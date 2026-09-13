import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const base = GALLERY.find((p) => p.slug === "sunset") ?? GALLERY[0];

const content: StyleLandingContent = {
  path: "/pixel-gradient",
  title: "Pixel Gradient Generator",
  tagline:
    "Turn any gradient into a grid of crisp pixel cells. Set the cell size and density, keep the grain, and export a 4K pixel-art background for a launch video, hero or game-style poster.",
  description:
    "Free pixel gradient generator. Pixelate blobs, stripes or clouds gradients with a cell size dial, keep real grain, export 4K with no watermark.",
  studioHref: buildStudioUrl({
    style: base.style,
    background: base.background,
    colors: base.colors,
    seed: base.seed,
    effect: "pixel",
    name: "Pixel",
  }),
  cta: "Make a pixel gradient",
  presetsHeading: "Palettes that pixelate well",
  presets: GALLERY.filter((p) =>
    ["sunset", "ember", "midnight", "solar", "aurora", "deep-sea", "storm", "blue-sky"].includes(p.slug)
  ),
  sections: [
    {
      heading: "What a pixel gradient is",
      body: "A pixel gradient is a smooth color blend sampled into a grid of flat cells, so the fade reads as steps of solid color instead of a continuous blur. It is the look of early game art and of the retro launch videos and posters that modern product teams use to signal craft without looking corporate.",
    },
    {
      heading: "Why it is rendered, not resized",
      body: "Scaling an image down and back up gives you blurry, uneven cells. Here the pixel finish is applied at export resolution: every cell is exactly the size you set, edges stay hard, and the grain underneath is preserved inside each cell so the result still has texture.",
    },
    {
      heading: "How to get the look",
      body: "Pick a palette with strong contrast between the background and the accents. Set Effect to Pixel, then a cell size between 16 and 32 for a hero and 8 to 12 for a fine mosaic. Density controls how many cells keep their color versus fade to the background. Blobs give soft islands of color; stripes give diagonal bands of cells.",
    },
    {
      heading: "Where pixel gradients work",
      body: "Launch video backdrops, hero sections for games, dev tools and AI products, event posters, social cards that need to stand out in a feed of smooth gradients, and Notion covers. The 9:16 export makes a phone wallpaper from the same scene.",
    },
  ],
  faqs: [
    {
      q: "Can I control the pixel size?",
      a: "Yes. The Cell size dial sets the pixel size in export pixels, from 8 to 64. The preview shows the same cells scaled to your screen, so what you tune is what exports.",
    },
    {
      q: "Does the grain survive the pixel effect?",
      a: "Yes. Grain is rendered first and the pixel finish samples it, so each cell carries a hint of texture. Set Grain to zero for perfectly flat cells.",
    },
    {
      q: "Is this different from a pixelate filter?",
      a: "A pixelate filter averages an existing image into blocks and blurs the result. Here the gradient itself is generated at 4K and quantized into exact cells, so edges are crisp and the file has no upscaling artifacts.",
    },
    {
      q: "Can I export a pixel gradient for free?",
      a: "Yes. Free accounts get five 4K exports a month with no watermark. Pro is a single payment for unlimited exports.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function PixelGradientPage() {
  return <StyleLanding content={content} />;
}
