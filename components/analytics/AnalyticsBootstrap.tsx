"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";

// Initialises PostHog on the production host only, so localhost and
// preview deployments never pollute the funnel. Set
// NEXT_PUBLIC_POSTHOG_FORCE=1 locally to verify events end to end.
const PRODUCTION_HOSTS = ["www.gradients.studio", "gradients.studio"];

const shouldCapture = () =>
  PRODUCTION_HOSTS.includes(window.location.hostname) ||
  process.env.NEXT_PUBLIC_POSTHOG_FORCE === "1";

export default function AnalyticsBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded || !shouldCapture()) return;
    posthog.init(key, {
      // Same-origin proxy (see next.config.js) so ad blockers don't drop
      // a third of the data; ui_host keeps toolbar/replay links correct
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Explicit events only: autocapture on a canvas editor is noise
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  // Tie events to the Clerk user so the funnel survives sign-in and the
  // server-side purchase event (keyed by Clerk id) lands on the same person
  useEffect(() => {
    if (!isLoaded || !posthog.__loaded) return;
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else if (!isSignedIn && posthog._isIdentified()) {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
