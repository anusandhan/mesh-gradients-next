import { describe, expect, test } from "vitest";
import { GALLERY } from "./gallery";
import {
  PREVIEW_SIZE,
  TAG_COPY,
  WALLPAPER_SIZES,
  WALLPAPER_TAGS,
  isWallpaperSize,
  presetsByTag,
  wallpaperFilename,
  wallpaperUrl,
} from "./wallpapers";

describe("wallpapers", () => {
  test("every palette has at least one tag and every tag has copy", () => {
    for (const p of GALLERY) expect(p.tags.length).toBeGreaterThan(0);
    for (const tag of WALLPAPER_TAGS) expect(TAG_COPY[tag]).toBeTruthy();
  });

  test("sizes are sane", () => {
    for (const s of WALLPAPER_SIZES) {
      expect(s.width).toBeGreaterThan(1000);
      expect(s.height).toBeGreaterThan(1000);
    }
    expect(isWallpaperSize("mac")).toBe(true);
    expect(isWallpaperSize("tablet")).toBe(false);
    expect(PREVIEW_SIZE.width).toBeLessThan(WALLPAPER_SIZES[0].width);
  });

  test("urls and filenames", () => {
    expect(wallpaperUrl("ember", "desktop")).toMatch(/^\/api\/wallpaper\/ember\?size=desktop&v=\d+$/);
    expect(wallpaperFilename(GALLERY[0], WALLPAPER_SIZES[1])).toBe(
      "gradients-studio-ember-5120x2880.jpg"
    );
  });

  test("tag lookup", () => {
    expect(presetsByTag("dark").length).toBeGreaterThan(2);
    expect(presetsByTag("nope")).toHaveLength(0);
  });
});
