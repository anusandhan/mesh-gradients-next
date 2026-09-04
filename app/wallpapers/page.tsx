import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/landing/TrackedLink";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { GALLERY, STYLE_LABELS } from "@/lib/gallery";
import { WALLPAPER_SIZES, WALLPAPER_TAGS } from "@/lib/wallpapers";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "Free 4K Gradient Wallpapers for Mac, Desktop and Phone";
const DESCRIPTION =
  "Twelve free gradient wallpapers with real grain, in 5K for Mac, 4K for desktop and 1290×2796 for phones. No sign-up, no watermark. Customise any of them in the studio.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE_NAME}` },
  description: DESCRIPTION,
  alternates: { canonical: "/wallpapers" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/wallpapers" },
};

const faqs = [
  {
    q: "Are these wallpapers really free?",
    a: "Yes. Every wallpaper on this page downloads at full size with no sign-up and no watermark, and you can use them personally or commercially.",
  },
  {
    q: "Which size should I pick?",
    a: "Mac 5K (5120×2880) for MacBooks and Studio Displays, Desktop 4K (3840×2160) for any 16:9 monitor, and Phone (1290×2796) for iPhone and Android. All three are rendered from the same scene, so you can match your laptop and phone.",
  },
  {
    q: "Why do they have grain?",
    a: "Smooth gradients band on large screens, especially in dark palettes. The grain is rendered into the image, so the colours stay clean at full size and on OLED displays.",
  },
  {
    q: "Can I change the colours?",
    a: "Yes. Every wallpaper page has a Customise button that opens the exact palette in the studio, where you can tune colours, blur and texture and export your own version.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: TITLE,
      url: `${SITE_URL}/wallpapers`,
      description: DESCRIPTION,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function WallpapersPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="pb-10 pt-8 sm:pt-12">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Free gradient wallpapers in 4K, 5K and phone sizes
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            Twelve palettes across three styles, rendered with real grain so
            they hold up on a 5K display and an OLED phone alike. Download any
            of them free, or open one in the studio and make it yours.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {(["blobs", "stripes", "clouds"] as const).map((style) => (
              <Link
                key={style}
                href={`/wallpapers/style/${style}`}
                className="rounded-full border border-neutral-200 px-3 py-1 hover:border-neutral-900"
              >
                {STYLE_LABELS[style]}
              </Link>
            ))}
            <span className="mx-1 self-center text-neutral-300">·</span>
            {WALLPAPER_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/wallpapers/color/${tag}`}
                className="rounded-full border border-neutral-200 px-3 py-1 capitalize hover:border-neutral-900"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        <WallpaperGrid presets={GALLERY} priority />

        <section className="mt-16 grid gap-8 md:grid-cols-3">
          {WALLPAPER_SIZES.map((size) => (
            <div key={size.id}>
              <h2 className="text-sm font-medium">{size.label}</h2>
              <p className="mt-1 font-azeret text-xs tabular-nums text-neutral-500">
                {`${size.width} × ${size.height}`}
              </p>
              <p className="mt-2 text-sm text-neutral-600">{size.device}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 max-w-2xl space-y-4 text-neutral-600">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Why these look better than a flat gradient
          </h2>
          <p>
            Most gradient wallpapers are a smooth blur exported once and
            resized for every screen. On a 27-inch monitor the smooth part
            turns into visible bands, and on a phone the fine detail is lost.
            These are rendered separately for each size from the same scene,
            with grain drawn in at the final resolution, so the texture is
            real at 100 percent and the colours never band.
          </p>
          <p>
            The three styles behave differently. Blobs are soft overlapping
            fields, the classic mesh look. Stripes are flowing fibres with a
            sheen, which read as silk or aurora depending on the palette.
            Clouds are billowing volumes with depth, best in dark palettes.
            Pick by mood first, then by the screen it is going on.
          </p>
          <p>
            If none of the twelve is quite right, every page has a Customise
            button. It opens the same palette in the studio, where you can
            change any colour, the blur, the grain and the texture, then export
            at 4K. Five exports a month are free.
          </p>
          <div className="pt-2">
            <Button asChild>
              <TrackedLink href="/app" location="wallpapers_cta">
                Open the studio
              </TrackedLink>
            </Button>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <dl className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="text-sm font-medium">{f.q}</dt>
                <dd className="mt-2 text-sm text-neutral-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
