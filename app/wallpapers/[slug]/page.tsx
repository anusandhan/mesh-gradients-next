import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import DownloadLink from "@/components/landing/DownloadLink";
import TrackedLink from "@/components/landing/TrackedLink";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import {
  GALLERY,
  STYLE_LABELS,
  findPreset,
  presetToStudioUrl,
} from "@/lib/gallery";
import {
  WALLPAPER_SIZES,
  wallpaperFilename,
  wallpaperUrl,
} from "@/lib/wallpapers";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// One page per collection palette: preview, three free downloads, the hex
// codes, and a Customise link that opens the exact scene in the studio.

type Params = { slug: string };

export const generateStaticParams = () =>
  GALLERY.map((p) => ({ slug: p.slug }));

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preset = findPreset(slug);
  if (!preset) return {};
  const title = `${preset.name} Gradient Wallpaper (4K, 5K, Phone)`;
  const description = `Free ${preset.name} wallpaper: ${preset.mood}, ${STYLE_LABELS[preset.style].toLowerCase()} style with real grain. Download for Mac, desktop or phone, or customise it in the studio.`;
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: `/wallpapers/${preset.slug}` },
    openGraph: {
      title,
      description,
      url: `/wallpapers/${preset.slug}`,
      images: [{ url: `/landing/gallery/${preset.slug}.jpg`, width: 960, height: 600 }],
    },
  };
}

export default async function WallpaperPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const preset = findPreset(slug);
  if (!preset) notFound();

  const related = GALLERY.filter(
    (p) => p.style === preset.style && p.slug !== preset.slug
  );
  const styleLabel = STYLE_LABELS[preset.style];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        name: `${preset.name} gradient wallpaper`,
        description: `${preset.mood}, ${styleLabel.toLowerCase()} style`,
        contentUrl: `${SITE_URL}${wallpaperUrl(preset.slug, "desktop")}`,
        thumbnailUrl: `${SITE_URL}/landing/gallery/${preset.slug}.jpg`,
        width: 3840,
        height: 2160,
        license: `${SITE_URL}/#faq`,
        acquireLicensePage: `${SITE_URL}/wallpapers/${preset.slug}`,
        creator: { "@type": "Organization", name: SITE_NAME },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Wallpapers", item: `${SITE_URL}/wallpapers` },
          { "@type": "ListItem", position: 2, name: styleLabel, item: `${SITE_URL}/wallpapers/style/${preset.style}` },
          { "@type": "ListItem", position: 3, name: preset.name, item: `${SITE_URL}/wallpapers/${preset.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <nav className="pt-6 text-sm text-neutral-500" aria-label="Breadcrumb">
          <Link href="/wallpapers" className="hover:text-neutral-900">Wallpapers</Link>
          <span className="mx-2">/</span>
          <Link href={`/wallpapers/style/${preset.style}`} className="hover:text-neutral-900">
            {styleLabel}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{preset.name}</span>
        </nav>

        <section className="grid gap-10 pt-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
              {/* The preview is rendered on demand at 1600×1000 and cached */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wallpaperUrl(preset.slug, "preview")}
                alt={`${preset.name} gradient wallpaper: ${preset.mood}`}
                width={1600}
                height={1000}
                className="block aspect-[16/10] w-full rounded-[20px] object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-neutral-500">{styleLabel}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">
              {preset.name}
            </h1>
            <p className="mt-3 text-neutral-600">
              {preset.mood[0].toUpperCase() + preset.mood.slice(1)}. Rendered
              with real grain at every size, so it stays clean on a 5K display
              and an OLED phone.
            </p>

            <h2 className="mt-8 text-sm font-medium">Download free</h2>
            <ul className="mt-3 space-y-2">
              {WALLPAPER_SIZES.map((size) => (
                <li key={size.id}>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <DownloadLink
                      href={wallpaperUrl(preset.slug, size.id)}
                      download={wallpaperFilename(preset, size)}
                      slug={preset.slug}
                      size={size.id}
                    >
                      <span>{size.label}</span>
                      <span className="font-azeret text-xs tabular-nums text-neutral-500">
                        {`${size.width} × ${size.height}`}
                      </span>
                    </DownloadLink>
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-neutral-500">
              No sign-up, no watermark. Free for personal and commercial use.
            </p>

            <h2 className="mt-8 text-sm font-medium">Palette</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {[preset.background, ...preset.colors].map((hex, i) => (
                <li
                  key={`${hex}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1"
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ background: hex }}
                  />
                  <span className="font-azeret text-xs uppercase tabular-nums text-neutral-700">
                    {hex}
                  </span>
                  {i === 0 && (
                    <span className="text-[10px] text-neutral-400">background</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild size="lg" className="w-full">
                <TrackedLink
                  href={presetToStudioUrl(preset)}
                  location="wallpaper_customise"
                  properties={{ preset: preset.slug }}
                >
                  Customise in the studio
                </TrackedLink>
              </Button>
              <p className="mt-2 text-xs text-neutral-500">
                Opens this exact scene. Change any colour, the blur or the
                grain, then export at 4K.
              </p>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              {`More ${styleLabel.toLowerCase()} wallpapers`}
            </h2>
            <div className="mt-6">
              <WallpaperGrid presets={related} />
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
