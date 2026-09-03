"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics";

// A next/link that records which landing-page call to action sent the
// visitor into the studio, so the funnel can start at the landing page.
type Props = ComponentProps<typeof Link> & { location: string };

export default function TrackedLink({ location, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        track("landing_cta_clicked", { location });
        onClick?.(event);
      }}
    />
  );
}
