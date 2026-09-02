import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { deletePreset, findUser, updatePreset } from "@/lib/db";
import { presetUpdateSchema } from "@/lib/presets";

export const runtime = "nodejs";

const idSchema = z.uuid();

// Edit and delete stay available after Pro lapses: users keep control of
// data they already saved; only creating new presets is Pro-gated.

const resolveUser = async () => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  return findUser(clerkUserId);
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await resolveUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const id = idSchema.safeParse((await params).id);
  const body = presetUpdateSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!id.success || !body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!(await updatePreset(user.id, id.data, body.data))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await resolveUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const id = idSchema.safeParse((await params).id);
  if (!id.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!(await deletePreset(user.id, id.data))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
