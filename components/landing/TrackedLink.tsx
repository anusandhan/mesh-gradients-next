"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

// A next/link that records which landing-page element sent the visitor
// into the studio, so the funnel can start on the landing page.
type Props = ComponentProps<typeof Link> & {
  location: string;
  event?: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
};

export default function TrackedLink({
  location,
  event = "landing_cta_clicked",
  properties,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, { location, ...properties });
        onClick?.(e);
      }}
    />
  );
}
