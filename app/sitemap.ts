import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1 },
    { url: `${SITE_URL}/app`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified, priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified, priority: 0.3 },
  ];
}
