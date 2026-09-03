"use client";

import * as React from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Photos-style scrubber: a strip of tick marks slides under a fixed center
// indicator. Dragging left raises the value, dragging right lowers it.
//
// Two phases, as in the Photos app:
//   - Track: while the pointer is down the strip follows it 1:1, written
//     straight to a motion value (no React state per move). A magnetic
//     detent at the default value catches the strip and fires a stronger
//     haptic so it can be reset by feel.
//   - Release: the strip keeps the gesture's velocity and glides to a stop
//     on a tick (inertia), rubber-banding back if it overshoots the range.
//     The strip is interruptible: touching it mid-glide grabs it.
//
// The strip leaves a wake: while it moves, the ticks on the trailing side of
// the indicator rise and darken in a half-Gaussian bump whose spread grows
// with speed, and they settle back a beat after the motion stops. Heights
// are written to the SVG each frame from the strip's velocity, so nothing
// re-renders during a drag.

const TICK_PX = 8; // horizontal pitch, also the drag distance per step
const TICK_W = 2;
const STRIP_H = 40;
const BASELINE = 34; // ticks and the indicator stand on this line
const BASE_H = 9; // resting tick height
const PEAK_H = 24; // tallest a tick gets at full speed
const INDICATOR_H = 28;
const DETENT = 0.75; // ticks either side of default that snap to it
const EDGE_ELASTIC = 0.25; // fraction of overdrag shown past the ends

// Wake tuning (velocity in ticks per second)
const WAKE_FULL_SPEED = 60; // speed at which the bump reaches PEAK_H
const WAKE_SPREAD_SPEED = 25; // extra tick of spread per this much speed
const WAKE_MIN_SIGMA = 1; // tight peak: a few ticks either side, not a hill
const WAKE_MAX_SIGMA = 3.5;
const WAKE_DECAY_MS = 110; // how quickly the bump follows / releases speed

const REST_RGB = [212, 212, 212]; // neutral-300
const PEAK_RGB = [23, 23, 23]; // neutral-900

