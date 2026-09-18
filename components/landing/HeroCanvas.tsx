"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ShuffleIcon } from "@/components/icons/ui";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { GALLERY, buildStudioUrl, type GalleryPreset } from "@/lib/gallery";
import {
  renderGradient,
  type GradientEffect,
  type GradientStyle,
} from "@/lib/gradient-renderer";
import TrackedLink from "./TrackedLink";

// The landing-page hero is the real renderer, not a screenshot: three style
// pills, a handful of palettes, shuffle, and a grain toggle. "Open in the
// studio" carries the exact state into /app. Until the first frame paints
// (and if JavaScript never runs) the server-rendered hero.jpg shows instead;
// it is rendered with the same default state so the crossfade is invisible.

const EXPORT_WIDTH = 3840; // blur is defined relative to the 4K export
const MAX_RENDER_WIDTH = 1400;
const ASPECT = 16 / 10;
const GRAIN = 0.2;
const DEFAULT_STYLE: GradientStyle = "stripes";

const STYLES: { value: GradientStyle; label: string }[] = [
  { value: "blobs", label: "Blobs" },
  { value: "stripes", label: "Stripes" },
  { value: "clouds", label: "Clouds" },
];

const EFFECTS: { value: GradientEffect; label: string }[] = [
  { value: "none", label: "Smooth" },
  { value: "pixel", label: "Pixel" },
  { value: "dither", label: "Dither" },
];

// Four palettes that read well in every style
const PALETTES: GalleryPreset[] = ["ember", "aurora", "peach-fuzz", "blue-sky"]
  .map((slug) => GALLERY.find((p) => p.slug === slug))
  .filter((p): p is GalleryPreset => Boolean(p));

const domCreateCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export default function HeroCanvas() {
  const [style, setStyle] = useState<GradientStyle>(DEFAULT_STYLE);
  const [palette, setPalette] = useState<GalleryPreset>(PALETTES[0]);
  const [seed, setSeed] = useState(PALETTES[0].seed);
  const [grainOn, setGrainOn] = useState(true);
  const [effect, setEffect] = useState<GradientEffect>("none");
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  const studioUrl = useMemo(
    () =>
      buildStudioUrl({
        style,
        background: palette.background,
        colors: palette.colors,
        seed,
        grain: grainOn ? GRAIN : 0,
        name: palette.name,
        effect,
      }),
    [style, palette, seed, grainOn, effect]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cssWidth = canvas.clientWidth || 1000;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.min(Math.round(cssWidth * dpr), MAX_RENDER_WIDTH);
    const height = Math.round(width / ASPECT);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderGradient(ctx, width, height, {
      backgroundColor: palette.background,
      colors: palette.colors,
      blur: 700,
      grain: grainOn ? GRAIN : 0,
      contrast: 130,
      saturation: 110,
      seed,
      placement: "center",
      blurScale: width / EXPORT_WIDTH,
      createCanvas: domCreateCanvas,
      style,
      effect,
    });
    setReady(true);
  }, [palette, grainOn, seed, style, effect]);

  // Coalesce renders onto the next frame; clouds can take a few hundred ms
  useEffect(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      render();
    });
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [render]);

  // Re-render on resize so the canvas never upscales
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => render());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [render]);

  const interact = (action: string, value?: string) =>
    track("landing_hero_interacted", { action, value });

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Elevation comes from layered shadows (hairline + contact + ambient),
          not a border. Radii are concentric: 20px canvas + 8px padding = 28px. */}
      <div className="rounded-[28px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-neutral-100 after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
          <Image
            src="/landing/hero.jpg"
            alt="A stripes mesh gradient in orange, violet and pink rendered by Gradients Studio"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              ready ? "opacity-0" : "opacity-100"
            )}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-300",
              ready ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {/* Controls: style + palette on one row, actions on the next */}
        <div className="flex flex-col gap-2.5 px-2 pb-2 pt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ToggleGroup
              type="single"
              value={style}
              onValueChange={(value) => {
                if (!value) return;
                setStyle(value as GradientStyle);
                interact("style", value);
              }}
              aria-label="Gradient style"
            >
              {STYLES.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* 28px swatches with a pseudo-element hit area of 40px; the
                12px gap keeps neighboring hit areas from overlapping */}
            <div className="flex items-center gap-3 px-1.5" role="group" aria-label="Palette">
              {PALETTES.map((option) => {
                const selected = palette.slug === option.slug;
                return (
                  <button
                    key={option.slug}
                    type="button"
                    title={option.name}
                    aria-label={`${option.name} palette`}
                    aria-pressed={selected}
                    onClick={() => {
                      setPalette(option);
                      setSeed(option.seed);
                      interact("palette", option.slug);
                    }}
                    className={cn(
                      "relative h-7 w-7 rounded-full outline-none transition-[box-shadow,transform] duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] before:absolute before:-inset-1.5 before:content-[''] active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "shadow-[0_0_0_2px_#fff,0_0_0_3.5px_#171717]"
                        : "shadow-[0_0_0_1px_rgba(0,0,0,0.12)] hover:shadow-[0_0_0_2px_#fff,0_0_0_3.5px_rgba(0,0,0,0.25)]"
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]} 50%, ${option.colors[2]})`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={effect}
              onValueChange={(value) => {
                if (!value) return;
                setEffect(value as GradientEffect);
                interact("effect", value);
              }}
              aria-label="Finish"
              className="mr-2"
            >
              {EFFECTS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 2 ** 32));
                interact("shuffle");
              }}
            >
              <ShuffleIcon />
              Shuffle
            </Button>
            {/* Fixed label plus a state dot: the button never changes width,
                and the state is readable without motion */}
            <Button
              variant="outline"
              size="sm"
              aria-pressed={grainOn}
              onClick={() => {
                setGrainOn((g) => !g);
                interact("grain", grainOn ? "off" : "on");
              }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-150",
                  grainOn ? "bg-neutral-900" : "bg-neutral-300"
                )}
              />
              Grain
            </Button>
            <div className="flex-1" />
            <Button asChild size="sm">
              <TrackedLink
                href={studioUrl}
                location="hero_canvas"
                properties={{ style, palette: palette.slug, grain: grainOn, effect }}
              >
                Open in the studio
              </TrackedLink>
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-neutral-500">
        This is the real renderer. What you see here is what exports at 4K.
      </p>
    </div>
  );
}
