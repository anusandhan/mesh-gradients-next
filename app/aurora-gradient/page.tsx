import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const aurora = GALLERY.find((p) => p.slug === "aurora")!;

const content: StyleLandingContent = {
  path: "/aurora-gradient",
  title: "Aurora Gradient Generator",
  tagline:
    "Northern-lights gradients: flowing green, blue and violet fibres on a night sky, with real grain. Tune the waviness and sheen, export at 4K.",
  description:
    "Free aurora gradient generator. Flowing northern-lights bands in green, blue and violet with real grain, 4K export with no watermark.",
  studioHref: buildStudioUrl({
    style: "stripes",
    background: aurora.background,
    colors: aurora.colors,
    seed: aurora.seed,
    name: "Aurora",
  }),
  cta: "Make an aurora gradient",
  presetsHeading: "Aurora and night-sky gradients",
  presets: GALLERY.filter((p) => ["aurora", "deep-sea", "midnight", "ice-fibre", "lavender-haze", "storm"].includes(p.slug)),
  sections: [
    {
      heading: "What an aurora gradient is",
      body: "An aurora gradient mimics the northern lights: ribbons of green and cyan fading into violet, draped diagonally across a dark sky. The fibres have direction and a faint shimmer, which a plain radial gradient never gets right.",
    },
    {
      heading: "How the stripes style makes it",
      body: "The Stripes style draws thousands of fine fibres along a shared wave, melts them with blur and adds light and dark folds for sheen. Set Waviness high for curtains, lower for calm bands, and use Sheen to control how much the folds glow.",
    },
    {
      heading: "Picking aurora colours",
      body: "Start from a near-black navy background. Use one mint or green, one electric blue and one violet, and let the fourth colour be a bright cyan for the highlights. Keep saturation near 110 percent so the greens stay luminous without turning neon.",
    },
    {
      heading: "Where it is used",
      body: "Dark-mode website heroes, OLED phone wallpapers, event and music artwork, and slide backgrounds for anything that wants to feel nocturnal and a little cinematic.",
    },
  ],
  faqs: [
    {
      q: "Can I make the aurora animated?",
      a: "Not yet. The studio exports still images. For a live page, use the export as a background and add subtle CSS motion on top.",
    },
    {
      q: "Why does the aurora look kinked or jagged?",
      a: "It should not. Fibres are drawn as true curves and the blur is defined against the 4K export, so lines stay smooth at every size. If a preview looks rough, the export will still be clean.",
    },
    {
      q: "Is the export free?",
      a: "Yes. Free accounts get five 4K exports a month, no watermark. Pro is a single payment for unlimited exports.",
    },
    {
      q: "Can I use it as a wallpaper?",
      a: "Yes. Pick Mac 16:10, Desktop 16:9 or Phone 9:16 in the size menu before exporting, or download the ready-made Aurora wallpaper from the wallpapers page.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function AuroraGradientPage() {
  return <StyleLanding content={content} />;
}
