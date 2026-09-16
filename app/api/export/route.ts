import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCanvas, GlobalFonts, Path2D } from "@napi-rs/canvas";
import { join } from "node:path";
import { z } from "zod";
import {
  renderGradient,
  DITHER_FONT,
  DITHER_CHARS_MAX,
  OVERLAY_SHAPES,
} from "@/lib/gradient-renderer";
import { PATH_DATA } from "@/lib/svg-outline";
import { STUDIO_ASPECT_RATIOS } from "@/lib/gallery";
import { getOrCreateUser, isPro, tryConsumeExport, rateLimit } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Same face the browser preview loads, so character dither exports match.
// The file is pulled into the function bundle by outputFileTracingIncludes.
GlobalFonts.registerFromPath(
  join(process.cwd(), "public", "fonts", "AzeretMono.ttf"),
  DITHER_FONT
);

// Fixed aspect allowlist — the client never sends pixel dimensions.
// Mirrors the UI: landscape at 3840 wide, portrait/square at 2160 tall.
const ASPECT_RATIOS = STUDIO_ASPECT_RATIOS;

const exportDimensions = (aspectRatio: string) => {
  const [w, h] = aspectRatio.split(":").map(Number);
  const ratio = w / h;
  return ratio > 1
    ? { width: 3840, height: Math.round(3840 / ratio) }
    : { width: Math.round(2160 * ratio), height: 2160 };
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const bodySchema = z.object({
  seed: z.number().int().min(0).max(4294967295),
  placement: z.enum(["center", "random"]),
  backgroundColor: z.string().regex(HEX),
  colors: z.array(z.string().regex(HEX)).min(1).max(8),
  blur: z.number().min(0).max(1000),
  grain: z.number().min(0).max(0.8),
  contrast: z.number().min(50).max(200),
  saturation: z.number().min(50).max(200),
  aspectRatio: z.enum(ASPECT_RATIOS),
  style: z.enum(["blobs", "stripes", "clouds"]).default("blobs"),
  fiberDensity: z.number().min(0).max(2).default(1),
  waviness: z.number().min(0).max(2).default(1),
  sheen: z.number().min(0).max(2).default(0.2),
  coverage: z.number().min(0).max(2).default(1),
  softness: z.number().min(0).max(2).default(1),
  detail: z.number().min(0).max(2).default(1),
  effect: z.enum(["none", "pixel", "dither"]).default("none"),
  effectSize: z.number().min(8).max(64).default(24),
  effectStrength: z.number().min(0).max(2).default(1),
  effectOpacity: z.number().min(0).max(1).default(1),
  ditherChars: z.string().max(DITHER_CHARS_MAX * 2).default(""),
  overlay: z.enum(["none", "shapes"]).default("none"),
  overlayShape: z.enum(OVERLAY_SHAPES).default("circle"),
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  overlaySize: z.number().min(100).max(3000).default(800),
  overlaySpacing: z.number().min(10).max(200).default(60),
  overlayStroke: z.number().min(1).max(20).default(3),
  overlayCenter: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).optional(),
  // Uploaded SVG, already reduced to one path in its viewBox units
  overlayPath: z
    .object({
      d: z.string().min(1).max(70_000).regex(PATH_DATA),
      box: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]),
    })
    .strict()
    .optional(),
  // JPEG default: the grain makes PNGs huge (~16MB at 4K) and slow to
  // encode/transfer; JPEG at q92 is visually identical here and ~8x smaller
  format: z.enum(["jpeg", "png"]).default("jpeg"),
}).strict();

const nodeCreateCanvas = (width: number, height: number) =>
  createCanvas(width, height) as unknown as HTMLCanvasElement;

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Sign in to export" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress;
  if (!email || email.verification?.status !== "verified") {
    return NextResponse.json(
      { error: "Verify your email address to export" },
      { status: 403 }
    );
  }

  // Rate limits protect render CPU even for Pro users: per-user and,
  // as a backstop against account farming, per-IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [userLimit, ipLimit] = await Promise.all([
    rateLimit(`export:user:${clerkUserId}`, 10),
    rateLimit(`export:ip:${ip}`, 20),
  ]);
  if (!userLimit.ok || !ipLimit.ok) {
    const retryAfter = Math.max(userLimit.retryAfter, ipLimit.retryAfter);
    return NextResponse.json(
      { error: "Too many exports, try again shortly", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const input = parsed.data;

  const dbUser = await getOrCreateUser(clerkUserId, email.emailAddress);

  // Pro: unlimited. Free: atomically consume one of the monthly exports.
  let remaining: number | null = null;
  const pro = await isPro(dbUser.id);
  if (!pro) {
    remaining = await tryConsumeExport(dbUser.id);
    if (remaining === null) {
      return NextResponse.json(
        {
          error: "Free export limit reached",
          code: "quota_exhausted",
          remaining: 0,
        },
        { status: 402 }
      );
    }
  }

  const needsPath = input.overlay === "shapes" && input.overlayShape === "custom";
  if (needsPath && !input.overlayPath) {
    return NextResponse.json({ error: "Custom overlay needs an SVG" }, { status: 400 });
  }
  const overlayPath =
    needsPath && input.overlayPath
      ? {
          path: new Path2D(input.overlayPath.d) as unknown as globalThis.Path2D,
          box: input.overlayPath.box,
        }
      : undefined;

  const { width, height } = exportDimensions(input.aspectRatio);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, width, height, {
    backgroundColor: input.backgroundColor,
    colors: input.colors,
    blur: input.blur,
    grain: input.grain,
    contrast: input.contrast,
    saturation: input.saturation,
    seed: input.seed,
    placement: input.placement,
    style: input.style,
    fiberDensity: input.fiberDensity,
    waviness: input.waviness,
    sheen: input.sheen,
    coverage: input.coverage,
    softness: input.softness,
    detail: input.detail,
    effect: input.effect,
    effectSize: input.effectSize,
    effectStrength: input.effectStrength,
    effectOpacity: input.effectOpacity,
    ditherChars: input.ditherChars,
    overlay: input.overlay,
    overlayShape: input.overlayShape,
    overlayOpacity: input.overlayOpacity,
    overlaySize: input.overlaySize,
    overlaySpacing: input.overlaySpacing,
    overlayStroke: input.overlayStroke,
    overlayCenter: input.overlayCenter,
    overlayPath,
    blurScale: 1,
    createCanvas: nodeCreateCanvas,
  });

  const isJpeg = input.format === "jpeg";
  const image = isJpeg
    ? canvas.toBuffer("image/jpeg", 92)
    : canvas.toBuffer("image/png");
  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": isJpeg ? "image/jpeg" : "image/png",
      "Content-Disposition": "attachment",
      "Cache-Control": "no-store",
      "X-Exports-Remaining": pro ? "unlimited" : String(remaining),
    },
  });
}
