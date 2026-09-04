"use client";

import type { AnchorHTMLAttributes } from "react";
import { track } from "@/lib/analytics";

// A plain download anchor that records which wallpaper and size was taken.
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  slug: string;
  size: string;
};

export default function DownloadLink({ slug, size, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track("wallpaper_downloaded", { slug, size });
        onClick?.(e);
      }}
    />
  );
}
