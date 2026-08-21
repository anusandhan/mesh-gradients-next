"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const GradientGenerator = dynamic(
  () => import("./GradientGenerator"),
  { ssr: false } // This will make sure GradientGenerator is only rendered on the client side
);

export default function Page() {
  // Suspense catches the ssr:false bailout now that ClerkProvider makes
  // the route dynamically rendered (without it the SSR stream 500s)
  return (
    <Suspense fallback={null}>
      <GradientGenerator />
    </Suspense>
  );
}
