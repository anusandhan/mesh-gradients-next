"use client";

import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { cn } from "@/lib/utils";
import {
  FREE_PRESET_LIMIT,
  PLANS,
  formatPrice,
  type PlanId,
} from "@/lib/plans";
import { track } from "@/lib/analytics";
import { parseStudioParams } from "@/lib/gallery";
import { FREE_EXPORTS_PER_MONTH } from "@/lib/site";
import { QuotaMeter } from "@/components/QuotaMeter";
import Spinner from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckIcon,
  DownloadIcon,
  GearSixIcon,
  PlusIcon,
  ShuffleIcon,
  SwatchesIcon,
  TabsIcon,
  SlidersIcon,
  MonitorIcon,
  SquareIcon,
  YoutubeLogoIcon,
  DeviceMobileIcon,
  InstagramLogoIcon,
  DeviceTabletCameraIcon,
  StackIcon,
  CirclesThreeIcon,
  WaveSineIcon,
  CloudIcon,
  DropIcon,
  DotsNineIcon,
  CircleHalfIcon,
  PaletteIcon,
  RowsIcon,
  SunDimIcon,
  FeatherIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { RulerSlider } from "@/components/mobile/RulerSlider";
import {
  MobileEditHeader,
  MobileEditPanel,
  type Adjustment,
  type EditTab,
} from "@/components/mobile/MobileEditPanel";
import Image from "next/image";
import {
  LovableIcon,
  DiaIcon,
  RaycastIcon,
  StripeIcon,
  ArcIcon,
  CometIcon,
  DevinIcon,
} from "@/components/icons";
import {
  formatColor,
  parseToHex,
  hexToChannels,
  channelsToHex,
  COLOR_FORMATS,
  CHANNEL_DEFS,
  type ColorFormat,
} from "@/lib/color-format";
import { ChannelNumberInput } from "@/components/ui/channel-color-picker";
import {
  renderGradient,
  normalizeHexColor,
  type GradientStyle,
} from "@/lib/gradient-renderer";
import { SignInButton, UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useColorPresets, type UserPreset } from "@/hooks/useColorPresets";
import { ManagePresetsDialog } from "@/components/presets/ManagePresetsDialog";
import { dedupeName, paletteMatchesPreset } from "@/lib/presets";

// Browser canvas factory for the renderer's scratch canvases. Canvases are
// pooled by size: every scratch canvas within one render has a distinct
// size and is fully repainted before use, so handing back the same element
// each frame is safe and avoids allocating a fresh GPU-backed canvas per
// blur level per render.
const scratchCanvases = new Map<string, HTMLCanvasElement>();
const domCreateCanvas = (width: number, height: number) => {
  const key = `${width}x${height}`;
  let canvas = scratchCanvases.get(key);
  if (!canvas) {
    // Aspect ratio or viewport changes retire old sizes; keep the pool small
    if (scratchCanvases.size >= 32) scratchCanvases.clear();
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    scratchCanvases.set(key, canvas);
  }
  return canvas;
};

