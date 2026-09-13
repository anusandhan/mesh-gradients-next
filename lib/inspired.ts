// "Inspired by" palettes: the colors behind product sites people already
// admire. Shared by the studio preset menu and the landing page. Names
// only, no logos, on the marketing side; the studio adds its own marks.

export type InspiredPalette = {
  name: string;
  background: string;
  colors: readonly string[];
};

export const INSPIRED_PALETTES: readonly InspiredPalette[] = [
  {
    name: "Lovable",
    background: "#1A1B1D",
    colors: ["#FE7A04", "#FE4F1A", "#F35CBE", "#7472FC"],
  },
  {
    name: "Dia",
    background: "#0358f7",
    colors: ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe"],
  },
  {
    name: "Raycast",
    background: "#07090B",
    colors: ["#CF1627", "#08243A", "#0F8B92", "#D54F63"],
  },
  {
    name: "Stripe",
    background: "#635BFF",
    colors: ["#F15372", "#FFCA3B", "#76E2FF", "#B5DAB9"],
  },
  {
    name: "Arc",
    background: "#140080",
    colors: ["#0229C9", "#FF526B", "#FF9598", "#EE4A5F"],
  },
  {
    name: "Comet",
    background: "#101013",
    colors: ["#5099A1", "#733138", "#53969F", "#C17B55"],
  },
  {
    name: "Devin",
    background: "#11131D",
    colors: ["#2A6DCE", "#1796E2", "#1DC19C", "#3FA9DD"],
  },
];
