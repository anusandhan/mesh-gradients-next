import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const base = GALLERY.find((p) => p.slug === "ember") ?? GALLERY[0];

const content: StyleLandingContent = {
  path: "/gradient-background",
  title: "Gradient Background Generator",
  tagline:
    "Make gradient backgrounds for websites, launch posts, decks and app screens. Three styles, real grain, pixel and dither finishes, exported at 4K with no watermark and ready to drop into Figma.",
  description:
    "Free gradient background generator for websites, social posts, slides and apps. Mesh, stripes and clouds styles with real grain, 4K export, no watermark.",
  studioHref: buildStudioUrl({
    style: base.style,
    background: base.background,
    colors: base.colors,
    seed: base.seed,
    grain: 0.25,
    name: base.name,
  }),
  cta: "Make a background",
  presetsHeading: "Backgrounds to start from",
  presets: GALLERY.filter((p) =>
    ["ember", "lavender-haze", "deep-sea", "aurora", "silk-rose", "midnight", "peach-fuzz", "blue-sky"].includes(p.slug)
  ),
  sections: [
    {
      heading: "Backgrounds for product sites",
      body: "The hero backgrounds on Linear, Vercel, Raycast and most AI product sites are gradients with grain, sometimes dithered, always dark and calm enough to hold a headline. Pick a palette, keep the blur high, add grain at 20 to 40 percent, and export at 16:9 or the 1.91:1 social card size.",
    },
    {
      heading: "Backgrounds for launch posts and decks",
      body: "A launch post needs a backdrop that survives feed compression; a deck needs section breaks that do not look like a template. Export 4:5 for a LinkedIn portrait post, 1.91:1 for X and link previews, 16:9 for slides. The same scene re-exports at every size, so the set matches.",
    },
    {
      heading: "Why these do not band",
      body: "Smooth gradients show visible color steps on large monitors, especially in dark palettes. Here the grain is rendered into the image at export resolution, so the steps scatter into texture. It survives JPEG compression, scaling in Figma and print.",
    },
    {
      heading: "From the studio to Figma, Framer or code",
      body: "Export the JPG and place it as an image fill in Figma or Framer, or as a background image on the web. Keep the studio link so you can reopen the exact gradient and re-export at another size later. A CSS gradient is fine for flat fades; for the grainy, dithered look you need an image.",
    },
  ],
  faqs: [
    {
      q: "What size should a website background be?",
      a: "Export at 16:9, which is 3840 by 2160 pixels, and let the browser cover the hero. For a link preview or social card use 1.91:1. Both are 4K, so they stay sharp on retina screens.",
    },
    {
      q: "Can I match my brand colors?",
      a: "Yes. Set the background and up to eight accent colors by hex, or start from a palette inspired by a site you like and swap in your own. Save the palette to reuse across sizes.",
    },
    {
      q: "Is it free for commercial work?",
      a: "Yes. Every export on every plan is yours to use in client work and in products you sell, with no credit required. Free accounts get five 4K exports a month.",
    },
    {
      q: "Do you make CSS gradients?",
      a: "No. The studio makes images, because grain, pixel and dither cannot be expressed in CSS. For a plain two-color fade, a CSS gradient is the better tool.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function GradientBackgroundPage() {
  return <StyleLanding content={content} />;
}
