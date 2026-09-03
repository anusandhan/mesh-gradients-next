"use client";

import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  SlidersIcon,
  SwatchesIcon,
  StackIcon,
  CropIcon,
  CirclesThreeIcon,
  WaveSineIcon,
  CloudIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { customEasing } from "@/lib/motion";
import { RulerSlider } from "@/components/mobile/RulerSlider";
import { AdjustDial } from "@/components/mobile/AdjustDial";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLOR_FORMATS, type ColorFormat } from "@/lib/color-format";
import type { GradientStyle } from "@/lib/gradient-renderer";

// Photos-app style edit mode for small screens. The preview stays visible
// above; this panel replaces the bottom bar with a tab strip (Adjust, Colors,
// Style, Size) and the header carries Cancel / Done.

export type EditTab = "adjust" | "colors" | "style" | "size";

export type Adjustment = {
  key: string;
  /** Full name, shown above the ruler */
  label: string;
  /** Short name under the dial */
  shortLabel: string;
  icon: Icon;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
};

export type EditPreset = {
  value: string;
  name: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  swatches?: string[];
};

export type EditAspectRatio = {
  value: string;
  label: string;
  ratio: string;
  icon: Icon;
};

const TABS: { key: EditTab; label: string; icon: Icon }[] = [
  { key: "adjust", label: "Effects", icon: SlidersIcon },
  { key: "colors", label: "Colors", icon: SwatchesIcon },
  { key: "style", label: "Style", icon: StackIcon },
  { key: "size", label: "Size", icon: CropIcon },
];

const STYLES: { value: GradientStyle; label: string; icon: Icon }[] = [
  { value: "blobs", label: "Blobs", icon: CirclesThreeIcon },
  { value: "stripes", label: "Stripes", icon: WaveSineIcon },
  { value: "clouds", label: "Clouds", icon: CloudIcon },
];

const tabLabel = (tab: EditTab) => TABS.find((t) => t.key === tab)?.label;

type MobileEditHeaderProps = {
  tab: EditTab;
  onCancel: () => void;
  onDone: () => void;
};

export function MobileEditHeader({ tab, onCancel, onDone }: MobileEditHeaderProps) {
  return (
    <div className="flex h-12 shrink-0 select-none items-center justify-between border-b border-neutral-200 bg-white px-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 rounded-lg px-3 text-sm text-neutral-600 transition-[color,transform] active:scale-[0.96]"
      >
        Cancel
      </button>
      <span className="text-sm font-medium text-neutral-800">
        {tabLabel(tab)}
      </span>
      <button
        type="button"
        onClick={onDone}
        className="h-11 rounded-lg px-3 text-sm font-semibold text-neutral-900 transition-transform active:scale-[0.96]"
      >
        Done
      </button>
    </div>
  );
}

type MobileEditPanelProps = {
  tab: EditTab;
  onTabChange: (tab: EditTab) => void;

  adjustments: Adjustment[];
  activeAdjustmentKey: string;
  onActiveAdjustmentChange: (key: string) => void;

  backgroundColor: string;
  colors: string[];
  colorFormat: ColorFormat;
  onColorFormatChange: (format: ColorFormat) => void;
  onBackgroundColorChange: (hex: string) => void;
  onColorChange: (index: number, hex: string) => void;
  presets: EditPreset[];
  selectedPreset: string;
  onSelectPreset: (value: string) => void;

  style: GradientStyle;
  onStyleChange: (style: GradientStyle) => void;

  aspectRatio: string;
  aspectRatioOptions: EditAspectRatio[];
  onAspectRatioChange: (value: string) => void;
};

