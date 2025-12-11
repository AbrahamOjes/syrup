# Scaling to 1000+ Merchants: Complete Strategy

## Executive Summary

**Goal**: Scale from 23 merchants to 1000+ merchants with active, verified coupons

**Timeline**: 4-12 weeks depending on approach

**Estimated Cost**: $0 - $500/month

---

## Strategy Overview

### Phase 1: Quick Wins (100 merchants in 1-2 weeks)
1. **Affiliate Network APIs** - Tap into existing merchant databases
2. **Scrape Top Coupon Sites** - RetailMeNot, Coupons.com, Groupon
3. **Use Existing Open-Source Data** - Community databases

### Phase 2: Automation (500 merchants in 4-6 weeks)
1. **Build Smart Scrapers** - Automated coupon discovery
2. **Merchant Auto-Discovery** - Find merchants from traffic data
3. **AI-Powered Validation** - Verify coupons automatically

### Phase 3: Community Scale (1000+ merchants in 8-12 weeks)
1. **User Submissions** - Let users add coupons
2. **Merchant Partnerships** - Direct integrations
3. **Continuous Updates** - Automated refresh system

---

## Approach 1: Affiliate Network APIs (FASTEST)

### What Are Affiliate Networks?

Affiliate networks connect merchants with affiliates who promote their products. They maintain massive databases of:
- Merchant information
- Active coupon codes
- Commission rates
- Product feeds

### Top Networks to Integrate

#### 1. **ShareASale** (4,000+ merchants)
- **Coverage**: Fashion, Electronics, Home, Beauty
- **API**: Yes (coupon/deals database)
- **Cost**: Free (just need affiliate account)
- **Integration Time**: 2-3 days

**Key Merchants**: Reebok, Wayfair, Reebok, Etsy sellers, etc.

#### 2. **CJ Affiliate (Commission Junction)** (3,000+ merchants)
- **Coverage**: Major brands globally
- **API**: Yes (product catalog API)
- **Cost**: Free (affiliate account required)
- **Integration Time**: 3-5 days

**Key Merchants**: Office Depot, Barnes & Noble, GoDaddy, etc.

#### 3. **Rakuten Advertising** (1,000+ merchants)
- **Coverage**: Global brands
- **API**: Yes (LinkShare API)
- **Cost**: Free (affiliate approval needed)
- **Integration Time**: 3-5 days

**Key Merchants**: Macy's, Walmart, Best Buy, etc.

#### 4. **Impact.com** (1,500+ merchants)
- **Coverage**: D2C brands, SaaS
- **API**: Yes (comprehensive)
- **Cost**: Free (application required)
- **Integration Time**: 2-3 days

**Key Merchants**: Shopify, Uber, Canva, etc.

#### 5. **Awin** (15,000+ merchants globally)
- **Coverage**: European + US brands
- **API**: Yes (product feed API)
- **Cost**: Free (affiliate account)
- **Integration Time**: 3-5 days

**Key Merchants**: AliExpress, Etsy, Nike (regional), etc.

### Implementation Plan

```typescript
// syrup-backend/src/services/affiliate-networks/shareasale.ts

import axios from 'axios';

interface ShareASaleConfig {
  affiliateId: string;
  apiToken: string;
  apiSecret: string;
}

interface ShareASaleCoupon {
  merchantId: string;
  merchantName: string;
  couponCode: string;
  dealTitle: string;
  dealDescription: string;
  startDate: string;
  endDate: string;
  couponUrl: string;
}

export class ShareASaleIntegration {
  private config: ShareASaleConfig;
  private baseUrl = 'https://api.shareasale.com/w.cfm';

  constructor(config: ShareASaleConfig) {
    this.config = config;
  }

  /**
   * Fetch all active coupons from ShareASale
   */
  async fetchCoupons(): Promise<ShareASaleCoupon[]> {
    const timestamp = Math.floor(Date.now() / 1000);
    const token = this.generateApiToken(timestamp);

    const response = await axios.get(this.baseUrl, {
      params: {
        affiliateId: this.config.affiliateId,
        token: token,
        timestamp: timestamp,
        action: 'dealsearch',
        version: '2.3',
      },
    });

    return this.parseCouponResponse(response.data);
  }

  /**
   * Import coupons into our database
   */
  async importToPrisma() {
    const coupons = await this.fetchCoupons();

    for (const coupon of coupons) {
      // Create or update merchant
      const merchant = await prisma.merchant.upsert({
        where: { name: coupon.merchantName },
        create: {
          name: coupon.merchantName,
          domains: [this.extractDomain(coupon.couponUrl)],
        },
        update: {},
      });

      // Create coupon
      await prisma.coupon.create({
        data: {
          code: coupon.couponCode,
          title: coupon.dealTitle,
          description: coupon.dealDescription,
          merchantId: merchant.id,
          expiresAt: new Date(coupon.endDate),
          score: 70, // Affiliate coupons get medium score
        },
      });
    }
  }

  private generateApiToken(timestamp: number): string {
    // ShareASale API token generation logic
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(`${this.config.apiToken}:${timestamp}:${this.config.apiSecret}`)
      .digest('hex');
    return hash;
  }

  private extractDomain(url: string): string {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  }

  private parseCouponResponse(data: any): ShareASaleCoupon[] {
    // Parse ShareASale XML/JSON response
    // Implementation depends on their response format
    return [];
  }
}
```

