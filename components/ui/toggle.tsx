"use client";

import React, { useState } from "react";

interface ToggleProps {
  isActive?: boolean;
  onToggle?: (isActive: boolean) => void;
  ariaLabel?: string;
  /** sm sits beside 14px labels; md is the portfolio original */
  size?: "sm" | "md";
}

// Track, knob and knob travel (track width - 2*padding - knob) per size
const SIZES = {
  md: { track: "h-6 w-11", knob: "w-5 h-5", travel: 20 },
  sm: { track: "h-5 w-9", knob: "w-4 h-4", travel: 16 },
};

const Toggle: React.FC<ToggleProps> = ({
  isActive: controlledIsActive,
  onToggle,
  ariaLabel = "Toggle",
  size = "md",
}) => {
  const dims = SIZES[size];
  const [internalIsActive, setInternalIsActive] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isActive =
    controlledIsActive !== undefined ? controlledIsActive : internalIsActive;

  const handleToggle = () => {
    const newState = !isActive;
    if (controlledIsActive === undefined) {
      setInternalIsActive(newState);
    }
    onToggle?.(newState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      role="switch"
      aria-checked={isActive}
      aria-label={ariaLabel}
      data-active={isActive ? "True" : "False"}
      className={[
        `inline-flex ${dims.track} items-center overflow-hidden rounded-full p-0.5`,
        "cursor-pointer appearance-none border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
        "shadow-[0px_0px_0px_3px_rgba(242,242,242,1.00),inset_0px_1px_3px_0px_rgba(0,0,0,0.25)]",
        isActive
          ? "bg-gradient-to-b from-green-600 to-green-500"
          : "bg-gradient-to-b from-neutral-300 to-neutral-200",
      ].join(" ")}
    >
      {/* CSS transitions, not a JS-driven motion value: the knob keeps
          moving on the compositor while the main thread is busy (a flip
          here can kick off a 200ms+ canvas re-render mid-slide) */}
      <div
        className="relative flex items-center justify-center rounded-full shadow-[0px_0px_2px_0px_rgba(0,0,0,0.45),0px_0px_3px_0px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ transform: `translateX(${isActive ? dims.travel : 0}px)` }}
      >
        {/* --- Knob with 1px angular gradient stroke (replaces border-white) --- */}
        <div className={`relative ${dims.knob} rounded-full`}>
          {/* Stroke layer */}
          <div
            className="
              absolute inset-0 rounded-full p-[1px]
              [background:conic-gradient(#ffffff_0%,#d4d4d4_50%,#ffffff_100%)]
            "
          >
            {/* Knob core */}
            <div
              className="
                w-full h-full rounded-full
                bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,white_0%,#DADADA_100%)]
                shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg
              "
            />
          </div>

          {/* Glow dot */}
          <span
            className={[
              "absolute w-1.5 h-1.5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full outline outline-[0.25px] shadow-none transition-opacity duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
              isActive
                ? "bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#67E595_0%,#21BF5B_100%)] shadow-[0px_0px_2px_0px_rgba(34,197,94,1.00)] outline-green-600"
                : "bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#A6A6A6_0%,#707070_100%)] shadow-[0px_0px_2px_0px_rgba(116,116,116,1.00)] outline-neutral-500",
            ].join(" ")}
            style={{ opacity: isActive ? 1 : 0.4 }}
          />
        </div>
      </div>
    </button>
  );
};

export default Toggle;
