import type { Metadata } from "next";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${SITE_NAME} for support, refunds and licensing questions.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <div className="mt-6 space-y-4 text-neutral-700">
          <p>
            Email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-neutral-900 underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            for support, refunds, licensing questions or anything else. One
            person reads it, usually within a day.
          </p>
          <p>
            For a refund, include the email address you paid with. Passes are
            refunded in full within 14 days if you have not exported anything
            yet.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
