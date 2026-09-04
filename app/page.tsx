import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/landing/TrackedLink";
import HeroCanvas from "@/components/landing/HeroCanvas";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { FREE_PRESET_LIMIT, PLANS, formatPrice } from "@/lib/plans";
import { MAX_PRESETS_PER_USER } from "@/lib/presets";
import { GALLERY, buildStudioUrl, presetToStudioUrl } from "@/lib/gallery";
import { TESTIMONIALS } from "@/lib/testimonials";
import { FREE_EXPORTS_PER_MONTH, SITE_NAME, SITE_URL } from "@/lib/site";

// Server-rendered marketing page. The studio itself lives at /app.
// Structure follows docs/landing-page-plan-2026-09.md: live hero, gallery,
// styles, use cases, the grain argument, pricing, FAQ, footer.

const TITLE = "Mesh Gradient Generator with Real Grain — Free 4K Export";
const DESCRIPTION =
  "Make mesh gradients in three styles with real grain, blur and colour controls. Export 4K wallpapers and backgrounds with no watermark. Free to start, nothing to subscribe to.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE_NAME}` },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME}: mesh gradient generator with real grain`,
    description:
      "Gradients that look designed, not generated. Export 4K, free to start, no subscription.",
    url: "/",
  },
};

const useCases = [
  {
    title: "Website hero and social card",
    sizes: "3840×2160 and 3840×2010",
    copy: "The Linear look, exported clean. Grain is baked in, so nothing bands behind your headline.",
    href: buildStudioUrl({ aspectRatio: "1.91:1", style: "blobs" }),
  },
  {
    title: "Desktop and phone wallpaper",
    sizes: "3840×2160, 3840×2400 Mac, 1215×2160 phone",
    copy: "One palette, every screen. Re-export the same scene for the Mac and the phone.",
    href: buildStudioUrl({ aspectRatio: "16:10", style: "clouds" }),
  },
  {
    title: "App Store and device shots",
    sizes: "1215×2160 portrait",
    copy: "Dark, premium backdrops that make a UI pop without fighting it.",
    href: buildStudioUrl({ aspectRatio: "9:16", style: "blobs" }),
  },
  {
    title: "Slides and video calls",
    sizes: "3840×2160",
    copy: "Decks and Zoom backgrounds that do not look like a template.",
    href: buildStudioUrl({ aspectRatio: "16:9", style: "stripes" }),
  },
  {
    title: "Notion covers and podcast art",
    sizes: "3840×1536 cover, 2160×2160 square",
    copy: "Aesthetic covers in one click, dark-mode safe.",
    href: buildStudioUrl({ aspectRatio: "5:2", style: "clouds" }),
  },
];

