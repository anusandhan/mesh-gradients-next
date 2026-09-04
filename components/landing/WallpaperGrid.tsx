import Image from "next/image";
import Link from "next/link";
import { STYLE_LABELS, type GalleryPreset } from "@/lib/gallery";

// Grid of palette cards used by the wallpaper index, style and tag pages.
// Thumbnails are the pre-rendered gallery tiles; the card links to the
// palette's own page where the full-size downloads live.
export default function WallpaperGrid({
  presets,
  priority = false,
}: {
  presets: GalleryPreset[];
  priority?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {presets.map((preset, index) => (
        <li key={preset.slug}>
          <Link
            href={`/wallpapers/${preset.slug}`}
            className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]"
          >
            <Image
              src={`/landing/gallery/${preset.slug}.jpg`}
              alt={`${preset.name} wallpaper: ${preset.mood}, ${STYLE_LABELS[preset.style].toLowerCase()} style`}
              width={960}
              height={600}
              priority={priority && index < 4}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="block aspect-[16/10] w-full object-cover"
            />
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-medium">{preset.name}</span>
              <span className="text-xs text-neutral-500">
                {STYLE_LABELS[preset.style]}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
