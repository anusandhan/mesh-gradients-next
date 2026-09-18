"use client";

import { useRef, type JSX } from "react";
import {
  CircleIcon,
  SquareIcon,
  SelectionIcon,
  DiamondIcon,
  TriangleIcon,
  HexagonIcon,
  StarIcon,
  FlowerIcon,
  SealIcon,
  HeartIcon,
  UploadSimpleIcon,
  XIcon,
} from "@/components/icons/ui";
import type { Icon } from "@/components/icons/ui";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { OverlayShape } from "@/lib/gradient-renderer";
import { svgToOutline, type Outline } from "@/lib/svg-outline";

export const OVERLAY_SVG_MAX_BYTES = 64 * 1024;

type ShapeIcon = Icon | ((props: { size?: number; weight?: string }) => JSX.Element);
const SHAPES: { value: OverlayShape; label: string; icon: ShapeIcon }[] = [
  { value: "circle", label: "Circle", icon: CircleIcon },
  { value: "square", label: "Square", icon: SquareIcon },
  { value: "rounded", label: "Rounded", icon: SelectionIcon },
  { value: "squircle", label: "Squircle", icon: SquircleIcon },
  { value: "diamond", label: "Diamond", icon: DiamondIcon },
  { value: "triangle", label: "Triangle", icon: TriangleIcon },
  { value: "hexagon", label: "Hexagon", icon: HexagonIcon },
  { value: "star", label: "Star", icon: StarIcon },
  { value: "flower", label: "Flower", icon: FlowerIcon },
  { value: "seal", label: "Seal", icon: SealIcon },
  { value: "heart", label: "Heart", icon: HeartIcon },
];

// Phosphor has no squircle; a superellipse outline in the same 16px grid
function SquircleIcon({ size = 16 }: { size?: number; weight?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2C13 2 14 3 14 8C14 13 13 14 8 14C3 14 2 13 2 8C2 3 3 2 8 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Thumbnail of an uploaded SVG, drawn the way the overlay will draw it
function OutlinePreview({ outline, size = 16 }: { outline: Outline; size?: number }) {
  return (
    <svg width={size} height={size} viewBox={outline.box.join(" ")} fill="none" aria-hidden="true">
      <path d={outline.d} stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Icon-only pills for the overlay shape, plus an Upload pill that opens the
// file dialog. Once an SVG is in, its pill shows the outline with a remove
// button beside it. Shared by the desktop sidebar and the mobile Overlay tab.
export function ShapePicker({
  shape,
  custom,
  onShapeChange,
  onUpload,
  onRemoveCustom,
  className,
}: {
  shape: OverlayShape;
  /** The uploaded SVG, if any; "custom" is only selectable while one exists */
  custom: Outline | null;
  onShapeChange: (shape: OverlayShape) => void;
  onUpload: (file: File) => void;
  onRemoveCustom: () => void;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasCustom = custom !== null;
  return (
    <>
      <ToggleGroup
        type="single"
        value={shape}
        onValueChange={(value) => {
          if (!value) return;
          if (value === "custom" && !hasCustom) {
            fileRef.current?.click();
            return;
          }
          onShapeChange(value as OverlayShape);
        }}
        aria-label="Overlay shape"
        className={className}
      >
        {SHAPES.map((s) => (
          <ToggleGroupItem
            key={s.value}
            value={s.value}
            aria-label={s.label}
            title={s.label}
            className="w-9 shrink-0 px-0"
          >
            <s.icon size={16} weight="regular" />
          </ToggleGroupItem>
        ))}
        {custom ? (
          <span className="flex shrink-0 items-center gap-0.5">
            <ToggleGroupItem
              value="custom"
              aria-label="Your SVG"
              title="Your SVG"
              className="w-9 shrink-0 px-0"
            >
              <OutlinePreview outline={custom} />
            </ToggleGroupItem>
            <button
              type="button"
              onClick={onRemoveCustom}
              aria-label="Remove SVG"
              title="Remove SVG"
              className="flex h-8 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-800"
            >
              <XIcon size={12} weight="bold" />
            </button>
          </span>
        ) : (
          <ToggleGroupItem
            value="custom"
            aria-label="Upload SVG"
            title="Upload an SVG; it's redrawn as white outlines"
            className="shrink-0 px-3"
          >
            <UploadSimpleIcon size={16} weight="regular" />
            Upload
          </ToggleGroupItem>
        )}
      </ToggleGroup>
      <input
        ref={fileRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />
    </>
  );
}

export type OverlaySvg = Outline & { path: Path2D };

// Read an uploaded SVG into a strokeable path. Fails on non-SVG files, files
// over the size cap, and markup with no shapes. The markup never touches the
// DOM: it's parsed as text and only its geometry survives.
export const loadOverlaySvg = async (file: File): Promise<OverlaySvg> => {
  const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
  if (!isSvg) throw new Error("Choose an SVG file");
  if (file.size > OVERLAY_SVG_MAX_BYTES) throw new Error("SVG must be under 64 KB");
  const outline = svgToOutline(await file.text());
  return { ...outline, path: new Path2D(outline.d) };
};

// Browser side of the shared dither face; resolves once the font can be
// used in ctx.font. The server registers the same file in the export route.
let ditherFontPromise: Promise<void> | null = null;
export const ensureDitherFont = (family: string) => {
  if (ditherFontPromise) return ditherFontPromise;
  ditherFontPromise = (async () => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    const face = new FontFace(family, "url(/fonts/AzeretMono.ttf)");
    await face.load();
    document.fonts.add(face);
  })().catch(() => undefined);
  return ditherFontPromise;
};
