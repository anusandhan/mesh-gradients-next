import { describe, expect, test } from "vitest";
import { createCanvas, Path2D } from "@napi-rs/canvas";
import { OVERLAY_SHAPES, renderGradient, type RenderOptions } from "./gradient-renderer";

const W = 160;
const H = 90;
const nodeCreateCanvas = (w: number, h: number) =>
  createCanvas(w, h) as unknown as HTMLCanvasElement;

const base: RenderOptions = {
  backgroundColor: "#1A1B1D",
  colors: ["#FE7A04", "#F35CBE", "#7472FC"],
  blur: 200,
  grain: 0,
  contrast: 100,
  saturation: 100,
  seed: 7,
  placement: "random",
  blurScale: W / 3840,
  createCanvas: nodeCreateCanvas,
};

const pixels = (opts: Partial<RenderOptions>) => {
  const ctx = createCanvas(W, H).getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, W, H, { ...base, ...opts });
  return ctx.getImageData(0, 0, W, H).data;
};

const differing = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > 2 || Math.abs(a[i + 1] - b[i + 1]) > 2) n++;
  }
  return n;
};

describe("effect opacity", () => {
  test("0% opacity leaves the smooth gradient untouched", () => {
    const plain = pixels({});
    const faded = pixels({ effect: "pixel", effectSize: 64, effectOpacity: 0 });
    expect(differing(plain, faded)).toBe(0);
  });

  test("100% opacity is the full finish; 50% sits between", () => {
    const plain = pixels({});
    const full = pixels({ effect: "pixel", effectSize: 64, effectOpacity: 1 });
    const half = pixels({ effect: "pixel", effectSize: 64, effectOpacity: 0.5 });
    const dFull = differing(plain, full);
    const dHalf = differing(plain, half);
    expect(dFull).toBeGreaterThan(W * H * 0.3);
    // Half-blended pixels still differ from plain but by less
    let sumFull = 0;
    let sumHalf = 0;
    for (let i = 0; i < plain.length; i += 4) {
      sumFull += Math.abs(plain[i] - full[i]);
      sumHalf += Math.abs(plain[i] - half[i]);
    }
    expect(sumHalf).toBeGreaterThan(0);
    expect(sumHalf).toBeLessThan(sumFull * 0.7);
    expect(dHalf).toBeGreaterThan(0);
  });
});

describe("dither characters", () => {
  test("custom characters change the dither output", () => {
    const symbols = pixels({ effect: "dither", effectSize: 64 });
    const chars = pixels({ effect: "dither", effectSize: 64, ditherChars: "@#" });
    expect(differing(symbols, chars)).toBeGreaterThan(0);
  });

  test("glyphs-only dither leaves the gradient smooth between glyphs", () => {
    const smooth = pixels({ effect: "none" });
    const dithered = pixels({ effect: "dither", effectSize: 64 });
    const glyphs = pixels({ effect: "dither", effectSize: 64, ditherGlyphsOnly: true });
    // Cell corners carry no glyph: untouched with glyphs only, quantized otherwise
    const corner = (d: Uint8ClampedArray) => Array.from(d.slice(8, 12));
    expect(corner(glyphs)).toEqual(corner(smooth));
    expect(corner(dithered)).not.toEqual(corner(smooth));
    // ...but the glyphs themselves are there
    expect(differing(glyphs, smooth)).toBeGreaterThan(50);
  });
});

describe("shapes overlay", () => {
  test("none draws nothing extra", () => {
    expect(differing(pixels({}), pixels({ overlay: "none" }))).toBe(0);
  });

  test("each built-in shape paints strokes over the gradient", () => {
    const plain = pixels({});
    for (const shape of OVERLAY_SHAPES.filter((s) => s !== "custom")) {
      const over = pixels({
        overlay: "shapes",
        overlayShape: shape,
        overlayOpacity: 1,
        overlaySpacing: 200,
        overlayStroke: 40,
      });
      expect(differing(plain, over), shape).toBeGreaterThan(50);
    }
  });

  test("custom overlay strokes the supplied path at growing scales", () => {
    const plain = pixels({});
    const over = pixels({
      overlay: "shapes",
      overlayShape: "custom",
      overlayPath: { path: new Path2D("M2 2h16v16H2z") as unknown as Path2D, box: [0, 0, 20, 20] },
      overlayOpacity: 1,
      overlaySpacing: 200,
      overlayStroke: 40,
    });
    expect(differing(plain, over)).toBeGreaterThan(50);
  });

  test("shapes stack on top of a pixel finish", () => {
    const finished = pixels({ effect: "pixel", effectSize: 64 });
    const both = pixels({
      effect: "pixel",
      effectSize: 64,
      overlay: "shapes",
      overlayShape: "circle",
      overlayOpacity: 1,
      overlaySpacing: 200,
      overlayStroke: 40,
    });
    expect(differing(finished, both)).toBeGreaterThan(50);
  });
});

