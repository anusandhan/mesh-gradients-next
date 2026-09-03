import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MAKER_NAME, SITE_NAME } from "@/lib/site";
import TrackedLink from "./TrackedLink";

// Header and footer shared by the marketing pages (/, /about, /contact).

export const Wordmark = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="/gs-logo.png"
      alt=""
      width={915}
      height={562}
      className="block h-auto w-9"
      priority
    />
    <span className="text-base font-medium text-neutral-900">{SITE_NAME}</span>
  </Link>
);

export const SiteHeader = () => (
  <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
    <Wordmark />
    <nav className="flex items-center gap-1 sm:gap-2">
      <Button asChild variant="ghost" className="hidden sm:inline-flex">
        <Link href="/#gallery">Gallery</Link>
      </Button>
      <Button asChild variant="ghost" className="hidden sm:inline-flex">
        <Link href="/#pricing">Pricing</Link>
      </Button>
      <Button asChild>
        <TrackedLink href="/app" location="header">
          Open the studio
        </TrackedLink>
      </Button>
    </nav>
  </header>
);

export const SiteFooter = () => (
  <footer className="border-t border-neutral-200">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-neutral-500 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Wordmark />
        <p className="mt-3 max-w-xs">
          Mesh gradients with real grain. Made by {MAKER_NAME}.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-3">
        <Link href="/app" className="hover:text-neutral-900">Studio</Link>
        <Link href="/#gallery" className="hover:text-neutral-900">Gallery</Link>
        <Link href="/#pricing" className="hover:text-neutral-900">Pricing</Link>
        <Link href="/#faq" className="hover:text-neutral-900">FAQ</Link>
        <Link href="/about" className="hover:text-neutral-900">About</Link>
        <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
      </div>
    </div>
    <div className="mx-auto w-full max-w-6xl px-6 pb-8 text-xs text-neutral-400">
      {`© ${new Date().getFullYear()} ${SITE_NAME}. Exports are yours to use in personal and commercial work.`}
    </div>
  </footer>
);
