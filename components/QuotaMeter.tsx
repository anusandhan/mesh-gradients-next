"use client";

import { memo } from "react";
import PixelHeart from "@/components/icons/PixelHeart";
import { cn } from "@/lib/utils";

// Free-tier export meter shown next to the wordmark. Five pixel hearts are
// the month's "lives" and the whole row is the upgrade control. Both heart
// states stay in the DOM; spending an export crossfades the filled heart
// out (opacity, scale, blur) so it reads as a life lost. The count is the
// static cue; the hover tint says "this goes somewhere".

type Props = {
  remaining: number;
  total: number;
  onUpgrade: () => void;
  compact?: boolean;
};

const HEART_SIZE = 14;

// Copy tracks the moment: "free" names the tier you're on, the last heart
// gets its own line (honest scarcity), and empty states the problem the
// dialog solves. The hearts already show the total, so "of 5" is dropped.
const labelFor = (left: number, compact: boolean) => {
  if (left <= 0) return compact ? "Out of exports" : "Out of free exports";
  if (left === 1) return compact ? "Last one" : "Last free export";
  return compact ? `${left} left` : `${left} free exports left`;
};

export const QuotaMeter = memo(function QuotaMeter({
  remaining,
  total,
  onUpgrade,
  compact = false,
}: Props) {
  const left = Math.max(0, Math.min(total, remaining));
  const empty = left === 0;

  return (
    <button
      type="button"
      onClick={onUpgrade}
      title="Go Pro for unlimited exports"
      aria-label={`${left} of ${total} free exports left this month. Go Pro for unlimited exports.`}
      className={cn(
        // Negative margins keep the content aligned with the column while
        // the hover tint and hit area extend past it
        "group -mx-1.5 flex w-[calc(100%+0.75rem)] items-center justify-center gap-2 rounded-md px-1.5 py-1",
        "transition-[background-color,scale] duration-150 ease-out hover:bg-neutral-100 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
      )}
    >
      <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
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
        </span>
        <span
          className={cn(
            "truncate tabular-nums",
            compact ? "text-[11px]" : "text-xs",
            empty ? "font-medium text-neutral-900" : "text-neutral-500",
            "transition-colors duration-150 group-hover:text-neutral-900"
          )}
        >
          {labelFor(left, compact)}
        </span>
    </button>
  );
});
