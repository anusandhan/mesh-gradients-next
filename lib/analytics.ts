import posthog from "posthog-js";

// Client-side product analytics. Every event the app emits is listed here
// so names stay consistent between the code and the PostHog funnels.
// Calls are no-ops until AnalyticsBootstrap has initialised PostHog, which
// only happens on the production host (or with NEXT_PUBLIC_POSTHOG_FORCE=1).

export type AnalyticsEvent =
  | "landing_cta_clicked"
  | "landing_hero_interacted"
  | "landing_gallery_clicked"
  | "export_completed"
  | "export_blocked_quota"
  | "upgrade_dialog_opened"
  | "upgrade_dialog_dismissed"
  | "checkout_started"
  | "preset_saved"
  | "preset_blocked_free_cap";

export const track = (
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
) => {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, properties);
};
