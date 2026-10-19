import type { Metadata, Viewport } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jaider Feliciana — Websites, Social Media & Ads in Aruba",
  description:
    "Fast, professional websites, social media marketing, Meta & Google Ads, branding and SEO for Aruba businesses. Book a free consultation.",
  openGraph: {
    title: "Jaider Feliciana — Websites that bring you more customers",
    description: "Websites, social media and ads for Aruba businesses. Free consultation on WhatsApp.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f2fb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
