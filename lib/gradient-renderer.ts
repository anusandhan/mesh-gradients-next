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

export type GradientStyle = "blobs" | "stripes" | "clouds";

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
  const SEGMENTS = 28;
  const strokeWave = (t: number, baseY: number, fan: number) => {
    ctx.beginPath();
    for (let s = 0; s <= SEGMENTS; s++) {
      const x = -diag + (2 * diag * s) / SEGMENTS;
      const y = baseY + waveOffset(x, t) + fan * x;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
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

// "Clouds": fbm noise mapped through the palette. Value noise comes from
// seeded coarse random grids upscaled with bilinear smoothing; summing
// octaves gives the fractal cloud field. A seeded directional ramp biases
// the field so one side stays denser, like a real sky.
const renderClouds = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: RenderOptions,
  random: () => number
) => {
  const stops = [opts.backgroundColor, ...opts.colors].map(hexToRgbTuple);
  const aspect = width / height;

  // Octave value-noise: coarse seeded grids, bilinear-upscaled. Grid sizes
  // are resolution-independent so every canvas size shows the same clouds.
  const field = opts.createCanvas(width, height);
  const fieldCtx = field.getContext("2d")!;
  fieldCtx.fillStyle = "#000000";
  fieldCtx.fillRect(0, 0, width, height);
  fieldCtx.globalCompositeOperation = "lighter";
  fieldCtx.imageSmoothingEnabled = true;
  fieldCtx.imageSmoothingQuality = "high";

  const coverage = opts.coverage ?? 1;
  const softness = opts.softness ?? 1;
  const detail = opts.detail ?? 1;

  const OCTAVES = 5;
  // Detail scales the high-frequency octaves; the noise value gets
  // renormalized by the total weight during mapping
  const baseWeights = [0.55, 0.3, 0.1, 0.05, 0.025];
  const weights = baseWeights.map((w, o) => (o < 2 ? w : w * detail));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  for (let o = 0; o < OCTAVES; o++) {
    const gw = Math.max(2, Math.round(3 * 2 ** o * aspect));
    const gh = Math.max(2, 3 * 2 ** o);
    const grid = opts.createCanvas(gw, gh);
    const gridCtx = grid.getContext("2d")!;
    const cells = gridCtx.createImageData(gw, gh);
    for (let i = 0; i < cells.data.length; i += 4) {
      const v = Math.round(random() * 255);
      cells.data[i] = v;
      cells.data[i + 1] = v;
      cells.data[i + 2] = v;
      cells.data[i + 3] = 255;
    }
    gridCtx.putImageData(cells, 0, 0);

    fieldCtx.globalAlpha = weights[o];
    fieldCtx.drawImage(grid, 0, 0, width, height);
  }
  fieldCtx.globalAlpha = 1;
  fieldCtx.globalCompositeOperation = "source-over";

  // Directional ramp for the macro composition (denser toward one corner)
  const rampAngle = random() * Math.PI * 2;
  const rdx = Math.cos(rampAngle);
  const rdy = Math.sin(rampAngle);
  const rampSpan =
    Math.abs(rdx * width) + Math.abs(rdy * height) || 1;
  const rampBase =
    (Math.min(0, rdx * width) + Math.min(0, rdy * height)) * -1;

  // Map field + ramp through the palette, per pixel
  const fieldData = fieldCtx.getImageData(0, 0, width, height).data;
  const out = ctx.createImageData(width, height);
  const outData = out.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const noise = fieldData[i] / 255 / weightSum;
      const ramp = (rampBase + rdx * x + rdy * y) / rampSpan;
      // Push contrast so cloud masses separate from sky and the palette
      // extremes (deep background, bright highlights) actually appear.
      // Coverage biases the whole mapping toward the highlight colors.
      let t =
        0.45 * (0.5 + (noise - 0.5) * 2.3) +
        0.55 * ramp +
        (coverage - 1) * 0.3;
      t = (t - 0.5) * 1.5 + 0.5;
      t = Math.max(0, Math.min(1, t));
      const [r, g, b] = samplePalette(stops, t);
      outData[i] = r;
      outData[i + 1] = g;
      outData[i + 2] = b;
      outData[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);

  // Gentle soften to melt any bilinear grid artifacts into mist
  applyBlur(
    ctx,
    width,
    height,
    44 * softness * (height / 2160),
    opts.createCanvas
  );
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
