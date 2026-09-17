import { describe, expect, it } from "vitest";
import { placementGrid, snapPlacement } from "./placement";
import { overlayCenterFor } from "./gradient-renderer";

describe("placementGrid", () => {
  it("keeps cells near square with 6 across the short side and even counts", () => {
    expect(placementGrid(16 / 9)).toEqual({ cols: 10, rows: 6 });
    expect(placementGrid(1)).toEqual({ cols: 6, rows: 6 });
    expect(placementGrid(9 / 16)).toEqual({ cols: 6, rows: 10 });
    expect(placementGrid(5 / 2)).toEqual({ cols: 16, rows: 6 });
  });

  it("always has an intersection at the exact center", () => {
    for (const ratio of [16 / 9, 16 / 10, 1.91, 5 / 2, 1, 4 / 3, 9 / 16, 3 / 4, 4 / 5]) {
      expect(snapPlacement(0.5, 0.5, placementGrid(ratio))).toEqual([0.5, 0.5]);
    }
  });
});

describe("snapPlacement", () => {
  it("snaps a fraction to the nearest grid intersection, clamped to the frame", () => {
    const grid = { cols: 4, rows: 2 };
    expect(snapPlacement(0.3, 0.6, grid)).toEqual([0.25, 0.5]);
    expect(snapPlacement(-0.2, 1.4, grid)).toEqual([0, 1]);
  });
});

describe("overlayCenterFor", () => {
  it("is deterministic per seed and stays inside the middle of the frame", () => {
    const a = overlayCenterFor(7);
    expect(overlayCenterFor(7)).toEqual(a);
    expect(overlayCenterFor(8)).not.toEqual(a);
    for (const f of a) expect(f).toBeGreaterThanOrEqual(0.3);
    for (const f of a) expect(f).toBeLessThanOrEqual(0.7);
  });
});