**Run Import:**
```bash
npm run import:shareasale
# Expected: 500-1000 new merchants in 1 hour
```

---

## Approach 2: Web Scraping (MEDIUM SPEED)

### Target Sites

1. **RetailMeNot** (300,000+ coupons)
2. **Coupons.com** (100,000+ coupons)
3. **Groupon** (50,000+ deals)
4. **Slickdeals** (Community-verified deals)
5. **Brad's Deals** (Curated deals)

### Legal Considerations

⚠️ **Important**: Web scraping may violate Terms of Service. Consider:

1. **Publicly Available Data**: Only scrape public coupon pages
2. **Rate Limiting**: Respect robots.txt and add delays
3. **Attribution**: Credit source sites
4. **No Reselling**: Use for your own platform only
5. **Alternative**: Use existing open-source scrapers

### Implementation with Open-Source Tools

Use **Wired-Coupon-Scraper** (found on GitHub):

```bash
# Clone the scraper
git clone https://github.com/Prem-ium/Wired-Coupon-Scraper.git
cd Wired-Coupon-Scraper

# Install dependencies
npm install

# Configure for your needs
# Edit config to target specific retailers

# Run scraper
npm start

# Expected output: JSON file with coupons
# Import into your database using a script
```

### Custom Scraper (Built with Playwright)

```typescript
// syrup-backend/scripts/scrapers/retailmenot-scraper.ts

import { chromium } from 'playwright';

interface ScrapedCoupon {
  merchant: string;
  code: string;
  title: string;
  description: string;
  expiresAt?: Date;
}

export class RetailMeNotScraper {
  async scrapeMerchant(merchantSlug: string): Promise<ScrapedCoupon[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to merchant page
    await page.goto(`https://www.retailmenot.com/view/${merchantSlug}`, {
      waitUntil: 'networkidle',
    });

    // Extract coupons
    const coupons = await page.$$eval('.offer-card', (elements) => {
      return elements.map((el) => ({
        code: el.querySelector('.offer-code')?.textContent?.trim() || '',
        title: el.querySelector('.offer-title')?.textContent?.trim() || '',
        description: el.querySelector('.offer-description')?.textContent?.trim() || '',
      }));
    });

    await browser.close();

    return coupons.map((c) => ({
      merchant: merchantSlug,
      ...c,
    }));
  }

  async scrapeTopMerchants(limit: number = 100): Promise<ScrapedCoupon[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Get top merchant slugs
    await page.goto('https://www.retailmenot.com/coupons/stores');
    const merchantSlugs = await page.$$eval('.store-card a', (links) =>
      links.slice(0, limit).map((a) => a.getAttribute('href')?.split('/').pop())
    );

    await browser.close();

    // Scrape each merchant (with rate limiting)
    const allCoupons: ScrapedCoupon[] = [];
    for (const slug of merchantSlugs) {
      if (!slug) continue;

      console.log(`Scraping ${slug}...`);
      const coupons = await this.scrapeMerchant(slug);
      allCoupons.push(...coupons);

      // Rate limit: wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return allCoupons;
  }
}
```

**Run Scraper:**
```bash
npm run scrape:retailmenot
# Expected: 100 merchants with 300+ coupons in 10 minutes
```

---

## Approach 3: CouponAPI.org (EASIEST)

### What is CouponAPI.org?

[CouponAPI.org](https://couponapi.org/) aggregates coupons from **all major affiliate networks** into one API.

**Coverage**:
- ShareASale
- CJ Affiliate
- Rakuten
- Impact
- ClickBank
- Amazon Associates

### Pricing

- **Free Tier**: 100 requests/day (enough for testing)
- **Starter**: $29/month - 1,000 requests/day
- **Pro**: $99/month - 10,000 requests/day
- **Enterprise**: $299/month - Unlimited

### Integration

```typescript
// syrup-backend/src/services/coupon-api.ts

