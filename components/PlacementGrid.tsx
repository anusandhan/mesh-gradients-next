"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { placementGrid, snapPlacement } from "@/lib/placement";

// Where the overlay shape sits in the frame: a white-framed card in the
// export's aspect ratio over a light grid, with a dark dot you click, drag
// or arrow-key; it snaps to the nearest intersection. The wrapper keeps a
// constant height so switching aspect ratios never shifts the layout; the
// card fits inside it. Fractions of width/height in and out.
export function PlacementGrid({
  ratio,
  center,
  onChange,
  height = "9rem",
  className,
}: {
  ratio: number;
  center: [number, number];
  onChange: (center: [number, number]) => void;
  /** CSS length of the wrapper; the card is aspect-fit inside it */
  height?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const grid = placementGrid(ratio);
  // Only report a new intersection: a pointer move inside the same cell
  // would otherwise re-render the whole preview for nothing
  const commit = (fx: number, fy: number) => {
    const next = snapPlacement(fx, fy, grid);
    if (next[0] !== center[0] || next[1] !== center[1]) onChange(next);
  };
  const place = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    commit((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };
  const nudge = (dx: number, dy: number) =>
    commit(center[0] + dx / grid.cols, center[1] + dy / grid.rows);

  return (
    <div className={cn("flex items-center justify-center", className)} style={{ height }}>
      <div
        role="group"
        aria-label="Shape placement"
        tabIndex={0}
        className="rounded-[20px] bg-white p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.15),0_0_2px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
        // p-1.5 frame sits outside the aspect box, so take it off the height first
        style={{ width: `min(100%, calc((${height} - 0.75rem) * ${ratio} + 0.75rem))` }}
        onKeyDown={(e) => {
          const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
          if (!step) return;
          e.preventDefault();
          nudge(step[0], step[1]);
        }}
      >
        <div
          ref={ref}
          className="relative w-full cursor-crosshair select-none touch-none overflow-hidden rounded-[14px] bg-[#f5f5f5]"
          style={{ aspectRatio: ratio }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            place(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons & 1) place(e);
          }}
        >
          {/* Interior lines only, so no line hugs the card's edge */}
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true" shapeRendering="crispEdges">
            {Array.from({ length: grid.cols - 1 }, (_, i) => `${((i + 1) * 100) / grid.cols}%`).map((x) => (
              <line key={`c${x}`} x1={x} x2={x} y1="0" y2="100%" stroke="#e5e5e5" />
            ))}
            {Array.from({ length: grid.rows - 1 }, (_, i) => `${((i + 1) * 100) / grid.rows}%`).map((y) => (
              <line key={`r${y}`} x1="0" x2="100%" y1={y} y2={y} stroke="#e5e5e5" />
            ))}
          </svg>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3c3c3c] bg-[#2f2f2f] shadow-[0_1px_3px_1px_rgba(0,0,0,0.3),0_0_10px_4px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.8),inset_0_0_3px_1px_rgba(255,255,255,0.5),inset_0_0_6px_3px_rgba(0,0,0,0.1)]"
            style={{ left: `${center[0] * 100}%`, top: `${center[1] * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
