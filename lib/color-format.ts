import {
  clampChroma,
  formatHex,
  formatRgb,
  formatHsl,
  oklch,
  hsl,
  rgb,
  parse,
} from "culori";
import type { Color } from "culori";

export type ColorFormat = "oklch" | "hex" | "rgb" | "hsl";

export const COLOR_FORMATS: { value: ColorFormat; label: string }[] = [
  { value: "oklch", label: "OKLCH" },
  { value: "hex", label: "Hex" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
];

// Parse any CSS color string (hex, rgb, hsl, oklch, named...) to a 6-digit
// hex. Out-of-gamut colors are mapped into sRGB by reducing chroma in OKLCH
// space, which preserves lightness and hue. Returns null if unparseable.
export const parseToHex = (input: string): string | null => {
  const parsed = parse(input.trim());
  if (!parsed) return null;
  const c = rgb(clampChroma(parsed, "oklch"));
  if (!c) return null;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return formatHex({ mode: "rgb", r: clamp(c.r), g: clamp(c.g), b: clamp(c.b) });
};

export type ChannelDef = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  unit?: string;
};

// Editable channels per format. Hex has no channels of its own; its picker
// operates on RGB.
export const CHANNEL_DEFS: Record<ColorFormat, ChannelDef[]> = {
  oklch: [
    { key: "l", label: "L", min: 0, max: 1, step: 0.001, decimals: 3 },
    { key: "c", label: "C", min: 0, max: 0.4, step: 0.001, decimals: 3 },
    { key: "h", label: "H", min: 0, max: 360, step: 0.1, decimals: 1, unit: "°" },
  ],
  hsl: [
    { key: "h", label: "H", min: 0, max: 360, step: 1, decimals: 1, unit: "°" },
    { key: "s", label: "S", min: 0, max: 100, step: 1, decimals: 1, unit: "%" },
    { key: "l", label: "L", min: 0, max: 100, step: 1, decimals: 1, unit: "%" },
  ],
  rgb: [
    { key: "r", label: "R", min: 0, max: 255, step: 1, decimals: 0 },
    { key: "g", label: "G", min: 0, max: 255, step: 1, decimals: 0 },
    { key: "b", label: "B", min: 0, max: 255, step: 1, decimals: 0 },
  ],
  hex: [
    { key: "r", label: "R", min: 0, max: 255, step: 1, decimals: 0 },
    { key: "g", label: "G", min: 0, max: 255, step: 1, decimals: 0 },
    { key: "b", label: "B", min: 0, max: 255, step: 1, decimals: 0 },
  ],
};

export const hexToChannels = (hex: string, format: ColorFormat): number[] => {
  const parsed = parse(hex) ?? { mode: "rgb" as const, r: 0, g: 0, b: 0 };
  switch (format) {
    case "oklch": {
      const c = oklch(parsed);
      return [c?.l ?? 0, c?.c ?? 0, c?.h ?? 0];
    }
    case "hsl": {
      const c = hsl(parsed);
      return [c?.h ?? 0, (c?.s ?? 0) * 100, (c?.l ?? 0) * 100];
    }
    default: {
      const c = rgb(parsed);
      return [(c?.r ?? 0) * 255, (c?.g ?? 0) * 255, (c?.b ?? 0) * 255];
    }
  }
};

export const channelsToHex = (
  values: number[],
  format: ColorFormat
): string => {
  let color: Color;
  switch (format) {
    case "oklch":
      // Gamut-map by reducing chroma only, so lightness and hue survive
      color = clampChroma(
        {
          mode: "oklch",
          l: Math.min(1, Math.max(0, values[0])),
          c: values[1],
          h: values[2],
        },
        "oklch"
      );
      break;
    case "hsl":
      color = {
        mode: "hsl",
        h: values[0],
        s: values[1] / 100,
        l: values[2] / 100,
      };
      break;
    default:
      color = {
        mode: "rgb",
        r: values[0] / 255,
        g: values[1] / 255,
        b: values[2] / 255,
      };
  }
  const c = rgb(color);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return formatHex({
    mode: "rgb",
    r: clamp(c?.r ?? 0),
    g: clamp(c?.g ?? 0),
    b: clamp(c?.b ?? 0),
  });
};

// Largest chroma still inside sRGB for a given OKLCH lightness and hue
export const maxChromaInGamut = (l: number, h: number): number => {
  const clamped = clampChroma(
    { mode: "oklch", l: Math.min(1, Math.max(0, l)), c: 0.4, h },
    "oklch"
  );
  return clamped?.c ?? 0;
};

// CSS gradient for a channel slider track: sweep this channel across its
// range while the other channels hold their current values. maxOverride
// narrows the sweep (used for the dynamically capped OKLCH chroma track).
export const channelTrackGradient = (
  values: number[],
  format: ColorFormat,
  index: number,
  maxOverride?: number
): string => {
  const def = CHANNEL_DEFS[format][index];
  const max = maxOverride ?? def.max;
  const STOPS = 16;
  const stops: string[] = [];
  for (let i = 0; i <= STOPS; i++) {
    const swept = [...values];
    swept[index] = def.min + ((max - def.min) * i) / STOPS;
    stops.push(
      `${channelsToHex(swept, format)} ${((i / STOPS) * 100).toFixed(1)}%`
    );
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
};

export const formatColor = (hex: string, format: ColorFormat): string => {
  const parsed = parse(hex);
  if (!parsed) return hex;
  switch (format) {
    case "hex":
      return formatHex(parsed) ?? hex;
    case "rgb":
      return formatRgb(parsed) ?? hex;
    case "hsl":
      return formatHsl(parsed) ?? hex;
    case "oklch": {
      const c = oklch(parsed);
      if (!c) return hex;
      return `oklch(${(c.l ?? 0).toFixed(3)} ${(c.c ?? 0).toFixed(3)} ${(
        c.h ?? 0
      ).toFixed(1)})`;
    }
  }
};
