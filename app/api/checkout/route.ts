import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { rateLimit } from "@/lib/db";
import { DEFAULT_PLAN, PLANS, isPlanId, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

// One Stripe Price per plan. STRIPE_PRICE_ID keeps its historical name
// (it is the headline Pro pass); the week pass has its own variable.
const priceIdFor = (plan: PlanId): string | undefined =>
  plan === "week"
    ? process.env.STRIPE_WEEK_PASS_PRICE_ID
    : process.env.STRIPE_PRICE_ID;

// Creates a Stripe Checkout session for a one-time Pro purchase. The
// entitlement itself is granted exclusively by the webhook — this route
// only starts the payment flow and tags the session with the plan so the
// webhook knows how long to grant.
export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const limit = await rateLimit(`checkout:user:${clerkUserId}`, 5);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  // Body is optional for backwards compatibility; unknown plans are
  // rejected rather than silently sold as something else.
  const body = (await request.json().catch(() => null)) as
    | { plan?: unknown }
    | null;
  const requested = body?.plan ?? DEFAULT_PLAN;
  if (!isPlanId(requested)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  const plan = PLANS[requested];

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = priceIdFor(plan.id);
  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 }
    );
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const origin = request.nextUrl.origin;

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: clerkUserId,
    customer_email: email,
    metadata: { plan: plan.id },
    success_url: `${origin}/?upgraded=1`,
    cancel_url: `${origin}/`,
    ...(process.env.STRIPE_AUTOMATIC_TAX === "true"
      ? { automatic_tax: { enabled: true } }
      : {}),
  });

  return NextResponse.json({ url: session.url });
}
