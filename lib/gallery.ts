import type { GradientStyle } from "./gradient-renderer";

// The collection: twelve named palettes, four per style, shown on the
// landing page, offered in the studio's preset menu and (later) served at
// /gradients/[slug]. Names describe the result, not a reference, so they
// read the same to a designer and to someone hunting for a wallpaper.
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
  // Colour words for the wallpaper tag pages (/wallpapers/color/[tag])
  tags: string[];
};

export const GALLERY: GalleryPreset[] = [
  // Blobs: soft overlapping fields
  {
    slug: "ember",
    name: "Ember",
    style: "blobs",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
    seed: 42,
    mood: "orange, pink and violet glowing on near-black",
    tags: ["dark", "orange", "pink", "purple"],
  },
  {
    slug: "peach-fuzz",
    name: "Peach Fuzz",
    style: "blobs",
    background: "#FFF1E6",
    colors: ["#FFB68A", "#FF8E57", "#FFC099", "#F7D6E0"],
    seed: 5,
    mood: "soft peach and blush pastels",
    tags: ["light", "peach", "pastel"],
  },
  {
    slug: "lavender-haze",
    name: "Lavender Haze",
    style: "blobs",
    background: "#E9E2FF",
    colors: ["#A78BFA", "#7C3AED", "#F0ABFC", "#818CF8"],
    seed: 8,
    mood: "lilac, violet and periwinkle mist",
    tags: ["light", "purple", "pastel"],
  },
  {
    slug: "deep-sea",
    name: "Deep Sea",
    style: "blobs",
    background: "#062A3F",
    colors: ["#0E5A8A", "#1B8FBF", "#22D3EE", "#0B3C5D"],
    seed: 21,
    mood: "navy, ocean blue and a teal glow",
    tags: ["dark", "blue", "teal"],
  },
  // Stripes: flowing fibres with sheen
  {
    slug: "aurora",
    name: "Aurora",
    style: "stripes",
    background: "#06111F",
    colors: ["#2AF598", "#009EFD", "#7B2FF7", "#00F0FF"],
    seed: 19,
    mood: "green, blue and violet northern lights",
    tags: ["dark", "green", "blue", "purple"],
  },
  {
    slug: "solar",
    name: "Solar",
    style: "stripes",
    background: "#F8E9D2",
    colors: ["#FFB347", "#FF6B6B", "#FFD166", "#F4A261"],
    seed: 31,
    mood: "warm sunrise amber and coral",
    tags: ["light", "yellow", "orange"],
  },
  {
    slug: "silk-rose",
    name: "Silk Rose",
    style: "stripes",
    background: "#F9C5D1",
    colors: ["#F472B6", "#E11D48", "#FDA4AF", "#FB7185"],
    seed: 12,
    mood: "rose, pink and blush silk",
    tags: ["light", "pink"],
  },
  {
    slug: "ice-fibre",
    name: "Ice Fibre",
    style: "stripes",
    background: "#BAE6FD",
    colors: ["#38BDF8", "#67E8F9", "#818CF8", "#E0F2FE"],
    seed: 27,
    mood: "icy sky blue, cyan and white threads",
    tags: ["light", "blue", "cyan"],
  },
  // Clouds: billowing volumes
  {
    slug: "blue-sky",
    name: "Blue Sky",
    style: "clouds",
    background: "#2F6BE8",
    colors: ["#7FB0F5", "#DCEBFF", "#FFFFFF"],
    seed: 3,
    mood: "white cumulus on a clear blue sky",
    tags: ["blue", "white"],
  },
  {
    slug: "sunset",
    name: "Sunset",
    style: "clouds",
    background: "#2B1055",
    colors: ["#7B2A8C", "#E8506B", "#FFA24C", "#FFD6A5"],
    seed: 14,
    mood: "violet dusk into coral and gold",
    tags: ["purple", "orange", "pink"],
  },
  {
    slug: "midnight",
    name: "Midnight",
    style: "clouds",
    background: "#05070F",
    colors: ["#0F1B3D", "#1E2A5A", "#3B4A8C", "#0B0F19"],
    seed: 23,
    mood: "deep indigo night clouds",
    tags: ["dark", "blue", "black"],
  },
  {
    slug: "storm",
    name: "Storm",
    style: "clouds",
    background: "#1F2933",
    colors: ["#3E4C59", "#7B8794", "#CBD2D9", "#52606D"],
    seed: 9,
    mood: "slate and silver storm front",
    tags: ["dark", "gray"],
  },
];

export const findPreset = (slug: string) =>
  GALLERY.find((preset) => preset.slug === slug) ?? null;

export const STYLE_LABELS: Record<GradientStyle, string> = {
  blobs: "Blobs",
  stripes: "Stripes",
  clouds: "Clouds",
};

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
  grain?: number;
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
  if (state.grain !== undefined) params.set("grain", String(state.grain));
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

  const grain = Number(params.get("grain"));
  if (params.has("grain") && inRange(grain, 0, 0.8)) state.grain = grain;

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
