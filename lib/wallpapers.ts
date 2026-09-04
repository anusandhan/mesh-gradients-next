import { GALLERY, type GalleryPreset } from "./gallery";
import type { GradientStyle } from "./gradient-renderer";

// Free wallpaper downloads. Files are rendered on demand by
// /api/wallpaper/[slug] with the real renderer and cached at the CDN, so
// nothing multi-megabyte lives in the repo. Bump WALLPAPER_VERSION when
// the renderer or a palette changes so cached files re-render.

export const WALLPAPER_VERSION = 2;

export type WallpaperSizeId = "desktop" | "mac" | "phone";

export type WallpaperSize = {
  id: WallpaperSizeId;
  label: string;
  device: string;
  width: number;
  height: number;
};

export const WALLPAPER_SIZES: WallpaperSize[] = [
  { id: "desktop", label: "Desktop 4K", device: "Windows, Linux, any 16:9 monitor", width: 3840, height: 2160 },
  { id: "mac", label: "Mac 5K", device: "MacBook and Studio Display, 16:10", width: 5120, height: 2880 },
  { id: "phone", label: "Phone", device: "iPhone and Android, 1290 × 2796", width: 1290, height: 2796 },
];

// The page hero; not offered as a download
export const PREVIEW_SIZE = { id: "preview", width: 1600, height: 1000 } as const;

export const isWallpaperSize = (value: unknown): value is WallpaperSizeId =>
  WALLPAPER_SIZES.some((s) => s.id === value);

export const wallpaperUrl = (slug: string, size: WallpaperSizeId | "preview") =>
  `/api/wallpaper/${slug}?size=${size}&v=${WALLPAPER_VERSION}`;

export const wallpaperFilename = (preset: GalleryPreset, size: WallpaperSize) =>
  `gradients-studio-${preset.slug}-${size.width}x${size.height}.jpg`;

// Tag pages: every colour word used by at least one palette
export const WALLPAPER_TAGS: string[] = Array.from(
  new Set(GALLERY.flatMap((p) => p.tags))
).sort();

export const presetsByTag = (tag: string) =>
  GALLERY.filter((p) => p.tags.includes(tag));

export const presetsByStyle = (style: GradientStyle) =>
  GALLERY.filter((p) => p.style === style);

export const TAG_COPY: Record<string, string> = {
  dark: "Dark gradient wallpapers that stay easy on the eyes, with grain that keeps deep colours from banding on OLED screens.",
  light: "Light, airy gradient wallpapers for desktops that need to stay readable behind icons and windows.",
  blue: "Blue gradient wallpapers, from clear sky to deep sea.",
  purple: "Purple and violet gradient wallpapers with real texture.",
  pink: "Pink gradient wallpapers, from soft blush to hot magenta.",
  orange: "Warm orange and amber gradient wallpapers.",
  green: "Green gradient wallpapers with aurora and mint tones.",
  teal: "Teal and cyan gradient wallpapers.",
  cyan: "Cyan and ice-blue gradient wallpapers.",
  yellow: "Golden and sunlit gradient wallpapers.",
  peach: "Peach and apricot gradient wallpapers.",
  pastel: "Pastel gradient wallpapers with soft, low-contrast colour.",
  gray: "Grey and slate gradient wallpapers for a quiet desktop.",
  black: "Near-black gradient wallpapers built for OLED displays.",
  white: "Bright gradient wallpapers with white highlights.",
};
