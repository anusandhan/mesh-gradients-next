import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";

// Shared shell for the legal pages: one column, readable measure, dated.
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated {updated}</p>
        <p className="mt-6 text-neutral-700">{intro}</p>
        <div className="mt-8 space-y-8 text-neutral-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-neutral-900 [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
