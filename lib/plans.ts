// Paid plans. Shared by the checkout route (price lookup), the Stripe
// webhook (entitlement duration) and the upgrade dialog (copy). Must stay
// server/client neutral — no env access here.
//
// Both plans are one-time payments that never auto-renew. Buying again
// stacks on top of any remaining time (see grantPro in lib/db.ts).

export type PlanId = "year" | "week";

export type Plan = {
  id: PlanId;
  name: string;
  priceUsd: number;
  days: number;
  durationLabel: string;
  blurb: string;
};

export const PLANS: Record<PlanId, Plan> = {
  year: {
    id: "year",
    name: "Pro",
    priceUsd: 39,
    days: 365,
    durationLabel: "12 months",
    blurb: "Unlimited 4K exports and 50 saved palettes for a year.",
  },
  week: {
    id: "week",
    name: "Week Pass",
    priceUsd: 9,
    days: 7,
    durationLabel: "7 days",
    blurb: "Unlimited 4K exports for one project week.",
  },
};

export const DEFAULT_PLAN: PlanId = "year";

// Free accounts can keep a few palettes; Pro raises the cap to
// MAX_PRESETS_PER_USER (lib/presets.ts).
export const FREE_PRESET_LIMIT = 3;

export const isPlanId = (value: unknown): value is PlanId =>
  value === "year" || value === "week";

// Resolve the plan from untrusted input (request body, Stripe metadata).
// Anything unrecognised falls back to the default so a checkout created
// before plans existed still grants the headline entitlement.
export const parsePlanId = (value: unknown): PlanId =>
  isPlanId(value) ? value : DEFAULT_PLAN;

export const formatPrice = (plan: Plan) => `$${plan.priceUsd}`;
