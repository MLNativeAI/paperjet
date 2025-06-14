"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@paperjet/ui/button";

const navigationLinks = [
  { href: "#features", label: "Features" },
  // { href: "#testimonials", label: "Testimonials" },
  // { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

interface HeaderProps {
  onSignupClick: () => void;
}

export const Header = ({ onSignupClick }: HeaderProps) => {
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

  const handleSignupClick = () => {
    onSignupClick();
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
            D
          </div>
          <span>PaperJet</span>
        </div>
        <nav className="hidden md:flex gap-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex gap-4 items-center">
          <button
            onClick={handleSignupClick}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </button>
          <Button
            onClick={handleSignupClick}
            className="rounded-full cursor-pointer"
          >
            <span className="flex items-center">
              Get Started
              <ChevronRight className="ml-1 size-4" />
            </span>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
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
              <button
                onClick={handleSignupClick}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
              >
                Log in
              </button>
              <Button
                onClick={handleSignupClick}
                className="rounded-full cursor-pointer"
              >
                <span className="flex items-center">
                  Get Started
                  <ChevronRight className="ml-1 size-4" />
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};
