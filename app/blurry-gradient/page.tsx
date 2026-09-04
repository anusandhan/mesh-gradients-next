import StyleLanding, {
  styleLandingMetadata,
  type StyleLandingContent,
} from "@/components/landing/StyleLanding";
import { GALLERY, buildStudioUrl } from "@/lib/gallery";

const cloud = GALLERY.find((p) => p.slug === "blue-sky")!;

const content: StyleLandingContent = {
  path: "/blurry-gradient",
  title: "Blurry Gradient Background Generator",
  tagline:
    "Soft, out-of-focus gradient backgrounds for heroes, wallpapers and slides. Dial the blur, keep a touch of grain so nothing bands, export at 4K.",
  description:
    "Free blurry gradient generator. Soft, blurred colour fields with optional grain, three styles, 4K export with no watermark.",
  studioHref: buildStudioUrl({
    style: "clouds",
    background: cloud.background,
    colors: cloud.colors,
    seed: cloud.seed,
    blur: 900,
    grain: 0.1,
    name: "Blurry",
  }),
  cta: "Make a blurry gradient",
  presetsHeading: "Blurry gradients to start from",
  presets: GALLERY.filter((p) => ["blue-sky", "peach-fuzz", "lavender-haze", "storm", "ice-fibre", "silk-rose", "sunset", "ember"].includes(p.slug)),
  sections: [
    {
      heading: "What makes a blurry gradient work",
      body: "A blurry gradient is a few colour fields blurred until their edges disappear. The trick is keeping some structure: a light source, a darker corner, a shape you can almost read. Blur everything evenly and you get a flat wash; blur a composition and you get depth.",
    },
    {
      heading: "Blur without banding",
      body: "Heavy blur creates long, slow colour transitions, which is exactly where 8-bit screens band. A small amount of grain, around 10 percent, breaks the bands without reading as texture. It is on by default here for that reason.",
    },
    {
      heading: "Blobs or clouds",
      body: "Blobs give the classic blurred-circles look: a few glowing fields on a background. Clouds add billowing volume and wispy edges, which reads as sky or smoke. Both share the same blur, grain, contrast and saturation controls.",
    },
    {
      heading: "Where it is used",
      body: "Website hero backgrounds behind a headline, app onboarding screens, slide decks, Zoom backgrounds, and phone wallpapers where a busy image would fight the icons.",
    },
  ],
  faqs: [
    {
      q: "How much blur should I use?",
      a: "For a hero background, 600 to 800 on the blur dial keeps some shape behind the text. For a wallpaper, 800 to 1000 gives a calmer, more even field. Watch the preview at the size it will be used.",
    },
    {
      q: "Why does my blurry gradient look striped?",
      a: "That is banding, and it shows most in dark palettes with slow transitions. Nudge the Grain dial to 10 or 15 percent and the stripes disappear.",
    },
    {
      q: "Can I use these commercially?",
      a: "Yes. Everything you export, on any plan, is yours for personal and client work.",
    },
    {
      q: "What sizes can I export?",
      a: "Landscape exports are 3840 pixels wide and portrait ones 2160 pixels tall, in nine aspect ratios from 16:9 desktop to 9:16 phone, 1.91:1 social cards and 5:2 Notion covers.",
    },
  ],
};

export const metadata = styleLandingMetadata(content);

export default function BlurryGradientPage() {
  return <StyleLanding content={content} />;
}