import axios from 'axios';

export class CouponAPIIntegration {
  private apiKey: string;
  private baseUrl = 'https://couponapi.org/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch coupons for a specific merchant
   */
  async fetchMerchantCoupons(merchantName: string) {
    const response = await axios.get(`${this.baseUrl}/coupons`, {
      params: {
        apikey: this.apiKey,
        merchant: merchantName,
      },
    });

    return response.data.coupons;
  }

  /**
   * Fetch all available merchants
   */
  async fetchAllMerchants() {
    const response = await axios.get(`${this.baseUrl}/merchants`, {
      params: {
        apikey: this.apiKey,
      },
    });

    return response.data.merchants;
  }

  /**
   * Import everything
   */
  async importAll() {
    const merchants = await this.fetchAllMerchants();

    for (const merchant of merchants.slice(0, 1000)) {
      const coupons = await this.fetchMerchantCoupons(merchant.name);

      // Import to database
      await this.importMerchant(merchant, coupons);

      console.log(`Imported ${merchant.name}: ${coupons.length} coupons`);
    }
  }
}
```

**One-Time Import:**
```bash
COUPONAPI_KEY=your_key npm run import:couponapi
# Expected: 1000+ merchants in 1 hour
```

---

## Approach 4: Community Contributions (SUSTAINABLE)

### Build a Crowdsourced System

Let users submit coupons (like Wikipedia for deals).

#### Features

1. **User Submission Form** - Anyone can add coupons
2. **Upvote/Downvote System** - Community validates
3. **Auto-Verification** - Test codes before publishing
4. **Reputation System** - Reward accurate submitters
5. **Moderation Queue** - Review before going live

#### Implementation

```typescript
// syrup-backend/src/routes/community.ts

import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CouponSubmissionSchema = z.object({
  merchantName: z.string(),
  merchantDomain: z.string().url(),
  code: z.string().min(3).max(50),
  title: z.string(),
  description: z.string(),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BOGO']),
  discountValue: z.number(),
  minOrderValue: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
  submitterEmail: z.string().email(),
});

// Submit a new coupon
router.post('/submit-coupon', async (req, res) => {
  const data = CouponSubmissionSchema.parse(req.body);

  // Create pending submission
  const submission = await prisma.couponSubmission.create({
    data: {
      ...data,
      status: 'PENDING',
      upvotes: 0,
      downvotes: 0,
    },
  });

  // Auto-verify (optional)
  const isValid = await verifyCoupon(data.code, data.merchantDomain);

  if (isValid) {
    // Auto-approve if verification passes
    await approveCoupon(submission.id);
  }

  res.json({ success: true, submissionId: submission.id });
});

// Upvote a coupon
router.post('/coupons/:id/upvote', async (req, res) => {
  await prisma.couponSubmission.update({
    where: { id: req.params.id },
    data: { upvotes: { increment: 1 } },
  });

  res.json({ success: true });
});

export default router;
```

**Add to Frontend:**
```html
<!-- Submit Coupon Form -->
<form action="/api/community/submit-coupon" method="POST">
  <input name="merchantName" placeholder="Merchant Name" required>
  <input name="code" placeholder="Coupon Code" required>
  <input name="title" placeholder="e.g., 20% Off Everything" required>
  <textarea name="description" placeholder="Terms and conditions"></textarea>
  <button type="submit">Submit Coupon</button>
</form>
```

---

## Approach 5: AI-Powered Auto-Discovery (ADVANCED)

### Concept

Use AI to:
1. **Discover merchants** from web traffic data
2. **Find coupons** by analyzing checkout pages
3. **Verify validity** by testing codes automatically
4. **Update expired** coupons automatically

### Implementation

```typescript
// syrup-backend/src/services/ai-discovery.ts

