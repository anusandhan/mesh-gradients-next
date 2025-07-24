"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DownloadIcon,
  ShuffleIcon,
  GearIcon,
  SwatchesIcon,
  TabsIcon,
  SlidersIcon,
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
  const [blurAmount, setBlurAmount] = useState([60]);
  const [noiseAmount, setNoiseAmount] = useState([0.2]);
  const [contrastAmount, setContrastAmount] = useState([130]);
  const [saturationAmount, setSaturationAmount] = useState([110]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

          const scaleFactor = 0.8;
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
  }, [
    backgroundColor,
    colorInputs,
    blurAmount,
    noiseAmount,
    contrastAmount,
    saturationAmount,
  ]);

  useEffect(() => {
    generateMeshGradient();
  }, [backgroundColor, colorInputs]);

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
  };

  const handleColorInputChange = (colorIndex: number) => (value: string) => {
    const newColors = [...colorInputs];
    newColors[colorIndex] = value;
    setColorInputs(newColors);
  };

  const generateRandomMeshGradient = useCallback(() => {
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

          const scaleFactor = 0.8;
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
      link.download = "mesh-gradient-wallpaper.png";
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const presetGradients = [
    {
      name: "Ocean Breeze",
      background: "#f0f9ff",
      colors: ["#0ea5e9", "#06b6d4", "#0891b2", "#0e7490"],
    },
    {
      name: "Sunset Glow",
      background: "#fef7ed",
      colors: ["#f97316", "#ea580c", "#dc2626", "#b91c1c"],
    },
    {
      name: "Forest Mist",
      background: "#f0fdf4",
      colors: ["#16a34a", "#22c55e", "#84cc16", "#a3e635"],
    },
    {
      name: "Purple Dream",
      background: "#0d0019",
      colors: ["#8b5cf6", "#a855f7", "#c084fc", "#d946ef"],
    },
  ];

  const applyPreset = (preset: (typeof presetGradients)[0]) => {
    setBackgroundColor(preset.background);
    setColorInputs(preset.colors);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <div className="h-screen flex flex-col">
          {/* Main Content - Flex container */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Controls Panel - Fixed width with scrollable content and fixed bottom buttons */}
            <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200">
              {/* Scrollable Controls */}
              <div className="flex-1 overflow-y-auto p-6 space-y-12">
                <Image
                  src="/beautiful-mesh-logo.png"
                  alt="Beautiful Mesh Logo"
                  height={54}
                  width={180}
                />
                {/* Color Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-gray-800">
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
                        <ColorInput
                          value={normalizeHexColor(backgroundColor)}
                          onChange={handleBackgroundColorChange}
                          previewSize="md"
                          previewShape="circle"
                          previewClassName="border-[1.5px] border-input shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Gradient Colors</Label>
                      {colorInputs.map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="text"
                            value={color}
                            onChange={(e) =>
                              handleColorInputChange(index)(e.target.value)
                            }
                            className="flex-1 text-sm"
                            placeholder="#000000"
                          />
                          <ColorInput
                            value={normalizeHexColor(color)}
                            onChange={handleColorInputChange(index)}
                            previewSize="md"
                            previewShape="circle"
                            previewClassName="border-[1.5px] border-input shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Effect Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-gray-800">
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
                        onValueCommit={() => generateMeshGradient()}
                        max={200}
                        min={60}
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
                        onValueCommit={() => generateMeshGradient()}
                        max={0.2}
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
                        onValueCommit={() => generateMeshGradient()}
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
                        onValueCommit={() => generateMeshGradient()}
                        max={200}
                        min={50}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-base font-medium text-gray-800">
                      <TabsIcon className="w-6 h-6" />
                      Presets
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {presetGradients.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-sm h-9"
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: preset.colors[0] }}
                          />
                          {preset.name}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Action Buttons */}
              <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 bg-white">
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
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full h-auto max-w-4xl bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="relative w-full h-full flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={1920}
                    height={1080}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-lg" />
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