describe("preview and export parity", () => {
  // The preview renders at a fraction of export size (blurScale < 1). Every
  // finish cell must land on the same grid and snap to the same color, or
  // the download looks different from what the studio showed.
  const cellAgreement = (opts: Partial<RenderOptions>) => {
    const EW = 400;
    const EH = 500;
    const PW = 200;
    const PH = 250;
    const cell = 20; // export px -> 10 preview px, 20 x 25 cells
    const exportCtx = createCanvas(EW, EH).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(exportCtx, EW, EH, { ...base, ...opts, effectSize: cell, blurScale: 1 });
    const previewCtx = createCanvas(PW, PH).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(previewCtx, PW, PH, { ...base, ...opts, effectSize: cell, blurScale: PW / EW });
    const small = createCanvas(PW, PH).getContext("2d");
    small.drawImage(exportCtx.canvas as unknown as HTMLCanvasElement as never, 0, 0, PW, PH);
    const a = small.getImageData(0, 0, PW, PH).data;
    const b = previewCtx.getImageData(0, 0, PW, PH).data;
    const c = cell * (PW / EW);
    let agree = 0;
    let total = 0;
    for (let cy = 0; cy < PH / c; cy++) {
      for (let cx = 0; cx < PW / c; cx++) {
        const mean = [0, 0, 0, 0, 0, 0];
        let n = 0;
        for (let y = cy * c; y < (cy + 1) * c; y++) {
          for (let x = cx * c; x < (cx + 1) * c; x++) {
            const i = (y * PW + x) * 4;
            for (let k = 0; k < 3; k++) {
              mean[k] += a[i + k];
              mean[k + 3] += b[i + k];
            }
            n++;
          }
        }
        const off = Math.max(
          Math.abs(mean[0] - mean[3]),
          Math.abs(mean[1] - mean[4]),
          Math.abs(mean[2] - mean[5])
        ) / n;
        if (off <= 12) agree++;
        total++;
      }
    }
    return agree / total;
  };

  test("dither with grain snaps the same cells in preview and export", () => {
    expect(cellAgreement({ effect: "dither", grain: 0.2, effectOpacity: 1 })).toBeGreaterThan(0.98);
  });

  test("pixel with grain matches", () => {
    expect(cellAgreement({ effect: "pixel", grain: 0.2, effectOpacity: 1 })).toBeGreaterThan(0.98);
  });

  test("character dither matches", () => {
    expect(
      cellAgreement({ effect: "dither", grain: 0.2, ditherChars: "@#%", effectOpacity: 1 })
    ).toBeGreaterThan(0.98);
  });
});

describe("grain parity", () => {
  // Grain must read the same at any render scale: the preview's grain should
  // look like the export's grain seen at preview size, not coarser
  test("preview grain matches the downscaled export within a few levels", () => {
    const EW = 400;
    const EH = 250;
    const PW = 100;
    const PH = 63;
    const opts = { ...base, grain: 0.3, contrast: 100, saturation: 100 };
    const exportCtx = createCanvas(EW, EH).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(exportCtx, EW, EH, { ...opts, blurScale: 1 });
    const previewCtx = createCanvas(PW, PH).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(previewCtx, PW, PH, { ...opts, blurScale: PW / EW });
    // Box-average the export 4x4 (what a screen shows at preview size)
    const full = exportCtx.getImageData(0, 0, EW, EH).data;
    const b = previewCtx.getImageData(0, 0, PW, PH).data;
    const f = EW / PW;
    let sum = 0;
    let n = 0;
    for (let y = 0; y < PH - 1; y++) {
      for (let x = 0; x < PW; x++) {
        const acc = [0, 0, 0];
        for (let dy = 0; dy < f; dy++) {
          for (let dx = 0; dx < f; dx++) {
            const i = ((y * f + dy) * EW + x * f + dx) * 4;
            acc[0] += full[i];
            acc[1] += full[i + 1];
            acc[2] += full[i + 2];
          }
        }
        const j = (y * PW + x) * 4;
        for (let k = 0; k < 3; k++) sum += Math.abs(acc[k] / (f * f) - b[j + k]);
        n++;
      }
    }
    expect(sum / n / 3).toBeLessThan(9);
  });
});

