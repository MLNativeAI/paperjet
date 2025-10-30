"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { navigationLinks } from "@/nav-config";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 border-t bg-background/95 backdrop-blur-lg z-50"
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
              <Button
                asChild
                variant="ghost"
                size="default"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2 justify-start"
              >
                <Link href="https://app.getpaperjet.com" target="_blank" rel="noopener noreferrer">
                  Log in
                </Link>
              </Button>
              <Button
                asChild
                variant="default"
                size="default"
                className="rounded-full cursor-pointer flex items-center"
              >
                <Link href="https://app.getpaperjet.com" target="_blank" rel="noopener noreferrer">
                  Try for free
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