const decimalsOf = (step: number) => {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

// Light tick per step; a distinctly stronger bump when landing on default
const vibrate = (strong: boolean) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(strong ? 18 : 3);
    } catch {
      // unsupported or blocked; haptics are a nicety only
    }
  }
};

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
  const toValue = (i: number) =>
    Number((min + clamp(Math.round(i), 0, tickCount) * step).toFixed(decimals));
  const defaultIndex = defaultValue === undefined ? null : toIndex(defaultValue);
  const stripWidth = tickCount * TICK_PX + TICK_W;
  const reducedMotion = useReducedMotion();

  // Continuous tick index. Source of truth for the strip's position during a
  // gesture; follows `value` otherwise.
  const index = useMotionValue(toIndex(value));
  const stripX = useTransform(index, (i) => -i * TICK_PX - TICK_W / 2);

  // Gesture bookkeeping lives in refs so the pointer handlers and the motion
  // value listener never re-render the component per move
  const gesture = React.useRef<{
    active: boolean;
    startX: number;
    startIndex: number;
    lastValue: number;
    inDetent: boolean;
    controls: AnimationPlaybackControls | null;
  }>({
    active: false,
    startX: 0,
    startIndex: 0,
    lastValue: value,
    inDetent: false,
    controls: null,
  });
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Every value crossing during track or glide: notify + haptic
  useMotionValueEvent(index, "change", (latest) => {
    const g = gesture.current;
    if (!g.active) return;
    const next = toValue(latest);
    if (next === g.lastValue) return;
    g.lastValue = next;
    onChangeRef.current(next);
    vibrate(next === defaultValue);
  });

  // External changes (keyboard, wheel, reset, Cancel) glide the strip into
  // place; during a gesture the strip already is the value
  React.useEffect(() => {
    if (gesture.current.active) return;
    gesture.current.lastValue = value;
    const target = toIndex(value);
    if (Math.abs(index.get() - target) < 1e-3) return;
    const controls = animate(index, target, {
      type: "spring",
      duration: reducedMotion ? 0 : 0.25,
      bounce: 0,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, step]);

  const snapToDefault = (i: number) =>
    defaultIndex !== null && Math.abs(i - defaultIndex) < DETENT
      ? defaultIndex
      : i;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Capture is a nicety (keeps tracking when the pointer leaves the
      // strip); an unknown pointer id must not break the gesture
    }
    const g = gesture.current;
    // Catching the strip mid-glide: stop where it is and track from there
    g.controls?.stop();
    g.controls = null;
    g.active = true;
    g.startX = e.clientX;
    g.startIndex = index.get();
    g.lastValue = toValue(g.startIndex);
    g.inDetent =
      defaultIndex !== null && Math.abs(g.startIndex - defaultIndex) < DETENT;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g.active || g.controls) return;
    let raw = g.startIndex - (e.clientX - g.startX) / TICK_PX;
    // Rubber-band past the ends instead of stopping dead
    if (raw < 0) raw *= EDGE_ELASTIC;
    else if (raw > tickCount) raw = tickCount + (raw - tickCount) * EDGE_ELASTIC;
    // Magnetic detent: the strip catches on the default and needs a little
    // extra pull to leave it
    const snapped = snapToDefault(raw);
    const nowInDetent = snapped !== raw;
    if (nowInDetent && !g.inDetent && g.lastValue === defaultValue) {
      // Entering the detent while already reporting default (a tiny wiggle
      // that never crossed a tick) still deserves the bump
      vibrate(true);
    }
    g.inDetent = nowInDetent;
    index.set(snapped);
  };

  const finishGesture = () => {
    gesture.current.active = false;
    gesture.current.controls = null;
    // If the parent changed the value mid-glide (Reset, Cancel), the strip
    // catches up now rather than sitting on a stale tick
    const target = toIndex(valueRef.current);
    if (Math.abs(index.get() - target) > 1e-3) {
      gesture.current.lastValue = valueRef.current;
      animate(index, target, { type: "spring", duration: 0.25, bounce: 0 });
    }
  };

  const handlePointerUp = () => {
    const g = gesture.current;
    if (!g.active || g.controls) return;
    const settle = (i: number) =>
      snapToDefault(Math.round(clamp(i, 0, tickCount)));
    if (reducedMotion) {
      // Direct manipulation stays; the decorative glide goes
      g.controls = animate(index, settle(index.get()), {
        type: "tween",
        duration: 0.15,
        ease: "easeOut",
        onComplete: finishGesture,
      });
      return;
    }
    // Leave the finger at the speed it was moving and decelerate onto a
    // tick. Overshoot past either end springs back.
    g.controls = animate(index, index.get(), {
      type: "inertia",
      velocity: index.getVelocity(),
      power: 0.25,
      timeConstant: 250,
      min: 0,
      max: tickCount,
      bounceStiffness: 500,
      bounceDamping: 40,
      restDelta: 0.01,
      modifyTarget: settle,
      onComplete: finishGesture,
    });
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
    const next = toValue(Math.round(toIndex(value)) + ticks);
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
    onChange(toValue(next));
  };

  // One rect per tick, updated in place by the wake loop below
  const rects = React.useRef<(SVGRectElement | null)[]>([]);
  const wake = React.useRef({ speed: 0, dir: 0, settled: true });
  const lastWeight = React.useRef<Float32Array>(new Float32Array(0));
  if (lastWeight.current.length !== tickCount + 1) {
    lastWeight.current = new Float32Array(tickCount + 1);
  }

  useAnimationFrame((_, delta) => {
    const w = wake.current;
    const v = reducedMotion ? 0 : index.getVelocity();
    // Smoothed speed: ramps up as the strip accelerates and decays over a
    // beat once it stops, which is what gives the wake its brief afterglow
    const k = 1 - Math.exp(-delta / WAKE_DECAY_MS);
    w.speed += (Math.abs(v) - w.speed) * k;
    if (Math.abs(v) > 1) w.dir = Math.sign(v);
    const amp = Math.min(1, w.speed / WAKE_FULL_SPEED);
    if (amp < 0.01) {
      if (w.settled) return;
      w.settled = true;
    } else {
      w.settled = false;
    }
    const sigma = Math.min(
      WAKE_MAX_SIGMA,
      WAKE_MIN_SIGMA + w.speed / WAKE_SPREAD_SPEED
    );
    const center = index.get();
    const weights = lastWeight.current;
    for (let i = 0; i <= tickCount; i++) {
      const rect = rects.current[i];
      if (!rect) continue;
      // Thumb moving left drags the strip left (index rising), and the
      // ticks that just slid past the indicator now sit to its left
      const d = i - center;
      const trailing = w.dir > 0 ? d <= 0 : d >= 0;
      const weight =
        amp > 0.01 && trailing && Math.abs(d) < sigma * 3.5
          ? amp * Math.exp(-(d * d) / (2 * sigma * sigma))
          : 0;
      if (Math.abs(weight - weights[i]) < 0.004) continue;
      weights[i] = weight;
      const h = BASE_H + (PEAK_H - BASE_H) * weight;
      rect.setAttribute("y", String(BASELINE - h));
      rect.setAttribute("height", String(h));
      rect.setAttribute(
        "fill",
        `rgb(${REST_RGB.map((c, ch) =>
          Math.round(c + (PEAK_RGB[ch] - c) * weight)
        ).join(" ")})`
      );
    }
  });

  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(
      <rect
        key={i}
        ref={(el) => {
          rects.current[i] = el;
        }}
        x={i * TICK_PX}
        y={BASELINE - BASE_H}
        width={TICK_W}
        height={BASE_H}
        rx={TICK_W / 2}
        fill={`rgb(${REST_RGB.join(" ")})`}
      />
    );
  }
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
        "relative h-12 w-full cursor-pointer touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md",
        className
      )}
      style={{ WebkitMaskImage: fade, maskImage: fade }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <motion.svg
        className="absolute left-1/2 top-1/2"
        width={stripWidth}
        height={STRIP_H}
        viewBox={`0 0 ${stripWidth} ${STRIP_H}`}
        aria-hidden
        style={{ x: stripX, y: "-50%" }}
      >
        {ticks}
        {defaultIndex !== null && (
          <circle
            cx={defaultIndex * TICK_PX + TICK_W / 2}
            cy={BASELINE - PEAK_H - 5}
            r={2}
            className="fill-neutral-400"
          />
        )}
      </motion.svg>
      {/* Indicator shares the ticks' baseline; the strip is centered
          vertically, so the baseline sits STRIP_H/2 - BASELINE above center */}
      <div
        className="pointer-events-none absolute left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-neutral-900"
        style={{
          height: INDICATOR_H,
          bottom: `calc(50% - ${BASELINE - STRIP_H / 2}px)`,
        }}
      />
    </div>
  );
}
