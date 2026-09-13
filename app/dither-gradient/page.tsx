import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const base = GALLERY.find((p) => p.slug === "midnight") ?? GALLERY[0];

const content: StyleLandingContent = {
  path: "/dither-gradient",
  title: "Dither Gradient Generator",
  tagline:
    "Make dithered gradients with an ordered dot pattern rendered at 4K. The finish behind current product sites and launch posts: a gradient that reads as texture, not as a blur.",
  description:
    "Free dither gradient generator. Ordered dither with dot, bar, cross and ring shapes, a density dial, three gradient styles, 4K export with no watermark.",
  studioHref: buildStudioUrl({
    style: base.style,
    background: base.background,
    colors: base.colors,
    seed: base.seed,
    effect: "dither",
    name: "Dither",
  }),
  cta: "Make a dithered gradient",
  presetsHeading: "Palettes that dither well",
  presets: GALLERY.filter((p) =>
    ["midnight", "deep-sea", "storm", "ember", "aurora", "silk-rose", "sunset", "ice-fiber"].includes(p.slug)
  ),
  sections: [
    {
      heading: "What a dithered gradient is",
      body: "Dithering draws a gradient with a pattern of dots instead of continuous tones: dense where the color is strong, sparse where it fades. Screens and printers have used it for decades to fake more colors than they had. Today it is a deliberate finish, the texture on the marketing sites of AI startups, dev tools and design tools.",
    },
    {
      heading: "Ordered dither, four shapes",
      body: "The finish uses an ordered Bayer pattern, so the dots line up in a clean grid rather than random noise. Choose dots, bars, crosses or rings, set the cell size, and use Density to decide how much of the gradient survives as solid color. Grain underneath keeps the flat areas from looking plastic.",
    },
    {
      heading: "How to get the look",
      body: "Start from a dark background with one or two bright accents; dither reads best when there is somewhere for the dots to fade into. Set Effect to Dither, cell size 12 to 24 for a hero, density around the middle. For a social card, go coarser so the pattern is visible at feed size.",
    },
    {
      heading: "Where dithered gradients work",
      body: "Website heroes and section backgrounds, OG images and launch posts, deck covers, app onboarding screens, and print, where an ordered pattern holds up on paper better than a smooth blur. Export at 1.91:1 for link previews and 4:5 for a LinkedIn portrait post.",
    },
  ],
  faqs: [
    {
      q: "Is this the same as adding noise?",
      a: "No. Noise is random and scatters everywhere at the same strength. Dither is structured: the pattern follows the gradient, so bright areas stay solid and only the transitions break into dots. Use Grain for noise, Dither for pattern, or both.",
    },
    {
      q: "Can I change the dot shape?",
      a: "Yes. The dither finish offers dot, bar, cross and ring cells. Bars read as a scanline texture, rings as a halftone print.",
    },
    {
      q: "Will the pattern survive compression?",
      a: "Yes. The dither is rendered into the 4K JPEG at high quality, so the pattern stays crisp on the web and in Figma. For the sharpest result keep the cell size at 12 or above.",
    },
    {
      q: "Can I export a dithered gradient for free?",
      a: "Yes. Free accounts get five 4K exports a month with no watermark. Pro is a single payment for unlimited exports.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function DitherGradientPage() {
  return <StyleLanding content={content} />;
}