describe("overlay path offset", () => {
  // Rings grow like Illustrator's Offset Path: each ring sits a constant
  // distance outside the previous one, so a square's corners round off and
  // the diagonal spacing equals the axis spacing (scaled copies would space
  // the diagonal by sqrt 2 more)
  test("square rings are equidistant along the axis and the diagonal", () => {
    const W = 400;
    const H = 400;
    const ctx = createCanvas(W, H).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(ctx, W, H, {
      ...base,
      colors: [],
      backgroundColor: "#000000",
      contrast: 100,
      saturation: 100,
      blurScale: 1,
      overlay: "shapes",
      overlayShape: "square",
      overlaySize: 100, // base square 100 wide
      overlaySpacing: 40,
      overlayStroke: 4,
      overlayOpacity: 1,
      overlayCenter: [0.5, 0.5],
    });
    const bright = (x: number, y: number) =>
      ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data[0] > 128;
    const c = 200;
    // Axis: ring k hugs the outside of offset 40k, so its band is [50+40k, 54+40k]
    expect(bright(c + 52, c)).toBe(true);
    expect(bright(c + 52 + 40, c)).toBe(true);
    expect(bright(c + 52 + 120, c)).toBe(true);
    expect(bright(c + 72, c)).toBe(false);
    // Diagonal: offset rings round the corner, radius 40k around the corner
    // (50, 50), so ring 3 sits at 50*sqrt2 + 120 (+2) from the center
    const d3 = (50 * Math.SQRT2 + 122) / Math.SQRT2;
    expect(bright(c + d3, c + d3)).toBe(true);
    // A scaled copy would put ring 3's corner at (50+120)*sqrt2; nothing there
    const scaled = 170 + 2 / Math.SQRT2;
    expect(bright(c + scaled, c + scaled)).toBe(false);
  });

  test("custom path rings follow the same offset geometry as built-in shapes", () => {
    const W = 400;
    const H = 400;
    const ctx = createCanvas(W, H).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(ctx, W, H, {
      ...base,
      colors: [],
      backgroundColor: "#000000",
      contrast: 100,
      saturation: 100,
      blurScale: 1,
      overlay: "shapes",
      overlayShape: "custom",
      // Same 100px square as the built-in test, as an uploaded path
      overlayPath: {
        path: new Path2D("M0 0h100v100H0z") as unknown as globalThis.Path2D,
        box: [0, 0, 100, 100],
      },
      overlaySize: 100,
      overlaySpacing: 40,
      overlayStroke: 4,
      overlayOpacity: 1,
      overlayCenter: [0.5, 0.5],
    });
    const red = (x: number, y: number) => ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data[0];
    const c = 200;
    expect(red(c, c)).toBeLessThan(40); // inside the shape stays clear
    expect(red(c + 52, c)).toBeGreaterThan(128);
    expect(red(c + 92, c)).toBeGreaterThan(128);
    expect(red(c + 172, c)).toBeGreaterThan(128);
    expect(red(c + 72, c)).toBeLessThan(40);
    const d3 = (50 * Math.SQRT2 + 122) / Math.SQRT2;
    expect(red(c + d3, c + d3)).toBeGreaterThan(128);
    const scaled = 170 + 2 / Math.SQRT2;
    expect(red(c + scaled, c + scaled)).toBeLessThan(40);
  });

  test("custom rings survive a scratch canvas reused after a built-in shape", () => {
    // The browser pools scratch canvases by size, so the overlay layer's
    // context carries state from the previous frame
    const pool = new Map<string, HTMLCanvasElement>();
    const pooled = (w: number, h: number) => {
      const key = `${w}x${h}`;
      if (!pool.has(key)) pool.set(key, createCanvas(w, h) as unknown as HTMLCanvasElement);
      return pool.get(key)!;
    };
    const W = 200;
    const H = 200;
    const ctx = createCanvas(W, H).getContext("2d") as unknown as CanvasRenderingContext2D;
    const opts: RenderOptions = {
      ...base,
      colors: [],
      backgroundColor: "#000000",
      contrast: 100,
      saturation: 100,
      blurScale: 1,
      createCanvas: pooled,
      overlay: "shapes",
      overlaySize: 100,
      overlaySpacing: 40,
      overlayStroke: 4,
      overlayOpacity: 1,
      overlayCenter: [0.5, 0.5],
    };
    renderGradient(ctx, W, H, { ...opts, overlayShape: "circle" });
    renderGradient(ctx, W, H, {
      ...opts,
      overlayShape: "custom",
      overlayPath: { path: new Path2D("M0 0h100v100H0z") as unknown as globalThis.Path2D, box: [0, 0, 100, 100] },
    });
    expect(ctx.getImageData(152, 100, 1, 1).data[0]).toBeGreaterThan(128);
  });

  test("stroke-only artwork (an open line) still gets rings", () => {
    const W = 200;
    const H = 200;
    const ctx = createCanvas(W, H).getContext("2d") as unknown as CanvasRenderingContext2D;
    renderGradient(ctx, W, H, {
      ...base,
      colors: [],
      backgroundColor: "#000000",
      contrast: 100,
      saturation: 100,
      blurScale: 1,
      overlay: "shapes",
      overlayShape: "custom",
      overlayPath: { path: new Path2D("M0 50h100") as unknown as globalThis.Path2D, box: [0, 0, 100, 100] },
      overlaySize: 100,
      overlaySpacing: 40,
      overlayStroke: 4,
      overlayOpacity: 1,
      overlayCenter: [0.5, 0.5],
    });
    // Ring 0 hugs the line: 1..4px above and below y = 100
    expect(ctx.getImageData(100, 97, 1, 1).data[0]).toBeGreaterThan(128);
    expect(ctx.getImageData(100, 103, 1, 1).data[0]).toBeGreaterThan(128);
    // Ring 1 sits 40px out
    expect(ctx.getImageData(100, 58, 1, 1).data[0]).toBeGreaterThan(128);
  });
});
