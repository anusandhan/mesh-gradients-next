"use client";

import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  SlidersIcon,
  SwatchesIcon,
  SparkleIcon,
  ShapesIcon,
  CropIcon,
  CirclesThreeIcon,
  WaveSineIcon,
  CloudIcon,
  ProhibitIcon,
  GridFourIcon,
  HashIcon,
  ShuffleIcon,
  DownloadIcon,
  XIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { customEasing } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
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
import type {
  GradientEffect,
  GradientOverlay,
  GradientStyle,
  OverlayShape,
} from "@/lib/gradient-renderer";
import { ShapePicker } from "@/components/ShapePicker";
import type { Outline } from "@/lib/svg-outline";

// Edit panel for small screens. Every change is live in the preview, so
// there is nothing to confirm: the panel opens, you work, you close it.
// Randomize and Export sit in the panel header because the loop we saw in
// replays is edit → regenerate → edit, and that should cost zero taps.
//
// Tabs are grouped by intent: Style (which look, and its dials), Effects
// (which finish, and its dials), Colors, Size.

export type EditTab = "style" | "effects" | "overlay" | "colors" | "size";

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
  { key: "style", label: "Style", icon: SlidersIcon },
  { key: "effects", label: "Effects", icon: SparkleIcon },
  { key: "overlay", label: "Overlay", icon: ShapesIcon },
  { key: "colors", label: "Colors", icon: SwatchesIcon },
  { key: "size", label: "Size", icon: CropIcon },
];

const STYLES: { value: GradientStyle; label: string; icon: Icon }[] = [
  { value: "blobs", label: "Blobs", icon: CirclesThreeIcon },
  { value: "stripes", label: "Stripes", icon: WaveSineIcon },
  { value: "clouds", label: "Clouds", icon: CloudIcon },
];

const EFFECTS: { value: GradientEffect; label: string; icon: Icon }[] = [
  { value: "none", label: "None", icon: ProhibitIcon },
  { value: "pixel", label: "Pixel", icon: GridFourIcon },
  { value: "dither", label: "Dither", icon: HashIcon },
];

const OVERLAYS: { value: GradientOverlay; label: string; icon: Icon }[] = [
  { value: "none", label: "None", icon: ProhibitIcon },
  { value: "shapes", label: "Shapes", icon: ShapesIcon },
];

const tabLabel = (tab: EditTab) => TABS.find((t) => t.key === tab)?.label;

