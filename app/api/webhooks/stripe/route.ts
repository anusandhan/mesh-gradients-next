import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateUser, grantPro, recordStripeEvent } from "@/lib/db";

export const runtime = "nodejs";

// The ONLY code path that writes entitlements. Trust chain:
// signature proves the event came from Stripe; the event-id table makes
// replays no-ops; client_reference_id was set by our checkout route from
// the Clerk session.
export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Replay/retry protection: first writer wins, everyone else no-ops
  const isNew = await recordStripeEvent(event.id);
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.client_reference_id;

    // "paid" for normal purchases; "no_payment_required" when a 100%-off
    // promotion code zeroes the total (Checkout skips payment collection)
    const settled =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";
    if (settled && clerkUserId) {
      const email = session.customer_details?.email ?? "";
      const user = await getOrCreateUser(clerkUserId, email);
      await grantPro(
        user.id,
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null
      );
    }
  }

  return NextResponse.json({ received: true });
}
