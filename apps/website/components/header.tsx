"use client";

import { motion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignupModal } from "@/components/signup-modal";

const navigationLinks = [
    { href: "#features", label: "Features" },
    // { href: "#testimonials", label: "Testimonials" },
    // { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
];

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}
        >
            <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
                <a href="https://getpaperjet.com">
                    <div className="flex items-center gap-2 font-bold">
                        <Image src="/logo.png" alt="PaperJet Logo" width={32} height={32} className="size-8" />
                        <span>PaperJet</span>
                    </div>
                </a>
                <nav className="hidden md:flex gap-8">
                    {navigationLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="hidden md:flex gap-4 items-center">
                    <SignupModal
                        triggerText="Log in"
                        triggerVariant="ghost"
                        triggerSize="default"
                        triggerClassName="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    />
                    <SignupModal
                        triggerText="Get Started"
                        triggerVariant="default"
                        triggerSize="default"
                        triggerClassName="rounded-full cursor-pointer flex items-center"
                    />
                </div>

                {/* Mobile menu button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                    {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden border-t bg-background/95 backdrop-blur-lg"
                >
                    <div className="container py-4 px-4 md:px-6 flex flex-col gap-4">
                        <nav className="flex flex-col gap-2">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-2 pt-2 border-t">
                            <SignupModal
                                triggerText="Log in"
                                triggerVariant="ghost"
                                triggerSize="default"
                                triggerClassName="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2 justify-start"
                            />
                            <SignupModal
                                triggerText="Get Started"
                                triggerVariant="default"
                                triggerSize="default"
                                triggerClassName="rounded-full cursor-pointer flex items-center"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </header>
    );
};
