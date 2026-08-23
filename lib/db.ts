import { neon } from "@neondatabase/serverless";

// Server-only module: quota and entitlement logic must never reach the
// client bundle. The client can't be trusted with any of this.
import "server-only";

export const FREE_EXPORTS_PER_MONTH = 5;

const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

// 'YYYY-MM' in UTC — quota buckets roll over at the UTC month boundary
export const currentMonth = () =>
  new Date().toISOString().slice(0, 7);

export type UserRecord = {
  id: number;
  clerk_user_id: string;
  email: string;
};

export const findUser = async (
  clerkUserId: string
): Promise<UserRecord | null> => {
  const sql = getSql();
  const rows = await sql`
    SELECT id, clerk_user_id, email FROM users
    WHERE clerk_user_id = ${clerkUserId}
  `;
  return rows.length > 0 ? (rows[0] as UserRecord) : null;
};

export const getOrCreateUser = async (
  clerkUserId: string,
  email: string
): Promise<UserRecord> => {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (clerk_user_id, email)
    VALUES (${clerkUserId}, ${email})
    ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, clerk_user_id, email
  `;
  return rows[0] as UserRecord;
};

export const isPro = async (userId: number): Promise<boolean> => {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM entitlements
    WHERE user_id = ${userId} AND pro_until > now()
  `;
  return rows.length > 0;
};

// Atomically consume one free export. Insert-or-increment in a single
// statement so concurrent requests can't both slip under the limit.
// Returns the remaining count, or null if the quota is exhausted.
export const tryConsumeExport = async (
  userId: number
): Promise<number | null> => {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO export_usage (user_id, month, count)
    VALUES (${userId}, ${currentMonth()}, 1)
    ON CONFLICT (user_id, month)
    DO UPDATE SET count = export_usage.count + 1
    WHERE export_usage.count < ${FREE_EXPORTS_PER_MONTH}
    RETURNING count
  `;
  if (rows.length === 0) return null;
  return FREE_EXPORTS_PER_MONTH - (rows[0] as { count: number }).count;
};

// Fixed-window rate limiter (atomic, same pattern as the quota counter).
// Returns whether the call is allowed and, when blocked, how many seconds
// remain in the current window.
export const rateLimit = async (
  key: string,
  limitPerMinute: number
): Promise<{ ok: boolean; retryAfter: number }> => {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, date_trunc('minute', now()), 1)
    ON CONFLICT (key, window_start)
    DO UPDATE SET count = rate_limits.count + 1
    RETURNING count
  `;
  const count = (rows[0] as { count: number }).count;
  // Opportunistic cleanup of stale windows
  if (Math.random() < 0.02) {
    await sql`DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour'`;
  }
  return {
    ok: count <= limitPerMinute,
    retryAfter: 60 - new Date().getUTCSeconds(),
  };
};

// Record a Stripe webhook event id. Returns false if we've already
// processed it (replay or retry) — callers must then skip side effects.
export const recordStripeEvent = async (eventId: string): Promise<boolean> => {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO stripe_events (event_id) VALUES (${eventId})
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  `;
  return rows.length > 0;
};

// Grant or extend Pro: 6 months on top of the current expiry (if still
// active) or from now. Called ONLY from the Stripe webhook handler.
export const grantPro = async (
  userId: number,
  stripePaymentId: string | null
): Promise<void> => {
  const sql = getSql();
  await sql`
    INSERT INTO entitlements (user_id, pro_until, stripe_payment_id)
    VALUES (${userId}, now() + interval '6 months', ${stripePaymentId})
    ON CONFLICT (user_id) DO UPDATE SET
      pro_until = GREATEST(entitlements.pro_until, now()) + interval '6 months',
      stripe_payment_id = EXCLUDED.stripe_payment_id,
      updated_at = now()
  `;
};

export type QuotaStatus = {
  plan: "pro" | "free";
  remaining: number | null; // null = unlimited
  proUntil: string | null;
  resetsAt: string; // next UTC month boundary
};

export const getQuota = async (userId: number): Promise<QuotaStatus> => {
  const sql = getSql();
  const [entitlement, usage] = await Promise.all([
    sql`SELECT pro_until FROM entitlements WHERE user_id = ${userId} AND pro_until > now()`,
    sql`SELECT count FROM export_usage WHERE user_id = ${userId} AND month = ${currentMonth()}`,
  ]);

  const now = new Date();
  const resetsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  if (entitlement.length > 0) {
    return {
      plan: "pro",
      remaining: null,
      proUntil: (entitlement[0] as { pro_until: string }).pro_until,
      resetsAt,
    };
  }
  const used = usage.length > 0 ? (usage[0] as { count: number }).count : 0;
  return {
    plan: "free",
    remaining: Math.max(0, FREE_EXPORTS_PER_MONTH - used),
    proUntil: null,
    resetsAt,
  };
};
