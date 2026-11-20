import type { Metadata } from "next";

export const siteUrl = "https://jaiderfeliciana.com";
export const siteName = "Jaider Feliciana";

const image = { url: "/opengraph-image", width: 1200, height: 630, alt: "Jaider Feliciana — Websites, social media & ads in Aruba" };

// Title, description, canonical link and share-preview tags (WhatsApp, Facebook, X) for one page.
// Every page sets its own, so pages never show another page's link or preview.
export function pageMeta({
  title,
  description,
  path,
  shareTitle = title,
  shareDescription = description,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  shareTitle?: string;
  shareDescription?: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images: [image] },
  };
}
