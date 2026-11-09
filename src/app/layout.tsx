import type { Metadata } from "next";
import { googleFontsHref } from "@/lib/themes";
import "./globals.css";

// Brand fonts load through the same Google Fonts helper as the themes, so the
// same family (e.g. Cormorant Garamond) is never registered twice under one name.
const BRAND_FONTS = googleFontsHref(["Cormorant Garamond", "Jost"]);

export const metadata: Metadata = {
  title: { default: "Vow — Wedding websites, beautifully made", template: "%s · Vow" },
  description: "Create a wedding invitation website in minutes. 30+ designer themes, RSVP tracking, photo galleries and more.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={BRAND_FONTS} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
