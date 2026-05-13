import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Practice",
  description: "LeetCode-style practice for React, Next.js, and TypeScript concepts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
