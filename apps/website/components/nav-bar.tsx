"use client";

import Link from "next/link";
import MobileNav from "@/components/mobile-nav";
import { SignupModal } from "@/components/signup-modal";
import { navigationLinks } from "@/nav-config";
import { GitHubLink } from "./github-link";

export const NavBar = () => {
  return (
    <>
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
        <GitHubLink />
        <SignupModal
          triggerText="Get Started"
          triggerVariant="default"
          triggerSize="default"
          triggerClassName="rounded-full cursor-pointer flex items-center"
        />
      </div>
      <MobileNav />
    </>
  );
};
