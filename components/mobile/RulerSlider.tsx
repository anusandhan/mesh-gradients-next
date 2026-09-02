"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Photos-style scrubber: a strip of tick marks slides under a fixed center
// indicator. Dragging left raises the value, dragging right lowers it, and
// the ticks between the default and the current value are highlighted so the
// deviation from default is visible at a glance.

const TICK_PX = 8;
const MAJOR_EVERY = 5;

const decimalsOf = (step: number) => {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const vibrate = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(3);
    } catch {
      // unsupported or blocked; haptics are a nicety only
    }
  }
};

const tickBackground = (color: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(to right, ${color} 0 1px, transparent 1px), linear-gradient(to right, ${color} 0 1px, transparent 1px)`,
  backgroundSize: `${TICK_PX}px 10px, ${TICK_PX * MAJOR_EVERY}px 18px`,
  backgroundPosition: "0 50%, 0 50%",
  backgroundRepeat: "repeat-x, repeat-x",
});

type RulerSliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
  "aria-valuetext"?: string;
  className?: string;
};

export function RulerSlider({
  value,
  min,
  max,
  step,
  defaultValue,
  onChange,
  className,
  "aria-label": ariaLabel,
  "aria-valuetext": ariaValueText,
}: RulerSliderProps) {
  const tickCount = Math.round((max - min) / step);
  const decimals = decimalsOf(step);
  const toIndex = (v: number) => clamp((v - min) / step, 0, tickCount);
  const toValue = (i: number) => Number((min + i * step).toFixed(decimals));

  // Continuous tick index while a drag is in flight; null snaps to `value`
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const drag = React.useRef<{
    startX: number;
    startIndex: number;
    lastValue: number;
  } | null>(null);

  const index = dragIndex ?? toIndex(value);
  const defaultIndex = defaultValue === undefined ? null : toIndex(defaultValue);
  const stripWidth = tickCount * TICK_PX + 1;

  const emit = (next: number) => {
    if (!drag.current || next === drag.current.lastValue) return;
    drag.current.lastValue = next;
    onChange(next);
    vibrate();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const startIndex = toIndex(value);
    drag.current = { startX: e.clientX, startIndex, lastValue: value };
    setDragIndex(startIndex);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = clamp(
      d.startIndex - (e.clientX - d.startX) / TICK_PX,
      0,
      tickCount
    );
    setDragIndex(raw);
    emit(toValue(Math.round(raw)));
  };

  const endDrag = () => {
    drag.current = null;
    setDragIndex(null);
  };

  // Trackpad horizontal scroll nudges the ruler on desktop. Only deltaX is
  // used so vertical wheel scrolling of the surrounding panel is untouched.
  const wheelRemainder = React.useRef(0);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    wheelRemainder.current += e.deltaX / TICK_PX;
    const ticks = Math.trunc(wheelRemainder.current);
    if (ticks === 0) return;
    wheelRemainder.current -= ticks;
    const next = toValue(clamp(Math.round(toIndex(value)) + ticks, 0, tickCount));
    if (next !== value) onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = Math.round(toIndex(value));
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = current + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = current - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tickCount;
    if (next === null) return;
    e.preventDefault();
    onChange(toValue(clamp(next, 0, tickCount)));
  };

  const lowIndex = defaultIndex === null ? index : Math.min(defaultIndex, index);
  const highIndex = defaultIndex === null ? index : Math.max(defaultIndex, index);
  const fade =
    "linear-gradient(to right, transparent, black 18%, black 82%, transparent)";

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText}
      aria-orientation="horizontal"
      className={cn(
        "relative h-12 w-full cursor-ew-resize touch-none select-none overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md",
        className
      )}
      style={{ WebkitMaskImage: fade, maskImage: fade }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "absolute left-1/2 top-0 h-full",
          dragIndex === null && "transition-transform duration-150 ease-out"
        )}
        style={{
          width: stripWidth,
          transform: `translateX(${-index * TICK_PX}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={tickBackground("rgb(212 212 212)")}
        />
        {defaultIndex !== null && (
          <div
            className="absolute inset-0"
            style={{
              ...tickBackground("rgb(23 23 23)"),
              clipPath: `inset(0 ${
                stripWidth - highIndex * TICK_PX - 1
              }px 0 ${lowIndex * TICK_PX}px)`,
            }}
          />
        )}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900" />
    </div>
  );
}