import OpenAI from 'openai';
import { chromium } from 'playwright';

export class AIDiscoveryService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Discover coupons for a merchant using AI + web scraping
   */
  async discoverCoupons(merchantDomain: string) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Visit merchant homepage
    await page.goto(`https://${merchantDomain}`);

    // 2. Look for coupon/promotion sections
    const promoText = await page.evaluate(() => {
      const promoElements = document.querySelectorAll(
        '[class*="promo"], [class*="sale"], [class*="discount"], [class*="coupon"]'
      );
      return Array.from(promoElements)
        .map((el) => el.textContent)
        .join('\n');
    });

    // 3. Use AI to extract coupon codes
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extract coupon codes and discount details from promotional text.',
        },
        {
          role: 'user',
          content: `Find coupon codes in this text:\n\n${promoText}`,
        },
      ],
    });

    const extractedCoupons = JSON.parse(response.choices[0].message.content);

    await browser.close();

    return extractedCoupons;
  }

  /**
   * Verify if a coupon code works
   */
  async verifyCoupon(code: string, merchantDomain: string): Promise<boolean> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // Navigate to checkout page
      await page.goto(`https://${merchantDomain}/checkout`);

      // Find coupon input field
      const couponInput = await page.locator('input[name*="coupon"], input[id*="promo"]').first();

      if (couponInput) {
        await couponInput.fill(code);
        await page.click('button[type="submit"]');

        // Wait for response
        await page.waitForTimeout(2000);

        // Check for success/error messages
        const successText = await page.textContent('body');
        const isValid = successText?.includes('applied') || successText?.includes('success');

        await browser.close();
        return isValid;
      }

      await browser.close();
      return false;
    } catch (error) {
      await browser.close();
      return false;
    }
  }
}
```

---

## Recommended Implementation Plan

### Week 1-2: Quick Start (100 merchants)
1. ✅ Sign up for ShareASale affiliate account
2. ✅ Sign up for CJ Affiliate account
3. ✅ Subscribe to CouponAPI.org ($29/month)
4. ✅ Run import scripts → 100 merchants instantly

### Week 3-4: Scale Up (500 merchants)
1. ✅ Add Rakuten and Awin integrations
2. ✅ Run custom scraper for top 100 sites
3. ✅ Import open-source coupon databases
4. ✅ Set up daily refresh job

### Week 5-8: Community & Automation (1000+ merchants)
1. ✅ Launch community submission system
2. ✅ Implement AI auto-discovery
3. ✅ Add merchant partnerships
4. ✅ Set up continuous monitoring

### Week 9-12: Quality & Optimization
1. ✅ Verify all coupons automatically
2. ✅ Remove expired codes
3. ✅ Improve scoring algorithm
4. ✅ Add merchant logos and branding

---

## Cost Breakdown

| Approach | Setup Time | Monthly Cost | Merchants | Quality |
|----------|------------|--------------|-----------|---------|
| **Affiliate Networks** | 3-5 days | $0 (free) | 500-2000 | ⭐⭐⭐⭐⭐ |
| **CouponAPI.org** | 1 day | $29-$99 | 1000+ | ⭐⭐⭐⭐ |
| **Web Scraping** | 1 week | $0 | 200-500 | ⭐⭐⭐ |
| **Community** | 2 weeks | $0 | Unlimited | ⭐⭐⭐⭐ |
| **AI Discovery** | 1 week | $50-$200 | Unlimited | ⭐⭐⭐⭐⭐ |

**Recommended Combo**: Affiliate Networks + CouponAPI.org = **$29/month for 2000+ merchants**

---

## Next Steps

Choose your path:

**Option A: Fastest (Paid)**
```bash
# Sign up for CouponAPI.org
# Run import in 1 hour
npm run import:couponapi
```

**Option B: Free (More Work)**
```bash
# Apply to affiliate networks
# Build importers
# Run over 1-2 weeks
```

**Option C: Hybrid (Best)**
```bash
# Use CouponAPI for initial 1000
# Add affiliate networks for ongoing updates
# Build community system for long-term growth
```

Want me to implement any of these approaches? I can build the importers right now!
