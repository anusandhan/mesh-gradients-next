// Turn an uploaded SVG into one path string so the overlay can stroke it in
// white at the dial's width, exactly like the built-in shapes. Pure string
// work, so it runs in the browser, the export route and tests alike.
//
// ponytail: transform attributes are ignored and <use>/<text> are dropped;
// icon sets and Figma exports bake transforms, so this covers the common
// case. Apply transforms if uploads with nested groups turn up.

export type Outline = { d: string; box: [number, number, number, number] };

const SHAPE = /<(path|rect|circle|ellipse|line|polyline|polygon)\b([^>]*?)\/?>/gi;
const ATTR = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const HIDDEN = /<(defs|clipPath|mask|symbol|pattern|marker)\b[\s\S]*?<\/\1>/gi;

const attrs = (raw: string) => {
  const map: Record<string, string> = {};
  raw.replace(ATTR, (_, name: string, dq?: string, sq?: string) => {
    map[name] = dq ?? sq ?? "";
    return "";
  });
  return map;
};
const num = (v: string | undefined, fallback = 0) => {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : fallback;
};
const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

const points = (raw: string | undefined) => {
  const nums = (raw ?? "").trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
  const pts: string[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push(`${fmt(nums[i])} ${fmt(nums[i + 1])}`);
  return pts;
};

const shapeToPath = (tag: string, a: Record<string, string>): string => {
  switch (tag) {
    case "path":
      return (a.d ?? "").trim();
    case "rect": {
      const x = num(a.x), y = num(a.y), w = num(a.width), h = num(a.height);
      const rx = Math.min(num(a.rx, num(a.ry)), w / 2);
      const ry = Math.min(num(a.ry, num(a.rx)), h / 2);
      if (!rx && !ry) return `M${fmt(x)} ${fmt(y)}h${fmt(w)}v${fmt(h)}h${fmt(-w)}z`;
      return (
        `M${fmt(x + rx)} ${fmt(y)}h${fmt(w - 2 * rx)}a${fmt(rx)} ${fmt(ry)} 0 0 1 ${fmt(rx)} ${fmt(ry)}` +
        `v${fmt(h - 2 * ry)}a${fmt(rx)} ${fmt(ry)} 0 0 1 ${fmt(-rx)} ${fmt(ry)}` +
        `h${fmt(2 * rx - w)}a${fmt(rx)} ${fmt(ry)} 0 0 1 ${fmt(-rx)} ${fmt(-ry)}` +
        `v${fmt(2 * ry - h)}a${fmt(rx)} ${fmt(ry)} 0 0 1 ${fmt(rx)} ${fmt(-ry)}z`
      );
    }
    case "circle":
    case "ellipse": {
      const cx = num(a.cx), cy = num(a.cy);
      const rx = tag === "circle" ? num(a.r) : num(a.rx);
      const ry = tag === "circle" ? num(a.r) : num(a.ry);
      if (!rx || !ry) return "";
      return `M${fmt(cx - rx)} ${fmt(cy)}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(2 * rx)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-2 * rx)} 0z`;
    }
    case "line":
      return `M${fmt(num(a.x1))} ${fmt(num(a.y1))}L${fmt(num(a.x2))} ${fmt(num(a.y2))}`;
    case "polyline":
    case "polygon": {
      const pts = points(a.points);
      if (pts.length < 2) return "";
      return `M${pts[0]}L${pts.slice(1).join("L")}${tag === "polygon" ? "z" : ""}`;
    }
    default:
      return "";
  }
};

export const svgToOutline = (svg: string): Outline => {
  const root = /<svg\b([^>]*)>/i.exec(svg);
  if (!root) throw new Error("That file isn't an SVG");
  const a = attrs(root[1]);
  const vb = (a.viewBox ?? "").trim().split(/[\s,]+/).map(Number);
  let box: Outline["box"];
  if (vb.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0) {
    box = [vb[0], vb[1], vb[2], vb[3]];
  } else if (num(a.width) > 0 && num(a.height) > 0) {
    box = [0, 0, num(a.width), num(a.height)];
  } else {
    throw new Error("SVG needs a viewBox or width and height");
  }
  const visible = svg.replace(HIDDEN, "");
  const parts: string[] = [];
  visible.replace(SHAPE, (_, tag: string, rest: string) => {
    const d = shapeToPath(tag.toLowerCase(), attrs(rest));
    if (d) parts.push(d);
    return "";
  });
  if (!parts.length) throw new Error("No shapes found to outline");
  return { d: parts.join(" "), box };
};

// Path data that a Path2D constructor will accept; anything else is refused
export const PATH_DATA = /^[MmZzLlHhVvCcSsQqTtAa0-9eE.,\s+-]+$/;
