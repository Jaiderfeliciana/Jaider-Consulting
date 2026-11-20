import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://jaiderfeliciana.com/", changeFrequency: "monthly", priority: 1 },
    { url: "https://jaiderfeliciana.com/book", changeFrequency: "monthly", priority: 0.8 },
  ];
}
