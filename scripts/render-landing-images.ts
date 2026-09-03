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
};

const shots: Shot[] = [
  {
    file: "hero.jpg",
    width: 2000,
    height: 1250,
    style: "blobs",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    seed: 42,
    quality: 80,
  },
  {
    file: "og.jpg",
    width: 1200,
    height: 630,
    style: "blobs",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    seed: 42,
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
];

const nodeCreateCanvas = (width: number, height: number) =>
  createCanvas(width, height) as unknown as HTMLCanvasElement;

mkdirSync(OUT_DIR, { recursive: true });

for (const shot of shots) {
  const canvas = createCanvas(shot.width, shot.height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  const options: RenderOptions = {
    backgroundColor: shot.background,
    colors: shot.colors,
    blur: 700,
    noise: 0.2,
    contrast: 130,
    saturation: 110,
    seed: shot.seed,
    placement: "center",
    blurScale: shot.width / EXPORT_WIDTH,
    createCanvas: nodeCreateCanvas,
    style: shot.style,
  };
  const start = Date.now();
  renderGradient(ctx, shot.width, shot.height, options);
  const buffer = canvas.toBuffer("image/jpeg", shot.quality ?? 85);
  writeFileSync(join(OUT_DIR, shot.file), buffer);
  console.log(
    `${shot.file}: ${shot.width}x${shot.height} ${(buffer.length / 1024).toFixed(0)}KB in ${Date.now() - start}ms`
  );
}
