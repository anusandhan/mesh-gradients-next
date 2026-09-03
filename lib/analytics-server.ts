import "server-only";
import { PostHog } from "posthog-node";

// Server-side capture for events the browser can't see reliably, e.g. a
// purchase confirmed by the Stripe webhook after the user has closed the
// tab. Uses the same public project key as the client. Each call opens a
// short-lived client and flushes before returning, which is what a
// serverless function needs.
export const captureServerEvent = async (
  distinctId: string,
  event: "purchase_completed",
  properties: Record<string, string | number | boolean | null | undefined>
): Promise<void> => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  try {
    client.capture({ distinctId, event, properties });
    await client.shutdown();
  } catch {
    // Analytics must never fail the webhook; Stripe would retry and the
    // entitlement write is already idempotent, but there's no point.
  }
};
