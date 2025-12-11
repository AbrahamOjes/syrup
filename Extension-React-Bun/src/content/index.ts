// Types and Interfaces
interface DomainConfig {
    inputSelector: string;
    preApplyButtonSelector?: string;
    applyButtonSelector: string;
    successSelector: string;
    failureSelector: string;
    priceSelector: string;
    removeCouponButtonSelector: string;
}

interface PlatformConfig {
    inputSelector: string;
    applyButtonSelector: string;
    successSelector: string;
    failureSelector: string;
    priceSelector: string;
    removeCouponButtonSelector: string;
}

interface Translation {
    message: string;
}

interface Translations {
    [key: string]: Translation;
}

interface CouponResult {
    success: boolean;
    priceDrop: number;
    finalPrice: number;
}

interface Coupon {
    couponCode?: string;
}

type Platform = 'woocommerce' | null;

interface Logger {
    prefix: string;
    isDev: boolean;
    forceDebug: boolean;
    init: () => Promise<void>;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}

(() => {
    /*******************************************************
     * 1. Configurations
     *******************************************************/
    const maxWaitTime = 4000;
    let translations: Translations = {};

    const domainReplacements: { [key: string]: string } = {
        "nordcheckout.com": "nordvpn.com"
    };

    const domainConfigs: { [key: string]: DomainConfig } = {
        "applebees.com": {
            inputSelector: "#txtPromoCode",
            applyButtonSelector: ".btnPromoApply",
            successSelector: ".lnkPromoRemove",
            failureSelector: ".invalid-feedback",
            priceSelector: ".order-price",
            removeCouponButtonSelector: ".lnkPromoRemove"
        },
        "nordvpn.com": {
            inputSelector: "input[name='couponCode']",
            preApplyButtonSelector: "p[data-testid='coupon-show-form-button'] > a",
            applyButtonSelector: "button[data-testid='coupon-apply-button']",
            successSelector: "div[data-testid='coupon-applied-message']",
            failureSelector: "div[data-testid='coupon-error-alert']",
            priceSelector: "span[data-testid='CartSummary-total-amount']",
            removeCouponButtonSelector: "button[data-testid='coupon-delete-applied-button']"
        }
    };

    const platformConfigs: { [key: string]: PlatformConfig } = {
        woocommerce: {
            inputSelector: "input[name='coupon_code']",
            applyButtonSelector: "button[name='apply_coupon'], input[name='apply_coupon']",
            successSelector: ".woocommerce-message",
            failureSelector: ".woocommerce-error",
            priceSelector: ".order-total .amount, .cart_totals .amount",
            removeCouponButtonSelector: ".woocommerce-remove-coupon"
        }
    };

    /*******************************************************
     * 2. E-Commerce Platform Detection
     *******************************************************/
    function detectPlatform(): Platform {
        try {
            const html = document.documentElement.innerHTML.toLowerCase();
            if (html.includes("woocommerce") || html.includes("wp-content/plugins/woocommerce")) {
                return "woocommerce";
            }
        } catch (error) {
            logger.warn("Failed to detect platform:", error);
        }
        return null;
    }

    /*******************************************************
     * 3. Helper Functions / Variables
     *******************************************************/
    let coupons: (Coupon | string)[] = [];

    async function fetchCoupons(domain: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(
                    { action: "getCoupons", domain },
                    (response: { coupons?: (Coupon | string)[] }) => {
                        if (chrome.runtime.lastError) {
                            logger.error("Runtime error during message passing:", chrome.runtime.lastError);
                            reject(chrome.runtime.lastError.message);
                            return;
                        }

                        if (response?.coupons?.length && response?.coupons?.length > 0) {
                            coupons = response.coupons;
                            resolve();
                            chrome.storage.local.set({ coupons });
                        } else {
                            logger.warn("No coupons returned from background");
                            resolve();
                        }
                    }
                );
            } catch (error) {
                logger.error("Error fetching coupons:", error);
                reject("Failed to fetch coupons");
            }
        });
    }

    async function loadTranslations(lang: string): Promise<Translations> {
        const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const translations = await response.json();
            return translations;
        } catch (error) {
            logger.error("Failed to load translations:", error);
            return {};
        }
    }

    async function setLanguage(lang: string): Promise<void> {
        try {
            translations = await loadTranslations(lang);
        } catch (error) {
            logger.error("Failed to set language:", error);
        }
    }

    function getLanguageFromStorage(callback: (lang: string) => void): void {
        try {
            chrome.storage.sync.get().then((data) => {
                const storedLanguage = data["language"];
                callback(storedLanguage || chrome.i18n.getUILanguage() || "en");
            });
        } catch (error) {
            logger.warn("Failed to get language from storage:", error);
            callback("en");
        }
    }

    function getMessage(key: string): string {
        try {
            return translations[key]?.message || key;
        } catch (error) {
            logger.error("Error getting message for key:", key, error);
            return key;
        }
    }

    function getTranslation(key: string, data: { [key: string]: string | number } = {}): string {
        try {
            let translated = getMessage(key);
            for (const [name, value] of Object.entries(data)) {
                translated = translated.replace(new RegExp(`%${name}%`, "g"), String(value));
            }
            return translated;
        } catch (error) {
            logger.error("Error getting translation for key:", key, error);
            return key;
        }
    }
    const __ = getTranslation;

    function isVisible(el: HTMLElement | null): boolean {
        try {
            if (!el) return false;
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        } catch (error) {
            logger.warn("Failed to check visibility of element:", error);
            return false;
        }
    }

    function parsePrice(str: string | undefined): number {
        try {
            if (!str) return 0;
            const numericString = str.replace(/[^\d.-]/g, "");
            return parseFloat(numericString) || 0;
        } catch (error) {
            logger.warn("Error parsing price:", error);
            return 0;
        }
    }

    function replaceValue(selector: string, value: string): HTMLElement | null {
        try {
            const el = document.querySelector<HTMLInputElement>(selector);
            if (el) {
                el.value = value;
                el.dispatchEvent(new Event("keydown", { bubbles: true }));
                el.dispatchEvent(new Event("keyup", { bubbles: true }));
                el.dispatchEvent(new Event("change", { bubbles: true }));
            }
            return el;
        } catch (error) {
            logger.warn(`Failed to replace value for selector: ${selector}`, error);
            return null;
        }
    }

    async function revertCoupon(
        inputSelector?: string,
        removeCouponButtonSelector?: string
    ): Promise<void> {
        try {
            if (inputSelector) {
                replaceValue(inputSelector, "");
            }
            if (removeCouponButtonSelector) {
                const removeCouponButton = document.querySelector(removeCouponButtonSelector) as HTMLButtonElement;
                if (removeCouponButton) {
                    removeCouponButton.click();
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            logger.error("Error reverting coupon:", error);
        }
    }

    const logger: Logger = {
        prefix: "[Syrup]",
        isDev: false,
        forceDebug: false,

        init() {
            return new Promise((resolve) => {
                try {
                    chrome.runtime.sendMessage({ action: "checkDev" }, (response) => {
                        this.isDev = response;
                        resolve();
                    });
                } catch {
                    resolve();
                }
            });
        },

        log(...args: any[]) {
            if (this.isDev || this.forceDebug) {
                console.log(this.prefix, ...args);
            }
        },

        info(...args: any[]) {
            if (this.isDev || this.forceDebug) {
                console.info(this.prefix, ...args);
            }
        },

        warn(...args: any[]) {
            if (this.isDev || this.forceDebug) {
                console.warn(this.prefix, ...args);
            }
        },

        error(...args: any[]) {
            console.error(this.prefix, ...args);
        },

        debug(...args: any[]) {
            if (this.isDev || this.forceDebug) {
                console.debug(this.prefix, ...args);
            }
        },
    };

    /*******************************************************
     * 4. Testing & Applying Coupons
     *******************************************************/
    let stopTesting = false;
    let useBestNow = false;
    let bestPrice = 0;
    let bestCoupon: string | null = null;
    let testPopoverElement: HTMLElement | null = null;

    async function applySingleCoupon(
        inputSelector: string,
        couponCode: string,
        preApplyButtonSelector?: string,
        applyButtonSelector?: string,
        successSelector?: string,
        failureSelector?: string,
        priceSelector?: string
    ): Promise<CouponResult> {
        try {
            const preApplyButton = preApplyButtonSelector
                ? document.querySelector(preApplyButtonSelector)
                : null;

            if (preApplyButton) {
                (preApplyButton as HTMLElement).click();
            }

            const input = inputSelector ? document.querySelector(inputSelector) : null;
            const applyButton = applyButtonSelector
                ? document.querySelector(applyButtonSelector)
                : null;

            if (input && applyButton) {
                replaceValue(inputSelector, couponCode);
                (applyButton as HTMLButtonElement).disabled = false;
                (applyButton as HTMLElement).click();
            }

            let prePrice = 0;
            if (priceSelector) {
                const priceText = document.querySelector(priceSelector)?.textContent;
                if (priceText) {
                    prePrice = parsePrice(priceText);
                }
            }

            let successBySelector = false;
            let failureBySelector = false;

            if (successSelector && failureSelector) {
                await new Promise<void>((resolve) => {
                    const startTime = Date.now();
                    const interval = setInterval(() => {
                        const sEl = document.querySelector(successSelector!) as HTMLElement;
                        const fEl = document.querySelector(failureSelector!) as HTMLElement;

                        if (sEl && isVisible(sEl)) {
                            successBySelector = true;
                            clearInterval(interval);
                            resolve();
                        } else if (fEl && isVisible(fEl)) {
                            failureBySelector = true;
                            clearInterval(interval);
                            resolve();
                        } else if (Date.now() - startTime > maxWaitTime) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 300);
                });
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            let postPrice = prePrice;
            if (priceSelector) {
                const priceText = document.querySelector(priceSelector)?.textContent;
                if (priceText) {
                    postPrice = parsePrice(priceText);
                }
            }

            if (successBySelector && !failureBySelector) {
                return {
                    success: true,
                    priceDrop: prePrice - postPrice,
                    finalPrice: postPrice,
                };
            } else if (failureBySelector && !successBySelector) {
                return {
                    success: false,
                    priceDrop: 0,
                    finalPrice: postPrice,
                };
            } else {
                const dropped = prePrice - postPrice;
                return {
                    success: dropped > 0,
                    priceDrop: dropped,
                    finalPrice: postPrice,
                };
            }
        } catch (error) {
            logger.error(`Error applying coupon ${couponCode}:`, error);
            return { success: false, priceDrop: 0, finalPrice: 0 };
        }
    }

    async function tryAllCouponsAndPickBest(config: DomainConfig | PlatformConfig): Promise<void> {
        stopTesting = false;
        useBestNow = false;
        bestPrice = 0;
        bestCoupon = null;

        const textContent = document.querySelector(config.priceSelector)?.textContent;
        if (!textContent) {
            logger.warn("Price selector not found");
            return;
        }

        const originalPrice = config.priceSelector
            ? parsePrice(textContent)
            : 0;
        bestPrice = originalPrice;

        showTestingPopover();

        for (let i = 0; i < coupons.length; i++) {
            if (stopTesting || useBestNow) {
                break;
            }

            const coupon = coupons[i];
            const couponCode = typeof coupon === 'string' ? coupon : coupon.couponCode;

            if (!couponCode) continue;

            updateTestingPopover(i + 1, coupons.length, couponCode, bestPrice);

            try {
                const result = await applySingleCoupon(
                    config.inputSelector,
                    couponCode,
                    (config as DomainConfig).preApplyButtonSelector,
                    config.applyButtonSelector,
                    config.successSelector,
                    config.failureSelector,
                    config.priceSelector
                );

                if (result.success && result.priceDrop > 0 && result.finalPrice < bestPrice) {
                    bestPrice = result.finalPrice;
                    bestCoupon = couponCode;
                }

                await revertCoupon(config.inputSelector, config.removeCouponButtonSelector);
            } catch (error) {
                logger.error(`Error testing coupon ${couponCode}:`, error);
            }
        }

        // Stopped by user
        if (stopTesting) {
            finishTestingPopover(null, originalPrice, 0, true);
            return;
        }

        // Use best or finished
        if (bestCoupon && bestPrice < originalPrice) {
            await applySingleCoupon(
                config.inputSelector,
                bestCoupon,
                (config as DomainConfig).preApplyButtonSelector,
                config.applyButtonSelector,
                config.successSelector,
                config.failureSelector,
                config.priceSelector
            );
            finishTestingPopover(bestCoupon, bestPrice, originalPrice - bestPrice);
        } else {
            finishTestingPopover(null, originalPrice, 0);
        }
    }

    /*******************************************************
     * 5. Popover UI with Semi-Transparent Background
     *******************************************************/
    function showTestingPopover(): void {
        // If there's an existing overlay/popover, remove it first
        if (testPopoverElement) {
            testPopoverElement.remove();
            testPopoverElement = null;
        }

        // Create a full-screen overlay to dim the background
        const overlay = document.createElement("div");
        overlay.id = "syrup-testing-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        overlay.style.zIndex = "9999998";

        // Create the actual popover container
        const container = document.createElement("div");
        container.id = "syrup-testing-popover";
        container.style.position = "absolute";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.zIndex = "9999999";
        container.style.backgroundColor = "#fff";
        container.style.border = "2px solid #ccc";
        container.style.borderRadius = "8px";
        container.style.padding = "20px";
        container.style.width = "400px";
        container.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
        container.style.fontFamily = "Arial, sans-serif";

        container.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-size: 22px;">
                ${__("testing_coupons")}
            </h2>
            <p id="syrup-test-step" style="margin: 5px 0; font-size: 16px; color: #333;"></p>
            <p id="syrup-test-status" style="margin: 5px 0; font-size: 14px; color: #666;"></p>
            <div style="margin-top: 15px;">
                <button id="syrup-cancel-test-btn" style="
                    background-color: #f44336;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 10px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-right: 8px;
                ">
                    ${__("cancel")}
                </button>
                <button id="syrup-use-best-btn" style="
                    background-color: #ff9800;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 10px 16px;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    ${__("use_best")}
                </button>
            </div>
        `;

        // Insert the popover container into the overlay
        overlay.appendChild(container);
        // Insert the overlay into the document
        document.body.appendChild(overlay);

        testPopoverElement = overlay;

        // Cancel
        document.getElementById("syrup-cancel-test-btn")?.addEventListener("click", () => {
            stopTesting = true;
        });
        // Use Best
        document.getElementById("syrup-use-best-btn")?.addEventListener("click", () => {
            useBestNow = true;
        });
    }

    function updateTestingPopover(
        currentIndex: number,
        total: number,
        currentCoupon: string,
        bestPriceSoFar: number
    ): void {
        if (!testPopoverElement) return;
        const container = testPopoverElement.querySelector("#syrup-testing-popover");
        if (!container) return;

        const stepEl = container.querySelector("#syrup-test-step");
        const statusEl = container.querySelector("#syrup-test-status");

        if (stepEl) {
            stepEl.textContent = __(`testing_coupon_current_of_total`, {
                currentIndex,
                total,
            });
        }
        if (statusEl) {
            statusEl.textContent = currentCoupon
                ? __(`now_trying_best_so_far`, {
                    currentCoupon,
                    bestPriceSoFar,
                })
                : __(`best_price_so_far`, { bestPriceSoFar });
        }
    }

    function finishTestingPopover(
        bestCoupon: string | null,
        finalPrice: number,
        savings: number,
        wasCancelled: boolean = false
    ): void {
        if (!testPopoverElement) return;

        const container = testPopoverElement.querySelector("#syrup-testing-popover");
        if (!container) return;

        const stepEl = container.querySelector("#syrup-test-step");
        const statusEl = container.querySelector("#syrup-test-status");
        const cancelBtn = container.querySelector("#syrup-cancel-test-btn");
        const useBestBtn = container.querySelector("#syrup-use-best-btn");

        if (cancelBtn) cancelBtn.remove();
        if (useBestBtn) useBestBtn.remove();

        if (wasCancelled) {
            if (stepEl) stepEl.textContent = __("testing_cancelled");
            if (statusEl) {
                statusEl.textContent = __("scan_was_stopped_no_coupons_applied");
            }
        } else if (bestCoupon) {
            if (stepEl) stepEl.textContent = __("we_found_the_best_coupon");
            if (statusEl) {
                statusEl.textContent = __(`applied_coupon_and_saved_savings_new_total`, {
                    bestCoupon,
                    savings: savings.toFixed(2),
                    finalPrice: finalPrice.toFixed(2),
                });
            }
        } else {
            if (stepEl) stepEl.textContent = __("no_better_price_found");
            if (statusEl) {
                statusEl.textContent = __("all_coupons_tested_but_none_lowered_your_total");
            }
        }

        // "Got it" button
        const gotItBtn = document.createElement("button");
        gotItBtn.id = "syrup-got-it-btn";
        gotItBtn.textContent = __("got_it");
        gotItBtn.style.marginTop = "15px";
        gotItBtn.style.backgroundColor = "#28a745";
        gotItBtn.style.color = "#fff";
        gotItBtn.style.border = "none";
        gotItBtn.style.borderRadius = "4px";
        gotItBtn.style.padding = "10px 16px";
        gotItBtn.style.fontSize = "14px";
        gotItBtn.style.cursor = "pointer";

        gotItBtn.addEventListener("click", () => {
            testPopoverElement?.remove();
            testPopoverElement = null;
        });
        container.appendChild(gotItBtn);
    }

    /*******************************************************
     * 6. Popups: Auto-Apply or No Config
     *******************************************************/
    function showAutoApplyPopup(syrupIconUrl: string): void {
        const popupHTML = `
            <div id="coupon-popup" style="
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 1000; 
                background-color: #ffffff; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                padding: 15px; 
                width: 320px; 
                font-family: Arial, sans-serif;
            ">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <img src="${syrupIconUrl}" alt="${__("syrup_logo")}" style="width: 40px; height: 40px; border-radius: 8px;">
                    <div>
                        <h3 style="margin: 0; font-size: 18px; color: #333;">${__("syrup_found_coupons")}</h3>
                        <p style="margin: 0; font-size: 14px; color: #666;">${__("click_apply_to_try_them_all")}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                    <button id="apply-coupons-btn" style="
                        background-color: #007bff; 
                        color: #ffffff; 
                        border: none; 
                        border-radius: 5px; 
                        padding: 10px 15px; 
                        font-size: 14px; 
                        cursor: pointer; 
                        transition: background-color 0.2s ease;
                        width: 100%;
                    ">${__("apply")}</button>
                    <button id="ignore-coupons-btn" style="
                        background-color: #f8f9fa; 
                        color: #333; 
                        border: 1px solid #ddd; 
                        border-radius: 5px; 
                        padding: 10px 15px; 
                        font-size: 14px; 
                        cursor: pointer; 
                        transition: background-color 0.2s ease;
                        width: 100%;
                    ">${__("ignore")}</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", popupHTML);

        document.getElementById("apply-coupons-btn")?.addEventListener("click", async () => {
            document.getElementById("coupon-popup")?.remove();
            const config = determineConfig();
            if (config) {
                await tryAllCouponsAndPickBest(config);
            } else {
                const SyrupIcon = chrome.runtime.getURL("icons/Syrup.png");
                showNoConfigPopup(SyrupIcon);
            }
        });

        document.getElementById("ignore-coupons-btn")?.addEventListener("click", () => {
            document.getElementById("coupon-popup")?.remove();
        });
    }

    function showNoConfigPopup(syrupIconUrl: string): void {
        const popupHTML = `
            <div id="no-config-popup" style="
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 1000; 
                background-color: #ffffff; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                padding: 15px; 
                width: 320px; 
                font-family: Arial, sans-serif;
            ">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <img src="${syrupIconUrl}" alt="${__("syrup_logo")}" style="width: 40px; height: 40px; border-radius: 8px;">
                    <div>
                        <h3 style="margin: 0; font-size: 18px; color: #333;">${__("syrup_found_coupons")}</h3>
                        <p style="margin: 0; font-size: 14px; color: #666;">${__("no_auto_apply_setup")}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                    <button id="show-extension-btn" style="
                        background-color: #007bff; 
                        color: #ffffff; 
                        border: none; 
                        border-radius: 5px; 
                        padding: 10px 15px; 
                        font-size: 14px; 
                        cursor: pointer; 
                        transition: background-color 0.2s ease;
                        width: 100%;
                    ">${__("show_extension")}</button>
                    <button id="ignore-no-config-btn" style="
                        background-color: #f8f9fa; 
                        color: #333; 
                        border: 1px solid #ddd; 
                        border-radius: 5px; 
                        padding: 10px 15px; 
                        font-size: 14px; 
                        cursor: pointer; 
                        transition: background-color 0.2s ease;
                        width: 100%;
                    ">${__("ignore")}</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", popupHTML);

        document.getElementById("show-extension-btn")?.addEventListener("click", () => {
            document.getElementById("no-config-popup")?.remove();
            chrome.runtime.sendMessage({ action: "openPopup" });
        });

        document.getElementById("ignore-no-config-btn")?.addEventListener("click", () => {
            document.getElementById("no-config-popup")?.remove();
        });
    }

    /*******************************************************
     * 7. Determine Config Based on Domain or Platform
     *******************************************************/
    function determineConfig(): DomainConfig | PlatformConfig | null {
        let domain = window.location.hostname.replace("www.", "");
        if (domainReplacements[domain]) domain = domainReplacements[domain];

        // 1) Check domain config
        if (domainConfigs[domain]) {
            return domainConfigs[domain];
        }

        // 2) Check platform
        const platform = detectPlatform();
        if (platform && platformConfigs[platform]) {
            return platformConfigs[platform];
        }

        // If not found, we have no config
        return null;
    }

    /*******************************************************
     * 8. Main
     *******************************************************/
    async function main(): Promise<void> {
        await logger.init();
        let domain = window.location.hostname.replace("www.", "");
        if (domainReplacements[domain]) domain = domainReplacements[domain];
        const path = window.location.pathname;

        // 1) Attempt to fetch coupons
        try {
            await fetchCoupons(domain);
        } catch (err) {
            logger.warn("Failed to fetch coupons:", err);
            return;
        }

        if (!coupons || coupons.length === 0) {
            logger.info("No coupons found");
            return; // No coupons to try
        }

        chrome.runtime.sendMessage({
            action: "setBadgeText",
            text: coupons.length.toString(),
        });

        // 2) Check if user is on a likely checkout page
        const isCheckoutPath = [
            "checkout",
            "cart",
            "basket",
            "order",
            "payment",
        ].some((keyword) => path.includes(keyword));
        if (!isCheckoutPath) {
            return;
        }

        // 3) Determine config
        const config = determineConfig();
        const SyrupIcon = chrome.runtime.getURL("icons/Syrup.png");

        // 4) If we found a config, show auto-apply, otherwise show fallback
        if (config) {
            showAutoApplyPopup(SyrupIcon);
        } else {
            showNoConfigPopup(SyrupIcon);
        }
    }

    // Delay a bit for the page to load
    setTimeout(() => {
        main().catch((err) => logger.error("Main error:", err));
    }, 3000);

    getLanguageFromStorage(setLanguage);
})();