import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { findUser, getQuota, FREE_EXPORTS_PER_MONTH } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Users are created lazily on first export; before that they have the
  // full free quota.
  const user = await findUser(clerkUserId);
  if (!user) {
    const now = new Date();
    return NextResponse.json({
      plan: "free",
      remaining: FREE_EXPORTS_PER_MONTH,
      proUntil: null,
      resetsAt: new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
      ).toISOString(),
    });
  }

  return NextResponse.json(await getQuota(user.id), {
    headers: { "Cache-Control": "no-store" },
  });
}
