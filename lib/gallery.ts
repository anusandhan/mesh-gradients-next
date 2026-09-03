import type { GradientStyle } from "./gradient-renderer";

// Curated presets shown on the landing page and (later) at /gradients/[slug].
// Server/client neutral. Thumbnails are rendered by
// scripts/render-landing-images.ts into public/landing/gallery/<slug>.jpg.

export type GalleryPreset = {
  slug: string;
  name: string;
  style: GradientStyle;
  background: string;
  colors: string[];
  seed: number;
  // Short line for alt text and the preset page
  mood: string;
};

export const GALLERY: GalleryPreset[] = [
  {
    slug: "lovable",
    name: "Lovable",
    style: "blobs",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    seed: 42,
    mood: "orange, pink and violet on near-black",
  },
  {
    slug: "aurora",
    name: "Aurora",
    style: "stripes",
    background: "#06111F",
    colors: ["#2AF598", "#009EFD", "#7B2FF7", "#00F0FF"],
    seed: 19,
    mood: "green, blue and violet northern lights",
  },
  {
    slug: "peach-fuzz",
    name: "Peach Fuzz",
    style: "blobs",
    background: "#FFF1E6",
    colors: ["#FFB68A", "#FF8E57", "#FFC099", "#F7D6E0"],
    seed: 5,
    mood: "soft peach and blush pastels",
  },
  {
    slug: "raycast",
    name: "Raycast",
    style: "clouds",
    background: "#07090B",
    colors: ["#CF1627", "#08243A", "#0F8B92", "#D54F63"],
    seed: 3,
    mood: "deep red and teal smoke on black",
  },
  {
    slug: "stripe",
    name: "Stripe",
    style: "stripes",
    background: "#635BFF",
    colors: ["#F15372", "#FFCA3B", "#76E2FF", "#B5DAB9"],
    seed: 11,
    mood: "coral, yellow and sky on violet",
  },
  {
    slug: "midnight-oled",
    name: "Midnight OLED",
    style: "blobs",
    background: "#000000",
    colors: ["#1B1B3A", "#3A1B5C", "#0F3D5C", "#111111"],
    seed: 23,
    mood: "dim indigo and teal glow on pure black",
  },
  {
    slug: "dia",
    name: "Dia",
    style: "blobs",
    background: "#0358F7",
    colors: ["#C679C4", "#FA3D1D", "#FFB005", "#E1E1FE"],
    seed: 7,
    mood: "electric blue with magenta and amber",
  },
  {
    slug: "solar",
    name: "Solar",
    style: "stripes",
    background: "#F8E9D2",
    colors: ["#FFB347", "#FF6B6B", "#FFD166", "#F4A261"],
    seed: 31,
    mood: "warm sunrise amber and coral",
  },
  {
    slug: "lagoon",
    name: "Lagoon",
    style: "clouds",
    background: "#041F2B",
    colors: ["#00B4D8", "#90E0EF", "#0077B6", "#CAF0F8"],
    seed: 9,
    mood: "aqua and ice blue on deep navy",
  },
  {
    slug: "arc",
    name: "Arc",
    style: "blobs",
    background: "#140080",
    colors: ["#0229C9", "#FF526B", "#FF9598", "#EE4A5F"],
    seed: 13,
    mood: "royal blue and coral",
  },
  {
    slug: "comet",
    name: "Comet",
    style: "clouds",
    background: "#101013",
    colors: ["#5099A1", "#733138", "#53969F", "#C17B55"],
    seed: 17,
    mood: "muted teal and rust smoke",
  },
  {
    slug: "devin",
    name: "Devin",
    style: "clouds",
    background: "#11131D",
    colors: ["#2A6DCE", "#1796E2", "#1DC19C", "#3FA9DD"],
    seed: 29,
    mood: "blue and mint clouds on charcoal",
  },
];

export const findPreset = (slug: string) =>
  GALLERY.find((preset) => preset.slug === slug) ?? null;

// ---------------------------------------------------------------------------
// Deep links into the studio. The landing page (and any future SEO page)
// builds /app?… URLs; the studio parses them once on mount. Everything is
// validated on the way in so a hand-edited URL can't put the editor into a
// state the export API would reject.

const STYLES: GradientStyle[] = ["blobs", "stripes", "clouds"];
const HEX = /^#[0-9a-fA-F]{6}$/;
const BARE_HEX = /^[0-9a-fA-F]{6}$/;

export const STUDIO_ASPECT_RATIOS = [
  "16:9",
  "16:10",
  "1.91:1",
  "5:2",
  "1:1",
  "4:3",
  "9:16",
  "3:4",
  "4:5",
] as const;
export type StudioAspectRatio = (typeof STUDIO_ASPECT_RATIOS)[number];

export type StudioState = {
  style?: GradientStyle;
  background?: string;
  colors?: string[];
  seed?: number;
  noise?: number;
  blur?: number;
  aspectRatio?: StudioAspectRatio;
  name?: string;
  plan?: "year" | "week";
};

const stripHash = (hex: string) => hex.replace(/^#/, "").toUpperCase();

export const buildStudioUrl = (state: StudioState): string => {
  const params = new URLSearchParams();
  if (state.style) params.set("style", state.style);
  if (state.background) params.set("bg", stripHash(state.background));
  if (state.colors?.length) params.set("colors", state.colors.map(stripHash).join(","));
  if (state.seed !== undefined) params.set("seed", String(state.seed));
  if (state.noise !== undefined) params.set("noise", String(state.noise));
  if (state.blur !== undefined) params.set("blur", String(state.blur));
  if (state.aspectRatio) params.set("aspect", state.aspectRatio);
  if (state.name) params.set("name", state.name);
  if (state.plan) params.set("plan", state.plan);
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
};

export const presetToStudioUrl = (preset: GalleryPreset) =>
  buildStudioUrl({
    style: preset.style,
    background: preset.background,
    colors: preset.colors,
    seed: preset.seed,
    name: preset.name,
  });

const inRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

export const parseStudioParams = (search: string): StudioState => {
  const params = new URLSearchParams(search);
  const state: StudioState = {};

  const style = params.get("style");
  if (style && (STYLES as string[]).includes(style)) {
    state.style = style as GradientStyle;
  }

  const bg = params.get("bg");
  if (bg && BARE_HEX.test(bg)) state.background = `#${bg}`;

  const colors = params.get("colors");
  if (colors) {
    const list = colors.split(",").filter((c) => BARE_HEX.test(c));
    if (list.length >= 1 && list.length <= 8 && list.length === colors.split(",").length) {
      state.colors = list.map((c) => `#${c}`);
    }
  }

  const seed = Number(params.get("seed"));
  if (params.has("seed") && Number.isInteger(seed) && inRange(seed, 0, 4294967295)) {
    state.seed = seed;
  }

  const noise = Number(params.get("noise"));
  if (params.has("noise") && inRange(noise, 0, 0.8)) state.noise = noise;

  const blur = Number(params.get("blur"));
  if (params.has("blur") && inRange(blur, 0, 1000)) state.blur = blur;

  const aspect = params.get("aspect");
  if (aspect && (STUDIO_ASPECT_RATIOS as readonly string[]).includes(aspect)) {
    state.aspectRatio = aspect as StudioAspectRatio;
  }

  const name = params.get("name")?.trim();
  if (name) state.name = name.slice(0, 40);

  const plan = params.get("plan");
  if (plan === "year" || plan === "week") state.plan = plan;

  return state;
};

export const isHexColor = (value: string) => HEX.test(value);
