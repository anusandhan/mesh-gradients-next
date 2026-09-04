import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { TAG_COPY, WALLPAPER_TAGS, presetsByTag } from "@/lib/wallpapers";
import { SITE_NAME } from "@/lib/site";

type Params = { tag: string };

const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);

export const generateStaticParams = () => WALLPAPER_TAGS.map((tag) => ({ tag }));

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (!WALLPAPER_TAGS.includes(tag)) return {};
  const title = `Free ${titleCase(tag)} Gradient Wallpapers (4K, 5K, Phone)`;
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description: TAG_COPY[tag],
    alternates: { canonical: `/wallpapers/color/${tag}` },
    openGraph: { title, description: TAG_COPY[tag], url: `/wallpapers/color/${tag}` },
  };
}

export default async function TagWallpapersPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tag } = await params;
  if (!WALLPAPER_TAGS.includes(tag)) notFound();
  const presets = presetsByTag(tag);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <nav className="pt-6 text-sm text-neutral-500" aria-label="Breadcrumb">
          <Link href="/wallpapers" className="hover:text-neutral-900">Wallpapers</Link>
          <span className="mx-2">/</span>
          <span className="capitalize text-neutral-900">{tag}</span>
        </nav>
        <section className="pb-10 pt-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {`Free ${tag} gradient wallpapers`}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">{TAG_COPY[tag]}</p>
          <p className="mt-2 text-sm text-neutral-500">
            Every download is free at 4K, 5K and phone size, with no sign-up
            and no watermark.
          </p>
        </section>
        <WallpaperGrid presets={presets} priority />
        <section className="mt-12 flex flex-wrap gap-2 text-sm">
          {WALLPAPER_TAGS.filter((t) => t !== tag).map((t) => (
            <Link
              key={t}
              href={`/wallpapers/color/${t}`}
              className="rounded-full border border-neutral-200 px-3 py-1 capitalize hover:border-neutral-900"
            >
              {t}
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
