import "../styles.css";
import type React from "react";
import type { Metadata } from "next";
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";

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
  title: "PaperJet",
  description: "Secure document processing for your business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oxanium.variable} ${merriweather.variable} ${firaCode.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
