import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/landing/TrackedLink";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import type { GalleryPreset } from "@/lib/gallery";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Thin SEO landing for one look (grainy, blurry, aurora): a keyword-first
// headline, a deep link that opens the studio pre-set to that look, a short
// explainer, matching wallpapers and a FAQ with schema.

export type StyleLandingContent = {
  path: string;
  title: string; // <title> and H1, keyword first
  tagline: string;
  description: string;
  studioHref: string;
  cta: string;
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
  presets: GalleryPreset[];
  presetsHeading: string;
};

export const styleLandingMetadata = (c: StyleLandingContent): Metadata => ({
  title: { absolute: `${c.title} | ${SITE_NAME}` },
  description: c.description,
  alternates: { canonical: c.path },
  openGraph: { title: c.title, description: c.description, url: c.path },
});

export default function StyleLanding({ content: c }: { content: StyleLandingContent }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: c.title,
        url: `${SITE_URL}${c.path}`,
        description: c.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
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
        <section className="pb-12 pt-8 sm:pt-12">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">{c.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <TrackedLink href={c.studioHref} location={`style_landing:${c.path}`}>
                {c.cta}
              </TrackedLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/wallpapers">Free wallpapers</Link>
            </Button>
          </div>
          <p className="mt-3 font-azeret text-xs tabular-nums text-neutral-500">
            5 free 4K exports a month · no watermark · no card
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{c.presetsHeading}</h2>
          <div className="mt-6">
            <WallpaperGrid presets={c.presets} priority />
          </div>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-2">
          {c.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-semibold tracking-tight">{s.heading}</h2>
              <p className="mt-2 text-neutral-600">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <dl className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
            {c.faqs.map((f) => (
              <div key={f.q}>
                <dt className="text-sm font-medium">{f.q}</dt>
                <dd className="mt-2 text-sm text-neutral-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-2xl border border-neutral-200 p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Make one now</h2>
          <p className="mx-auto mt-2 max-w-md text-neutral-600">
            The studio opens pre-set to this look. Shuffle until something
            feels right, then export.
          </p>
          <Button asChild size="lg" className="mt-6">
            <TrackedLink href={c.studioHref} location={`style_landing_close:${c.path}`}>
              {c.cta}
            </TrackedLink>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
