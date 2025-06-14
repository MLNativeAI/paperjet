import "../styles.css";
import type React from "react";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
