"use client";

import { useState } from "react";
import Image from "next/image";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { GALLERY, STYLE_LABELS, presetToStudioUrl } from "@/lib/gallery";
import type { GradientStyle } from "@/lib/gradient-renderer";
import TrackedLink from "./TrackedLink";

// Landing-page gallery: one style at a time so four tiles get the eye
// instead of twelve fighting for it. All twelve stay in the HTML (hidden,
// not unmounted) so every deep link is crawlable.

const STYLES: GradientStyle[] = ["blobs", "stripes", "clouds"];

export default function GalleryTabs() {
  const [style, setStyle] = useState<GradientStyle>("blobs");

  return (
    <div>
      <ToggleGroup
        type="single"
        value={style}
        onValueChange={(value) => {
          if (value) setStyle(value as GradientStyle);
        }}
        aria-label="Gallery style"
        className="mt-6"
      >
        {STYLES.map((s) => (
          <ToggleGroupItem key={s} value={s} aria-label={STYLE_LABELS[s]}>
            {STYLE_LABELS[s]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {STYLES.map((s) => (
        <ul
          key={s}
          className={cn(
            "mt-6 grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4",
            s === style ? "grid" : "hidden"
          )}
        >
          {GALLERY.filter((p) => p.style === s).map((preset) => (
            <li key={preset.slug}>
              <TrackedLink
                href={presetToStudioUrl(preset)}
                location="gallery"
                event="landing_gallery_clicked"
                properties={{ preset: preset.slug, style: preset.style }}
                className="group block"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl",
                    // Hairline outline in pure black so no tint bleeds into the image edge
                    "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  )}
                >
                  <Image
                    src={`/landing/gallery/${preset.slug}.jpg`}
                    alt={`${preset.name}: ${preset.mood}, ${STYLE_LABELS[preset.style].toLowerCase()} style`}
                    width={960}
                    height={600}
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="block aspect-[16/10] w-full object-cover transition-transform duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between px-0.5">
                  <span className="text-sm font-medium text-neutral-900">
                    {preset.name}
                  </span>
                  <span className="text-xs text-neutral-400 transition-colors group-hover:text-neutral-700">
                    Open
                  </span>
                </div>
              </TrackedLink>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
