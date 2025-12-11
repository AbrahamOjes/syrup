import { Button } from "@/popup/components/ui/button.tsx";
import CenteredScrollZone from "@/popup/components/ui/CenteredScrollZone.tsx";
import { useTheme } from "@/popup/components/ThemeProvider";
import { Sun, Moon, SunMoon, SwatchBook } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ThemeSwitcher() {
    const { setTheme } = useTheme();
    const { t } = useTranslation();

    const ToogleDropdown = () => {
        const wrapper = document.querySelector('.theme') as HTMLDivElement;
        wrapper.classList.toggle('hidden');
    }

    return (
        <div className="flex relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    ToogleDropdown();
                }}>
                <SwatchBook className="h-[1.2rem] aspect-auto" />
            </Button>
            <CenteredScrollZone className="theme">
                <div className="w-[60%] h-[100%] flex flex-col border-1 border-white border-opacity-70 bg-card rounded-lg dropdown-content">
                    <Button className="w-[100%] bg-card text-card-foreground flex flex-row hover:text-primary hover:cursor-pointer hover:bg-primary/10" onClick={() => { setTheme("light"); ToogleDropdown(); }}>
                        <Sun/>
                        <p className="text-card-foreground text-sm ml-2 hover:cursor-pointer">{ t('Light') }</p>
                    </Button>
                    <Button className="w-[100%] bg-card text-card-foreground flex flex-row hover:text-primary hover:cursor-pointer hover:bg-primary/10" onClick={() => { setTheme("dark"); ToogleDropdown(); }}>
                        <Moon/>
                        <p className="text-card-foreground text-sm ml-2 hover:cursor-pointer">{ t('Dark') }</p>
                    </Button>
                    <Button className="w-[100%] bg-card text-card-foreground flex flex-row hover:text-primary hover:cursor-pointer hover:bg-primary/10" onClick={() => { setTheme("system"); ToogleDropdown(); }}>
                        <SunMoon/>
                        <p className="text-card-foreground text-sm ml-2 hover:cursor-pointer">{ t('System') }</p>
                    </Button>
                </div>
            </CenteredScrollZone>
        </div>
    );
}

export default ThemeSwitcher;