import type { MetadataRoute } from "next";
import { GALLERY } from "@/lib/gallery";
import { WALLPAPER_TAGS } from "@/lib/wallpapers";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    priority,
  });
  return [
    entry("/", 1),
    entry("/app", 0.8),
    entry("/wallpapers", 0.9),
    entry("/grainy-gradient", 0.8),
    entry("/blurry-gradient", 0.8),
    entry("/aurora-gradient", 0.8),
    ...(["blobs", "stripes", "clouds"] as const).map((s) =>
      entry(`/wallpapers/style/${s}`, 0.7)
    ),
    ...GALLERY.map((p) => entry(`/wallpapers/${p.slug}`, 0.6)),
    ...WALLPAPER_TAGS.map((t) => entry(`/wallpapers/color/${t}`, 0.5)),
    entry("/about", 0.3),
    entry("/contact", 0.3),
  ];
}
