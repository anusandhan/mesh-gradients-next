"use client";

import { Label } from "@/components/ui/label";
import { RulerSlider } from "@/components/mobile/RulerSlider";
import type { Adjustment } from "@/components/mobile/MobileEditPanel";

// Desktop slider stack: label, tap-to-reset value, ruler. Shared by the
// Style section (blur, grain, contrast, saturation and the style's own
// dials) and the Effects section (cell size, dot size / density).
export function DialList({ dials }: { dials: Adjustment[] }) {
  return (
    <div className="space-y-5">
      {dials.map((a) => (
        <div key={a.key} className="space-y-1">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm">{a.label}</Label>
            <button
              type="button"
              disabled={a.value === a.defaultValue}
              onClick={() => a.onChange(a.defaultValue)}
              aria-label={`Reset ${a.label}`}
              title="Reset to default"
              className="rounded font-azeret text-xs tabular-nums text-neutral-800 transition-colors hover:text-neutral-950 disabled:text-muted-foreground"
            >
              {a.format(a.value)}
            </button>
          </div>
          <RulerSlider
            value={a.value}
            min={a.min}
            max={a.max}
            step={a.step}
            defaultValue={a.defaultValue}
            onChange={a.onChange}
            aria-label={a.label}
            aria-valuetext={a.format(a.value)}
            className="h-10"
          />
        </div>
      ))}
    </div>
  );
}
