import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MAKER_NAME, SITE_NAME } from "@/lib/site";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${SITE_NAME} exists and who makes it.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          About {SITE_NAME}
        </h1>
        <div className="mt-6 space-y-4 text-neutral-700">
          <p>
            Most gradient generators make the same soft blur. It looks fine on
            a phone and falls apart on a 4K monitor: colour bands, muddy
            centres, and a texture that a designer can spot from across the
            room. {SITE_NAME} started as a fix for that.
          </p>
          <p>
            The renderer draws real grain into the image instead of pasting a
            noise layer on top, so the export holds up at full size and in
            print. The three styles, blobs, stripes and clouds, each have their
            own dials, but colour, blur, contrast and saturation work the same
            way everywhere. Everything you see in the editor is what you get
            in the file.
          </p>
          <p>
            It is made by {MAKER_NAME}, one person, and priced to match: a
            free tier that is genuinely useful, and a pass you pay for once.
            No subscription, because a tool you use in bursts should not bill
            you every month.
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/app">Open the studio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
