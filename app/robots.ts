import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/checkout", "/api/export", "/api/presets", "/api/quota", "/api/webhooks", "/ingest/"] },
    sitemap: "https://www.gradients.studio/sitemap.xml",
  };
}
