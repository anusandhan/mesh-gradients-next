import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/landing/TrackedLink";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { STYLE_LABELS, buildStudioUrl } from "@/lib/gallery";
import { presetsByStyle } from "@/lib/wallpapers";
import { SITE_NAME } from "@/lib/site";
import type { GradientStyle } from "@/lib/gradient-renderer";

const STYLES: GradientStyle[] = ["blobs", "stripes", "clouds"];

const COPY: Record<GradientStyle, { title: string; description: string; body: string[] }> = {
  blobs: {
    title: "Mesh Gradient Wallpapers",
    description:
      "Free mesh gradient wallpapers in 4K, 5K and phone sizes. Soft overlapping colour fields with real grain, no watermark, no sign-up.",
    body: [
      "Blobs are the classic mesh gradient: several colour points spread across the canvas and blurred into each other. They make calm, glowing backgrounds that sit well behind icons and windows.",
      "These four palettes cover the range: a dark ember glow, a pale peach, a lilac haze and a deep sea. Each is rendered with grain at the final size, so the soft transitions stay smooth on a large monitor instead of banding.",
    ],
  },
  stripes: {
    title: "Silk and Aurora Stripe Wallpapers",
    description:
      "Free striped gradient wallpapers in 4K, 5K and phone sizes. Flowing fibres with a sheen that read as silk or aurora, rendered with real grain.",
    body: [
      "Stripes are thousands of fine fibres flowing diagonally across the canvas, melted together by blur and finished with a soft sheen. Depending on the palette they read as draped silk or the northern lights.",
      "The four palettes here run from an aurora on a night sky to sunlit amber, a rose silk and an icy blue weave. The fibres are drawn as true curves, so nothing kinks at full size.",
    ],
  },
  clouds: {
    title: "Cloud Gradient Wallpapers",
    description:
      "Free cloud gradient wallpapers in 4K, 5K and phone sizes. Billowing volumes with real depth, from a clear blue sky to midnight and storm.",
    body: [
      "Clouds are built from fractal noise mapped through the palette, so masses have real depth and the edges wisp instead of blobbing. They work best with a sky colour and two or three highlight tones.",
      "Blue Sky is the daytime reference. Sunset runs violet into coral and gold, Midnight is deep indigo, and Storm is slate and silver. All four are dark-mode safe on the phone size.",
    ],
  },
};

type Params = { style: string };

export const generateStaticParams = () => STYLES.map((style) => ({ style }));

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { style } = await params;
  if (!STYLES.includes(style as GradientStyle)) return {};
  const copy = COPY[style as GradientStyle];
  return {
    title: { absolute: `Free ${copy.title} (4K, 5K, Phone) | ${SITE_NAME}` },
    description: copy.description,
    alternates: { canonical: `/wallpapers/style/${style}` },
    openGraph: { title: copy.title, description: copy.description, url: `/wallpapers/style/${style}` },
  };
}

export default async function StyleWallpapersPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { style } = await params;
  if (!STYLES.includes(style as GradientStyle)) notFound();
  const gradientStyle = style as GradientStyle;
  const copy = COPY[gradientStyle];
  const presets = presetsByStyle(gradientStyle);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <nav className="pt-6 text-sm text-neutral-500" aria-label="Breadcrumb">
          <Link href="/wallpapers" className="hover:text-neutral-900">Wallpapers</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{STYLE_LABELS[gradientStyle]}</span>
        </nav>
        <section className="pb-10 pt-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {`Free ${copy.title.toLowerCase()}`}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">{copy.description}</p>
        </section>

        <WallpaperGrid presets={presets} priority />

        <section className="mt-16 max-w-2xl space-y-4 text-neutral-600">
          {copy.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <TrackedLink
                href={buildStudioUrl({ style: gradientStyle })}
                location="wallpaper_style_cta"
                properties={{ style }}
              >
                {`Make your own ${STYLE_LABELS[gradientStyle].toLowerCase()} gradient`}
              </TrackedLink>
            </Button>
            {STYLES.filter((s) => s !== gradientStyle).map((s) => (
              <Button key={s} asChild variant="outline">
                <Link href={`/wallpapers/style/${s}`}>{`${STYLE_LABELS[s]} wallpapers`}</Link>
              </Button>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
