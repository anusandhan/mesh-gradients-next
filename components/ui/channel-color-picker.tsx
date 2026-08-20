"use client";

import * as React from "react";
import { Slider } from "radix-ui";
import { EyedropperIcon } from "@phosphor-icons/react";
import {
  CHANNEL_DEFS,
  hexToChannels,
  channelsToHex,
  channelTrackGradient,
  maxChromaInGamut,
  type ChannelDef,
  type ColorFormat,
} from "@/lib/color-format";
import { cn } from "@/lib/utils";

// Borderless numeric input for one color channel. Holds a draft while
// focused so reformatting doesn't fight typing; commits parseable values
// live, clamped to the channel's range.
const ChannelNumberInput = ({
  value,
  def,
  onCommit,
  className,
}: {
  value: number;
  def: ChannelDef;
  onCommit: (value: number) => void;
  className?: string;
}) => {
  const [draft, setDraft] = React.useState<string | null>(null);
  const formatted = value.toFixed(def.decimals);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft ?? formatted}
      onFocus={(e) => {
        setDraft(formatted);
        e.currentTarget.select();
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        const parsed = Number.parseFloat(e.target.value);
        if (Number.isFinite(parsed)) {
          onCommit(Math.min(def.max, Math.max(def.min, parsed)));
        }
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "w-full min-w-0 bg-transparent text-sm tabular-nums text-neutral-800 outline-none",
        className
      )}
      aria-label={def.label}
    />
  );
};

// Slider-per-channel picker in the given format's native color space
// (OKLCH: L/C/H, HSL: H/S/L, RGB & hex: R/G/B).
const ChannelColorPicker = ({
  value,
  format,
  onChange,
}: {
  value: string;
  format: ColorFormat;
  onChange: (hex: string) => void;
}) => {
  const [channels, setChannels] = React.useState(() =>
    hexToChannels(value, format)
  );
  const hex = channelsToHex(channels, format);
  // What the 8-bit hex actually stores. Shown in the number cells so they
  // can never disagree with the panel inputs, which derive from the same
  // hex. Sliders keep the local (unquantized) values so dragging stays
  // smooth and degenerate channels (e.g. hue on a gray) don't snap back.
  const displayChannels = hexToChannels(hex, format);

  // For OKLCH, cap chroma at the largest value still inside sRGB for the
  // current lightness/hue, so the picker can't request colors that hex
  // can't store (which would make it disagree with the stored value).
  const chromaCap =
    format === "oklch"
      ? Math.max(maxChromaInGamut(channels[0], channels[2]), 0.001)
      : null;
  const defs = CHANNEL_DEFS[format].map((def) =>
    chromaCap !== null && def.key === "c" ? { ...def, max: chromaCap } : def
  );

  const update = (index: number, channelValue: number) => {
    const next = [...channels];
    next[index] = channelValue;
    // Moving L or H can shrink the in-gamut chroma range; pull C back in
    if (chromaCap !== null && index !== 1) {
      next[1] = Math.min(next[1], maxChromaInGamut(next[0], next[2]));
    }
    setChannels(next);
    onChange(channelsToHex(next, format));
  };

  const setFromHex = (newHex: string) => {
    setChannels(hexToChannels(newHex, format));
    onChange(newHex);
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      setFromHex(result.sRGBHex);
    } catch {
      // user dismissed the eyedropper or the API is unavailable
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {defs.map((def, index) => (
        <Slider.Root
          key={def.key}
          className="relative flex h-5 w-full touch-none items-center"
          min={def.min}
          max={def.max}
          step={def.step}
          value={[channels[index]]}
          onValueChange={([channelValue]) => update(index, channelValue)}
        >
          <Slider.Track
            className="relative h-3.5 w-full grow overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
            style={{
              background: channelTrackGradient(
                channels,
                format,
                index,
                def.key === "c" && chromaCap !== null ? chromaCap : undefined
              ),
            }}
          >
            <Slider.Range className="absolute h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block h-5 w-5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={def.label}
          />
        </Slider.Root>
      ))}

      <div className="flex items-center rounded-lg border border-neutral-200 shadow-sm">
        <button
          type="button"
          onClick={handleEyeDropper}
          className="flex shrink-0 items-center gap-1.5 py-2 pl-3 pr-2 text-neutral-500 hover:text-neutral-800 transition-colors"
          aria-label="Pick color from screen"
        >
          <span
            className="block h-5 w-5 rounded-full border border-black/10"
            style={{ backgroundColor: hex }}
          />
          <EyedropperIcon className="h-3.5 w-3.5" />
        </button>
        {defs.map((def, index) => (
          <div
            key={def.key}
            className={cn(
              "flex min-w-0 items-center gap-1 border-l border-neutral-200 px-2 py-2",
              // hue values ("248.8°") need more room than L/C ("0.074")
              def.key === "h" ? "flex-[1.3]" : "flex-1"
            )}
          >
            <span className="text-xs text-neutral-500">{def.label}</span>
            <ChannelNumberInput
              value={displayChannels[index]}
              def={def}
              onCommit={(channelValue) => update(index, channelValue)}
              className="text-right"
            />
            {def.unit && (
              <span className="text-xs text-neutral-400">{def.unit}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChannelColorPicker, ChannelNumberInput };
