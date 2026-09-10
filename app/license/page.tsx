import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "License",
  description: `What you may do with gradients and wallpapers from ${SITE_NAME}.`,
  alternates: { canonical: "/license" },
};

const UPDATED = "September 10, 2026";

export default function LicensePage() {
  return (
    <LegalPage
      title="License"
      updated={UPDATED}
      intro="Short version: anything you export or download from Gradients Studio is yours to use, personally or commercially, without credit. Here is the long version."
    >
      <section>
        <h2>What is covered</h2>
        <p>
          Images you export from the editor on any plan, and the free
          wallpapers downloaded from this site.
        </p>
      </section>

      <section>
        <h2>What you may do</h2>
        <ul>
          <li>Use them in personal and client work, in products you sell, in
            print, on screen, in video and in apps.</li>
          <li>Modify them, combine them with other work, and use them as
            backgrounds, textures or source material.</li>
          <li>Use them without attribution. Credit is welcome, never
            required.</li>
        </ul>
      </section>

      <section>
        <h2>What you may not do</h2>
        <ul>
          <li>Sell or redistribute the images on their own, for example as a
            wallpaper pack, a stock asset or a template where the image is the
            product.</li>
          <li>Claim the images are made by anyone other than you, or use them
            to imply {SITE_NAME} endorses your work.</li>
          <li>Use them in anything unlawful, deceptive or hateful.</li>
        </ul>
      </section>

      <section>
        <h2>Palettes and presets</h2>
        <p>
          The named palettes in the collection are ours, but the images you
          make from them are yours under the terms above. Other people can
          make images from the same palette; that does not affect your rights
          in yours.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          If a use is not clearly covered, ask at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. The answer
          is usually yes.
        </p>
      </section>
    </LegalPage>
  );
}
