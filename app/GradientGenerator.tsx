"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SwatchPicker } from "@/components/ui/swatch-picker";
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

type PresetGradient = {
  name: string;
  background: string;
  colors: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

// Function to validate and normalize hex color
const normalizeHexColor = (hex: string): string => {
  // Remove # if present
  let cleanHex = hex.replace("#", "");

  // If it's a valid 3-digit hex, convert to 6-digit
  if (/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // If it's not a valid 6-digit hex, return a default color
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return "#000000"; // Default to black if invalid
  }

  return "#" + cleanHex;
};

// Function to convert hex color to rgba
const hexToRgba = (hex: string, alpha: number = 1) => {
  const normalizedHex = normalizeHexColor(hex);
  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Seeded PRNG (mulberry32) so the preview and the full-res export
// draw the exact same gradient for a given seed
const mulberry32 = (seed: number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateNoise = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha: number = 0.03
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255 * alpha;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
};

type RenderOptions = {
  backgroundColor: string;
  colors: string[];
  blur: number; // defined relative to export resolution
  noise: number;
  contrast: number;
  saturation: number;
  seed: number;
  placement: "center" | "random";
  blurScale: number; // rendered width / export width, 1 when exporting
};

const renderGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions
) => {
  const random = mulberry32(opts.seed);
  const blur = opts.blur * opts.blurScale;

  ctx.filter = "none";
  ctx.fillStyle = normalizeHexColor(opts.backgroundColor);
  ctx.fillRect(0, 0, width, height);

  opts.colors.forEach((color) => {
    const normalizedColor = normalizeHexColor(color);

    const scaleFactor = 1.2;
    const x = opts.placement === "center" ? width / 2 : random() * width;
    const y = opts.placement === "center" ? height / 2 : random() * height;
    const endRadius =
      opts.placement === "center"
        ? Math.max(width, height) * scaleFactor
        : (random() * scaleFactor + scaleFactor) * Math.min(width, height);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, endRadius);
    gradient.addColorStop(0, normalizedColor);
    gradient.addColorStop(0.8, hexToRgba(normalizedColor, 0.2));
    gradient.addColorStop(1, hexToRgba(normalizedColor, 0));
    ctx.fillStyle = gradient;

    // Create an irregular blob
    const path = new Path2D();
    const numPoints = 5 + Math.floor(random() * 5);
    const points = [];

    // Generate random points around the center (x, y)
    for (let i = 0; i < numPoints; i++) {
      const angle = random() * Math.PI * 2;
      const radiusVariance = 0.3 + random() * 0.7;
      const pointRadius = endRadius * radiusVariance;
      points.push({
        x: x + pointRadius * Math.cos(angle),
        y: y + pointRadius * Math.sin(angle),
      });
    }

    // Move to the first point
    path.moveTo(points[0].x, points[0].y);

    // Draw the blob using Bezier curves
    for (let i = 0; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length;
      const nextPoint = points[nextIndex];
      const cp1 = {
        x: (points[i].x + nextPoint.x) / 2,
        y: (points[i].y + nextPoint.y) / 2,
      };
      const cp2 = {
        x: cp1.x + (random() - 0.5) * endRadius,
        y: cp1.y + (random() - 0.5) * endRadius,
      };
      path.quadraticCurveTo(cp2.x, cp2.y, nextPoint.x, nextPoint.y);
    }

    path.closePath();
    ctx.fill(path);
  });

  // Apply filters
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = `contrast(${opts.contrast}%) saturate(${opts.saturation}%)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = `blur(${blur / 2}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = "none";

  if (opts.noise > 0) {
    generateNoise(ctx, width, height, opts.noise);
  }
};

const GradientGenerator = () => {
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [colorInputs, setColorInputs] = useState([
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
  ]);
  const [blurAmount, setBlurAmount] = useState([125]);
  const [noiseAmount, setNoiseAmount] = useState([0.3]);
  const [contrastAmount, setContrastAmount] = useState([130]);
  const [saturationAmount, setSaturationAmount] = useState([110]);
  const [gradientName, setGradientName] = useState("New Gradient");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 32));
  const [placement, setPlacement] = useState<"center" | "random">("center");
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const previewDimensions = useMemo(() => {
    // Get parent container max dimensions
    const maxParentWidth = 1024; // max-w-4xl equivalent
    const maxParentHeight = 600; // Fixed height

    const [width, height] = aspectRatio.split(":").map(Number);
    const aspectRatioValue = width / height;

    // Calculate dimensions that fit within parent
    let calculatedWidth, calculatedHeight;

    if (aspectRatioValue > 1) {
      // Landscape - fit to width
      calculatedWidth = Math.min(
        maxParentWidth,
        maxParentHeight * aspectRatioValue
      );
      calculatedHeight = calculatedWidth / aspectRatioValue;
    } else {
      // Portrait - fit to height
      calculatedHeight = Math.min(
        maxParentHeight,
        maxParentWidth / aspectRatioValue
      );
      calculatedWidth = calculatedHeight * aspectRatioValue;
    }

    return {
      width: Math.round(calculatedWidth),
      height: Math.round(calculatedHeight),
    };
  }, [aspectRatio]);

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

  const downloadCanvasAsImage = () => {
    setIsExporting(true);
    // Let the spinner paint before blocking the main thread with the 4K render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = canvasDimensions.width;
        exportCanvas.height = canvasDimensions.height;
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) {
          setIsExporting(false);
          return;
        }
        renderGradient(ctx, exportCanvas.width, exportCanvas.height, {
          ...renderOptions,
          blurScale: 1,
        });
        exportCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `${gradientName}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
          setIsExporting(false);
        }, "image/png");
      }, 0);
    });
  };

  const applyPreset = (preset: PresetGradient) => {
    setBackgroundColor(preset.background);
    setColorInputs(preset.colors);
    setGradientName(preset.name);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <div className="h-screen flex flex-col">
          {/* Main Content - Flex container */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Controls Panel - Fixed width with scrollable content and fixed bottom buttons */}
            <div className="w-80 flex-shrink-0 flex flex-col border-r border-neutral-200">
              {/* Scrollable Controls */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10 mb-10">
                <div className="flex items-center gap-2">
                  <Image
                    src="/beautiful-mesh-logo.png"
                    alt="Beautiful Mesh Logo"
                    width={915}
                    height={562}
                    className="block w-10 h-auto"
                  />
                  <span className="text-md font-medium text-neutral-800">
                    {`Beautiful Mesh`}
                  </span>
                </div>

                {/* Color Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-neutral-800">
                      <SwatchesIcon className="w-6 h-6" />
                      Colors
                    </h3>
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
                        <SwatchPicker
                          value={normalizeHexColor(backgroundColor)}
                          onChange={handleBackgroundColorChange}
                        />
                        <Input
                          id="backgroundColor"
                          type="text"
                          value={backgroundColor}
                          onChange={(e) =>
                            handleBackgroundColorChange(e.target.value)
                          }
                          className="flex-1 text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Gradient Colors</Label>
                      {colorInputs.map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <SwatchPicker
                            value={normalizeHexColor(color)}
                            onChange={handleColorInputChange(index)}
                          />

                          <Input
                            type="text"
                            value={color}
                            onChange={(e) =>
                              handleColorInputChange(index)(e.target.value)
                            }
                            className="flex-1 text-sm"
                            placeholder="#000000"
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
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Blur Amount</Label>
                        <span className="text-xs text-muted-foreground">
                          {blurAmount[0]}px
                        </span>
                      </div>
                      <Slider
                        value={blurAmount}
                        onValueChange={setBlurAmount}                        max={200}
                        min={125}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Noise</Label>
                        <span className="text-xs text-muted-foreground">
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
                        <span className="text-xs text-muted-foreground">
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
                        <span className="text-xs text-muted-foreground">
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
              </div>

              {/* Fixed Action Buttons */}
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
                        className="flex-1 h-9 text-sm"
                      >
                        <DownloadIcon weight="bold" className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download as PNG image</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Canvas Preview - Fixed */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className="flex-1 flex items-center justify-center p-6"
                style={{
                  maxWidth: "calc(100vw - 20rem - 3rem)", // 20rem = w-80 sidebar, 3rem = total horizontal padding (p-6)
                  height: "calc(100vh - 100px)",
                  maxHeight: "calc(100vh - 500px)",
                }}
              >
                <div
                  className="relative mx-auto bg-white rounded-xl border border-neutral-200 overflow-hidden"
                  style={{
                    width: `${previewDimensions.width}px`,
                    maxHeight: `${previewDimensions.height}px`,
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
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-sm"
                    />
                    {/* Export Spinner Overlay */}
                    {isExporting && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-sm">
                        <div className="text-center">
                          <Spinner
                            size={24}
                            className="text-neutral-600 mb-2"
                          />
                        </div>
                      </div>
                    )}
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-lg" /> */}
                  </div>
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
