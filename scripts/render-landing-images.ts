// Renders the landing-page imagery with the real export renderer so the
// marketing site shows exactly what the studio produces. Output goes to
// public/landing/. Run with: npx tsx scripts/render-landing-images.ts

import { createCanvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  renderGradient,
  type GradientStyle,
  type RenderOptions,
} from "../lib/gradient-renderer";
import { GALLERY } from "../lib/gallery";

const OUT_DIR = join(process.cwd(), "public", "landing");
// Blur is specified relative to the 3840-wide export; scale it for
// smaller renders so the look matches the studio.
const EXPORT_WIDTH = 3840;

type Shot = {
  file: string;
  width: number;
  height: number;
  style: GradientStyle;
  background: string;
  colors: string[];
  seed: number;
  quality?: number;
  grain?: number;
};

const LOVABLE = GALLERY[0];

const shots: Shot[] = [
  {
    file: "hero.jpg",
    width: 2000,
    height: 1250,
    style: "blobs",
    background: LOVABLE.background,
    colors: LOVABLE.colors,
    seed: LOVABLE.seed,
    quality: 80,
  },
  {
    file: "og.jpg",
    width: 1200,
    height: 630,
    style: "blobs",
    background: LOVABLE.background,
    colors: LOVABLE.colors,
    seed: LOVABLE.seed,
  },
  {
    file: "blobs.jpg",
    width: 1200,
    height: 900,
    style: "blobs",
    background: "#0358f7",
    colors: ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe"],
    seed: 7,
  },
  {
    file: "stripes.jpg",
    width: 1200,
    height: 900,
    style: "stripes",
    background: "#635BFF",
    colors: ["#F15372", "#FFCA3B", "#76E2FF", "#B5DAB9"],
    seed: 11,
  },
  {
    file: "clouds.jpg",
    width: 1200,
    height: 900,
    style: "clouds",
    background: "#11131D",
    colors: ["#2A6DCE", "#1796E2", "#1DC19C", "#3FA9DD"],
    seed: 3,
  },
  // Gallery tiles, 16:10 like the hero canvas
  ...GALLERY.map((preset) => ({
    file: `gallery/${preset.slug}.jpg`,
    width: 960,
    height: 600,
    style: preset.style,
    background: preset.background,
    colors: preset.colors,
    seed: preset.seed,
  })),
];

const nodeCreateCanvas = (width: number, height: number) =>
  createCanvas(width, height) as unknown as HTMLCanvasElement;

const baseOptions = (shot: Shot, width: number): RenderOptions => ({
  backgroundColor: shot.background,
  colors: shot.colors,
  blur: 700,
  grain: shot.grain ?? 0.2,
  contrast: 130,
  saturation: 110,
  seed: shot.seed,
  placement: "center",
  blurScale: width / EXPORT_WIDTH,
  createCanvas: nodeCreateCanvas,
  style: shot.style,
});

mkdirSync(join(OUT_DIR, "gallery"), { recursive: true });

for (const shot of shots) {
  const canvas = createCanvas(shot.width, shot.height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  const start = Date.now();
  renderGradient(ctx, shot.width, shot.height, baseOptions(shot, shot.width));
  const buffer = canvas.toBuffer("image/jpeg", shot.quality ?? 85);
  writeFileSync(join(OUT_DIR, shot.file), buffer);
  console.log(
    `${shot.file}: ${shot.width}x${shot.height} ${(buffer.length / 1024).toFixed(0)}KB in ${Date.now() - start}ms`
  );
}

// Grain before/after: render a subtle dark palette at full 4K with and
// without grain, then crop the same 720x450 region at 100% so the page can
// show real banding next to real grain rather than a mock-up. JPEG at q92
// keeps the grain intact at a sane file size.
const grainShot: Shot = {
  file: "",
  width: 3840,
  height: 2160,
  style: "blobs",
  background: "#0B0F19",
  colors: ["#1E2A5A", "#2B1E4A", "#1B3B4A", "#14213D"],
  seed: 77,
};
for (const [file, grain] of [
  ["grain-off.jpg", 0],
  ["grain-on.jpg", 0.12],
] as const) {
  const full = createCanvas(grainShot.width, grainShot.height);
  const ctx = full.getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, grainShot.width, grainShot.height, {
    ...baseOptions(grainShot, grainShot.width),
    grain,
  });
  const cropW = 720;
  const cropH = 450;
  const crop = createCanvas(cropW, cropH);
  const cctx = crop.getContext("2d");
  cctx.drawImage(full, 1500, 950, cropW, cropH, 0, 0, cropW, cropH);
  const buffer = crop.toBuffer("image/jpeg", 92);
  writeFileSync(join(OUT_DIR, file), buffer);
  console.log(`${file}: ${cropW}x${cropH} crop ${(buffer.length / 1024).toFixed(0)}KB`);
}
