import type { MetadataRoute } from "next";
import { servicePages } from "@/content/servicePages";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://jaiderfeliciana.com/", changeFrequency: "monthly", priority: 1 },
    ...servicePages.map((p) => ({ url: `https://jaiderfeliciana.com/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: "https://jaiderfeliciana.com/book", changeFrequency: "monthly", priority: 0.8 },
  ];
}
