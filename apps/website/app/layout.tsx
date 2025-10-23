import { PostHogProvider } from "@/components/posthog-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../styles.css";
import type { Metadata } from "next";
import { Fira_Code, Merriweather, Oxanium } from "next/font/google";
import type React from "react";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "PaperJet | Secure document processing for your business.",
  description: "Secure document processing for your business.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${oxanium.variable} ${merriweather.variable} ${firaCode.variable}`}>{children}</body>
        <GoogleAnalytics gaId="AW-16468275958" />
      </html>
    </PostHogProvider>
  );
}
