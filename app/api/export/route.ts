import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCanvas } from "@napi-rs/canvas";
import { z } from "zod";
import { renderGradient } from "@/lib/gradient-renderer";
import { getOrCreateUser, isPro, tryConsumeExport } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Fixed aspect allowlist — the client never sends pixel dimensions.
// Mirrors the UI: landscape at 3840 wide, portrait/square at 2160 tall.
const ASPECT_RATIOS = ["16:9", "1:1", "4:3", "9:16", "3:4", "4:5"] as const;

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
  noise: z.number().min(0).max(0.8),
  contrast: z.number().min(50).max(200),
  saturation: z.number().min(50).max(200),
  aspectRatio: z.enum(ASPECT_RATIOS),
});

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

  const { width, height } = exportDimensions(input.aspectRatio);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  renderGradient(ctx, width, height, {
    backgroundColor: input.backgroundColor,
    colors: input.colors,
    blur: input.blur,
    noise: input.noise,
    contrast: input.contrast,
    saturation: input.saturation,
    seed: input.seed,
    placement: input.placement,
    blurScale: 1,
    createCanvas: nodeCreateCanvas,
  });

  const png = canvas.toBuffer("image/png");
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": "attachment",
      "Cache-Control": "no-store",
      "X-Exports-Remaining": pro ? "unlimited" : String(remaining),
    },
  });
}
