"use client";

import { memo } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import PixelHeart from "@/components/icons/PixelHeart";
import { cn } from "@/lib/utils";

// Free-tier export meter shown next to the wordmark. Five pixel hearts are
// the month's "lives". Both heart states stay in the DOM; spending an export
// crossfades the filled heart out (opacity, scale, blur) so it reads as a
// life lost rather than a repaint. The count is the static cue.

type Props = {
  remaining: number;
  total: number;
  onUpgrade: () => void;
  compact?: boolean;
};

const HEART_SIZE = 14;

export const QuotaMeter = memo(function QuotaMeter({
  remaining,
  total,
  onUpgrade,
  compact = false,
}: Props) {
  const left = Math.max(0, Math.min(total, remaining));
  const empty = left === 0;
  // Short on purpose: the hearts say "exports", the aria-label says it all.
  // The compact variant sits in the mobile bottom bar next to three buttons.
  const label = empty
    ? "No exports left"
    : compact
      ? `${left} left`
      : `${left} of ${total} left`;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="flex shrink-0 items-center gap-0.5"
          role="img"
          aria-label={`${left} of ${total} free exports left this month`}
        >
          {Array.from({ length: total }, (_, i) => {
            const alive = i < left;
            return (
              <span
                key={i}
                className="relative block"
                style={{ width: HEART_SIZE, height: HEART_SIZE * (536 / 583) }}
              >
                <PixelHeart
                  filled={false}
                  size={HEART_SIZE}
                  className="absolute inset-0"
                />
                <PixelHeart
                  filled
                  size={HEART_SIZE}
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
                    alive
                      ? "scale-100 opacity-100 blur-0"
                      : "scale-[0.25] opacity-0 blur-[4px]"
                  )}
                />
              </span>
            );
          })}
        </div>
        <span
          className={cn(
            "truncate tabular-nums",
            compact ? "text-[11px]" : "text-xs",
            empty ? "font-medium text-neutral-900" : "text-neutral-500"
          )}
        >
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className={cn(
          // Visible pill is small; the ::before hitbox brings it to ~40px tall
          "group relative -mr-1.5 flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 font-medium text-neutral-900",
          "before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']",
          "transition-[background-color,scale] duration-150 ease-out hover:bg-neutral-100 active:scale-[0.96]",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        Go Pro
        <ArrowRightIcon
          weight="bold"
          className="size-3 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
});
