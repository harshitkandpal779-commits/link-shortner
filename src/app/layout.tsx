import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snip.link — URL Shortener",
  description: "Create real, working short links with click analytics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 bg-[radial-gradient(60rem_40rem_at_50%_-10rem,rgba(56,189,248,0.18),transparent)] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
