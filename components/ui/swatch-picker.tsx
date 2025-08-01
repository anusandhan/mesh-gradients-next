"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Tailwind base colors organized by color name
const tailwindColors = {
  neutral: {
    name: "Neutral",
    colors: {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "300": "#d4d4d4",
      "400": "#a3a3a3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0a0a0a",
    },
  },
  red: {
    name: "Red",
    colors: {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444",
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      "950": "#450a0a",
    },
  },
  orange: {
    name: "Orange",
    colors: {
      "50": "#fff7ed",
      "100": "#ffedd5",
      "200": "#fed7aa",
      "300": "#fdba74",
      "400": "#fb923c",
      "500": "#f97316",
      "600": "#ea580c",
      "700": "#c2410c",
      "800": "#9a3412",
      "900": "#7c2d12",
      "950": "#431407",
    },
  },
  amber: {
    name: "Amber",
    colors: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b",
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      "950": "#451a03",
    },
  },
  yellow: {
    name: "Yellow",
    colors: {
      "50": "#fefce8",
      "100": "#fef9c3",
      "200": "#fef08a",
      "300": "#fde047",
      "400": "#facc15",
      "500": "#eab308",
      "600": "#ca8a04",
      "700": "#a16207",
      "800": "#854d0e",
      "900": "#713f12",
      "950": "#422006",
    },
  },
  lime: {
    name: "Lime",
    colors: {
      "50": "#f7fee7",
      "100": "#ecfccb",
      "200": "#d9f99d",
      "300": "#bef264",
      "400": "#a3e635",
      "500": "#84cc16",
      "600": "#65a30d",
      "700": "#4d7c0f",
      "800": "#3f6212",
      "900": "#365314",
      "950": "#1a2e05",
    },
  },
  green: {
    name: "Green",
    colors: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d",
      "950": "#052e16",
    },
  },
  emerald: {
    name: "Emerald",
    colors: {
      "50": "#ecfdf5",
      "100": "#d1fae5",
      "200": "#a7f3d0",
      "300": "#6ee7b7",
      "400": "#34d399",
      "500": "#10b981",
      "600": "#059669",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b",
      "950": "#022c22",
    },
  },
  teal: {
    name: "Teal",
    colors: {
      "50": "#f0fdfa",
      "100": "#ccfbf1",
      "200": "#99f6e4",
      "300": "#5eead4",
      "400": "#2dd4bf",
      "500": "#14b8a6",
      "600": "#0d9488",
      "700": "#0f766e",
      "800": "#115e59",
      "900": "#134e4a",
      "950": "#042f2e",
    },
  },
  cyan: {
    name: "Cyan",
    colors: {
      "50": "#ecfeff",
      "100": "#cffafe",
      "200": "#a5f3fc",
      "300": "#67e8f9",
      "400": "#22d3ee",
      "500": "#06b6d4",
      "600": "#0891b2",
      "700": "#0e7490",
      "800": "#155e75",
      "900": "#164e63",
      "950": "#083344",
    },
  },
  sky: {
    name: "Sky",
    colors: {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "200": "#bae6fd",
      "300": "#7dd3fc",
      "400": "#38bdf8",
      "500": "#0ea5e9",
      "600": "#0284c7",
      "700": "#0369a1",
      "800": "#075985",
      "900": "#0c4a6e",
      "950": "#082f49",
    },
  },
  blue: {
    name: "Blue",
    colors: {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554",
    },
  },
  indigo: {
    name: "Indigo",
    colors: {
      "50": "#eef2ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1",
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      "950": "#1e1b4b",
    },
  },
  violet: {
    name: "Violet",
    colors: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "200": "#e9d5ff",
      "300": "#d8b4fe",
      "400": "#c084fc",
      "500": "#a855f7",
      "600": "#9333ea",
      "700": "#7c3aed",
      "800": "#6b21a8",
      "900": "#581c87",
      "950": "#3b0764",
    },
  },
  purple: {
    name: "Purple",
    colors: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "200": "#e9d5ff",
      "300": "#d8b4fe",
      "400": "#c084fc",
      "500": "#a855f7",
      "600": "#9333ea",
      "700": "#7c3aed",
      "800": "#6b21a8",
      "900": "#581c87",
      "950": "#3b0764",
    },
  },
  fuchsia: {
    name: "Fuchsia",
    colors: {
      "50": "#fdf4ff",
      "100": "#fae8ff",
      "200": "#f5d0fe",
      "300": "#f0abfc",
      "400": "#e879f9",
      "500": "#d946ef",
      "600": "#c026d3",
      "700": "#a21caf",
      "800": "#86198f",
      "900": "#701a75",
      "950": "#4a044e",
    },
  },
  pink: {
    name: "Pink",
    colors: {
      "50": "#fdf2f8",
      "100": "#fce7f3",
      "200": "#fbcfe8",
      "300": "#f9a8d4",
      "400": "#f472b6",
      "500": "#ec4899",
      "600": "#db2777",
      "700": "#be185d",
      "800": "#9d174d",
      "900": "#831843",
      "950": "#500724",
    },
  },
  rose: {
    name: "Rose",
    colors: {
      "50": "#fff1f2",
      "100": "#ffe4e6",
      "200": "#fecdd3",
      "300": "#fda4af",
      "400": "#fb7185",
      "500": "#f43f5e",
      "600": "#e11d48",
      "700": "#be123c",
      "800": "#9f1239",
      "900": "#881337",
      "950": "#4c0519",
    },
  },
};

interface SwatchPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SwatchPicker = React.forwardRef<HTMLDivElement, SwatchPickerProps>(
  ({ value, onChange, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setOpen((prev) => !prev);
    const closeDropdown = () => setOpen(false);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          closeDropdown();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className={cn("relative", className)} ref={ref}>
        <div ref={containerRef}>
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 p-0 rounded-lg border border-[1.25px] border-neutral-400 hover:border-neutral-700 transition-all duration-200 ease-out cursor-pointer"
            style={{
              backgroundColor: value,
              boxShadow: "inset 0 0 0 2px rgba(255, 255, 255, 0.25)",
            }}
            aria-label="Select color"
            type="button"
          />
          {open && (
            <div className="absolute z-30 mt-2 bg-white border border-neutral-200 rounded-lg shadow-sm max-h-96 overflow-y-auto w-auto pb-2 px-2">
              {Object.entries(tailwindColors).map(([colorName, colorData]) => (
                <div key={colorName} className="py-2">
                  <div className="text-xs font-medium text-neutral-900">
                    {colorData.name}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-2 w-max">
                    {Object.entries(colorData.colors).map(([shade, hex]) => (
                      <button
                        key={`${colorName}-${shade}`}
                        onClick={() => {
                          onChange(hex);
                          closeDropdown();
                        }}
                        className={cn(
                          "h-6 w-6 rounded-sm border transition-colors",
                          value === hex
                            ? "border-neutral-600"
                            : "border-neutral-200 hover:border-neutral-400"
                        )}
                        style={{ backgroundColor: hex }}
                        title={`${colorData.name} ${shade}`}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SwatchPicker.displayName = "SwatchPicker";

export { SwatchPicker };
