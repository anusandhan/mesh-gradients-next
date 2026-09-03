import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "The Gradients Studio editor. Blobs, stripes and clouds with grain, blur and colour controls. Export at 4K.",
  alternates: { canonical: "/app" },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
