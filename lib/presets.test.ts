import { describe, expect, test } from "vitest";
import {
  MAX_PRESETS_PER_USER,
  dedupeName,
  paletteMatchesPreset,
  presetInputSchema,
  presetUpdateSchema,
  reorderSchema,
} from "./presets";

describe("presetInputSchema", () => {
  const valid = {
    name: "Sunset Drift",
    background: "#1a1b1d",
    colors: ["#fe7a04", "#FE4F1A"],
  };

  test("accepts a valid preset", () => {
    expect(presetInputSchema.parse(valid)).toEqual(valid);
  });

  test("trims the name", () => {
    const parsed = presetInputSchema.parse({ ...valid, name: "  Dawn  " });
    expect(parsed.name).toBe("Dawn");
  });

  test("rejects a name that is empty after trimming", () => {
    expect(presetInputSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false
    );
  });

  test("rejects a name longer than 40 characters", () => {
    const name = "x".repeat(41);
    expect(presetInputSchema.safeParse({ ...valid, name }).success).toBe(false);
  });

  test("rejects a non-hex background", () => {
    const bad = { ...valid, background: "blue" };
    expect(presetInputSchema.safeParse(bad).success).toBe(false);
  });

  test("rejects shorthand hex colors", () => {
    const bad = { ...valid, colors: ["#fff"] };
    expect(presetInputSchema.safeParse(bad).success).toBe(false);
  });

  test("rejects an empty colors array", () => {
    expect(
      presetInputSchema.safeParse({ ...valid, colors: [] }).success
    ).toBe(false);
  });

  test("rejects more than 8 colors", () => {
    const colors = Array.from({ length: 9 }, () => "#123456");
    expect(presetInputSchema.safeParse({ ...valid, colors }).success).toBe(
      false
    );
  });

  test("rejects unknown keys", () => {
    const bad = { ...valid, isAdmin: true };
    expect(presetInputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("dedupeName", () => {
  test("returns the name unchanged when unused", () => {
    expect(dedupeName("Sunset", ["Ocean"])).toBe("Sunset");
  });

  test("appends 2 on first collision", () => {
    expect(dedupeName("Sunset", ["Sunset"])).toBe("Sunset 2");
  });

  test("keeps counting past existing numbered copies", () => {
    expect(dedupeName("Sunset", ["Sunset", "Sunset 2", "Sunset 3"])).toBe(
      "Sunset 4"
    );
  });

  test("compares case-insensitively", () => {
    expect(dedupeName("sunset", ["Sunset"])).toBe("sunset 2");
  });

  test("truncates so the suffix still fits the 40-char limit", () => {
    const long = "x".repeat(40);
    const result = dedupeName(long, [long]);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.endsWith(" 2")).toBe(true);
  });
});

describe("paletteMatchesPreset", () => {
  const preset = {
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A"],
  };

  test("matches identical palette ignoring case", () => {
    expect(
      paletteMatchesPreset(preset, "#1a1b1d", ["#fe7a04", "#fe4f1a"])
    ).toBe(true);
  });

  test("does not match a different background", () => {
    expect(
      paletteMatchesPreset(preset, "#000000", ["#fe7a04", "#fe4f1a"])
    ).toBe(false);
  });

  test("does not match when colors differ in length or order", () => {
    expect(paletteMatchesPreset(preset, "#1a1b1d", ["#fe7a04"])).toBe(false);
    expect(
      paletteMatchesPreset(preset, "#1a1b1d", ["#fe4f1a", "#fe7a04"])
    ).toBe(false);
  });
});

describe("MAX_PRESETS_PER_USER", () => {
  test("is 50", () => {
    expect(MAX_PRESETS_PER_USER).toBe(50);
  });
});

describe("presetUpdateSchema", () => {
  test("accepts a partial update with only a name", () => {
    expect(presetUpdateSchema.parse({ name: " Dusk " })).toEqual({
      name: "Dusk",
    });
  });

  test("accepts colors and background together", () => {
    const patch = { background: "#112233", colors: ["#445566"] };
    expect(presetUpdateSchema.parse(patch)).toEqual(patch);
  });

  test("rejects an empty patch", () => {
    expect(presetUpdateSchema.safeParse({}).success).toBe(false);
  });

  test("rejects unknown keys and invalid colors", () => {
    expect(presetUpdateSchema.safeParse({ id: "x" }).success).toBe(false);
    expect(
      presetUpdateSchema.safeParse({ colors: ["red"] }).success
    ).toBe(false);
  });
});

describe("reorderSchema", () => {
  const id = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";

  test("accepts a list of uuids", () => {
    expect(reorderSchema.parse({ order: [id] })).toEqual({ order: [id] });
  });

  test("rejects non-uuid entries, empty lists, and unknown keys", () => {
    expect(reorderSchema.safeParse({ order: ["nope"] }).success).toBe(false);
    expect(reorderSchema.safeParse({ order: [] }).success).toBe(false);
    expect(
      reorderSchema.safeParse({ order: [id], extra: 1 }).success
    ).toBe(false);
  });

  test("rejects more entries than the preset cap", () => {
    const order = Array.from({ length: 51 }, () => id);
    expect(reorderSchema.safeParse({ order }).success).toBe(false);
  });
});
