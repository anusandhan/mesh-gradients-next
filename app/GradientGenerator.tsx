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
  GearIcon,
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
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialRender = useRef(true);

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

  const generateNoise = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number = 0.03
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      let noise = Math.random() * 255 * alpha;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const generateMeshGradient = useCallback(() => {
    setIsLoading(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Normalize background color
        const normalizedBgColor = normalizeHexColor(backgroundColor);
        ctx.fillStyle = normalizedBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        colorInputs.forEach((color) => {
          // Normalize each color before using
          const normalizedColor = normalizeHexColor(color);

          const x = canvas.width / 2;
          const y = canvas.height / 2;

          const scaleFactor = 1.2;
          const endRadius = Math.max(canvas.width, canvas.height) * scaleFactor;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, endRadius);
          gradient.addColorStop(0, normalizedColor);
          gradient.addColorStop(0.8, hexToRgba(normalizedColor, 0.2));
          gradient.addColorStop(1, hexToRgba(normalizedColor, 0));
          ctx.fillStyle = gradient;

          // Create an irregular blob
          const path = new Path2D();
          const numPoints = 5 + Math.floor(Math.random() * 5);
          let points = [];

          // Generate random points around the center (x, y)
          for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusVariance = 0.3 + Math.random() * 0.7;
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
              x: cp1.x + (Math.random() - 0.5) * endRadius,
              y: cp1.y + (Math.random() - 0.5) * endRadius,
            };
            path.quadraticCurveTo(cp2.x, cp2.y, nextPoint.x, nextPoint.y);
          }

          path.closePath();
          ctx.fill(path);
          ctx.filter = `blur(${blurAmount[0]}px)`;
        });

        // Apply filters
        ctx.filter = `blur(${blurAmount[0]}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = `contrast(${contrastAmount[0]}%) saturate(${saturationAmount[0]}%)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = `blur(${blurAmount[0] / 2}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";

        // Generate noise
        generateNoise(ctx, canvas.width, canvas.height, noiseAmount[0]);
      }
    }
    // Add a small delay to make the loading state visible
    setTimeout(() => setIsLoading(false), 300);
  }, [
    backgroundColor,
    colorInputs,
    blurAmount,
    noiseAmount,
    contrastAmount,
    saturationAmount,
  ]);

  // Debounced version of generateMeshGradient
  const debouncedGenerateMeshGradient = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      generateMeshGradient();
    }, 500); // 500ms debounce delay
  }, [generateMeshGradient]);

  // Generate once on initial mount
  // useEffect(() => {
  //   generateMeshGradient();
  // }, []);

  // Generate when backgroundColor or colorInputs change (after debounce)
  useEffect(() => {
    debouncedGenerateMeshGradient();
  }, [backgroundColor, colorInputs, aspectRatio]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
  };

  const handleColorInputChange = (colorIndex: number) => (value: string) => {
    const newColors = [...colorInputs];
    newColors[colorIndex] = value;
    setColorInputs(newColors);
  };

  const generateRandomMeshGradient = useCallback(() => {
    setIsLoading(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Normalize background color
        const normalizedBgColor = normalizeHexColor(backgroundColor);
        ctx.fillStyle = normalizedBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        colorInputs.forEach((color) => {
          // Normalize each color before using
          const normalizedColor = normalizeHexColor(color);

          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;

          const scaleFactor = 1.2;
          const endRadius =
            (Math.random() * scaleFactor + scaleFactor) *
            Math.min(canvas.width, canvas.height);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, endRadius);
          gradient.addColorStop(0, normalizedColor);
          gradient.addColorStop(0.8, hexToRgba(normalizedColor, 0.2));
          gradient.addColorStop(1, hexToRgba(normalizedColor, 0));
          ctx.fillStyle = gradient;

          // Create an irregular blob
          const path = new Path2D();
          const numPoints = 5 + Math.floor(Math.random() * 5);
          let points = [];

          // Generate random points around the center (x, y)
          for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusVariance = 0.3 + Math.random() * 0.7;
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
              x: cp1.x + (Math.random() - 0.5) * endRadius,
              y: cp1.y + (Math.random() - 0.5) * endRadius,
            };
            path.quadraticCurveTo(cp2.x, cp2.y, nextPoint.x, nextPoint.y);
          }

          path.closePath();
          ctx.fill(path);
          ctx.filter = `blur(${blurAmount[0]}px)`;
        });

        // Apply filters
        ctx.filter = `blur(${blurAmount[0]}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = `contrast(${contrastAmount[0]}%) saturate(${saturationAmount[0]}%)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = `blur(${blurAmount[0] / 2}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";

        // Generate noise
        generateNoise(ctx, canvas.width, canvas.height, noiseAmount[0]);
      }
    }
    // Add a small delay to make the loading state visible
    setTimeout(() => setIsLoading(false), 300);
  }, [
    backgroundColor,
    colorInputs,
    blurAmount,
    noiseAmount,
    contrastAmount,
    saturationAmount,
  ]);

  const handleRandomize = () => {
    generateRandomMeshGradient();
  };

  const downloadCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${gradientName}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const presetGradients = [
    // {
    //   name: "Heatwaves",
    //   background: "#f8fafc",
    //   colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
    // },
    {
      name: "Lovable",
      background: "#1A1B1D",
      colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    },
    {
      name: "Dia",
      background: "#0358f7",
      colors: ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe"],
    },
    {
      name: "Raycast",
      background: "#07090B",
      colors: ["#CF1627", "#08243A", "#0F8B92", "#D54F63"],
    },
    {
      name: "Stripe",
      background: "#635BFF",
      colors: ["#F15372", "#FFCA3B", "#76E2FF", "#B5DAB9"],
    },
    {
      name: "Arc",
      background: "#140080",
      colors: ["#0229C9", "#FF526B", "#FF9598", "#EE4A5F"],
    },
    {
      name: "Comet",
      background: "#101013",
      colors: ["#5099A1", "#733138", "#53969F", "#C17B55"],
    },

    {
      name: "Devin",
      background: "#F6F6F6",
      colors: ["#2A6DCE", "#1796E2", "#1DC19C", "#3FA9DD"],
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

  const applyPreset = (preset: (typeof presetGradients)[0]) => {
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
                    width={40}
                    height={40}
                    className="block"
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
                      Presets
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
                        {presetGradients.map((preset, index) => (
                          <SelectItem key={index} value={preset.name}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  background: `linear-gradient(45deg, ${preset.colors.join(
                                    ", "
                                  )})`,
                                }}
                              />
                              {preset.name}
                            </div>
                          </SelectItem>
                        ))}
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
                        onValueChange={setBlurAmount}
                        onValueCommit={debouncedGenerateMeshGradient}
                        max={200}
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
                        onValueChange={setNoiseAmount}
                        onValueCommit={debouncedGenerateMeshGradient}
                        max={0.8}
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
                        onValueChange={setContrastAmount}
                        onValueCommit={debouncedGenerateMeshGradient}
                        max={200}
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
                        onValueChange={setSaturationAmount}
                        onValueCommit={debouncedGenerateMeshGradient}
                        max={200}
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
                      width={canvasDimensions.width}
                      height={canvasDimensions.height}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-sm"
                    />
                    {/* Loading Spinner Overlay */}
                    {isLoading && (
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
