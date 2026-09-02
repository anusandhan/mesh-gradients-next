import { z } from "zod";

// Shared preset logic: imported by both the API routes (validation) and the
// client (name dedup, active-preset matching). Must stay server/client neutral.

export const MAX_PRESETS_PER_USER = 50;
export const MAX_PRESET_NAME_LENGTH = 40;

const HEX = /^#[0-9a-fA-F]{6}$/;

const presetName = z
  .string()
  .trim()
  .min(1)
  .max(MAX_PRESET_NAME_LENGTH);

export const presetInputSchema = z
  .object({
    name: presetName,
    background: z.string().regex(HEX),
    colors: z.array(z.string().regex(HEX)).min(1).max(8),
  })
  .strict();

// Partial edit from the manage-presets dialog - any subset of fields, but
// never an empty patch.
export const presetUpdateSchema = z
  .object({
    name: presetName.optional(),
    background: z.string().regex(HEX).optional(),
    colors: z.array(z.string().regex(HEX)).min(1).max(8).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Empty update",
  });

export const reorderSchema = z
  .object({
    order: z.array(z.uuid()).min(1).max(MAX_PRESETS_PER_USER),
  })
  .strict();

export type PresetInput = z.infer<typeof presetInputSchema>;
export type PresetUpdate = z.infer<typeof presetUpdateSchema>;

// "Sunset" taken -> "Sunset 2" -> "Sunset 3" ..., case-insensitive,
// truncating the base so the suffix never exceeds the name limit.
export const dedupeName = (name: string, existing: string[]): string => {
  const taken = new Set(existing.map((n) => n.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  for (let n = 2; ; n++) {
    const suffix = ` ${n}`;
    const base = name.slice(0, MAX_PRESET_NAME_LENGTH - suffix.length);
    const candidate = `${base}${suffix}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
};

export const paletteMatchesPreset = (
  preset: { background: string; colors: string[] },
  background: string,
  colors: string[]
): boolean =>
  preset.background.toLowerCase() === background.toLowerCase() &&
  preset.colors.length === colors.length &&
  preset.colors.every((c, i) => c.toLowerCase() === colors[i].toLowerCase());
