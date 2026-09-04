import { NextRequest, NextResponse } from "next/server";
import { createCanvas } from "@napi-rs/canvas";
import { renderGradient } from "@/lib/gradient-renderer";
import { findPreset } from "@/lib/gallery";
import {
  PREVIEW_SIZE,
  WALLPAPER_SIZES,
  isWallpaperSize,
  wallpaperFilename,
} from "@/lib/wallpapers";
import { rateLimit } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Free, sign-in-less wallpaper downloads for the curated collection.
// Curated only: the slug must be a gallery palette, so this can't be used
// to bypass the export quota for custom gradients. Responses are immutable
// (the URL carries a version) and cached at the CDN, so each file renders
// once per deploy, not once per visitor.

const nodeCreateCanvas = (width: number, height: number) =>
  createCanvas(width, height) as unknown as HTMLCanvasElement;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const preset = findPreset(slug);
  if (!preset) {
    return NextResponse.json({ error: "Unknown wallpaper" }, { status: 404 });
  }

  const sizeParam = request.nextUrl.searchParams.get("size") ?? "desktop";
  const size =
    sizeParam === "preview"
      ? PREVIEW_SIZE
      : isWallpaperSize(sizeParam)
        ? WALLPAPER_SIZES.find((s) => s.id === sizeParam)!
        : null;
  if (!size) {
    return NextResponse.json({ error: "Unknown size" }, { status: 400 });
  }

  // Renders cost real CPU; the CDN absorbs repeats, this absorbs bursts
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimit(`wallpaper:ip:${ip}`, 12);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many downloads, try again shortly" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { width, height } = size;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, width, height, {
    backgroundColor: preset.background,
    colors: preset.colors,
    blur: 700,
    grain: 0.2,
    contrast: 130,
    saturation: 110,
    seed: preset.seed,
    placement: "center",
    style: preset.style,
    // Blur is defined against the 4K export; scale it so every size shows
    // the same composition as the gallery tile
    blurScale: width >= height ? width / 3840 : height / 2160,
    createCanvas: nodeCreateCanvas,
  });

  const image = canvas.toBuffer("image/jpeg", 92);
  const headers: Record<string, string> = {
    "Content-Type": "image/jpeg",
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  };
  if (size.id !== "preview") {
    headers["Content-Disposition"] =
      `attachment; filename="${wallpaperFilename(preset, size)}"`;
  }
  return new NextResponse(new Uint8Array(image), { headers });
}
