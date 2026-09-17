// Overlay placement grid: square-ish cells, six across the short side,
// so the box reads the same at any aspect ratio. Counts stay even so the
// exact center is always an intersection. Fractions of width/height
// throughout, matching RenderOptions.overlayCenter.

export type PlacementGrid = { cols: number; rows: number };

const even = (n: number) => 2 * Math.round(n / 2);

export const placementGrid = (ratio: number): PlacementGrid =>
  ratio >= 1
    ? { cols: even(6 * ratio), rows: 6 }
    : { cols: 6, rows: even(6 / ratio) };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const snapPlacement = (
  fx: number,
  fy: number,
  { cols, rows }: PlacementGrid
): [number, number] => [
  Math.round(clamp01(fx) * cols) / cols,
  Math.round(clamp01(fy) * rows) / rows,
];
