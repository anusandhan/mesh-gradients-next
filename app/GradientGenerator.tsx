"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { cn } from "@/lib/utils";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DownloadIcon,
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
  XIcon,
  StackIcon,
} from "@phosphor-icons/react";
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

// Browser canvas factory for the renderer's blur pyramid scratch canvases
const domCreateCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
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
        className="flex-1 text-sm"
        placeholder={placeholder}
      />
    );
  }

  const defs = CHANNEL_DEFS[format];
  const channels = hexToChannels(hex, format);

  return (
    <div className="flex h-9 flex-1 min-w-0 items-center rounded-lg border border-input bg-transparent shadow-sm">
      {defs.map((def, index) => (
        <div
          key={def.key}
          className={cn(
            "flex h-full min-w-0 flex-1 items-center px-2.5",
            index > 0 && "border-l border-neutral-200"
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
            className="text-center"
          />
        </div>
      ))}
    </div>
  );
};

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
  const [colorFormat, setColorFormat] = useState<ColorFormat>("oklch");
  const [isExporting, setIsExporting] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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

  const startCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      alert(data?.error ?? "Could not start checkout. Please try again.");
    } catch {
      alert("Could not start checkout. Please check your connection.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
  };

  const handleColorInputChange = (colorIndex: number) => (value: string) => {
    const newColors = [...colorInputs];
    newColors[colorIndex] = value;
    setColorInputs(newColors);
  };

  const handleRandomize = () => {
    setPlacement("random");
    setSeed(Math.floor(Math.random() * 2 ** 32));
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

  const aspectRatioOptions = [
    { value: "16:9", label: "Desktop", ratio: "16:9", icon: MonitorIcon },
    { value: "1:1", label: "Square Post", ratio: "1:1", icon: SquareIcon },
    {
      value: "4:3",
      label: "YouTube Classic",
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

  // Re-render the preview (debounced) whenever any gradient parameter changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(renderPreview, 120);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
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
          format: "jpeg",
        }),
      });

      if (res.status === 401) {
        openSignIn();
        return;
      }
      if (res.status === 402) {
        setQuota((prev) => (prev ? { ...prev, remaining: 0 } : prev));
        setUpgradeOpen(true);
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
    } catch {
      alert("Export failed. Please check your connection and try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const quotaBadge =
    isSignedIn && quota ? (
      <p className="text-center text-xs tabular-nums text-neutral-500">
        {quota.plan === "pro"
          ? "Pro — unlimited exports"
          : `${quota.remaining} of 5 free exports left this month`}
      </p>
    ) : null;

  const applyPreset = (preset: PresetGradient) => {
    setBackgroundColor(preset.background);
    setColorInputs(preset.colors);
    setGradientName(preset.name);
  };

  return (
    <TooltipProvider>
      <div className="bg-white">
        <div className="flex flex-col h-screen" style={{ height: "100dvh" }}>
          {/* Main Content - full-screen preview on mobile, sidebar + preview on lg+ */}
          <div className="flex-1 flex lg:gap-6 min-h-0">
            {/* Upgrade dialog - shown when the free export quota is spent */}
            {upgradeOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60] bg-black/50"
                  onClick={() => setUpgradeOpen(false)}
                />
                <div className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    You&apos;re out of free exports
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    You&apos;ve used all 5 free exports this month. Go Pro for
                    a year of unlimited 4K exports.
                  </p>
                  <div className="mt-4 rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-neutral-900">
                        $29
                      </span>
                      <span className="text-sm text-neutral-500">/ year</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                      <li>Unlimited 4K exports</li>
                      <li>All aspect ratios</li>
                      <li>One-time payment — no subscription</li>
                    </ul>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setUpgradeOpen(false)}
                    >
                      Maybe later
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={startCheckout}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? "Redirecting…" : "Upgrade"}
                    </Button>
                  </div>
                  {quota?.resetsAt && (
                    <p className="mt-3 text-center text-xs text-neutral-400">
                      Free exports reset on{" "}
                      {new Date(quota.resetsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Backdrop behind the mobile controls modal */}
            {controlsOpen && (
              <div
                className="lg:hidden fixed inset-0 z-40 bg-black/40"
                onClick={() => setControlsOpen(false)}
              />
            )}
            {/* Controls Panel - near-full-screen modal on mobile, static sidebar on lg+ */}
            <div
              className={cn(
                "flex-col bg-white",
                controlsOpen
                  ? "flex fixed inset-x-0 bottom-0 top-14 z-50 rounded-t-2xl border-t border-neutral-200 shadow-xl"
                  : "hidden",
                "lg:flex lg:static lg:inset-auto lg:z-auto lg:w-80 lg:flex-shrink-0 lg:min-h-0 lg:rounded-none lg:border-t-0 lg:border-r lg:border-neutral-200 lg:shadow-none"
              )}
            >
              {/* Mobile modal header */}
              <div className="lg:hidden flex items-center justify-between px-6 py-3 border-b border-neutral-200">
                <span className="text-base font-medium text-neutral-800">
                  Controls
                </span>
                <button
                  onClick={() => setControlsOpen(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                  aria-label="Close controls"
                  type="button"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              {/* Logo + account - desktop sidebar only */}
              <div className="hidden lg:flex items-center justify-between gap-2 p-6 pb-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src="/beautiful-mesh-logo.png"
                    alt="Gradients Studio Logo"
                    width={915}
                    height={562}
                    className="block w-10 h-auto shrink-0"
                  />
                  <span className="truncate text-md font-medium text-neutral-800">
                    {`Gradients Studio`}
                  </span>
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
                {/* Gradient Style */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <StackIcon className="w-6 h-6" />
                      Style
                    </h3>
                  </div>
                  <Select
                    value={gradientStyle}
                    onValueChange={(value) =>
                      setGradientStyle(value as GradientStyle)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blobs">Blurred Blobs</SelectItem>
                      <SelectItem value="stripes">Silk Stripes</SelectItem>
                      <SelectItem value="clouds">Clouds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <SwatchesIcon className="w-6 h-6" />
                      Colors
                    </h3>
                    <Select
                      value={colorFormat}
                      onValueChange={(value) =>
                        setColorFormat(value as ColorFormat)
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
                      <div className="flex gap-2">
                        <ColorPickerPopover
                          value={normalizeHexColor(backgroundColor)}
                          format={colorFormat}
                          onChange={handleBackgroundColorChange}
                        />
                        <ColorField
                          id="backgroundColor"
                          hex={normalizeHexColor(backgroundColor)}
                          format={colorFormat}
                          placeholder="oklch(1 0 0)"
                          onChange={handleBackgroundColorChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Gradient Colors</Label>
                      {colorInputs.map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <ColorPickerPopover
                            value={normalizeHexColor(color)}
                            format={colorFormat}
                            onChange={handleColorInputChange(index)}
                          />

                          <ColorField
                            hex={normalizeHexColor(color)}
                            format={colorFormat}
                            placeholder="oklch(0 0 0)"
                            onChange={handleColorInputChange(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <TabsIcon className="w-6 h-6" />
                      Preset
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Select
                      onValueChange={(value) => {
                        const preset = presetGradients.find(
                          (p) => p.name === value
                        );
                        if (preset) {
                          applyPreset(preset);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetGradients.map((preset, index) => {
                          const IconComponent = preset.icon;
                          return (
                            <SelectItem key={index} value={preset.name}>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Effect Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <SlidersIcon className="w-6 h-6" />
                      Effects
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {gradientStyle === "blobs" && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm">Blur Amount</Label>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {blurAmount[0]}px
                          </span>
                        </div>
                        <Slider
                          value={blurAmount}
                          onValueChange={setBlurAmount}
                          max={1000}
                          min={550}
                          step={5}
                        />
                      </div>
                    )}

                    {gradientStyle === "stripes" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-sm">Fiber Density</Label>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {Math.round(fiberDensity[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={fiberDensity}
                            onValueChange={setFiberDensity}
                            min={0}
                            max={2}
                            step={0.05}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-sm">Waviness</Label>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {Math.round(waviness[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={waviness}
                            onValueChange={setWaviness}
                            min={0}
                            max={2}
                            step={0.05}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-sm">Sheen</Label>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {Math.round(sheen[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={sheen}
                            onValueChange={setSheen}
                            min={0}
                            max={2}
                            step={0.05}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Noise</Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {(noiseAmount[0] * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={noiseAmount}
                        onValueChange={setNoiseAmount}                        max={0.8}
                        min={0}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Contrast</Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {contrastAmount[0]}%
                        </span>
                      </div>
                      <Slider
                        value={contrastAmount}
                        onValueChange={setContrastAmount}                        max={200}
                        min={50}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Saturation</Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {saturationAmount[0]}%
                        </span>
                      </div>
                      <Slider
                        value={saturationAmount}
                        onValueChange={setSaturationAmount}                        max={200}
                        min={50}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Quota status - mobile sheet (desktop shows it under the action buttons) */}
                {quotaBadge && <div className="lg:hidden">{quotaBadge}</div>}
              </div>

              {/* Fixed Action Buttons - desktop sidebar only; mobile has icon buttons in the bottom bar */}
              <div className="hidden lg:block flex-shrink-0 p-6 pt-4 border-t border-neutral-200 bg-white">
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
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download as PNG image</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {quotaBadge && <div className="mt-3">{quotaBadge}</div>}
              </div>
            </div>

            {/* Canvas Preview - fills remaining space; mobile adds a bottom bar */}
            <div className="flex-1 min-w-0 flex flex-col">
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
                  {/* Gradient Name Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          setGradientName(
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
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm h-auto text-xs text-neutral-600 hover:text-neutral-800 transition-colors cursor-pointer outline-none">
                        <SelectValue>
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const currentOption = aspectRatioOptions.find(
                                (opt) => opt.value === aspectRatio
                              );
                              const IconComponent =
                                currentOption?.icon || MonitorIcon;
                              return (
                                <>
                                  <IconComponent className="w-3 h-3" />
                                  <span className="text-xs text-neutral-600">
                                    {currentOption?.label}
                                  </span>
                                  <span className="text-xs text-neutral-400">
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
                              <div className="flex items-center gap-1.5">
                                <IconComponent className="w-3 h-3" />
                                <span className="text-xs text-neutral-600">
                                  {option.label}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  {option.ratio}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

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
              {/* Mobile bottom bar */}
              <div className="lg:hidden flex-shrink-0 flex items-center justify-between gap-3 p-4 border-t border-neutral-200 bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src="/beautiful-mesh-logo.png"
                    alt="Gradients Studio Logo"
                    width={915}
                    height={562}
                    className="block w-8 h-auto shrink-0"
                  />
                  <span className="truncate text-sm font-medium text-neutral-800">
                    {`Gradients Studio`}
                  </span>
                </div>
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
                    aria-label="Download image"
                  >
                    {isExporting ? (
                      <Spinner size={16} />
                    ) : (
                      <DownloadIcon weight="bold" className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setControlsOpen(true)}
                    className="h-9 w-9 p-0"
                    aria-label="Show controls"
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
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GradientGenerator;
