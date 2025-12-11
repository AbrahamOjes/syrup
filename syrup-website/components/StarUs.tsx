"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";

const StarUsButton: React.FC = () => {
    const [stars, setStars] = useState(0);
    const [showButton, setShowButton] = useState(true);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/repos/Abdallah-Alwarawreh/Syrup"
                );
                if (response.ok) {
                    const data = await response.json();
                    setStars(data.stargazers_count);
                } else {
                    console.error(
                        "Failed to fetch stargazer count:",
                        response.status
                    );
                }
            } catch (error) {
                console.error("Error fetching stargazer count:", error);
            }
        };

        const handleScroll = () => {
            console.log(window.scrollY);

            if (window.scrollY > 50) {
                setShowButton(false);
            } else {
                setShowButton(true);
            }
        };

        fetchStars();
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <Button
            className={`fixed bottom-4 font-semibold rounded-lg shadow-lg flex items-center transition-all duration-200 ease-in-out ${
                showButton
                    ? "space-x-2 py-2 px-4 left-1/2 transform -translate-x-1/2"
                    : "p-3 left-4"
            }`}
            asChild
        >
            <Link
                href="https://github.com/Abdallah-Alwarawreh/Syrup"
                target="_blank"
            >
                <Icon icon="mdi:github" className="w-5 h-5" />
                {showButton && (
                    <>
                        <span>Star us on GitHub</span>
                        <span className="ml-2 bg-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {stars}
                        </span>
                    </>
                )}
            </Link>
        </Button>
    );
};

export default StarUsButton;
