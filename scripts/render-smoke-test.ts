// Server-side render smoke test (UNF-208): proves the shared gradient
// renderer produces a valid 4K PNG in Node via @napi-rs/canvas — the
// foundation for the /api/export route. Run with: npm run test:render

import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderGradient, type RenderOptions } from "../lib/gradient-renderer";

const WIDTH = 3840;
const HEIGHT = 2160;

// @napi-rs/canvas is API-compatible with the DOM canvas for everything the
// renderer uses; the casts bridge the nominal type gap.
const nodeCreateCanvas = (width: number, height: number) =>
  createCanvas(width, height) as unknown as HTMLCanvasElement;

const baseOptions: Omit<RenderOptions, "noise"> = {
  backgroundColor: "#1A1B1D",
  colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
  blur: 700,
  contrast: 130,
  saturation: 110,
  seed: 42,
  placement: "center",
  blurScale: 1,
  createCanvas: nodeCreateCanvas,
};

const render = (noise: number) => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, WIDTH, HEIGHT, { ...baseOptions, noise });
  return { canvas, ctx };
};

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "ok:  " : "FAIL:"} ${name}${detail ? ` (${detail})` : ""}`);
  if (!cond) failures++;
};

const start = Date.now();
const { canvas, ctx } = render(0.2);
const renderMs = Date.now() - start;

const png = canvas.toBuffer("image/png");

// PNG signature + IHDR dimensions (big-endian at offsets 16/20)
check("PNG signature", png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])));
check("width is 3840", png.readUInt32BE(16) === WIDTH, `got ${png.readUInt32BE(16)}`);
check("height is 2160", png.readUInt32BE(20) === HEIGHT, `got ${png.readUInt32BE(20)}`);
check("non-trivial file size", png.length > 100_000, `${(png.length / 1024).toFixed(0)}KB`);

// Not a solid color: sample a grid and count distinct pixels
const samples = new Set<string>();
for (let sx = 0; sx < 20; sx++) {
  for (let sy = 0; sy < 20; sy++) {
    const px = ctx.getImageData(
      Math.floor(((sx + 0.5) * WIDTH) / 20),
      Math.floor(((sy + 0.5) * HEIGHT) / 20),
      1,
      1
    ).data;
    samples.add(`${px[0]},${px[1]},${px[2]}`);
  }
}
check("not a solid color", samples.size > 50, `${samples.size}/400 distinct samples`);

// Determinism: same seed with noise disabled must be byte-identical
const bufferA = render(0).canvas.toBuffer("image/png");
const bufferB = render(0).canvas.toBuffer("image/png");
check("same seed renders byte-identical (noise off)", bufferA.equals(bufferB));

// Different seed must differ
const other = createCanvas(WIDTH, HEIGHT);
renderGradient(
  other.getContext("2d") as unknown as CanvasRenderingContext2D,
  WIDTH,
  HEIGHT,
  { ...baseOptions, noise: 0, seed: 43 }
);
check("different seed renders differently", !other.toBuffer("image/png").equals(bufferA));

const outPath = join(tmpdir(), "gradient-smoke-test.png");
writeFileSync(outPath, png);
console.log(`\n4K render took ${renderMs}ms — inspect: ${outPath}`);

process.exit(failures ? 1 : 0);