const faqs = [
  {
    q: "What is a mesh gradient?",
    a: "A gradient made from several colour points spread across a canvas and blurred together, instead of one straight fade between two colours. It gives the soft, glowing look you see on modern app and product sites.",
  },
  {
    q: "Is the free plan really free?",
    a: `Yes. Every style and control is open, and you get ${FREE_EXPORTS_PER_MONTH} full-resolution 4K exports each month plus ${FREE_PRESET_LIMIT} saved palettes. No watermark, no card.`,
  },
  {
    q: "What resolution and formats do I get?",
    a: "Landscape exports are 3840 pixels wide, portrait and square are 2160 pixels tall. Files are high-quality JPEG. Every plan exports at the same resolution.",
  },
  {
    q: "Is Pro a subscription?",
    a: `No. ${PLANS.year.name} is one payment for ${PLANS.year.durationLabel} and the ${PLANS.week.name} is one payment for ${PLANS.week.durationLabel}. Neither auto-renews. When the time is up you drop back to the free plan and keep every palette you saved.`,
  },
  {
    q: "Can I use the exports commercially?",
    a: "Yes. Anything you export, on any plan, is yours to use in personal and client work, including products you sell.",
  },
  {
    q: "Why does grain matter?",
    a: "Smooth blurs at 4K show visible colour bands, especially in dark palettes. Grain breaks the bands into texture the eye reads as depth. It is rendered into the image, not pasted on top, so it survives compression and print.",
  },
  {
    q: "Do you export CSS or SVG?",
    a: "Not yet. The studio makes images. If you need a CSS gradient for a live page, use a CSS tool and bring the image here for the places an image belongs: wallpapers, social cards, slides, screenshots and covers.",
  },
  {
    q: "What if I buy a pass and change my mind?",
    a: "Email us within 14 days. If you have not exported anything yet, the pass is refunded in full.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        {
          "@type": "Offer",
          name: PLANS.week.name,
          price: String(PLANS.week.priceUsd),
          priceCurrency: "USD",
          description: `${PLANS.week.durationLabel} of unlimited 4K exports, one-time payment`,
        },
        {
          "@type": "Offer",
          name: PLANS.year.name,
          price: String(PLANS.year.priceUsd),
          priceCurrency: "USD",
          description: `${PLANS.year.durationLabel} of unlimited 4K exports and ${MAX_PRESETS_PER_USER} saved palettes, one-time payment`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

const SectionHeading = ({
  title,
  lead,
}: {
  title: string;
  lead?: string;
}) => (
  <>
    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    {lead && <p className="mt-2 max-w-xl text-neutral-600">{lead}</p>}
  </>
);

export default function LandingPage() {
  const freeLine = `${FREE_EXPORTS_PER_MONTH} free 4K exports a month · no watermark · no card`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main>
        {/* Hero: copy left, the real renderer right */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 sm:pt-12">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                Mesh gradient generator with real grain
              </h1>
              <p className="mt-4 text-lg text-neutral-600">
                Gradients that look designed, not generated. Pick blobs, stripes
                or clouds, tune the colour, blur and texture, then export a 4K
                wallpaper or background. Free to start, nothing to subscribe to.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <TrackedLink href="/app" location="hero">
                    Start for free
                  </TrackedLink>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#pricing">See pricing</Link>
                </Button>
              </div>
              <p className="mt-3 font-azeret text-xs tabular-nums text-neutral-500">
                {freeLine}
              </p>
            </div>
            <div className="lg:col-span-7">
              <HeroCanvas />
            </div>
          </div>
        </section>

        {/* Proof strip: hidden until there are real quotes */}
        {TESTIMONIALS.length > 0 && (
          <section className="border-y border-neutral-200 bg-neutral-50">
            <div className="mx-auto w-full max-w-6xl px-6 py-8">
              <blockquote className="mx-auto max-w-2xl text-center">
                <p className="text-lg text-neutral-800">
                  “{TESTIMONIALS[0].quote}”
                </p>
                <footer className="mt-2 text-sm text-neutral-500">
                  {TESTIMONIALS[0].name}, {TESTIMONIALS[0].role}
                </footer>
              </blockquote>
            </div>
          </section>
        )}

        {/* Gallery */}
        <section id="gallery" className="scroll-mt-8 border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <SectionHeading
              title="Start from a palette"
              lead="Twelve presets across the three styles. Open one, then make it yours."
            />
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {GALLERY.map((preset) => (
                <li key={preset.slug}>
                  <TrackedLink
                    href={presetToStudioUrl(preset)}
                    location="gallery"
                    event="landing_gallery_clicked"
                    properties={{ preset: preset.slug, style: preset.style }}
                    className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]"
                  >
                    <Image
                      src={`/landing/gallery/${preset.slug}.jpg`}
                      alt={`${preset.name}: ${preset.mood}, ${preset.style} style`}
                      width={960}
                      height={600}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="block aspect-[16/10] w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs capitalize text-neutral-500">
                        {preset.style}
                      </span>
                    </div>
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Styles */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <SectionHeading
            title="Three styles, one set of controls"
            lead="Colour, blur, contrast and saturation work the same way everywhere. Each style adds its own dials."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Blobs",
                file: "/landing/blobs.jpg",
                copy: "Soft, overlapping colour fields. The classic mesh look for heroes and wallpapers.",
                dials: "Blur and placement",
              },
              {
                name: "Stripes",
                file: "/landing/stripes.jpg",
                copy: "Flowing fibres with a subtle sheen. Reads as fabric or aurora depending on the palette.",
                dials: "Density, waviness, sheen",
              },
              {
                name: "Clouds",
                file: "/landing/clouds.jpg",
                copy: "Billowing volumes with real depth. Best for dark palettes and moody backdrops.",
                dials: "Coverage, softness, detail",
              },
            ].map((style) => (
              <figure
                key={style.name}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <Image
                  src={style.file}
                  alt={`${style.name} style gradient`}
                  width={1200}
                  height={900}
                  className="block aspect-[4/3] w-full object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
                <figcaption className="p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{style.name}</span>
                    <span className="font-azeret text-[11px] text-neutral-500">
                      {style.dials}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{style.copy}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <SectionHeading
              title="Made for how you will use it"
              lead="Pick the size first and the studio frames the gradient for it. Every export is full resolution."
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="mt-1 font-azeret text-[11px] tabular-nums text-neutral-500">
                    {item.sizes}
                  </p>
                  <p className="mt-3 flex-1 text-sm text-neutral-600">{item.copy}</p>
                  <TrackedLink
                    href={item.href}
                    location="use_case"
                    properties={{ useCase: item.title }}
                    className="mt-4 text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
                  >
                    Open at this size
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why it looks designed */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <SectionHeading
            title="Why it looks designed"
            lead="Most generators make a smooth blur that falls apart at full size. Here is the difference at 100% on a 4K export."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                file: "/landing/grain-off.jpg",
                label: "Smooth blur, no grain",
                note: "Colour bands and a flat, plastic centre.",
              },
              {
                file: "/landing/grain-on.jpg",
                label: "Same gradient with grain",
                note: "Bands break into texture the eye reads as depth.",
              },
            ].map((item) => (
              <figure
                key={item.file}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <Image
                  src={item.file}
                  alt={`${item.label}: ${item.note}`}
                  width={720}
                  height={450}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="block w-full"
                />
                <figcaption className="p-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <p className="mt-1 text-sm text-neutral-600">{item.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 grid gap-6 text-sm text-neutral-600 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-neutral-900">
                Grain is rendered, not pasted
              </h3>
              <p className="mt-1">
                The grain is drawn into the gradient at export resolution, so
                it survives JPEG compression, scaling and print instead of
                turning to mush.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900">
                Blur that stays clean
              </h3>
              <p className="mt-1">
                Blur is defined against the 4K export, so the preview and the
                file match. What you tune on a laptop is what lands on the
                monitor.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900">
                Palettes you can keep
              </h3>
              <p className="mt-1">
                Save a palette once and reuse it across styles and sizes. Free
                accounts keep {FREE_PRESET_LIMIT}, Pro keeps {MAX_PRESETS_PER_USER}.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-8 border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <SectionHeading
              title="Pricing"
              lead="Pay once for the time you need. Nothing auto-renews, and commercial use is included on every plan."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {/* Free */}
              <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="text-sm font-medium text-neutral-500">Free</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$0</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                  <li>Every style and control</li>
                  <li>{`${FREE_EXPORTS_PER_MONTH} 4K exports a month, no watermark`}</li>
                  <li>{`${FREE_PRESET_LIMIT} saved palettes`}</li>
                </ul>
                <Button asChild variant="outline" className="mt-6">
                  <TrackedLink href="/app" location="pricing_free">
                    Start for free
                  </TrackedLink>
                </Button>
              </div>

              {/* Pro. Figma spec: 8px outside stroke with a radial gradient,
                  plus an 8px #F4F4F4 spread shadow. The ring is a padded
                  wrapper with negative margin so the white card lines up
                  with its neighbours and the ring grows into the gaps.
                  Radii are concentric: 16px card + 8px ring = 24px. */}
              <div
                className="-m-2 rounded-[24px] p-2 shadow-[0_0_0_8px_#F4F4F4]"
                style={{
                  background:
                    "radial-gradient(ellipse farthest-corner at center, #8487FF 0%, #F6CCFD 33%, #C3EFED 66%, #8487FF 100%)",
                }}
              >
              <div className="flex h-full flex-col rounded-2xl bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-neutral-500">
                    {PLANS.year.name}
                  </div>
                  <Image
                    src="/best-value-badge.png"
                    alt="Best value"
                    width={1449}
                    height={423}
                    className="h-7 w-auto"
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">
                    {formatPrice(PLANS.year)}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {`/ ${PLANS.year.durationLabel}`}
                  </span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                  <li>Unlimited 4K exports</li>
                  <li>{`${MAX_PRESETS_PER_USER} saved palettes`}</li>
                  <li>One payment, never auto-renews</li>
                </ul>
                <Button asChild className="mt-6">
                  <TrackedLink
                    href={buildStudioUrl({ plan: "year" })}
                    location="pricing_pro"
                  >
                    {`Get ${PLANS.year.name}`}
                  </TrackedLink>
                </Button>
              </div>
              </div>

              {/* Week pass */}
              <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="text-sm font-medium text-neutral-500">
                  {PLANS.week.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">
                    {formatPrice(PLANS.week)}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {`/ ${PLANS.week.durationLabel}`}
                  </span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                  <li>Unlimited 4K exports for one project</li>
                  <li>Same controls as Pro</li>
                  <li>One payment, never auto-renews</li>
                </ul>
                <Button asChild variant="outline" className="mt-6">
                  <TrackedLink
                    href={buildStudioUrl({ plan: "week" })}
                    location="pricing_week"
                  >
                    Get the pass
                  </TrackedLink>
                </Button>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Need it for one project? Take the {PLANS.week.name}. Making these
              regularly? {PLANS.year.name} is {PLANS.year.durationLabel} for less
              than five weeks of passes. Buying again adds time on top of what
              you have left. Refund within 14 days if you have not exported.
            </p>
          </div>
        </section>

        {/* Testimonials: hidden until there are at least three */}
        {TESTIMONIALS.length >= 3 && (
          <section className="mx-auto w-full max-w-6xl px-6 py-16">
            <SectionHeading title="What people say" />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.slice(0, 6).map((t) => (
                <li
                  key={t.name}
                  className="rounded-2xl border border-neutral-200 p-5"
                >
                  <p className="text-sm text-neutral-800">“{t.quote}”</p>
                  <p className="mt-3 text-xs text-neutral-500">
                    {t.url ? (
                      <a href={t.url} className="hover:text-neutral-900">
                        {t.name}
                      </a>
                    ) : (
                      t.name
                    )}
                    , {t.role}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="scroll-mt-8 border-t border-neutral-200">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <SectionHeading title="Questions" />
            <dl className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-medium">{item.q}</dt>
                  <dd className="mt-2 text-sm text-neutral-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing CTA on a full-bleed gradient */}
        <section className="relative overflow-hidden">
          <Image
            src="/landing/hero.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center text-white">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Make one now
            </h2>
            <p className="mt-3 max-w-md text-white/85">
              The studio opens with a random palette. Shuffle until something
              feels right, then export.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-8 border-white/40 from-white to-white text-neutral-900"
            >
              <TrackedLink href="/app" location="closing">
                Open the studio
              </TrackedLink>
            </Button>
            <p className="mt-3 font-azeret text-xs tabular-nums text-white/80">
              {freeLine}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