export function MobileEditPanel({
  tab,
  onTabChange,
  adjustments,
  activeAdjustmentKey,
  onActiveAdjustmentChange,
  backgroundColor,
  colors,
  colorFormat,
  onColorFormatChange,
  onBackgroundColorChange,
  onColorChange,
  presets,
  selectedPreset,
  onSelectPreset,
  style,
  onStyleChange,
  aspectRatio,
  aspectRatioOptions,
  onAspectRatioChange,
}: MobileEditPanelProps) {
  // Fall back to the first tool when the style change removed the active one
  const active =
    adjustments.find((a) => a.key === activeAdjustmentKey) ?? adjustments[0];

  return (
    <div className="flex shrink-0 select-none flex-col border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {/* Fixed-height content area so the preview doesn't jump between tabs */}
      <div className="relative h-40 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: customEasing.easeOutQuad }}
            className="absolute inset-0 flex flex-col"
          >
            {tab === "adjust" && active && (
              <div className="flex h-full flex-col justify-between pt-3">
                <div className="flex items-baseline justify-between px-5">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {active.label}
                  </span>
                  <button
                    type="button"
                    disabled={active.value === active.defaultValue}
                    onClick={() => active.onChange(active.defaultValue)}
                    aria-label={`Reset ${active.label}`}
                    className="min-w-[3.5rem] rounded-md text-right font-azeret text-sm tabular-nums text-neutral-900 transition-colors disabled:text-neutral-500"
                  >
                    {active.format(active.value)}
                  </button>
                </div>
                <RulerSlider
                  key={active.key}
                  value={active.value}
                  min={active.min}
                  max={active.max}
                  step={active.step}
                  defaultValue={active.defaultValue}
                  onChange={active.onChange}
                  aria-label={active.label}
                  aria-valuetext={active.format(active.value)}
                />
                <div className="snap-x overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {/* Centered while it fits, scrolls once it overflows */}
                  <div className="mx-auto flex w-max">
                    {adjustments.map((a) => (
                      <AdjustDial
                        key={a.key}
                        label={a.shortLabel}
                        icon={a.icon}
                        progress={(a.value - a.min) / (a.max - a.min)}
                        active={a.key === active.key}
                        onClick={() => onActiveAdjustmentChange(a.key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "colors" && (
              <div className="flex h-full flex-col justify-between pt-2">
                <div className="flex items-center justify-between px-5">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Colors
                  </span>
                  <Select
                    value={colorFormat}
                    onValueChange={(value) =>
                      onColorFormatChange(value as ColorFormat)
                    }
                  >
                    <SelectTrigger
                      aria-label="Color format"
                      className="h-7 w-auto gap-1 px-2 text-xs text-neutral-600"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {COLOR_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start justify-center gap-4 px-5">
                  <Swatch
                    label="Background"
                    value={backgroundColor}
                    format={colorFormat}
                    onChange={onBackgroundColorChange}
                  />
                  <span
                    aria-hidden
                    className="mt-3 h-5 w-px shrink-0 bg-neutral-200"
                  />
                  {colors.map((color, index) => (
                    <Swatch
                      key={index}
                      label={`Color ${index + 1}`}
                      value={color}
                      format={colorFormat}
                      onChange={(hex) => onColorChange(index, hex)}
                    />
                  ))}
                </div>
                {/* Same pill toggle group as the desktop Style picker, kept to
                    one scrolling row so the tab height stays fixed */}
                <div className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <ToggleGroup
                    type="single"
                    value={selectedPreset}
                    onValueChange={(value) => {
                      // Radix allows deselecting the active pill; the palette
                      // is always something, so ignore empty
                      if (value) onSelectPreset(value);
                    }}
                    aria-label="Preset"
                    className="w-max flex-nowrap"
                  >
                    {presets.map((preset) => {
                      const PresetIcon = preset.icon;
                      return (
                        <ToggleGroupItem
                          key={preset.value}
                          value={preset.value}
                          aria-label={preset.name}
                          className="shrink-0"
                        >
                          {preset.swatches ? (
                            <span
                              aria-hidden
                              className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                              style={{
                                background: `linear-gradient(135deg, ${preset.swatches.join(", ")})`,
                              }}
                            />
                          ) : PresetIcon ? (
                            <PresetIcon size={16} />
                          ) : null}
                          <span className="max-w-[8rem] truncate">
                            {preset.name}
                          </span>
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </div>
              </div>
            )}

            {tab === "style" && (
              <div className="flex h-full items-center justify-center gap-3 px-5">
                {STYLES.map((s) => {
                  const selected = s.value === style;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onStyleChange(s.value)}
                      className={cn(
                        "flex h-20 flex-1 flex-col items-center justify-center gap-2 rounded-xl border transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
                        selected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-600"
                      )}
                    >
                      <s.icon size={22} weight={selected ? "fill" : "regular"} />
                      <span className="text-xs font-medium">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "size" && (
              <div className="flex h-full items-center">
                <div className="w-full overflow-x-auto px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="mx-auto flex w-max gap-2">
                  {aspectRatioOptions.map((option) => {
                    const selected = option.value === aspectRatio;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onAspectRatioChange(option.value)}
                        className={cn(
                          "flex h-20 w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
                          selected
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-600"
                        )}
                      >
                        <option.icon
                          size={20}
                          weight={selected ? "fill" : "regular"}
                        />
                        <span className="font-azeret text-sm font-medium tabular-nums">
                          {option.ratio}
                        </span>
                        <span
                          className={cn(
                            "max-w-full truncate px-1 text-[10px] leading-none",
                            selected ? "text-neutral-300" : "text-neutral-500"
                          )}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab strip */}
      <div className="flex border-t border-neutral-100 px-2">
        {TABS.map((t) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onTabChange(t.key)}
              className={cn(
                "flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg transition-[color,transform] duration-150 active:scale-[0.96]",
                selected ? "text-neutral-900" : "text-neutral-400"
              )}
            >
              <t.icon size={20} weight={selected ? "fill" : "regular"} />
              <span className="text-[10px] font-medium leading-none">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Swatch = ({
  label,
  value,
  format,
  onChange,
}: {
  label: string;
  value: string;
  format: ColorFormat;
  onChange: (hex: string) => void;
}) => (
  <div className="flex flex-col items-center gap-1.5">
    <ColorPickerPopover
      value={value}
      format={format}
      onChange={onChange}
      className="h-11 w-11 rounded-full border-neutral-300"
    />
    <span className="text-[10px] leading-none text-neutral-500">{label}</span>
  </div>
);
