import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What ${SITE_NAME} collects, why, and how to get it deleted.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "September 10, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro={`${SITE_NAME} is run by one person and collects as little as it can. This page says exactly what is collected, which services handle it, and how to have it removed.`}
    >
      <section>
        <h2>What is collected</h2>
        <ul>
          <li>
            <strong>Account.</strong> If you sign in, your email address and a
            user ID, handled by Clerk. Sign-in is only needed to export; the
            editor and the free wallpapers work without an account.
          </li>
          <li>
            <strong>Usage.</strong> Your export count for the current month and
            the palettes you choose to save, stored in our database so the free
            tier and Pro work.
          </li>
          <li>
            <strong>Payments.</strong> Stripe processes payments. We never see
            or store your card number. We store the Stripe payment ID and the
            date your pass expires.
          </li>
          <li>
            <strong>Analytics.</strong> PostHog records page views and product
            events such as an export or an upgrade dialog opening, and may
            record session replays that show how the interface was used.
            Colors you pick and images you export are not sent to analytics.
          </li>
          <li>
            <strong>Exports.</strong> Gradients are rendered on our server and
            sent straight back to you. They are not kept.
          </li>
          <li>
            <strong>Server logs.</strong> Standard request logs, including IP
            address, used for rate limiting and abuse prevention and kept
            briefly by our hosting provider.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <p>
          Clerk sets cookies to keep you signed in. PostHog sets a cookie and
          local storage entries to tell returning visits apart. There are no
          advertising cookies and no data is sold to anyone.
        </p>
      </section>

      <section>
        <h2>Who handles the data</h2>
        <ul>
          <li>Clerk, for sign-in and accounts.</li>
          <li>Stripe, for payments and receipts.</li>
          <li>PostHog, for analytics and session replay.</li>
          <li>Vercel, for hosting and request logs.</li>
          <li>Neon, for the database that stores accounts, exports and palettes.</li>
        </ul>
        <p>
          Each of these processes data under its own privacy policy and only
          as needed to run the service.
        </p>
      </section>

      <section>
        <h2>What it is used for</h2>
        <p>
          To run the editor and exports, to enforce the free-tier limit, to
          grant and honor paid passes, to send a receipt, to understand which
          parts of the product get used, and to keep the service safe from
          abuse. Nothing else. No marketing email is sent unless you ask for
          it.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            Use the editor and download the free wallpapers without an account.
          </li>
          <li>
            Block analytics with any content blocker; the product works the
            same.
          </li>
          <li>
            Ask for a copy of your data, or for your account and everything
            attached to it to be deleted, by emailing{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Deletion
            is done within 30 days and confirmed by reply.
          </li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The service is not directed at children under 13 and does not
          knowingly collect their data.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes in a way that matters, the date at the top
          moves and the change is noted here. Questions go to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
