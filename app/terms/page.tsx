import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/landing/LegalPage";
import { PLANS } from "@/lib/plans";
import { FREE_EXPORTS_PER_MONTH, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${SITE_NAME}: plans, payments, refunds and what you may do with exports.`,
  alternates: { canonical: "/terms" },
};

const UPDATED = "September 10, 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      intro={`These are the terms for using ${SITE_NAME}. They are short because the product is simple: you make gradients, you export them, and you own what you export.`}
    >
      <section>
        <h2>The service</h2>
        <p>
          {SITE_NAME} is a web app for making and exporting gradient images.
          It is provided by its maker, Anusandhan, referred to here as
          &quot;we&quot;. By using it you agree to these terms.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          The editor and the free wallpapers need no account. Exporting from
          the editor needs a signed-in account with a verified email. You are
          responsible for activity under your account. One person, one
          account; sharing an account to pool free exports is not allowed.
        </p>
      </section>

      <section>
        <h2>Plans and payment</h2>
        <ul>
          <li>
            <strong>Free:</strong> {FREE_EXPORTS_PER_MONTH} exports per
            calendar month at full resolution, and a small number of saved
            palettes.
          </li>
          <li>
            <strong>{PLANS.year.name}:</strong> ${PLANS.year.priceUsd} for{" "}
            {PLANS.year.durationLabel} of unlimited exports and more saved
            palettes.
          </li>
          <li>
            <strong>{PLANS.week.name}:</strong> ${PLANS.week.priceUsd} for{" "}
            {PLANS.week.durationLabel} of unlimited exports.
          </li>
        </ul>
        <p>
          Both paid plans are one-time payments. They never auto-renew and we
          never store your card. Buying again while a pass is active adds the
          new time on top of what is left. Payments are handled by Stripe;
          prices are in US dollars and may be shown in your local currency.
          Taxes may be added where required.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within
          14 days of buying a pass. If you have not exported anything with it,
          the pass is refunded in full. If you have, we will still talk;
          reasonable requests are honoured.
        </p>
      </section>

      <section>
        <h2>Your exports</h2>
        <p>
          Everything you export is yours, on every plan, for personal and
          commercial use, including in products you sell. The full terms are
          on the <Link href="/license">license page</Link>. You do not need to
          credit {SITE_NAME}, though we appreciate it.
        </p>
      </section>

      <section>
        <h2>Fair use</h2>
        <p>
          Do not automate exports, scrape the service, resell access, or use
          it to attack the service or anyone else. Requests are rate limited
          to keep rendering fast for everyone. Accounts that abuse the service
          may be closed.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          The service is provided as is. We aim for it to be available and
          accurate but do not promise either, and we may change features or
          prices. Active passes keep what they were sold with for their term.
          Our liability to you is limited to what you paid us in the past
          twelve months.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          What we collect and why is in the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms go to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. If these
          terms change in a way that matters, the date at the top moves.
        </p>
      </section>
    </LegalPage>
  );
}
