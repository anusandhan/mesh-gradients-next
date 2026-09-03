import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://www.gradients.studio/", lastModified, priority: 1 },
    { url: "https://www.gradients.studio/app", lastModified, priority: 0.8 },
  ];
}
