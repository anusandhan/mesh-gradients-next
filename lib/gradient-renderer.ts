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
  // The pyramid can only halve in whole steps, and at these radii it bottoms
  // out at a handful of pixels, so integer level sizes can't express small
  // radius changes. Strength is made continuous by blending the results of
  // the two neighbouring step counts by the fractional part: every slider
  // value renders differently, and the look changes smoothly through the
  // range instead of jumping at step boundaries. The chain stops on its own
  // once a level would drop to 2px, so 4K exports no longer saturate at a
  // fixed step cap partway up the slider.
  const exact = Math.log2(Math.max(2, radius / 2));
  const fullSteps = Math.floor(exact);
  const fraction = exact - fullSteps;

  const levels: HTMLCanvasElement[] = [];
  let w = width;
  let h = height;
  let src: HTMLCanvasElement = ctx.canvas as HTMLCanvasElement;
  const wanted = fraction > 0.005 ? fullSteps + 1 : fullSteps;
  for (let i = 0; i < wanted && w > 2 && h > 2; i++) {
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
  if (levels.length === 0) return;

  // Upscale from a given level back through the intermediate sizes (which
  // keeps the result smooth), overwriting the shallower levels on the way
  const upscaleFrom = (index: number) => {
    let img = levels[index];
    for (let i = index - 1; i >= 0; i--) {
      const levelCtx = levels[i].getContext("2d")!;
      levelCtx.imageSmoothingEnabled = true;
      levelCtx.imageSmoothingQuality = "high";
      levelCtx.drawImage(img, 0, 0, levels[i].width, levels[i].height);
      img = levels[i];
    }
    return img;
  };

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Coarser result first (the deeper level, which the upscale pass below
  // would otherwise overwrite), then the finer one on top
  const fine = Math.min(fullSteps, levels.length) - 1;
  const coarse = fine + 1;
  ctx.drawImage(upscaleFrom(fine), 0, 0, width, height);
  if (coarse < levels.length) {
    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = fraction;
    ctx.drawImage(upscaleFrom(coarse), 0, 0, width, height);
    ctx.globalAlpha = previousAlpha;
  }
};

// Browser preview fast path. ctx.filter runs contrast()/saturate() on the
// GPU, and the grain is a pre-generated noise tile composited with
// "lighter" (additive, scaled by globalAlpha), which is exactly what the
// per-pixel loop below computes — without the getImageData round trip
// that dominates preview render time. Export (Node canvas) and browsers
// where ctx.filter is a no-op (iOS Safari < 18) keep the pixel loop.
const NOISE_TILE_SIZE = 1024;
let fastPathSupported: boolean | null = null;
let noiseTile: HTMLCanvasElement | null = null;

const detectFastPath = () => {
  if (fastPathSupported !== null) return fastPathSupported;
  fastPathSupported = false;
  if (typeof document === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const p = probe.getContext("2d");
    if (!p || typeof p.filter !== "string") return false;
    p.fillStyle = "#ffffff";
    p.filter = "invert(1)";
    p.fillRect(0, 0, 1, 1);
    const px = p.getImageData(0, 0, 1, 1).data;
    // A browser that ignores the filter paints white; a working one, black
    fastPathSupported = px[0] < 8 && px[3] === 255;
  } catch {
    fastPathSupported = false;
  }
  return fastPathSupported;
};

const getNoiseTile = () => {
  if (noiseTile) return noiseTile;
  const tile = document.createElement("canvas");
  tile.width = NOISE_TILE_SIZE;
  tile.height = NOISE_TILE_SIZE;
  const t = tile.getContext("2d")!;
  const img = t.createImageData(NOISE_TILE_SIZE, NOISE_TILE_SIZE);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 256) | 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  t.putImageData(img, 0, 0);
  noiseTile = tile;
  return tile;
};