// One-row pill picker: the same ToggleGroup the desktop sidebar uses, so
// styles and finishes look identical on both screens
function SegmentedRow<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; icon: Icon }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        // Radix allows deselecting the active pill; a choice is always
        // required, so ignore empty
        if (next) onChange(next as T);
      }}
      aria-label={label}
      className="justify-center px-5"
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
          <o.icon size={16} weight="fill" />
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// Slider + dial strip for a list of adjustments
function DialPane({
  dials,
  activeKey,
  onActiveChange,
  stripKey,
}: {
  dials: Adjustment[];
  activeKey: string;
  onActiveChange: (key: string) => void;
  /** Changes when the dial set changes, to crossfade the strip */
  stripKey: string;
}) {
  const active = dials.find((a) => a.key === activeKey) ?? dials[0];
  if (!active) return null;
  return (
    <div className="flex flex-1 flex-col justify-between pt-2">
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
      <div className="snap-x overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Centered while it fits, scrolls once it overflows. A style
            change swaps the dial set, so the strip crossfades. */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={stripKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: customEasing.easeOutQuad }}
            className="mx-auto flex w-max"
          >
            {dials.map((a) => (
              <AdjustDial
                key={a.key}
                label={a.shortLabel}
                icon={a.icon}
                progress={(a.value - a.min) / (a.max - a.min)}
                active={a.key === active.key}
                onClick={() => onActiveChange(a.key)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

type MobileEditPanelProps = {
  tab: EditTab;
  onTabChange: (tab: EditTab) => void;
  onClose: () => void;
  onRandomize: () => void;
  onExport: () => void;
  isExporting: boolean;

  styleDials: Adjustment[];
  effectDials: Adjustment[];
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
  effect: GradientEffect;
  onEffectChange: (effect: GradientEffect) => void;
  /** Rendered above the dither dials; null unless the finish is Dither */
  ditherCharsInput: React.ReactNode;

  overlay: GradientOverlay;
  onOverlayChange: (overlay: GradientOverlay) => void;
  overlayShape: OverlayShape;
  onOverlayShapeChange: (shape: OverlayShape) => void;
  customShape: Outline | null;
  onUploadSvg: (file: File) => void;
  onRemoveSvg: () => void;
  overlayDials: Adjustment[];
  /** Placement grid, sized for the panel */
  placement: React.ReactNode;

  aspectRatio: string;
  aspectRatioOptions: EditAspectRatio[];
  onAspectRatioChange: (value: string) => void;
};

export function MobileEditPanel({
  tab,
  onTabChange,
  onClose,
  onRandomize,
  onExport,
  isExporting,
  styleDials,
  effectDials,
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
  effect,
  onEffectChange,
  ditherCharsInput,
  overlay,
  onOverlayChange,
  overlayShape,
  onOverlayShapeChange,
  customShape,
  onUploadSvg,
  onRemoveSvg,
  overlayDials,
  placement,
  aspectRatio,
  aspectRatioOptions,
  onAspectRatioChange,
}: MobileEditPanelProps) {
  return (
    <div className="flex shrink-0 select-none flex-col border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {/* Header: what you're editing, and the two actions the loop needs */}
      <div className="flex h-12 items-center justify-between border-b border-neutral-100 pl-5 pr-2">
        <span className="text-sm font-medium text-neutral-800">{tabLabel(tab)}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            onClick={onRandomize}
            className="h-9 w-9 p-0"
            aria-label="Randomize gradient"
          >
            <ShuffleIcon weight="bold" className="h-4 w-4" />
          </Button>
          <Button
            onClick={onExport}
            disabled={isExporting}
            className="h-9 w-9 p-0"
            aria-label="Export image"
          >
            {isExporting ? (
              <Spinner size={16} />
            ) : (
              <DownloadIcon weight="bold" className="h-4 w-4" />
            )}
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 transition-[color,transform] duration-150 hover:text-neutral-900 active:scale-[0.96]"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Fixed-height content area so the preview doesn't jump between
          tabs. Two tabs carry an extra row above their dials (the dither
          character input, the overlay shape pills and placement grid) and get a taller box; the
          height eases so the preview resizes rather than snapping. */}
      <div
        className={cn(
          "relative overflow-hidden transition-[height] duration-200 ease-out",
          tab === "effects" && ditherCharsInput
            ? "h-[19rem]"
            : tab === "overlay" && overlay !== "none"
              ? "h-[26rem]"
              : "h-56"
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: customEasing.easeOutQuad }}
            className="absolute inset-0 flex flex-col"
          >
            {tab === "style" && (
              <div className="flex h-full flex-col pt-3">
                <SegmentedRow
                  options={STYLES}
                  value={style}
                  onChange={onStyleChange}
                  label="Gradient style"
                />
                <DialPane
                  dials={styleDials}
                  activeKey={activeAdjustmentKey}
                  onActiveChange={onActiveAdjustmentChange}
                  stripKey={style}
                />
              </div>
            )}

            {tab === "effects" && (
              <div className="flex h-full flex-col pt-3">
                <SegmentedRow
                  options={EFFECTS}
                  value={effect}
                  onChange={onEffectChange}
                  label="Finish"
                />
                {/* Dials exist only while a finish is on; the empty state
                    says so rather than showing dead controls */}
                <div className="relative flex-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {effect === "none" ? (
                      <motion.p
                        key="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center px-5 text-center text-xs text-neutral-500"
                      >
                        Pick Pixel or Dither to add a finish on top of the gradient.
                      </motion.p>
                    ) : (
                      <motion.div
                        key="dials"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: customEasing.easeOutQuad }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {ditherCharsInput && (
                          <div className="px-5 pt-3">{ditherCharsInput}</div>
                        )}
                        <DialPane
                          dials={effectDials}
                          activeKey={activeAdjustmentKey}
                          onActiveChange={onActiveAdjustmentChange}
                          stripKey={effect}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {tab === "overlay" && (
              <div className="flex h-full flex-col pt-3">
                <SegmentedRow
                  options={OVERLAYS}
                  value={overlay}
                  onChange={onOverlayChange}
                  label="Overlay"
                />
                <div className="relative flex-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {overlay === "none" ? (
                      <motion.p
                        key="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center px-5 text-center text-xs text-neutral-500"
                      >
                        Pick Shapes to ring the gradient with concentric outlines.
                      </motion.p>
                    ) : (
                      <motion.div
                        key="dials"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: customEasing.easeOutQuad }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <ShapePicker
                          shape={overlayShape}
                          custom={customShape}
                          onShapeChange={onOverlayShapeChange}
                          onUpload={onUploadSvg}
                          onRemoveCustom={onRemoveSvg}
                          // One scrollable row, so the box height holds on narrow phones.
                          // pb/-mb: the scroller clips vertically too, so give the
                          // pill shadows room without moving what follows
                          className="-mb-2 flex-nowrap overflow-x-auto px-5 pb-2 pt-3 [justify-content:safe_center] [scrollbar-width:none]"
                        />
                        <div className="px-5 pt-3">{placement}</div>
                        <DialPane
                          dials={overlayDials}
                          activeKey={activeAdjustmentKey}
                          onActiveChange={onActiveAdjustmentChange}
                          stripKey={overlayShape}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {tab === "colors" && (
              <div className="flex h-full flex-col justify-between pt-2">
                {/* Preset first: pick a palette, then adjust its colors */}
                <div className="flex items-center justify-between px-5">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Preset
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
                {/* Same pill toggle group as the desktop picker, kept to one
                    scrolling row so the tab height stays fixed */}
                <div className="overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                <div className="flex items-start justify-center gap-4 px-5 pb-3">
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
