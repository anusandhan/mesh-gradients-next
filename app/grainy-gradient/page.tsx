import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const content: StyleLandingContent = {
  path: "/grainy-gradient",
  title: "Grainy Gradient Generator",
  tagline:
    "Make grainy gradients with real film grain, not a noise layer pasted on top. Blobs, stripes or clouds, tuned with a grain dial, exported at 4K with no watermark.",
  description:
    "Free grainy gradient generator. Real grain rendered into the image, three styles, 4K export with no watermark. Fixes banding in dark gradients.",
  studioHref: buildStudioUrl({
    style: "blobs",
    background: GALLERY[0].background,
    colors: GALLERY[0].colors,
    seed: GALLERY[0].seed,
    grain: 0.45,
    name: "Grainy",
  }),
  cta: "Make a grainy gradient",
  presetsHeading: "Grainy gradients to start from",
  presets: GALLERY.filter((p) => ["ember", "deep-sea", "midnight", "storm", "sunset", "aurora", "solar", "peach-fuzz"].includes(p.slug)),
  sections: [
    {
      heading: "What a grainy gradient is",
      body: "A grainy gradient is a soft colour blend with fine, film-like texture drawn over it. The grain does two jobs: it gives a flat gradient a tactile, printed feel, and it breaks up the colour bands that smooth gradients show on large screens and in dark palettes.",
    },
    {
      heading: "Why rendered grain beats a noise layer",
      body: "The usual recipe is a noise layer set to overlay in Photoshop or a CSS noise filter. Both sit on top of the image and turn to mush when the file is compressed or scaled. Here the grain is drawn at export resolution, so it survives JPEG compression, resizing and print.",
    },
    {
      heading: "How to get the look",
      body: "Pick a palette, set the Grain dial between 25 and 50 percent, and keep Blur high so the colours melt into each other. Dark backgrounds with two or three bright accents show grain best. Contrast at 120 to 140 percent lifts the texture without crushing the shadows.",
    },
    {
      heading: "Where grainy gradients work",
      body: "Website heroes and OG images in the Linear and Stripe style, wallpapers for OLED phones and Mac displays, slide backgrounds, album and podcast art, and print, where grain hides the banding that a smooth gradient would otherwise show at 300 dpi.",
    },
  ],
  faqs: [
    {
      q: "How do I fix banding in a gradient?",
      a: "Add grain. Banding appears when a smooth gradient has too few colour steps for the screen. Grain scatters the boundary between steps so the eye reads texture instead of stripes. The Grain dial here renders it into the image at full size.",
    },
    {
      q: "Is the grain the same in the preview and the export?",
      a: "The preview shows grain at screen scale; the export renders it fresh at 4K, so the texture is fine and even rather than an upscaled copy of the preview.",
    },
    {
      q: "Can I export a grainy gradient for free?",
      a: "Yes. Free accounts get five 4K exports a month with no watermark. Pro is a single payment for unlimited exports.",
    },
    {
      q: "Does grain increase the file size?",
      a: "A little. Grain is fine detail, so JPEGs land around two megabytes at 4K instead of a few hundred kilobytes. That is the trade for texture that holds up at full size.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function GrainyGradientPage() {
  return <StyleLanding content={content} />;
}
