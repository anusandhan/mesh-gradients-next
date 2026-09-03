import type { Metadata } from "next";
import { Inter, Azeret_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AnalyticsBootstrap from "@/components/analytics/AnalyticsBootstrap";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
// Numeric color channels (Figma spec: Azeret Mono 400, 12px)
const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-azeret-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gradients.studio"),
  title: {
    default: "Gradients Studio",
    template: "%s · Gradients Studio",
  },
  description:
    "Create beautiful, customizable mesh gradients for wallpapers, backgrounds, and designs",
  openGraph: {
    siteName: "Gradients Studio",
    type: "website",
    images: [{ url: "/landing/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} ${azeretMono.variable} antialiased`}>
          <AnalyticsBootstrap />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
