"use client";

import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Round tool button with a progress ring, in the spirit of the Photos app's
// adjustment dials. The ring shows where the value sits in its range.

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type AdjustDialProps = {
  label: string;
  icon: Icon;
  /** 0..1 position of the value within its range */
  progress: number;
  active: boolean;
  onClick: () => void;
};

export function AdjustDial({
  label,
  icon: IconComponent,
  progress,
  active,
  onClick,
}: AdjustDialProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="flex w-[4.5rem] shrink-0 snap-center flex-col items-center gap-1.5 py-1 outline-none transition-transform active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
    >
      <span className="relative flex h-11 w-11 items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 44 44"
          aria-hidden
        >
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="2"
            className="stroke-neutral-200"
          />
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
            className={cn(
              "transition-[stroke-dashoffset,stroke] duration-150 ease-out",
              active ? "stroke-neutral-900" : "stroke-neutral-500"
            )}
          />
        </svg>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150",
            active ? "bg-neutral-900 text-white" : "text-neutral-600"
          )}
        >
          <IconComponent size={16} weight={active ? "fill" : "regular"} />
        </span>
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10px] leading-none transition-colors duration-150",
          active ? "font-medium text-neutral-900" : "text-neutral-500"
        )}
      >
        {label}
      </span>
    </button>
  );
}
