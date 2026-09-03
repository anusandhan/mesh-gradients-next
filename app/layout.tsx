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
  title: "Gradients Studio",
  description:
    "Create beautiful, customizable mesh gradients for wallpapers, backgrounds, and designs",
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
