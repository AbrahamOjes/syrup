"use client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import developers from "@/public/about/developer.json";
import translation from "@/public/about/translation.json";

const Developers = JSON.stringify(developers);
const Translation = JSON.stringify(translation);

export default function About() {
    const [DevelopersElement, setDevelopers] = useState<JSX.Element[]>([]);
    const [TranslationElement, setTranslation] = useState<JSX.Element[]>([]);
    const [ContributorsElement, setContributors] = useState<JSX.Element[]>([]);

    const contributorsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const GITHUB_API_URL = "https://api.github.com/repos/";
    const REPO_OWNER = "Abdallah-Alwarawreh";
    const REPO_NAME = "syrup";

    useEffect(() => {
        const fetchContributors = async () => {
            const DeveloperArray: JSX.Element[] = [];
            const TranslationArray: JSX.Element[] = [];
            const ContributorsArray: JSX.Element[] = [];

            const response = await fetch(
                `${GITHUB_API_URL}${REPO_OWNER}/${REPO_NAME}/contributors`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch contributors");
            }
            const contributorsRAW = await response.json();
            contributorsRAW.forEach((contributor: any) => {
                const formattedLogin = contributor.login.replace(/-/g, " ");
                if (
                    developers.some((dev: any) => dev.name === formattedLogin)
                ) {
                    DeveloperArray.push(
                        <div
                            key={contributor.login}
                            className="flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            <img
                                src={contributor.avatar_url}
                                alt={formattedLogin}
                                className="mb-4 rounded-full w-32 h-32"
                            />
                            <h3 className="mb-1 text-xl font-semibold">
                                {formattedLogin}
                            </h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                {developers.find(
                                    (dev: any) => dev.name === formattedLogin
                                )?.role || "Contributor"}
                            </p>
                            <a
                                href={contributor.html_url}
                                target="_blank"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                            >
                                <Github className="lucide lucide-github mr-1 h-4 w-4" />{" "}
                                Github Profile
                            </a>
                        </div>
                    );
                } else {
                    ContributorsArray.push(
                        <div
                            key={contributor.login}
                            className="rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            <img
                                src={contributor.avatar_url}
                                alt={formattedLogin}
                                className="mb-3 w-12 h-12 rounded-full"
                            />
                            <h3 className="mb-3 text-xl font-semibold">
                                {formattedLogin}
                            </h3>
                            <p className="text-muted-foreground">
                                Contributions: {contributor.contributions}
                            </p>
                            <a
                                href={contributor.html_url}
                                target="_blank"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mt-3"
                            >
                                <Github className="lucide lucide-github mr-1 h-4 w-4" />{" "}
                                Github Profile
                            </a>
                        </div>
                    );
                }
            });
            const translators = JSON.parse(Translation);
            for (const translator of translators) {
                const img = new Image();
                if (
                    [
                        "slashing5",
                        "Pavlova",
                        "ghazer",
                        "SolarPixels",
                        "ItsAdi1982",
                        "jbgl",
                        "Panda",
                        "Tijn",
                    ].includes(translator.name)
                ) {
                    img.src = `/Testimonials/placeholder.svg`;
                } else img.src = `https://github.com/${translator.name}.png`;
                img.onload = () => {
                    TranslationArray.push(
                        <div
                            key={translator.name}
                            className="rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            <img
                                src={img.src}
                                alt={`${translator.name}'s github avatar`}
                                className="w-12 h-12 rounded-full mb-4"
                            />
                            <h3 className="mb-3 text-xl font-semibold">
                                {translator.name}
                            </h3>
                            <p className="text-muted-foreground">
                                {translator.translation}
                            </p>
                        </div>
                    );
                    setTranslation([...TranslationArray]);
                };
                img.onerror = () => {
                    TranslationArray.push(
                        <div
                            key={translator.name}
                            className="rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            <img
                                src={`/Testimonials/placeholder.svg`}
                                alt={`${translator.name}'s github avatar`}
                                className="w-12 h-12 rounded-full mb-4"
                            />
                            <h3 className="mb-3 text-xl font-semibold">
                                {translator.name}
                            </h3>
                            <p className="text-muted-foreground">
                                {translator.translation}
                            </p>
                        </div>
                    );
                    setTranslation([...TranslationArray]);
                };
            }
            setDevelopers(DeveloperArray);
            setTranslation(TranslationArray);
            setContributors(ContributorsArray);
        };

        fetchContributors();

        if (window.location.hash === "#contributors") {
            contributorsRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="h-[10vh]"></div>
            <main className="container mx-auto px-4 py-16 md:px-6">
                {/* Mission Section */}
                <section className="mb-20">
                    <h1 className="mb-8 text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl lg:text-6xl">
                        About Syrup
                    </h1>
                    <p className="mb-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
                        Syrup is an open-source browser extension that helps you
                        save money by automatically finding and applying the
                        best coupon codes when you shop online.
                    </p>
                    <p className="max-w-3xl text-lg text-muted-foreground md:text-xl">
                        Our mission is to make online shopping more affordable
                        and accessible for everyone by eliminating the
                        frustration of searching for working coupon codes.
                    </p>
                </section>

                {/* Key Features Section */}
                <section className="mb-20">
                    <h2 className="mb-8 text-3xl font-bold text-[#0F172A]">
                        What Makes Us Different
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:scale-105">
                            <h3 className="mb-3 text-xl font-semibold">
                                100% Open Source
                            </h3>
                            <p className="text-muted-foreground">
                                We believe in transparency. Our entire codebase
                                is open source and available for anyone to
                                inspect, contribute to, or learn from.
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:scale-105">
                            <h3 className="mb-3 text-xl font-semibold">
                                Privacy First
                            </h3>
                            <p className="text-muted-foreground">
                                We don't track your personal data or shopping
                                habits.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="mb-20">
                    <h2 className="mb-8 text-3xl font-bold text-[#0F172A]">
                        Developers
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {DevelopersElement}
                    </div>
                    <h2
                        ref={contributorsRef}
                        className="mt-12 mb-8 text-3xl font-bold text-[#0F172A]"
                    >
                        Contributors
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {ContributorsElement}
                    </div>
                    <h2 className="mt-12 mb-8 text-3xl font-bold text-[#0F172A]">
                        Translators
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {TranslationElement}
                    </div>
                </section>

                {/* Join Us Section */}
                <section>
                    <div className="rounded-lg bg-[#C4401C]/10 p-8 md:p-12">
                        <h2 className="mb-4 text-3xl font-bold text-[#C4401C]">
                            Join Our Community
                        </h2>
                        <p className="mb-6 max-w-2xl text-lg text-muted-foreground">
                            Want to contribute to Syrup? We welcome
                            contributions of all kinds - from code to
                            documentation, bug reports to feature suggestions.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button
                                asChild
                                className="bg-[#C4401C] text-white hover:bg-[#C4401C]/90"
                            >
                                <Link href="https://github.com/Abdallah-Alwarawreh/syrup">
                                    <Github className="mr-2 h-4 w-4" />
                                    View on GitHub
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="bg-white"
                            >
                                <Link href="https://github.com/Abdallah-Alwarawreh/syrup/issues">
                                    Report an Issue
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
