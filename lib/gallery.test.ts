import { describe, expect, test } from "vitest";
import {
  GALLERY,
  buildStudioUrl,
  findPreset,
  parseStudioParams,
  presetToStudioUrl,
} from "./gallery";

describe("gallery presets", () => {
  test("slugs are unique and url-safe", () => {
    const slugs = GALLERY.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  test("every preset has valid hex colours", () => {
    for (const preset of GALLERY) {
      expect(preset.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.colors.length).toBeGreaterThanOrEqual(1);
      expect(preset.colors.length).toBeLessThanOrEqual(8);
      for (const c of preset.colors) expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test("covers all three styles", () => {
    const styles = new Set(GALLERY.map((p) => p.style));
    expect(styles).toEqual(new Set(["blobs", "stripes", "clouds"]));
  });

  test("findPreset", () => {
    expect(findPreset("lovable")?.name).toBe("Lovable");
    expect(findPreset("nope")).toBeNull();
  });
});

describe("studio deep links", () => {
  test("round-trips a preset through the URL", () => {
    const preset = GALLERY[0];
    const url = presetToStudioUrl(preset);
    expect(url.startsWith("/app?")).toBe(true);
    const parsed = parseStudioParams(url.slice("/app".length));
    expect(parsed.style).toBe(preset.style);
    expect(parsed.background).toBe(preset.background.toUpperCase());
    expect(parsed.colors).toEqual(preset.colors.map((c) => c.toUpperCase()));
    expect(parsed.seed).toBe(preset.seed);
    expect(parsed.name).toBe(preset.name);
  });

  test("builds a plain /app when nothing is set", () => {
    expect(buildStudioUrl({})).toBe("/app");
  });

  test("carries the plan and aspect ratio", () => {
    const url = buildStudioUrl({ plan: "week", aspectRatio: "1.91:1" });
    const parsed = parseStudioParams(url.slice("/app".length));
    expect(parsed.plan).toBe("week");
    expect(parsed.aspectRatio).toBe("1.91:1");
  });

  test("drops invalid values instead of throwing", () => {
    const parsed = parseStudioParams(
      "?style=neon&bg=zzz&colors=FF0000,nothex&seed=-1&noise=9&blur=5000&aspect=2:1&plan=lifetime"
    );
    expect(parsed).toEqual({});
  });

  test("accepts the bounds the export API accepts", () => {
    const parsed = parseStudioParams("?noise=0.8&blur=1000&seed=4294967295");
    expect(parsed).toEqual({ noise: 0.8, blur: 1000, seed: 4294967295 });
  });

  test("truncates long names", () => {
    const parsed = parseStudioParams(`?name=${"x".repeat(80)}`);
    expect(parsed.name?.length).toBe(40);
  });
});