type PresetGradient = {
  name: string;
  background: string;
  colors: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

// Color value input in the selected format. Hex renders one text field that
// accepts any CSS color string; the other formats render one number input
// per channel. Internal value stays hex either way.
const ColorField = ({
  id,
  hex,
  format,
  placeholder,
  onChange,
}: {
  id?: string;
  hex: string;
  format: ColorFormat;
  placeholder: string;
  onChange: (hex: string) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  if (format === "hex") {
    return (
      <Input
        id={id}
        type="text"
        value={draft ?? formatColor(hex, format)}
        onFocus={() => setDraft(formatColor(hex, format))}
        onChange={(e) => {
          setDraft(e.target.value);
          const parsed = parseToHex(e.target.value);
          if (parsed) onChange(parsed);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="h-9 flex-1 rounded-lg border-black/[0.04] bg-neutral-50 px-2 text-center font-azeret text-xs text-neutral-700 shadow-none transition-colors duration-150 focus-visible:border-neutral-800 focus-visible:bg-white focus-visible:ring-0"
        placeholder={placeholder}
      />
    );
  }

  const defs = CHANNEL_DEFS[format];
  const channels = hexToChannels(hex, format);

  return (
    // Figma "Color Picker" fields: one 8px-radius well with hairline
    // dividers between the channel cells
    <div className="flex h-9 flex-1 min-w-0 items-center rounded-lg border border-black/[0.04] bg-neutral-50 transition-colors duration-150 focus-within:border-neutral-800 focus-within:bg-white">
      {defs.map((def, index) => (
        <div
          key={def.key}
          className={cn(
            "flex h-full min-w-0 flex-1 items-center px-2",
            index > 0 && "border-l border-black/[0.04]"
          )}
        >
          <ChannelNumberInput
            value={channels[index]}
            def={def}
            onCommit={(channelValue) => {
              const next = [...channels];
              next[index] = channelValue;
              onChange(channelsToHex(next, format));
            }}
            className="text-center font-azeret text-xs text-neutral-700"
          />
        </div>
      ))}
    </div>
  );
};

const presetGradients: PresetGradient[] = [
  // {
  //   name: "Heatwaves",
  //   background: "#f8fafc",
  //   colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
  // },
  {
    name: "Lovable",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    icon: LovableIcon,
  },
  {
    name: "Dia",
    background: "#0358f7",
    colors: ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe"],
    icon: DiaIcon,
  },
  {
    name: "Raycast",
    background: "#07090B",
    colors: ["#CF1627", "#08243A", "#0F8B92", "#D54F63"],
    icon: RaycastIcon,
  },
  {
    name: "Stripe",
    background: "#635BFF",
    colors: ["#F15372", "#FFCA3B", "#76E2FF", "#B5DAB9"],
    icon: StripeIcon,
  },
  {
    name: "Arc",
    background: "#140080",
    colors: ["#0229C9", "#FF526B", "#FF9598", "#EE4A5F"],
    icon: ArcIcon,
  },
  {
    name: "Comet",
    background: "#101013",
    colors: ["#5099A1", "#733138", "#53969F", "#C17B55"],
    icon: CometIcon,
  },
  {
    name: "Devin",
    background: "#11131D",
    colors: ["#2A6DCE", "#1796E2", "#1DC19C", "#3FA9DD"],
    icon: DevinIcon,
  },
  // {
  //   name: "Creem",
  //   background: "#18120E",
  //   colors: ["#FFC099", "#FFB68A", "#FF8E57", "#B39A8D"],
  // },
];

// Values must stay in sync with STUDIO_ASPECT_RATIOS (lib/gallery.ts), which
// the export API validates against.
const aspectRatioOptions = [
  { value: "16:9", label: "Desktop", ratio: "16:9", icon: MonitorIcon },
  { value: "16:10", label: "Mac", ratio: "16:10", icon: MonitorIcon },
  { value: "1.91:1", label: "Social card", ratio: "1.91:1", icon: TabsIcon },
  { value: "5:2", label: "Notion cover", ratio: "5:2", icon: RowsIcon },
  { value: "1:1", label: "Square Post", ratio: "1:1", icon: SquareIcon },
  {
    value: "4:3",
    label: "YouTube",
    ratio: "4:3",
    icon: YoutubeLogoIcon,
  },
  { value: "9:16", label: "Story", ratio: "9:16", icon: DeviceMobileIcon },
  {
    value: "3:4",
    label: "Post",
    ratio: "3:4",
    icon: InstagramLogoIcon,
  },
  {
    value: "4:5",
    label: "Portrait",
    ratio: "4:5",
    icon: DeviceTabletCameraIcon,
  },
];

// Sidebar sections are memoized so a slider tick (which re-renders the
// generator for the new value) doesn't also reconcile the color pickers,
// preset select, style toggle, and preview badges — they only depend on
// props that don't change during a drag.

const StyleSection = memo(function StyleSection({
  gradientStyle,
  onChange,
}: {
  gradientStyle: GradientStyle;
  onChange: (style: GradientStyle) => void;
}) {
  return (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
              <StackIcon className="w-6 h-6" />
              Style
            </h3>
          </div>
          <ToggleGroup
            type="single"
            value={gradientStyle}
            onValueChange={(value) => {
              // Radix allows deselecting the active item; a style is
              // always required, so ignore empty
              if (value) onChange(value as GradientStyle);
            }}
            aria-label="Gradient style"
            className="w-full"
          >
            <ToggleGroupItem value="blobs" aria-label="Blurred Blobs">
              <CirclesThreeIcon size={16} weight="fill" />
              Blobs
            </ToggleGroupItem>
            <ToggleGroupItem value="stripes" aria-label="Silk Stripes">
              <WaveSineIcon size={16} weight="fill" />
              Stripes
            </ToggleGroupItem>
            <ToggleGroupItem value="clouds" aria-label="Clouds">
              <CloudIcon size={16} weight="fill" />
              Clouds
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
  );
});

// Figma "Color Picker" row: 12px outer radius = 8px swatch/field radius +
// 4px padding, so the nested corners stay concentric
const colorRowClass =
  "flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1";

const ColorsSection = memo(function ColorsSection({
  colorFormat,
  onColorFormatChange,
  backgroundColor,
  colorInputs,
  onBackgroundChange,
  onColorChange,
}: {
  colorFormat: ColorFormat;
  onColorFormatChange: (format: ColorFormat) => void;
  backgroundColor: string;
  colorInputs: string[];
  onBackgroundChange: (hex: string) => void;
  onColorChange: (index: number, hex: string) => void;
}) {
  return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
              <SwatchesIcon className="w-6 h-6" />
              Colors
            </h3>
            <Select
              value={colorFormat}
              onValueChange={(value) =>
                onColorFormatChange(value as ColorFormat)
              }
            >
              <SelectTrigger className="h-7 w-auto gap-1 px-2 text-xs text-neutral-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="backgroundColor"
                className="text-sm font-medium"
              >
                Background
              </Label>
              <div className={colorRowClass}>
                <ColorPickerPopover
                  value={normalizeHexColor(backgroundColor)}
                  format={colorFormat}
                  onChange={onBackgroundChange}
                />
                <ColorField
                  id="backgroundColor"
                  hex={normalizeHexColor(backgroundColor)}
                  format={colorFormat}
                  placeholder="oklch(1 0 0)"
                  onChange={onBackgroundChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">Gradient Colors</Label>
              {colorInputs.map((color, index) => (
                <div key={index} className={colorRowClass}>
                  <ColorPickerPopover
                    value={normalizeHexColor(color)}
                    format={colorFormat}
                    onChange={(hex) => onColorChange(index, hex)}
                  />

                  <ColorField
                    hex={normalizeHexColor(color)}
                    format={colorFormat}
                    placeholder="oklch(0 0 0)"
                    onChange={(hex) => onColorChange(index, hex)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
  );
});

const PresetsSection = memo(function PresetsSection({
  selectedPresetValue,
  presetSelectOpen,
  onPresetSelectOpenChange,
  onSelectPreset,
  userPresets,
  presetDraftName,
  onPresetDraftNameChange,
  onStartSaving,
  onCommitSave,
  savingPreset,
  presetSelected,
  onManagePresets,
}: {
  selectedPresetValue: string;
  presetSelectOpen: boolean;
  onPresetSelectOpenChange: (open: boolean) => void;
  onSelectPreset: (value: string) => void;
  userPresets: UserPreset[];
  presetDraftName: string | null;
  onPresetDraftNameChange: (name: string | null) => void;
  onStartSaving: () => void;
  onCommitSave: () => void;
  savingPreset: boolean;
  presetSelected: boolean;
  onManagePresets: () => void;
}) {
  return (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
              <TabsIcon className="w-6 h-6" />
              Preset
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {presetDraftName === null ? (
            <Select
              value={selectedPresetValue}
              open={presetSelectOpen}
              onOpenChange={onPresetSelectOpenChange}
              onValueChange={onSelectPreset}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a preset" />
              </SelectTrigger>
              <SelectContent>
                {userPresets.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-neutral-500">
                      USER PRESETS
                    </SelectLabel>
                    {userPresets.map((preset) => (
                      <SelectItem
                        key={preset.id}
                        value={`user:${preset.id}`}
                        indicator="dot"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                            style={{
                              background: `linear-gradient(135deg, ${preset.colors.join(", ")})`,
                            }}
                          />
                          <span className="max-w-[10rem] truncate">
                            {preset.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                  </SelectGroup>
                )}
                {presetGradients.map((preset, index) => {
                  const IconComponent = preset.icon;
                  return (
                    <SelectItem
                      key={index}
                      value={preset.name}
                      indicator="dot"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent
                          size={16}
                          className="text-neutral-600"
                        />
                        {preset.name}
                      </div>
                    </SelectItem>
                  );
                })}
                {userPresets.length > 0 && (
                  <>
                    <SelectSeparator />
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-accent hover:text-accent-foreground"
                      onPointerDown={(e) => {
                        // Keep Radix Select from treating this as an
                        // item selection
                        e.preventDefault();
                      }}
                      onClick={() => {
                        onPresetSelectOpenChange(false);
                        onManagePresets();
                      }}
                    >
                      <GearSixIcon size={16} />
                      Manage Presets
                    </button>
                  </>
                )}
              </SelectContent>
            </Select>
            ) : (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  type: "spring",
                  duration: 0.3,
                  bounce: 0,
                }}
                className="relative flex-1"
              >
                <Input
                  autoFocus
                  value={presetDraftName}
                  maxLength={40}
                  placeholder="Preset name"
                  aria-label="Preset name"
                  className="w-full pr-14 text-sm"
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => onPresetDraftNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCommitSave();
                    if (e.key === "Escape") onPresetDraftNameChange(null);
                  }}
                />
                <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">
                  ↵
                </Kbd>
              </motion.div>
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label={
                presetDraftName === null
                  ? "Save preset"
                  : "Confirm save"
              }
              disabled={
                savingPreset ||
                (presetDraftName === null && presetSelected)
              }
              className="shrink-0"
              onClick={
                presetDraftName === null
                  ? onStartSaving
                  : onCommitSave
              }
            >
                    {savingPreset ? (
                      <Spinner size={16} />
                    ) : (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <motion.span
                          className="absolute flex"
                          animate={
                            presetDraftName === null
                              ? {
                                  opacity: 1,
                                  scale: 1,
                                  filter: "blur(0px)",
                                }
                              : {
                                  opacity: 0,
                                  scale: 0.25,
                                  filter: "blur(4px)",
                                }
                          }
                          transition={{
                            type: "spring",
                            duration: 0.3,
                            bounce: 0,
                          }}
                        >
                          <PlusIcon
                            weight="bold"
                            className="w-4 h-4"
                          />
                        </motion.span>
                        <motion.span
                          className="absolute flex"
                          initial={false}
                          animate={
                            presetDraftName === null
                              ? {
                                  opacity: 0,
                                  scale: 0.25,
                                  filter: "blur(4px)",
                                }
                              : {
                                  opacity: 1,
                                  scale: 1,
                                  filter: "blur(0px)",
                                }
                          }
                          transition={{
                            type: "spring",
                            duration: 0.3,
                            bounce: 0,
                          }}
                        >
                          <CheckIcon
                            weight="bold"
                            className="w-4 h-4"
                          />
                        </motion.span>
                      </span>
                    )}
            </Button>
          </div>
        </div>
  );
});

const PreviewBadges = memo(function PreviewBadges({
  gradientName,
  onGradientNameChange,
  aspectRatio,
  onAspectRatioChange,
}: {
  gradientName: string;
  onGradientNameChange: (name: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
}) {
  return (
    <>
            {/* Gradient Name Badge */}
            <div className="absolute top-2 left-2 z-20">
              <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onGradientNameChange(
                      e.currentTarget.textContent || "New Gradient"
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      e.currentTarget.textContent = gradientName;
                      e.currentTarget.blur();
                    }
                  }}
                  className="text-xs text-neutral-600 hover:text-neutral-800 transition-colors cursor-text outline-none w-auto"
                >
                  {gradientName}
                </div>
              </div>
            </div>

            {/* Aspect Ratio Badge */}
            <div className="absolute top-2 right-2 z-20">
              <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                <SelectTrigger className="w-auto bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm h-auto text-xs text-neutral-600 hover:text-neutral-800 transition-colors cursor-pointer outline-none [&>span]:line-clamp-none">
                  <SelectValue>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      {(() => {
                        const currentOption = aspectRatioOptions.find(
                          (opt) => opt.value === aspectRatio
                        );
                        const IconComponent =
                          currentOption?.icon || MonitorIcon;
                        return (
                          <>
                            <IconComponent className="w-3 h-3 shrink-0" />
                            {/* Phones only get room for the ratio;
                                the label lives in the Size tab */}
                            <span className="hidden sm:inline text-xs text-neutral-600">
                              {currentOption?.label}
                            </span>
                            <span className="font-azeret text-xs tabular-nums text-neutral-600 sm:text-neutral-400">
                              {currentOption?.ratio}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="top" // or "bottom" if you want it under the trigger
                  align="end" // right edge
                  sideOffset={2} // optional spacing from the trigger
                  className="origin-top-right bg-white border border-neutral-200 rounded-lg shadow-sm"
                >
                  {aspectRatioOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <IconComponent className="w-3 h-3 shrink-0" />
                          <span className="text-xs text-neutral-600">
                            {option.label}
                          </span>
                          <span className="font-azeret text-xs tabular-nums text-neutral-400">
                            {option.ratio}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
    </>
  );
});

const GradientGenerator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [colorInputs, setColorInputs] = useState([
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
  ]);
  const [blurAmount, setBlurAmount] = useState([700]);
  const [noiseAmount, setNoiseAmount] = useState([0.2]);
  const [contrastAmount, setContrastAmount] = useState([130]);
  const [saturationAmount, setSaturationAmount] = useState([110]);
  const [gradientName, setGradientName] = useState("New Gradient");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 32));
  const [placement, setPlacement] = useState<"center" | "random">("center");
  const [gradientStyle, setGradientStyle] = useState<GradientStyle>("blobs");
  const [fiberDensity, setFiberDensity] = useState([1]);
  const [waviness, setWaviness] = useState([1]);
  const [sheen, setSheen] = useState([0.2]);
  const [coverage, setCoverage] = useState([1]);
  const [softness, setSoftness] = useState([1]);
  const [detail, setDetail] = useState([1]);
  const [colorFormat, setColorFormat] = useState<ColorFormat>("oklch");
  const [isExporting, setIsExporting] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [editTab, setEditTab] = useState<EditTab>("adjust");
  const [activeAdjustmentKey, setActiveAdjustmentKey] = useState("blur");
  // Everything the mobile edit mode can touch, captured on open so Cancel
  // can put it back
  const editSnapshotRef = useRef<{
    backgroundColor: string;
    colorInputs: string[];
    blurAmount: number[];
    noiseAmount: number[];
    contrastAmount: number[];
    saturationAmount: number[];
    gradientStyle: GradientStyle;
    fiberDensity: number[];
    waviness: number[];
    sheen: number[];
    coverage: number[];
    softness: number[];
    detail: number[];
    aspectRatio: string;
    gradientName: string;
  } | null>(null);
  // Why the upgrade dialog opened drives its headline: out of exports,
  // palette cap hit, or the user just clicked "Go Pro"
  const [upgradeOpen, setUpgradeOpen] = useState<
    false | "exports" | "presets" | "browse"
  >(false);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);

  // One place to observe the upgrade dialog regardless of which code path
  // opened it. Dismissal is inferred from the open -> closed transition.
  const previousUpgradeOpen = useRef<typeof upgradeOpen>(false);
  useEffect(() => {
    const previous = previousUpgradeOpen.current;
    previousUpgradeOpen.current = upgradeOpen;
    if (upgradeOpen) {
      track("upgrade_dialog_opened", { reason: upgradeOpen });
    } else if (previous) {
      track("upgrade_dialog_dismissed", { reason: previous });
    }
  }, [upgradeOpen]);
  const [quota, setQuota] = useState<{
    plan: "free" | "pro";
    remaining: number | null;
    resetsAt: string;
  } | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: 1024,
    height: 600,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const lastRenderMsRef = useRef(0);

  // Phones get a portrait canvas by default; it fills the screen far better
  // than 16:9. Runs once after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setAspectRatio("3:4");
    }
  }, []);

  // Track the preview container's actual size so the canvas fits any viewport
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setContainerSize({
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Display-only quota status; the server is the source of truth and
  // re-checks on every export regardless of what this shows
  const refreshQuota = useCallback(async () => {
    if (!isSignedIn) {
      setQuota(null);
      return;
    }
    try {
      const res = await fetch("/api/quota");
      if (res.ok) setQuota(await res.json());
    } catch {
      // badge is cosmetic; ignore fetch failures
    }
  }, [isSignedIn]);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // Deep links from the landing page (/app?style=…&colors=…&plan=…): apply
  // once on mount, then clean the URL. Defined before the ?upgraded effect
  // below because that one also rewrites the URL.
  useEffect(() => {
    const search = window.location.search;
    if (!search || new URLSearchParams(search).has("upgraded")) return;
    const s = parseStudioParams(search);
    if (s.style) setGradientStyle(s.style);
    if (s.background) setBackgroundColor(s.background);
    if (s.colors) setColorInputs(s.colors);
    if (s.seed !== undefined) setSeed(s.seed);
    if (s.noise !== undefined) setNoiseAmount([s.noise]);
    if (s.blur !== undefined) setBlurAmount([s.blur]);
    if (s.aspectRatio) setAspectRatio(s.aspectRatio);
    if (s.name) setGradientName(s.name);
    if (s.plan) setUpgradeOpen("browse");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  // Returning from Stripe Checkout: the webhook may lag a moment, so poll
  // the quota a few times until the Pro badge shows up
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("upgraded")) return;
    window.history.replaceState(null, "", window.location.pathname);
    const timers = [1000, 3000, 7000].map((ms) =>
      setTimeout(refreshQuota, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [refreshQuota]);

  const startCheckout = async (plan: PlanId) => {
    setCheckoutLoading(plan);
    track("checkout_started", { plan, reason: upgradeOpen || "unknown" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 401) {
        // Landing-page pricing links can open the dialog before sign-in
        openSignIn();
        return;
      }
      alert(data?.error ?? "Could not start checkout. Please try again.");
    } catch {
      alert("Could not start checkout. Please check your connection.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleBackgroundColorChange = setBackgroundColor;

  const handleColorInputChange = useCallback(
    (colorIndex: number, value: string) => {
      setColorInputs((prev) => {
        const next = [...prev];
        next[colorIndex] = value;
        return next;
      });
    },
    []
  );

  const handleRandomize = useCallback(() => {
    setPlacement("random");
    setSeed(Math.floor(Math.random() * 2 ** 32));
  }, []);

  const canvasDimensions = useMemo(() => {
    const baseWidth = 3840; // 4K base width
    const [width, height] = aspectRatio.split(":").map(Number);
    const aspectRatioValue = width / height;

    if (aspectRatioValue > 1) {
      // Landscape
      return {
        width: baseWidth,
        height: Math.round(baseWidth / aspectRatioValue),
      };
    } else {
      // Portrait
      return { height: 2160, width: Math.round(2160 * aspectRatioValue) };
    }
  }, [aspectRatio]);

  // Fit the selected aspect ratio inside the measured container
  const previewDimensions = useMemo(() => {
    const maxWidth = Math.max(containerSize.width, 160);
    const maxHeight = Math.max(containerSize.height, 160);

    const [width, height] = aspectRatio.split(":").map(Number);
    const aspectRatioValue = width / height;

    let calculatedWidth = Math.min(maxWidth, maxHeight * aspectRatioValue);
    let calculatedHeight = calculatedWidth / aspectRatioValue;
    if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
      calculatedWidth = calculatedHeight * aspectRatioValue;
    }

    return {
      width: Math.round(calculatedWidth),
      height: Math.round(calculatedHeight),
    };
  }, [containerSize, aspectRatio]);

  // The on-screen canvas only needs display resolution (times DPR for sharpness);
  // full export resolution is rendered off-screen at download time
  const previewCanvasSize = useMemo(() => {
    const dpr =
      typeof window === "undefined"
        ? 1
        : Math.min(window.devicePixelRatio || 1, 2);
    return {
      width: Math.round(previewDimensions.width * dpr),
      height: Math.round(previewDimensions.height * dpr),
    };
  }, [previewDimensions]);

  const renderOptions = useMemo(
    () => ({
      backgroundColor,
      colors: colorInputs,
      blur: blurAmount[0],
      noise: noiseAmount[0],
      contrast: contrastAmount[0],
      saturation: saturationAmount[0],
      seed,
      placement,
      style: gradientStyle,
      fiberDensity: fiberDensity[0],
      waviness: waviness[0],
      sheen: sheen[0],
      coverage: coverage[0],
      softness: softness[0],
      detail: detail[0],
      createCanvas: domCreateCanvas,
    }),
    [
      backgroundColor,
      colorInputs,
      blurAmount,
      noiseAmount,
      contrastAmount,
      saturationAmount,
      seed,
      placement,
      gradientStyle,
      fiberDensity,
      waviness,
      sheen,
      coverage,
      softness,
      detail,
    ]
  );

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    renderGradient(ctx, canvas.width, canvas.height, {
      ...renderOptions,
      blurScale: canvas.width / canvasDimensions.width,
    });
  }, [renderOptions, canvasDimensions]);

  // Re-render the preview whenever any gradient parameter changes. Renders
  // are coalesced onto the next animation frame so a drag paints as fast as
  // the renderer allows. When a style renders slowly (clouds' per-pixel
  // palette mapping), back off to a short delay sized by the last render so
  // the slider itself stays responsive instead of queueing a render per tick.
  useEffect(() => {
    const cancel = () => {
      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current);
        renderFrameRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
    cancel();
    const run = () => {
      renderFrameRef.current = null;
      debounceTimeoutRef.current = null;
      const start = performance.now();
      renderPreview();
      lastRenderMsRef.current = performance.now() - start;
    };
    if (lastRenderMsRef.current > 40) {
      debounceTimeoutRef.current = setTimeout(
        run,
        Math.min(250, lastRenderMsRef.current)
      );
    } else {
      renderFrameRef.current = requestAnimationFrame(run);
    }
    return cancel;
  }, [renderPreview, previewCanvasSize]);

  // High-res export happens server-side (/api/export enforces the plan
  // and quota); the client only previews and downloads the returned PNG.
  const downloadCanvasAsImage = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setIsExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed,
          placement,
          backgroundColor: normalizeHexColor(backgroundColor),
          colors: colorInputs.map(normalizeHexColor),
          blur: blurAmount[0],
          noise: noiseAmount[0],
          contrast: contrastAmount[0],
          saturation: saturationAmount[0],
          aspectRatio,
          style: gradientStyle,
          fiberDensity: fiberDensity[0],
          waviness: waviness[0],
          sheen: sheen[0],
          coverage: coverage[0],
          softness: softness[0],
          detail: detail[0],
          format: "jpeg",
        }),
      });

      if (res.status === 401) {
        openSignIn();
        return;
      }
      if (res.status === 402) {
        setQuota((prev) => (prev ? { ...prev, remaining: 0 } : prev));
        track("export_blocked_quota", { aspectRatio, style: gradientStyle });
        setUpgradeOpen("exports");
        return;
      }
      if (res.status === 429) {
        alert("Too many exports at once — try again in a minute.");
        return;
      }
      if (!res.ok) {
        alert("Export failed. Please try again.");
        return;
      }

      const remainingHeader = res.headers.get("X-Exports-Remaining");
      if (remainingHeader !== null) {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                remaining:
                  remainingHeader === "unlimited"
                    ? null
                    : Number(remainingHeader),
              }
            : prev
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${gradientName}.jpg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      track("export_completed", {
        aspectRatio,
        style: gradientStyle,
        plan: quota?.plan ?? "unknown",
        remaining:
          remainingHeader === null || remainingHeader === "unlimited"
            ? null
            : Number(remainingHeader),
      });
    } catch {
      alert("Export failed. Please check your connection and try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const isProUser = quota?.plan === "pro";

  // Free users see their remaining quota; Pro is shown as the badge next
  // to the wordmark instead of text here
  const quotaBadge =
    isSignedIn && quota && quota.plan === "free" ? (
      <QuotaMeter
        remaining={quota.remaining ?? 0}
        total={FREE_EXPORTS_PER_MONTH}
        onUpgrade={() => setUpgradeOpen("browse")}
      />
    ) : null;

  const proBadge = (
    <Image
      src="/pro-badge.png"
      alt="Pro"
      width={849}
      height={480}
      className="block h-5 w-auto shrink-0"
    />
  );

  const {
    presets: userPresets,
    save: savePresetApi,
    remove: removePresetApi,
    update: updatePresetApi,
    reorder: reorderPresetsApi,
  } = useColorPresets(isSignedIn);
  const [managePresetsOpen, setManagePresetsOpen] = useState(false);
  const [presetSelectOpen, setPresetSelectOpen] = useState(false);

  const [savingPreset, setSavingPreset] = useState(false);
  // null = idle; a string = the name being typed for the palette about to save
  const [presetDraftName, setPresetDraftName] = useState<string | null>(null);

  // The saved palette (if any) matching what's currently on the canvas —
  // drives the filled bookmark and save-vs-remove behavior.
  const activeUserPreset = useMemo(
    () =>
      userPresets.find((p) =>
        paletteMatchesPreset(
          p,
          normalizeHexColor(backgroundColor),
          colorInputs.map(normalizeHexColor)
        )
      ),
    [userPresets, backgroundColor, colorInputs]
  );

  // Same match against the curated presets - selection is fully derived from
  // the palette, so editing any color deselects and reverting reselects.
  const activeCuratedPreset = presetGradients.find((p) =>
    paletteMatchesPreset(
      {
        background: normalizeHexColor(p.background),
        colors: p.colors.map(normalizeHexColor),
      },
      normalizeHexColor(backgroundColor),
      colorInputs.map(normalizeHexColor)
    )
  );

  const selectedPresetValue = activeUserPreset
    ? `user:${activeUserPreset.id}`
    : activeCuratedPreset?.name ?? "";

  // The + button is always present; it only disables while the palette
  // already matches a saved or curated preset (nothing new to save).
  const presetSelected = Boolean(activeUserPreset || activeCuratedPreset);

  // Shared by the sidebar Select and the mobile preset chips
  const selectPreset = useCallback(
    (value: string) => {
      const preset = value.startsWith("user:")
        ? userPresets.find((p) => `user:${p.id}` === value)
        : presetGradients.find((p) => p.name === value);
      if (preset) {
        setBackgroundColor(preset.background);
        setColorInputs(preset.colors);
        setGradientName(preset.name);
      }
    },
    [userPresets]
  );

  const openManagePresets = useCallback(() => setManagePresetsOpen(true), []);

  const mobilePresets = [
    ...userPresets.map((p) => ({
      value: `user:${p.id}`,
      name: p.name,
      swatches: p.colors,
    })),
    ...presetGradients.map((p) => ({
      value: p.name,
      name: p.name,
      icon: p.icon,
    })),
  ];

  // Dials for the mobile Adjust tab; mirrors the sidebar's Effects section
  const percent = (v: number) => `${Math.round(v * 100)}%`;
  const dial = (
    key: string,
    label: string,
    shortLabel: string,
    icon: Adjustment["icon"],
    state: [number[], (v: number[]) => void],
    range: { min: number; max: number; step: number; defaultValue: number },
    format: (v: number) => string
  ): Adjustment => ({
    key,
    label,
    shortLabel,
    icon,
    value: state[0][0],
    onChange: (v) => state[1]([v]),
    format,
    ...range,
  });
  const styleDials: Adjustment[] =
    gradientStyle === "blobs"
      ? [
          dial(
            "blur",
            "Blur Amount",
            "Blur",
            DropIcon,
            [blurAmount, setBlurAmount],
            { min: 550, max: 1000, step: 5, defaultValue: 700 },
            (v) => `${v}px`
          ),
        ]
      : gradientStyle === "stripes"
        ? [
            dial(
              "fiberDensity",
              "Fiber Density",
              "Fibers",
              RowsIcon,
              [fiberDensity, setFiberDensity],
              { min: 0, max: 2, step: 0.05, defaultValue: 1 },
              percent
            ),
            dial(
              "waviness",
              "Waviness",
              "Waviness",
              WaveSineIcon,
              [waviness, setWaviness],
              { min: 0, max: 2, step: 0.05, defaultValue: 1 },
              percent
            ),
            dial(
              "sheen",
              "Sheen",
              "Sheen",
              SunDimIcon,
              [sheen, setSheen],
              { min: 0, max: 2, step: 0.05, defaultValue: 0.2 },
              percent
            ),
          ]
        : [
            dial(
              "coverage",
              "Coverage",
              "Coverage",
              CloudIcon,
              [coverage, setCoverage],
              { min: 0, max: 2, step: 0.05, defaultValue: 1 },
              percent
            ),
            dial(
              "softness",
              "Softness",
              "Softness",
              FeatherIcon,
              [softness, setSoftness],
              { min: 0, max: 2, step: 0.05, defaultValue: 1 },
              percent
            ),
            dial(
              "detail",
              "Detail",
              "Detail",
              SparkleIcon,
              [detail, setDetail],
              { min: 0, max: 2, step: 0.05, defaultValue: 1 },
              percent
            ),
          ];
  const adjustments: Adjustment[] = [
    ...styleDials,
    dial(
      "noise",
      "Noise",
      "Noise",
      DotsNineIcon,
      [noiseAmount, setNoiseAmount],
      { min: 0, max: 0.8, step: 0.01, defaultValue: 0.2 },
      percent
    ),
    dial(
      "contrast",
      "Contrast",
      "Contrast",
      CircleHalfIcon,
      [contrastAmount, setContrastAmount],
      { min: 50, max: 200, step: 5, defaultValue: 130 },
      (v) => `${v}%`
    ),
    dial(
      "saturation",
      "Saturation",
      "Saturation",
      PaletteIcon,
      [saturationAmount, setSaturationAmount],
      { min: 50, max: 200, step: 5, defaultValue: 110 },
      (v) => `${v}%`
    ),
  ];

  const openEditMode = () => {
    editSnapshotRef.current = {
      backgroundColor,
      colorInputs,
      blurAmount,
      noiseAmount,
      contrastAmount,
      saturationAmount,
      gradientStyle,
      fiberDensity,
      waviness,
      sheen,
      coverage,
      softness,
      detail,
      aspectRatio,
      gradientName,
    };
    setControlsOpen(true);
  };

  const cancelEditMode = () => {
    const s = editSnapshotRef.current;
    if (s) {
      setBackgroundColor(s.backgroundColor);
      setColorInputs(s.colorInputs);
      setBlurAmount(s.blurAmount);
      setNoiseAmount(s.noiseAmount);
      setContrastAmount(s.contrastAmount);
      setSaturationAmount(s.saturationAmount);
      setGradientStyle(s.gradientStyle);
      setFiberDensity(s.fiberDensity);
      setWaviness(s.waviness);
      setSheen(s.sheen);
      setCoverage(s.coverage);
      setSoftness(s.softness);
      setDetail(s.detail);
      setAspectRatio(s.aspectRatio);
      setGradientName(s.gradientName);
    }
    editSnapshotRef.current = null;
    setControlsOpen(false);
  };

  const doneEditMode = () => {
    editSnapshotRef.current = null;
    setControlsOpen(false);
  };

  const startSavingPreset = useCallback(() => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    // Free accounts may save a few palettes; the server enforces the cap
    // and answers pro_required once it's hit
    setPresetDraftName(
      dedupeName(
        (gradientName.trim() || "My Preset").slice(0, 40),
        userPresets.map((p) => p.name)
      )
    );
  }, [isSignedIn, openSignIn, gradientName, userPresets]);

  const commitSavePreset = useCallback(async () => {
    if (savingPreset) return;
    const name = dedupeName(
      ((presetDraftName ?? "").trim() || "My Preset").slice(0, 40),
      userPresets.map((p) => p.name)
    );
    setSavingPreset(true);
    const result = await savePresetApi({
      name,
      background: normalizeHexColor(backgroundColor),
      colors: colorInputs.map(normalizeHexColor),
    });
    setSavingPreset(false);
    if (result.ok) {
      // The new preset now matches the palette, so it selects itself and
      // the save affordance disappears
      setPresetDraftName(null);
      track("preset_saved", { count: userPresets.length + 1 });
    } else if (result.code === "pro_required") {
      setPresetDraftName(null);
      track("preset_blocked_free_cap");
      setUpgradeOpen("presets");
    } else if (result.code === "preset_cap") {
      setPresetDraftName(null);
      toast("Preset limit reached (50)");
    } else {
      // Keep the draft so the user can retry
      toast("Could not save preset");
    }
  }, [
    savingPreset,
    presetDraftName,
    userPresets,
    savePresetApi,
    backgroundColor,
    colorInputs,
  ]);

  return (
    <TooltipProvider>
      <div className="bg-white">
        <div
          className="flex h-screen flex-col overflow-hidden overscroll-none"
          style={{ height: "100dvh" }}
        >
          {/* Toaster is fixed-position but its host element still takes a
              flex slot, so it must live outside the gap-6 row */}
          <Toaster position="bottom-center" />

          <ManagePresetsDialog
            open={managePresetsOpen}
            onOpenChange={setManagePresetsOpen}
            presets={userPresets}
            colorFormat={colorFormat}
            onUpdate={updatePresetApi}
            onRemove={removePresetApi}
            onReorder={reorderPresetsApi}
          />

          {/* Main Content - full-screen preview on mobile, sidebar + preview on lg+ */}
          <div className="flex-1 flex lg:gap-6 min-h-0">
            {/* Upgrade dialog - shown when the free export quota is spent */}
            {upgradeOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60] bg-black/50"
                  onClick={() => setUpgradeOpen(false)}
                />
                <div
                  role="dialog"
                  aria-labelledby="upgrade-title"
                  className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
                >
                  <h2
                    id="upgrade-title"
                    className="text-lg font-semibold text-neutral-900"
                  >
                    {upgradeOpen === "exports"
                      ? "You're out of free exports"
                      : upgradeOpen === "presets"
                        ? "Save more palettes with Pro"
                        : "Go Pro"}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    {upgradeOpen === "exports"
                      ? "You've used all 5 free exports this month. Pro removes the limit."
                      : upgradeOpen === "presets"
                        ? `Free accounts keep ${FREE_PRESET_LIMIT} palettes. Pro keeps 50 and removes the export limit.`
                        : "Unlimited 4K exports and 50 saved palettes. Pay once, no subscription."}
                  </p>

                  {/* Headline pass */}
                  <div className="mt-4 rounded-xl border-2 border-neutral-900 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-neutral-900">
                          {formatPrice(PLANS.year)}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {`/ ${PLANS.year.durationLabel}`}
                        </span>
                      </div>
                      <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        Best value
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                      <li>Unlimited 4K exports</li>
                      <li>Save up to 50 palettes</li>
                      <li>One payment, never auto-renews</li>
                    </ul>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => startCheckout("year")}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === "year"
                        ? "Redirecting…"
                        : `Get ${PLANS.year.name}`}
                    </Button>
                  </div>

                  {/* Burst pass for one-project users */}
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-neutral-900">
                          {formatPrice(PLANS.week)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {`/ ${PLANS.week.durationLabel}`}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {PLANS.week.name}: unlimited exports for one project
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-8 shrink-0 px-3 text-xs"
                      onClick={() => startCheckout("week")}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === "week" ? "Redirecting…" : "Get pass"}
                    </Button>
                  </div>

                  <button
                    type="button"
                    className="mt-4 w-full text-center text-sm text-neutral-500 hover:text-neutral-800"
                    onClick={() => setUpgradeOpen(false)}
                  >
                    Maybe later
                  </button>
                  {upgradeOpen === "exports" && quota?.resetsAt && (
                    <p className="mt-2 text-center text-xs text-neutral-400">
                      Free exports reset on{" "}
                      {new Date(quota.resetsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Controls Panel - desktop sidebar; mobile uses the edit mode below the preview */}
            <div className="hidden lg:flex flex-col bg-white lg:w-80 lg:flex-shrink-0 lg:min-h-0 lg:border-r lg:border-neutral-200">
              {/* Logo + account: mirrors the bottom action bar (p-6 pt-4 + border-t) */}
              <div className="flex items-center justify-between gap-2 p-6 pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-2 min-w-0">
                  {isProUser ? (
                    <Image
                      src="/gs-pro-logo.png"
                      alt="Gradients Studio Pro Logo"
                      width={704}
                      height={432}
                      className="block w-10 h-auto shrink-0"
                    />
                  ) : (
                    <Image
                      src="/gs-logo.png"
                      alt="Gradients Studio Logo"
                      width={915}
                      height={562}
                      className="block w-10 h-auto shrink-0"
                    />
                  )}
                  <span className="truncate text-md font-medium text-neutral-800 user-select-none">
                    {`Gradients Studio`}
                  </span>
                  {isProUser && proBadge}
                </div>
                {isLoaded && !isSignedIn && (
                  <SignInButton mode="modal">
                    <Button variant="outline" className="h-8 px-3 text-xs">
                      Sign in
                    </Button>
                  </SignInButton>
                )}
                {isSignedIn && <UserButton />}
              </div>
              {/* Scrollable Controls */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                <StyleSection
                  gradientStyle={gradientStyle}
                  onChange={setGradientStyle}
                />

                <ColorsSection
                  colorFormat={colorFormat}
                  onColorFormatChange={setColorFormat}
                  backgroundColor={backgroundColor}
                  colorInputs={colorInputs}
                  onBackgroundChange={handleBackgroundColorChange}
                  onColorChange={handleColorInputChange}
                />

                <PresetsSection
                  selectedPresetValue={selectedPresetValue}
                  presetSelectOpen={presetSelectOpen}
                  onPresetSelectOpenChange={setPresetSelectOpen}
                  onSelectPreset={selectPreset}
                  userPresets={userPresets}
                  presetDraftName={presetDraftName}
                  onPresetDraftNameChange={setPresetDraftName}
                  onStartSaving={startSavingPreset}
                  onCommitSave={commitSavePreset}
                  savingPreset={savingPreset}
                  presetSelected={presetSelected}
                  onManagePresets={openManagePresets}
                />

                {/* Effect Controls */}
                <div className="select-none space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <SlidersIcon className="w-6 h-6" />
                      Effects
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {adjustments.map((a) => (
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
                </div>

              </div>

              {/* Fixed Action Buttons - desktop sidebar only; mobile has icon buttons in the bottom bar */}
              <div className="flex-shrink-0 p-6 pt-4 border-t border-neutral-200 bg-white">
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleRandomize}
                        className="flex-1 h-9 text-sm"
                      >
                        <ShuffleIcon weight="bold" className="w-4 h-4 mr-2" />
                        Randomize
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate a random gradient</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={downloadCanvasAsImage}
                        disabled={isExporting}
                        className="flex-1 h-9 text-sm"
                      >
                        {isExporting ? (
                          <Spinner size={16} className="mr-2" />
                        ) : (
                          <DownloadIcon
                            weight="bold"
                            className="w-4 h-4 mr-2"
                          />
                        )}
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export a 4K JPG</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {quotaBadge && <div className="mt-3">{quotaBadge}</div>}
              </div>
            </div>

            {/* Canvas Preview - fills remaining space; mobile adds a bottom bar */}
            <div className="flex-1 min-w-0 flex flex-col">
              {controlsOpen && (
                <div className="lg:hidden">
                  <MobileEditHeader
                    tab={editTab}
                    onCancel={cancelEditMode}
                    onDone={doneEditMode}
                  />
                </div>
              )}
              <div
                ref={previewContainerRef}
                className="flex-1 min-h-0 flex items-center justify-center p-4 lg:p-6"
              >
                <div
                  className="relative mx-auto bg-white rounded-xl border border-neutral-200 overflow-hidden"
                  style={{
                    width: `${previewDimensions.width}px`,
                  }}
                >
                  <PreviewBadges
                    gradientName={gradientName}
                    onGradientNameChange={setGradientName}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={setAspectRatio}
                  />

                  <div
                    className="relative mx-auto"
                    style={{
                      width: `100%`,
                      aspectRatio: aspectRatio.replace(":", "/"),
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={previewCanvasSize.width}
                      height={previewCanvasSize.height}
                      onContextMenu={(e) => e.preventDefault()}
                      className="absolute top-0 left-0 w-full h-full rounded-sm select-none"
                    />
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-lg" /> */}
                  </div>
                </div>
              </div>
              {/* Mobile bottom: edit panel while editing, otherwise the action bar */}
              {controlsOpen ? (
                <div className="lg:hidden">
                  <MobileEditPanel
                    tab={editTab}
                    onTabChange={setEditTab}
                    adjustments={adjustments}
                    activeAdjustmentKey={activeAdjustmentKey}
                    onActiveAdjustmentChange={setActiveAdjustmentKey}
                    backgroundColor={normalizeHexColor(backgroundColor)}
                    colors={colorInputs.map(normalizeHexColor)}
                    colorFormat={colorFormat}
                    onColorFormatChange={setColorFormat}
                    onBackgroundColorChange={handleBackgroundColorChange}
                    onColorChange={handleColorInputChange}
                    presets={mobilePresets}
                    selectedPreset={selectedPresetValue}
                    onSelectPreset={selectPreset}
                    style={gradientStyle}
                    onStyleChange={setGradientStyle}
                    aspectRatio={aspectRatio}
                    aspectRatioOptions={aspectRatioOptions}
                    onAspectRatioChange={setAspectRatio}
                  />
                </div>
              ) : (
              <div className="lg:hidden flex-shrink-0 flex items-center justify-between gap-3 p-4 border-t border-neutral-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
                {isProUser ? (
                  proBadge
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src="/gs-logo.png"
                      alt="Gradients Studio Logo"
                      width={915}
                      height={562}
                      className="block w-8 h-auto shrink-0"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="hidden min-[400px]:block truncate text-sm font-medium text-neutral-800">
                        {`Gradients Studio`}
                      </span>
                      {isSignedIn && quota?.plan === "free" && (
                        <QuotaMeter
                          compact
                          remaining={quota.remaining ?? 0}
                          total={FREE_EXPORTS_PER_MONTH}
                          onUpgrade={() => setUpgradeOpen("browse")}
                        />
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRandomize}
                    className="h-9 w-9 p-0"
                    aria-label="Randomize gradient"
                  >
                    <ShuffleIcon weight="bold" className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={downloadCanvasAsImage}
                    disabled={isExporting}
                    className="h-9 w-9 p-0"
                    aria-label="Export image"
                  >
                    {isExporting ? (
                      <Spinner size={16} />
                    ) : (
                      <DownloadIcon weight="bold" className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openEditMode}
                    className="h-9 w-9 p-0"
                    aria-label="Edit gradient"
                  >
                    <SlidersIcon weight="bold" className="w-4 h-4" />
                  </Button>
                  {isLoaded && !isSignedIn && (
                    <SignInButton mode="modal">
                      <Button variant="outline" className="h-9 px-3 text-sm">
                        Sign in
                      </Button>
                    </SignInButton>
                  )}
                  {isSignedIn && <UserButton />}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GradientGenerator;
