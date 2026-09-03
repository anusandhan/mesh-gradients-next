import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/landing/TrackedLink";
import { FREE_PRESET_LIMIT, PLANS, formatPrice } from "@/lib/plans";
import { MAX_PRESETS_PER_USER } from "@/lib/presets";

// Server-rendered marketing page. The studio itself lives at /app.
// Deliberately simple for now: brand, one hero, the three styles, pricing.

export const metadata: Metadata = {
  title: "Gradients Studio — Mesh gradient generator with real grain",
  description:
    "Design mesh, stripe and cloud gradients with grain, blur and colour controls. Export 4K wallpapers and backgrounds. Free to start, no subscription.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gradients Studio",
    description:
      "Mesh gradients that look designed, not generated. Export 4K, free to start.",
    url: "/",
  },
};

const FREE_EXPORTS = 5;

const styles = [
  {
    name: "Blobs",
    file: "/landing/blobs.jpg",
    blurb: "Soft, overlapping colour fields. The classic mesh look.",
  },
  {
    name: "Stripes",
    file: "/landing/stripes.jpg",
    blurb: "Flowing fibres with adjustable density, waviness and sheen.",
  },
  {
    name: "Clouds",
    file: "/landing/clouds.jpg",
    blurb: "Billowing volumes with coverage, softness and detail dials.",
  },
];

const faqs = [
  {
    q: "Is the free plan really free?",
    a: `Yes. Every control is available, and you get ${FREE_EXPORTS} full-resolution 4K exports each month plus ${FREE_PRESET_LIMIT} saved palettes. No card required.`,
  },
  {
    q: "Is Pro a subscription?",
    a: "No. Both passes are a single payment that never auto-renews. When your time is up, you simply drop back to the free plan and keep everything you saved.",
  },
  {
    q: "Can I use the exports commercially?",
    a: "Yes. Anything you export is yours to use in personal and commercial work.",
  },
];

const Wordmark = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="/gs-logo.png"
      alt=""
      width={915}
      height={562}
      className="block h-auto w-9"
      priority
    />
    <span className="text-base font-medium text-neutral-900">
      Gradients Studio
    </span>
  </Link>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <a href="#pricing">Pricing</a>
          </Button>
          <Button asChild>
            <TrackedLink href="/app" location="header">
              Open the studio
            </TrackedLink>
          </Button>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 sm:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              Mesh gradients that look designed, not generated.
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Blobs, stripes and clouds with real grain. Tune the colours, blur
              and texture, then export a 4K wallpaper or background in one
              click.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <TrackedLink href="/app" location="hero">
                  Start for free
                </TrackedLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#pricing">See pricing</a>
              </Button>
            </div>
            <p className="mt-3 font-azeret text-xs tabular-nums text-neutral-500">
              {`${FREE_EXPORTS} free 4K exports every month · no card required`}
            </p>
          </div>

          {/* Framed like the logo: rounded canvas inside a soft white bezel */}
          <div className="mx-auto mt-12 max-w-5xl rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
            <Image
              src="/landing/hero.jpg"
              alt="A mesh gradient in orange, pink and violet rendered by Gradients Studio"
              width={2000}
              height={1250}
              className="block w-full rounded-[20px]"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </div>
        </section>

        {/* Styles */}
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              Three styles, one set of controls
            </h2>
            <p className="mt-2 max-w-xl text-neutral-600">
              Pick a palette, choose a style, and every gradient gets the same
              grain, blur, contrast and saturation dials.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {styles.map((style) => (
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
                    <div className="text-sm font-medium">{style.name}</div>
                    <p className="mt-1 text-sm text-neutral-600">
                      {style.blurb}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-8">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
            <p className="mt-2 max-w-xl text-neutral-600">
              Pay once for the time you need. Nothing auto-renews.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* Free */}
              <div className="flex flex-col rounded-2xl border border-neutral-200 p-6">
                <div className="text-sm font-medium text-neutral-500">Free</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$0</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                  <li>Every style and control</li>
                  <li>{`${FREE_EXPORTS} 4K exports per month`}</li>
                  <li>{`${FREE_PRESET_LIMIT} saved palettes`}</li>
                </ul>
                <Button asChild variant="outline" className="mt-6">
                  <TrackedLink href="/app" location="pricing_free">
                    Start for free
                  </TrackedLink>
                </Button>
              </div>

              {/* Pro */}
              <div className="flex flex-col rounded-2xl border-2 border-neutral-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-neutral-500">
                    {PLANS.year.name}
                  </div>
                  <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    Best value
                  </span>
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
                  <TrackedLink href="/app" location="pricing_pro">
                    {`Get ${PLANS.year.name}`}
                  </TrackedLink>
                </Button>
              </div>

              {/* Week pass */}
              <div className="flex flex-col rounded-2xl border border-neutral-200 p-6">
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
                  <TrackedLink href="/app" location="pricing_week">
                    Get the pass
                  </TrackedLink>
                </Button>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Passes are bought inside the studio after signing in. Buying again
              adds time on top of what you have left.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
            <dl className="mt-8 grid gap-8 md:grid-cols-3">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-medium">{item.q}</dt>
                  <dd className="mt-2 text-sm text-neutral-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center">
        <Wordmark />
        <div className="flex items-center gap-4">
          <Link href="/app" className="hover:text-neutral-900">
            Studio
          </Link>
          <a href="#pricing" className="hover:text-neutral-900">
            Pricing
          </a>
          <span>{`© ${new Date().getFullYear()} Gradients Studio`}</span>
        </div>
      </footer>
    </div>
  );
}
