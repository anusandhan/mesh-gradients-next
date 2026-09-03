"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

const GradientGenerator = dynamic(
  () => import("../GradientGenerator"),
  { ssr: false } // This will make sure GradientGenerator is only rendered on the client side
);

export default function Page() {
  // Suspense catches the ssr:false bailout now that ClerkProvider makes
  // the route dynamically rendered (without it the SSR stream 500s)
  return (
    <>
      {/* Crawlable summary for a client-only route; visually hidden */}
      <div className="sr-only">
        <h1>Gradients Studio editor</h1>
        <p>
          Make mesh gradients in three styles, blobs, stripes and clouds, with
          grain, blur, contrast and saturation controls, then export at 4K.
          Free accounts get five exports a month.
        </p>
        <Link href="/">About Gradients Studio and pricing</Link>
      </div>
      <Suspense fallback={null}>
        <GradientGenerator />
      </Suspense>
    </>
  );
}
