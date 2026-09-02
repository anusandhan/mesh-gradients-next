import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { rateLimit } from "@/lib/db";

export const runtime = "nodejs";

// Creates a Stripe Checkout session for the one-time $29 Pro purchase.
// The entitlement itself is granted exclusively by the webhook — this
// route only starts the payment flow.
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

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
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
    success_url: `${origin}/?upgraded=1`,
    cancel_url: `${origin}/`,
    ...(process.env.STRIPE_AUTOMATIC_TAX === "true"
      ? { automatic_tax: { enabled: true } }
      : {}),
  });

  return NextResponse.json({ url: session.url });
}
