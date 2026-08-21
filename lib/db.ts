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
