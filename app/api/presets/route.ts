import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createPreset,
  findUser,
  getOrCreateUser,
  isPro,
  listPresets,
  rateLimit,
  reorderPresets,
} from "@/lib/db";
import {
  MAX_PRESETS_PER_USER,
  presetInputSchema,
  reorderSchema,
} from "@/lib/presets";

export const runtime = "nodejs";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  // Lapsed Pro keeps read access to saved palettes; only saving is gated.
  const user = await findUser(clerkUserId);
  if (!user) return NextResponse.json({ presets: [] });
  return NextResponse.json({ presets: await listPresets(user.id) });
}

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress;
  if (!email || email.verification?.status !== "verified") {
    return NextResponse.json(
      { error: "Verify your email address first" },
      { status: 403 }
    );
  }

  const limit = await rateLimit(`presets:user:${clerkUserId}`, 30);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = presetInputSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const dbUser = await getOrCreateUser(clerkUserId, email.emailAddress);
  if (!(await isPro(dbUser.id))) {
    return NextResponse.json(
      { error: "Saving palettes is a Pro feature", code: "pro_required" },
      { status: 402 }
    );
  }

  const preset = await createPreset(dbUser.id, parsed.data, MAX_PRESETS_PER_USER);
  if (!preset) {
    return NextResponse.json(
      {
        error: `Palette limit reached (${MAX_PRESETS_PER_USER})`,
        code: "preset_cap",
      },
      { status: 409 }
    );
  }
  return NextResponse.json({ preset }, { status: 201 });
}

// Persist the manage-dialog drag order. Available to any signed-in user
// (like edit/delete); ownership is enforced per-row in the update.
export async function PATCH(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const user = await findUser(clerkUserId);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = reorderSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await reorderPresets(user.id, parsed.data.order);
  return NextResponse.json({ ok: true });
}
