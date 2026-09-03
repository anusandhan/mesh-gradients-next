"use client";

import { memo } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Free-tier export meter shown next to the wordmark. Five pills stand for
// the monthly allowance; a pill dims when an export is spent (a colour
// transition, so a decrement reads as "one used" rather than a repaint).
// The count is a state cue on its own; the meter is the glanceable version.

type Props = {
  remaining: number;
  total: number;
  onUpgrade: () => void;
  compact?: boolean;
};

export const QuotaMeter = memo(function QuotaMeter({
  remaining,
  total,
  onUpgrade,
  compact = false,
}: Props) {
  const left = Math.max(0, Math.min(total, remaining));
  const empty = left === 0;
  // The compact variant sits in the mobile bottom bar next to three buttons
  const label = empty
    ? "No free exports left"
    : compact
      ? `${left} of ${total} left`
      : `${left} of ${total} exports left`;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="flex shrink-0 items-center gap-[3px]"
          role="img"
          aria-label={`${left} of ${total} free exports left this month`}
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-2 rounded-full transition-colors duration-200 ease-out",
                i < left ? "bg-neutral-800" : "bg-neutral-200"
              )}
            />
          ))}
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
