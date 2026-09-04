"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { GALLERY, buildStudioUrl, type GalleryPreset } from "@/lib/gallery";
import {
  renderGradient,
  type GradientStyle,
} from "@/lib/gradient-renderer";
import TrackedLink from "./TrackedLink";

// The landing-page hero is the real renderer, not a screenshot: three style
// tabs, a handful of palettes, shuffle, and a grain toggle. "Open in the
// studio" carries the exact state into /app. Until the first frame paints
// (and if JavaScript never runs) the server-rendered hero.jpg shows instead.

const EXPORT_WIDTH = 3840; // blur is defined relative to the 4K export
const MAX_RENDER_WIDTH = 1400;
const ASPECT = 16 / 10;
const GRAIN = 0.2;

const STYLES: { value: GradientStyle; label: string }[] = [
  { value: "blobs", label: "Blobs" },
  { value: "stripes", label: "Stripes" },
  { value: "clouds", label: "Clouds" },
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
  const [style, setStyle] = useState<GradientStyle>("blobs");
  const [palette, setPalette] = useState<GalleryPreset>(PALETTES[0]);
  const [seed, setSeed] = useState(PALETTES[0].seed);
  const [grainOn, setGrainOn] = useState(true);
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
      }),
    [style, palette, seed, grainOn]
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
    });
    setReady(true);
  }, [palette, grainOn, seed, style]);

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
      <div className="rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-neutral-100">
          <Image
            src="/landing/hero.jpg"
            alt="A mesh gradient in orange, pink and violet rendered by Gradients Studio"
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
        <div className="flex flex-col gap-2 px-2 pb-2 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="tablist"
              aria-label="Gradient style"
              className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5"
            >
              {STYLES.map((option) => (
                <button
                  key={option.value}
                  role="tab"
                  aria-selected={style === option.value}
                  onClick={() => {
                    setStyle(option.value);
                    interact("style", option.value);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    style === option.value
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5" aria-label="Palette">
              {PALETTES.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  title={option.name}
                  aria-label={`${option.name} palette`}
                  aria-pressed={palette.slug === option.slug}
                  onClick={() => {
                    setPalette(option);
                    setSeed(option.seed);
                    interact("palette", option.slug);
                  }}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform active:scale-95",
                    palette.slug === option.slug
                      ? "border-neutral-900"
                      : "border-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]} 50%, ${option.colors[2]})`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 2 ** 32));
                interact("shuffle");
              }}
            >
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={grainOn}
              onClick={() => {
                setGrainOn((g) => !g);
                interact("grain", grainOn ? "off" : "on");
              }}
            >
              {grainOn ? "Grain on" : "Grain off"}
            </Button>
            <div className="flex-1" />
            <Button asChild size="sm">
              <TrackedLink
                href={studioUrl}
                location="hero_canvas"
                properties={{ style, palette: palette.slug, grain: grainOn }}
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