const applyAdjustmentsFast = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contrastK: number,
  saturationK: number,
  noise: number
) => {
  ctx.save();
  if (contrastK !== 1 || saturationK !== 1) {
    ctx.filter = `contrast(${contrastK}) saturate(${saturationK})`;
    // Drawing a canvas onto itself snapshots the source first (HTML spec)
    ctx.drawImage(ctx.canvas, 0, 0, width, height);
    ctx.filter = "none";
  }
  if (noise > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = noise;
    ctx.fillStyle = ctx.createPattern(getNoiseTile(), "repeat")!;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
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

  if (detectFastPath()) {
    applyAdjustmentsFast(ctx, width, height, contrastK, saturationK, noise);
    return;
  }

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

export type GradientStyle = "blobs" | "stripes" | "clouds";
// Post-process finishes applied after colour and grain
export type GradientEffect = "none" | "pixel" | "dither";
export const EFFECT_SIZE_DEFAULT = 24; // cell size in export pixels
export const EFFECT_STRENGTH_DEFAULT = 1;

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
  style?: GradientStyle; // default "blobs"
  // Stripes-only dials, all 0..2 multipliers with 1 as the designed look
  fiberDensity?: number;
  waviness?: number;
  sheen?: number;
  // Clouds-only dials, all 0..2 multipliers with 1 as the designed look
  coverage?: number;
  softness?: number;
  detail?: number;
  // Finish: none, dot-matrix pixels, or palette-quantised symbol dither.
  // effectSize is the grid cell in export pixels (scaled by blurScale);
  // effectStrength is a 0..2 multiplier (dot size / symbol density).
  effect?: GradientEffect;
  effectSize?: number;
  effectStrength?: number;
};

const hexToRgbTuple = (hex: string): [number, number, number] => {
  const normalized = normalizeHexColor(hex);
  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ];
};

// Interpolate the palette (background + colors as evenly spaced stops) at
// position t in [0, 1]
const samplePalette = (
  stops: [number, number, number][],
  t: number
): [number, number, number] => {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const frac = scaled - index;
  const a = stops[index];
  const b = stops[index + 1];
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ];
};

