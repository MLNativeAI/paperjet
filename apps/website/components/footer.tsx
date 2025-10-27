import Image from "next/image";
import Link from "next/link";

export const Footer = () => (
  <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:py-16">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold">
            <Image src="/logo.png" alt="PaperJet Logo" width={120} height={40} />
          </div>
          <p className="text-sm text-muted-foreground">Privacy-first document processing platform.</p>
          <div className="flex gap-4">
            <Link
              href="https://www.linkedin.com/company/getpaperjet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="https://github.com/mlnativeai/paperjet"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
            </li>
            {/* <li>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </li> */}
            {/* <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Self-Hosting
              </Link>
            </li> */}
            {/* <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                API
              </Link>
            </li> */}
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="https://docs.paperjet.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/mlnativeai/paperjet"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </li>
            {/* <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Community
              </Link>
            </li> */}
            <li>
              <Link
                href="https://github.com/MLNativeAI/paperjet/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="https://mlnative.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service (coming soon)
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 mt-4 pt-4">
        <p className="text-xs text-center sm:text-left text-muted-foreground">
          &copy; {new Date().getFullYear()} mlnative. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
