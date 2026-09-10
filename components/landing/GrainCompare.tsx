"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowsOutLineHorizontalIcon } from "@phosphor-icons/react";

// Before/after slider for the grain argument. Both crops are the same 4K
// render at 100%, pushed through the same tone quantization; only grain
// differs. The handle tracks the pointer 1:1 (a range input under the whole
// frame), so there is no easing to feel disconnected from the finger, and
// the keyboard gets the comparison for free.

const START = 50;

export default function GrainCompare() {
  const [position, setPosition] = useState(START);

  return (
    <div className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
      <Image
        src="/landing/grain-on.jpg"
        alt="The same dark gradient with grain: tones step smoothly with no visible bands"
        fill
        sizes="(min-width: 1024px) 640px, 100vw"
        className="object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        <Image
          src="/landing/grain-off.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Divider and handle follow the value directly */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.25)]">
          <ArrowsOutLineHorizontalIcon size={18} />
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
        No grain
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Grain
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Compare without and with grain"
        aria-valuetext={`${Math.round(position)}% without grain`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 [touch-action:pan-y]"
      />
    </div>
  );
}