// "Silk stripes": diagonal color bands with fine streaks along the flow
// direction, melted by blur and finished with a short directional smear.
const renderStripes = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions,
  random: () => number
) => {
  const diag = Math.hypot(width, height);
  const cx = width / 2;
  const cy = height / 2;
  // Flow direction: roughly diagonal, seeded within ±25°
  const angle = ((-40 + (random() - 0.5) * 50) * Math.PI) / 180;
  const scale = height / 2160; // stroke widths defined at export resolution

  const stops = [opts.backgroundColor, ...opts.colors].map(hexToRgbTuple);

  // Seeded shuffle: each randomize also re-deals which color sits where
  // in the band gradient
  for (let i = stops.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [stops[i], stops[j]] = [stops[j], stops[i]];
  }

  // Span the band gradient across the canvas's projection on the
  // perpendicular axis, so every palette stop (background included) is
  // actually visible on screen
  const halfSpan =
    (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) /
      2 +
    2;

  // Shared wave field: every fiber and fold follows these, so the whole
  // sheet undulates coherently like draped silk. Phase shifts with the
  // fiber's band position (t) to shear the waves into folds.
  const waves = Array.from({ length: 3 }, () => ({
    amp: (0.025 + random() * 0.045) * halfSpan * 2,
    freq: ((0.6 + random() * 1.6) * Math.PI) / diag,
    phase: random() * Math.PI * 2,
    grow: 0.3 + random() * 0.7,
  }));
  const waviness = opts.waviness ?? 1;
  const fiberDensity = opts.fiberDensity ?? 1;
  const sheen = opts.sheen ?? 0.2;

  const waveOffset = (x: number, t: number) =>
    waviness *
    waves.reduce(
      (acc, w) =>
        acc +
        w.amp *
          Math.sin(w.freq * x + w.phase + t * 5) *
          (0.35 + (w.grow * (x + diag)) / (2 * diag)),
      0
    );
  // Analytic dy/dx of waveOffset, so each fibre can be drawn as cubic
  // Hermite segments with exact tangents instead of a polyline. That is
  // what keeps the curves smooth: a polyline's corners survive the blur
  // and read as kinks, especially where several fibres share the same x.
  const waveSlope = (x: number, t: number) =>
    waviness *
    waves.reduce((acc, w) => {
      const arg = w.freq * x + w.phase + t * 5;
      const envelope = 0.35 + (w.grow * (x + diag)) / (2 * diag);
      return (
        acc +
        w.amp *
          (w.freq * Math.cos(arg) * envelope +
            (Math.sin(arg) * w.grow) / (2 * diag))
      );
    }, 0);

  // Base bands: linear gradient perpendicular to the flow
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const bands = ctx.createLinearGradient(0, -halfSpan, 0, halfSpan);
  stops.forEach((stop, i) => {
    bands.addColorStop(
      i / (stops.length - 1),
      `rgb(${stop[0]}, ${stop[1]}, ${stop[2]})`
    );
  });
  ctx.fillStyle = bands;
  ctx.fillRect(-diag, -diag, diag * 2, diag * 2);
  ctx.restore();

  // Melt the bands together before streaking
  applyBlur(
    ctx,
    width,
    height,
    opts.blur * opts.blurScale * 0.25,
    opts.createCanvas
  );

  // Fibers and folds all follow the shared wave field. Fibers sample the
  // palette near their band position with a brightness push; folds are
  // broad white/black bands whose luminance modulation gives the sheet
  // its 3D drape. Same counts at every resolution for an identical look.
  // Cubic Hermite segments: y and dy/dx are exact at every knot, so the
  // stroke is C1-smooth no matter how few knots there are.
  const SEGMENTS = 32;
  const strokeWave = (t: number, baseY: number, fan: number) => {
    const step = (2 * diag) / SEGMENTS;
    const third = step / 3;
    let x0 = -diag;
    let y0 = baseY + waveOffset(x0, t) + fan * x0;
    let m0 = waveSlope(x0, t) + fan;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let s = 1; s <= SEGMENTS; s++) {
      const x1 = -diag + step * s;
      const y1 = baseY + waveOffset(x1, t) + fan * x1;
      const m1 = waveSlope(x1, t) + fan;
      ctx.bezierCurveTo(
        x0 + third,
        y0 + m0 * third,
        x1 - third,
        y1 - m1 * third,
        x1,
        y1
      );
      x0 = x1;
      y0 = y1;
      m0 = m1;
    }
    ctx.stroke();
  };

  const drawStreaks = (
    count: number,
    widthRange: [number, number],
    alphaRange: [number, number],
    options: {
      shade?: "palette" | "light" | "dark";
      useDensity?: boolean;
      alphaScale?: number;
    } = {}
  ) => {
    const { shade = "palette", useDensity = false, alphaScale = 1 } = options;
    // Always compute a fixed 2x pool of fibers so the RNG sequence — and
    // therefore every fiber's position — is identical at every density.
    // The density dial only changes how many of them get drawn.
    const pool = count * 2;
    const drawCount = useDensity
      ? Math.round(count * fiberDensity)
      : count;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < pool; i++) {
      const t = random();
      const baseY = (t - 0.5) * halfSpan * 2.2;
      const alpha =
        (alphaRange[0] + random() * (alphaRange[1] - alphaRange[0])) *
        alphaScale;
      const lineWidth = Math.max(
        0.6,
        (widthRange[0] + random() * (widthRange[1] - widthRange[0])) * scale
      );
      const fan = (random() - 0.5) * 0.06 * (t - 0.5);
      const [r, g, b] = samplePalette(stops, t + (random() - 0.5) * 0.15);
      const brightness = 0.72 + random() * 0.6;

      if (i >= drawCount || alpha <= 0.002) continue;

      if (shade === "palette") {
        ctx.strokeStyle = `rgba(${Math.round(Math.min(255, r * brightness))}, ${Math.round(Math.min(255, g * brightness))}, ${Math.round(Math.min(255, b * brightness))}, ${alpha})`;
      } else {
        ctx.strokeStyle =
          shade === "light"
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(20, 10, 30, ${alpha})`;
      }
      ctx.lineWidth = lineWidth;
      strokeWave(t, baseY, fan);
    }
    ctx.restore();
  };

  // Broad soft beams, dense fine striations, crisp hairlines, then the
  // sheen/shadow folds that sell the 3D drape
  drawStreaks(14, [60, 220], [0.05, 0.12], { useDensity: true });
  drawStreaks(900, [1, 9], [0.1, 0.28], { useDensity: true });
  drawStreaks(220, [0.8, 2.2], [0.22, 0.4], { useDensity: true });
  drawStreaks(7, [180, 480], [0.05, 0.11], {
    shade: "light",
    alphaScale: sheen,
  });
  drawStreaks(6, [180, 480], [0.04, 0.09], {
    shade: "dark",
    alphaScale: sheen,
  });
  drawStreaks(120, [1, 4], [0.1, 0.22], {
    shade: "light",
    useDensity: true,
    alphaScale: sheen,
  });

  // Short directional smear along the flow softens the streaks into silk
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  ctx.globalAlpha = 0.25;
  for (const offset of [4, 9]) {
    ctx.drawImage(ctx.canvas, dx * offset * scale, dy * offset * scale);
  }
  ctx.globalAlpha = 1;
};

// --- Smooth 2D noise for the clouds -----------------------------------------
// Seeded, hash-based gradient (Perlin-style) noise with a quintic fade.
// Evaluated per pixel in resolution-independent units, so every canvas
// size shows the same sky and there is no upscaled grid to leave blocks.

const hash2 = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return h ^ (h >>> 16);
};

// Eight unit-ish gradient directions; picking by hash bits avoids trig
const GRAD_X = [1, -1, 0, 0, 0.7071, -0.7071, 0.7071, -0.7071];
const GRAD_Y = [0, 0, 1, -1, 0.7071, 0.7071, -0.7071, -0.7071];

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// Returns roughly [-1, 1]
const gradientNoise = (x: number, y: number, seed: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = fade(xf);
  const v = fade(yf);
  const g00 = hash2(xi, yi, seed) & 7;
  const g10 = hash2(xi + 1, yi, seed) & 7;
  const g01 = hash2(xi, yi + 1, seed) & 7;
  const g11 = hash2(xi + 1, yi + 1, seed) & 7;
  const n00 = GRAD_X[g00] * xf + GRAD_Y[g00] * yf;
  const n10 = GRAD_X[g10] * (xf - 1) + GRAD_Y[g10] * yf;
  const n01 = GRAD_X[g01] * xf + GRAD_Y[g01] * (yf - 1);
  const n11 = GRAD_X[g11] * (xf - 1) + GRAD_Y[g11] * (yf - 1);
  const nx0 = n00 + (n10 - n00) * u;
  const nx1 = n01 + (n11 - n01) * u;
  return nx0 + (nx1 - nx0) * v;
};

// Fractal sum of octaves; weights are normalised by the caller
const fbm = (
  x: number,
  y: number,
  seed: number,
  weights: number[],
  weightSum: number
) => {
  let sum = 0;
  let f = 1;
  for (let o = 0; o < weights.length; o++) {
    sum += weights[o] * gradientNoise(x * f, y * f, seed + o * 7919);
    f *= 2;
  }
  return sum / weightSum;
};

// "Clouds": domain-warped fractal noise mapped through the palette. The
// warp bends the field so cloud edges wisp and curl instead of blobbing;
// a seeded directional ramp keeps one side of the sky denser, like a real
// one. Softness is a final blur; detail scales the fine octaves; coverage
// biases the whole mapping toward the highlight colours.
const renderClouds = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions,
  random: () => number
) => {
  const stops = [opts.backgroundColor, ...opts.colors].map(hexToRgbTuple);

  // The field is smooth and gets softened afterwards, so it is evaluated
  // at a capped size and upscaled. Preview stays interactive; export maps
  // ~2M pixels, which the blur then carries to 4K without visible loss.
  const MAP_PIXEL_BUDGET = opts.blurScale < 1 ? 300_000 : 2_100_000;
  const mapScale = Math.min(1, Math.sqrt(MAP_PIXEL_BUDGET / (width * height)));
  const mapW = Math.max(1, Math.round(width * mapScale));
  const mapH = Math.max(1, Math.round(height * mapScale));

  const coverage = opts.coverage ?? 1;
  const softness = opts.softness ?? 1;
  const detail = opts.detail ?? 1;

  // Seeds and composition are drawn from the RNG in a fixed order so the
  // same seed always gives the same sky at any size
  const seedA = Math.floor(random() * 2 ** 31);
  const seedB = Math.floor(random() * 2 ** 31);
  const seedC = Math.floor(random() * 2 ** 31);
  const rampAngle = random() * Math.PI * 2;
  const offsetX = random() * 64;
  const offsetY = random() * 64;
  const rdx = Math.cos(rampAngle);
  const rdy = Math.sin(rampAngle);

  // Octave weights: the two coarse octaves carry the masses, the rest add
  // texture and answer to the detail dial
  const baseWeights = [0.6, 0.25, 0.1, 0.04, 0.015];
  const weights = baseWeights.map((w, o) => (o < 2 ? w : w * detail));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const warpWeights = [0.6, 0.4];
  const warpSum = warpWeights.reduce((a, b) => a + b, 0);

  // Palette lookup table: t quantized to 1/1023, well under 8-bit output
  // precision, so the loop does an index instead of an interpolation
  const LUT_SIZE = 1024;
  const lut = new Uint8ClampedArray(LUT_SIZE * 3);
  for (let k = 0; k < LUT_SIZE; k++) {
    const [r, g, b] = samplePalette(stops, k / (LUT_SIZE - 1));
    lut[k * 3] = r;
    lut[k * 3 + 1] = g;
    lut[k * 3 + 2] = b;
  }

  const field = opts.createCanvas(mapW, mapH);
  const fieldCtx = field.getContext("2d")!;
  const out = fieldCtx.createImageData(mapW, mapH);
  const outData = out.data;

  // Base frequency: a couple of cells across the height, so masses stay big
  const FREQ = 2.2;
  const WARP = 0.35;
  const unit = FREQ / mapH;
  // Ramp spans the canvas along its direction, in [0, 1]
  const rampSpan = Math.abs(rdx * mapW) + Math.abs(rdy * mapH) || 1;
  const rampBase = -(Math.min(0, rdx * mapW) + Math.min(0, rdy * mapH));
  const coverageBias = (coverage - 1) * 0.3;

  for (let y = 0; y < mapH; y++) {
    const py = y * unit + offsetY;
    const rowRamp = rampBase + rdy * y;
    for (let x = 0; x < mapW; x++) {
      const px = x * unit + offsetX;
      // Domain warp: displace the lookup by a coarser noise pair
      const qx = fbm(px + 5.2, py + 1.3, seedB, warpWeights, warpSum);
      const qy = fbm(px + 1.7, py + 9.2, seedC, warpWeights, warpSum);
      const n = fbm(px + WARP * qx, py + WARP * qy, seedA, weights, weightSum);
      const ramp = (rowRamp + rdx * x) / rampSpan;
      // Gradient noise sits mostly within ±0.6; open it up gently rather
      // than clipping, so masses separate from sky but edges stay soft
      let t = 0.5 + n * 0.8 + (ramp - 0.5) * 0.6 + coverageBias;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      // Smoothstep for a soft shoulder at both palette ends
      t = t * t * (3 - 2 * t);
      const k = (t * (LUT_SIZE - 1) + 0.5) | 0;
      const i = (y * mapW + x) * 4;
      outData[i] = lut[k * 3];
      outData[i + 1] = lut[k * 3 + 1];
      outData[i + 2] = lut[k * 3 + 2];
      outData[i + 3] = 255;
    }
  }

  fieldCtx.putImageData(out, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(field, 0, 0, width, height);

  // Softness: a light final blur turns fine texture into mist
  applyBlur(
    ctx,
    width,
    height,
    28 * softness * (height / 2160),
    opts.createCanvas
  );
};

// --- Finishes -----------------------------------------------------------------
// Both finishes read the rendered image once, then repaint it on a grid.
// Cells are sampled at their centre: the underlying gradient is smooth, so
// a single sample is as good as an average and far cheaper.

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const cellHash = (x: number, y: number) => {
  let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

// "Pixel": a dot matrix. Each cell becomes a square dot in the colour the
// gradient had there, on the background colour, like a status-page grid.
const applyPixel = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cell: number,
  strength: number,
  background: string
) => {
  const src = ctx.getImageData(0, 0, width, height).data;
  ctx.fillStyle = normalizeHexColor(background);
  ctx.fillRect(0, 0, width, height);
  // Dot spans 0..84% of the cell across the strength range; the rest is gutter
  const dot = Math.max(1, cell * 0.42 * strength);
  const inset = (cell - dot) / 2;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  for (let cy = 0; cy < rows; cy++) {
    const sy = Math.min(height - 1, Math.floor(cy * cell + cell / 2));
    for (let cx = 0; cx < cols; cx++) {
      const sx = Math.min(width - 1, Math.floor(cx * cell + cell / 2));
      const i = (sy * width + sx) * 4;
      ctx.fillStyle = `rgb(${src[i]},${src[i + 1]},${src[i + 2]})`;
      ctx.fillRect(cx * cell + inset, cy * cell + inset, dot, dot);
    }
  }
};

// "Dither": every cell snaps to its nearest palette colour; where the
// gradient sits between two palette colours, an ordered (Bayer) threshold
// decides whether the cell also carries a symbol in the second colour, so
// transitions turn into fields of bars, crosses, rings and dots.
const applyDither = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cell: number,
  strength: number,
  palette: [number, number, number][]
) => {
  const src = ctx.getImageData(0, 0, width, height).data;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const css = palette.map((p) => `rgb(${p[0]},${p[1]},${p[2]})`);
  // Fill with the background colour, then only paint cells that differ
  ctx.fillStyle = css[0];
  ctx.fillRect(0, 0, width, height);

  const bar = Math.max(1, cell * 0.18);
  const arm = cell * 0.6;
  const ring = cell * 0.26;

  for (let cy = 0; cy < rows; cy++) {
    const sy = Math.min(height - 1, Math.floor(cy * cell + cell / 2));
    for (let cx = 0; cx < cols; cx++) {
      const sx = Math.min(width - 1, Math.floor(cx * cell + cell / 2));
      const i = (sy * width + sx) * 4;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      // Two nearest palette colours
      let best = 0;
      let bestD = Infinity;
      let second = 0;
      let secondD = Infinity;
      for (let p = 0; p < palette.length; p++) {
        const dr = palette[p][0] - r;
        const dg = palette[p][1] - g;
        const db = palette[p][2] - b;
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) {
          second = best;
          secondD = bestD;
          best = p;
          bestD = d;
        } else if (d < secondD) {
          second = p;
          secondD = d;
        }
      }
      const x0 = cx * cell;
      const y0 = cy * cell;
      if (best !== 0) {
        ctx.fillStyle = css[best];
        ctx.fillRect(x0, y0, cell + 0.5, cell + 0.5);
      }
      if (palette.length < 2) continue;
      // How far this cell sits toward the second colour, 0..0.5
      const mix = Math.sqrt(bestD) / (Math.sqrt(bestD) + Math.sqrt(secondD) + 1e-6);
      const threshold = (BAYER_4[cy & 3][cx & 3] + 0.5) / 16;
      if (mix * 2 * strength <= threshold) continue;

      ctx.fillStyle = css[second];
      const midX = x0 + cell / 2;
      const midY = y0 + cell / 2;
      switch (cellHash(cx, cy) & 3) {
        case 0: // bar
          ctx.fillRect(midX - bar / 2, midY - arm / 2, bar, arm);
          break;
        case 1: // cross
          ctx.fillRect(midX - bar / 2, midY - arm / 2, bar, arm);
          ctx.fillRect(midX - arm / 2, midY - bar / 2, arm, bar);
          break;
        case 2: // ring
          ctx.beginPath();
          ctx.arc(midX, midY, ring, 0, Math.PI * 2);
          ctx.arc(midX, midY, Math.max(0.5, ring - bar), 0, Math.PI * 2, true);
          ctx.fill();
          break;
        default: // dot
          ctx.fillRect(midX - bar, midY - bar, bar * 2, bar * 2);
      }
    }
  }
};

const applyEffect = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions
) => {
  const effect = opts.effect ?? "none";
  if (effect === "none") return;
  const cell = Math.max(
    2,
    Math.round((opts.effectSize ?? EFFECT_SIZE_DEFAULT) * opts.blurScale)
  );
  const strength = opts.effectStrength ?? EFFECT_STRENGTH_DEFAULT;
  if (effect === "pixel") {
    applyPixel(ctx, width, height, cell, strength, opts.backgroundColor);
  } else {
    applyDither(
      ctx,
      width,
      height,
      cell,
      strength,
      [opts.backgroundColor, ...opts.colors].map(hexToRgbTuple)
    );
  }
};

export const renderGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions
) => {
  const random = mulberry32(opts.seed);
  const blur = opts.blur * opts.blurScale;

  if (opts.style === "stripes" || opts.style === "clouds") {
    if (opts.style === "stripes") {
      renderStripes(ctx, width, height, opts, random);
    } else {
      renderClouds(ctx, width, height, opts, random);
    }
    applyAdjustments(
      ctx,
      width,
      height,
      opts.contrast,
      opts.saturation,
      opts.noise
    );
    applyEffect(ctx, width, height, opts);
    return;
  }

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
  applyEffect(ctx, width, height, opts);
};
