// Runtime-agnostic mesh gradient renderer. Runs in the browser (preview)
// and in Node via @napi-rs/canvas (server-side 4K export) — callers inject
// a canvas factory instead of the module touching `document`. Server code
// casts its canvas/context to the DOM types; @napi-rs/canvas is
// API-compatible for everything used here.

// Function to validate and normalize hex color
export const normalizeHexColor = (hex: string): string => {
  // Remove # if present
  let cleanHex = hex.replace("#", "");

  // If it's a valid 3-digit hex, convert to 6-digit
  if (/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // If it's not a valid 6-digit hex, return a default color
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return "#000000"; // Default to black if invalid
  }

  return "#" + cleanHex;
};

// Function to convert hex color to rgba
export const hexToRgba = (hex: string, alpha: number = 1) => {
  const normalizedHex = normalizeHexColor(hex);
  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Seeded PRNG (mulberry32) so the preview and the full-res export
// draw the exact same gradient for a given seed
export const mulberry32 = (seed: number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type CreateCanvas = (
  width: number,
  height: number
) => HTMLCanvasElement;

// Approximate a heavy Gaussian blur by downscaling the canvas in halving
// steps and scaling back up with bilinear smoothing. Unlike ctx.filter
// (which iOS Safari < 18 silently ignores), drawImage resampling works in
// every browser and in Node — and is faster than filter-based blur at
// these radii.
const applyBlur = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
  createCanvas: CreateCanvas
) => {
  if (radius < 1) return;
  const steps = Math.max(
    1,
    Math.min(8, Math.round(Math.log2(Math.max(2, radius / 2))))
  );

  const levels: HTMLCanvasElement[] = [];
  let src: HTMLCanvasElement = ctx.canvas as HTMLCanvasElement;
  let w = width;
  let h = height;
  for (let i = 0; i < steps; i++) {
    w = Math.max(1, Math.round(w / 2));
    h = Math.max(1, Math.round(h / 2));
    const level = createCanvas(w, h);
    const levelCtx = level.getContext("2d")!;
    levelCtx.imageSmoothingEnabled = true;
    levelCtx.imageSmoothingQuality = "high";
    levelCtx.drawImage(src, 0, 0, w, h);
    levels.push(level);
    src = level;
  }
  // Upscale back through the intermediate sizes to keep the result smooth
  for (let i = levels.length - 2; i >= 0; i--) {
    const levelCtx = levels[i].getContext("2d")!;
    levelCtx.imageSmoothingEnabled = true;
    levelCtx.imageSmoothingQuality = "high";
    levelCtx.drawImage(src, 0, 0, levels[i].width, levels[i].height);
    src = levels[i];
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
};

// Contrast, saturation, and film-grain noise in one per-pixel pass,
// matching the CSS filter definitions of contrast() and saturate()
const applyAdjustments = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contrast: number,
  saturation: number,
  noise: number
) => {
  const contrastK = contrast / 100;
  const saturationK = saturation / 100;
  if (contrastK === 1 && saturationK === 1 && noise <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = (data[i] - 128) * contrastK + 128;
    let g = (data[i + 1] - 128) * contrastK + 128;
    let b = (data[i + 2] - 128) * contrastK + 128;

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = luma + (r - luma) * saturationK;
    g = luma + (g - luma) * saturationK;
    b = luma + (b - luma) * saturationK;

    const grain = noise > 0 ? Math.random() * 255 * noise : 0;
    data[i] = r + grain;
    data[i + 1] = g + grain;
    data[i + 2] = b + grain;
  }
  ctx.putImageData(imageData, 0, 0);
};

export type RenderOptions = {
  backgroundColor: string;
  colors: string[];
  blur: number; // defined relative to export resolution
  noise: number;
  contrast: number;
  saturation: number;
  seed: number;
  placement: "center" | "random";
  blurScale: number; // rendered width / export width, 1 when exporting
  createCanvas: CreateCanvas; // scratch canvases for the blur pyramid
};

export const renderGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions
) => {
  const random = mulberry32(opts.seed);
  const blur = opts.blur * opts.blurScale;

  ctx.fillStyle = normalizeHexColor(opts.backgroundColor);
  ctx.fillRect(0, 0, width, height);

  opts.colors.forEach((color) => {
    const normalizedColor = normalizeHexColor(color);

    const scaleFactor = 1.2;
    const x = opts.placement === "center" ? width / 2 : random() * width;
    const y = opts.placement === "center" ? height / 2 : random() * height;
    const endRadius =
      opts.placement === "center"
        ? Math.max(width, height) * scaleFactor
        : (random() * scaleFactor + scaleFactor) * Math.min(width, height);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, endRadius);
    gradient.addColorStop(0, normalizedColor);
    gradient.addColorStop(0.8, hexToRgba(normalizedColor, 0.2));
    gradient.addColorStop(1, hexToRgba(normalizedColor, 0));
    ctx.fillStyle = gradient;

    // Create an irregular blob (direct path calls, not Path2D — Node has
    // no Path2D global)
    const numPoints = 5 + Math.floor(random() * 5);
    const points = [];

    // Generate random points around the center (x, y)
    for (let i = 0; i < numPoints; i++) {
      const angle = random() * Math.PI * 2;
      const radiusVariance = 0.3 + random() * 0.7;
      const pointRadius = endRadius * radiusVariance;
      points.push({
        x: x + pointRadius * Math.cos(angle),
        y: y + pointRadius * Math.sin(angle),
      });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Draw the blob using Bezier curves
    for (let i = 0; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length;
      const nextPoint = points[nextIndex];
      const cp1 = {
        x: (points[i].x + nextPoint.x) / 2,
        y: (points[i].y + nextPoint.y) / 2,
      };
      const cp2 = {
        x: cp1.x + (random() - 0.5) * endRadius,
        y: cp1.y + (random() - 0.5) * endRadius,
      };
      ctx.quadraticCurveTo(cp2.x, cp2.y, nextPoint.x, nextPoint.y);
    }

    ctx.closePath();
    ctx.fill();
  });

  // Post-process without ctx.filter (unsupported on iOS Safari < 18).
  // 1.12 folds the original chained blur(B) + blur(B/2) into one pass.
  applyBlur(ctx, width, height, blur * 1.12, opts.createCanvas);
  applyAdjustments(
    ctx,
    width,
    height,
    opts.contrast,
    opts.saturation,
    opts.noise
  );
};
