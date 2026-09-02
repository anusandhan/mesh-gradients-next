"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CaretDownIcon,
  CaretUpIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import type { UserPreset } from "@/hooks/useColorPresets";
import { normalizeHexColor } from "@/lib/gradient-renderer";
import type { ColorFormat } from "@/lib/color-format";

type PresetPatch = Partial<Omit<UserPreset, "id">>;

const rowSpring = { type: "spring", duration: 0.35, bounce: 0 } as const;

// One editable card per preset. Name, background, and colors edit in place;
// a Save button appears once anything differs from the saved state. Delete
// is a two-step inline confirm - no nested dialogs, no undo toast.
const PresetRow = ({
  preset,
  isFirst,
  isLast,
  colorFormat,
  onUpdate,
  onRemove,
  onMove,
}: {
  preset: UserPreset;
  isFirst: boolean;
  isLast: boolean;
  colorFormat: ColorFormat;
  onUpdate: (id: string, patch: PresetPatch) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
  onMove: (id: string, direction: -1 | 1) => void;
}) => {
  const [draftName, setDraftName] = useState(preset.name);
  const [draftBackground, setDraftBackground] = useState(preset.background);
  const [draftColors, setDraftColors] = useState(preset.colors);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync drafts when the server state changes (e.g. after a save)
  useEffect(() => {
    setDraftName(preset.name);
    setDraftBackground(preset.background);
    setDraftColors(preset.colors);
  }, [preset]);

  useEffect(
    () => () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    },
    []
  );

  const trimmedName = draftName.trim().slice(0, 40);
  const dirty =
    (trimmedName.length > 0 && trimmedName !== preset.name) ||
    draftBackground !== preset.background ||
    draftColors.some((c, i) => c !== preset.colors[i]);

  const handleSave = async () => {
    if (!dirty || busy) return;
    const patch: PresetPatch = {};
    if (trimmedName.length > 0 && trimmedName !== preset.name) {
      patch.name = trimmedName;
    }
    if (draftBackground !== preset.background) {
      patch.background = draftBackground;
    }
    if (draftColors.some((c, i) => c !== preset.colors[i])) {
      patch.colors = draftColors;
    }
    setBusy(true);
    const ok = await onUpdate(preset.id, patch);
    setBusy(false);
    if (!ok) toast("Could not save changes");
  };

  const handleDelete = async () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      // Disarm if the second click never comes
      disarmTimer.current = setTimeout(() => setDeleteArmed(false), 3000);
      return;
    }
    if (disarmTimer.current) clearTimeout(disarmTimer.current);
    setBusy(true);
    const ok = await onRemove(preset.id);
    setBusy(false);
    if (!ok) {
      setDeleteArmed(false);
      toast("Could not delete preset");
    }
  };

  return (
    <motion.div
      layout
      transition={rowSpring}
      className="rounded-xl border border-neutral-200 bg-white p-3"
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button
            type="button"
            aria-label={`Move ${preset.name} up`}
            disabled={isFirst}
            className="flex h-6 w-7 items-center justify-center rounded text-neutral-400 transition-colors hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-30"
            onClick={() => onMove(preset.id, -1)}
          >
            <CaretUpIcon size={12} weight="bold" />
          </button>
          <button
            type="button"
            aria-label={`Move ${preset.name} down`}
            disabled={isLast}
            className="flex h-6 w-7 items-center justify-center rounded text-neutral-400 transition-colors hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-30"
            onClick={() => onMove(preset.id, 1)}
          >
            <CaretDownIcon size={12} weight="bold" />
          </button>
        </div>
        <Input
          value={draftName}
          maxLength={40}
          aria-label={`Preset name for ${preset.name}`}
          className="h-8 flex-1 text-sm"
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        {dirty && (
          <Button
            size="sm"
            disabled={busy}
            onClick={handleSave}
            className="h-8"
          >
            Save
          </Button>
        )}
        {/* Two-step delete: the armed state turns only the text and icon
            red; the width change animates via the layout spring and the
            label crossfades */}
        <motion.div layout transition={rowSpring}>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={handleDelete}
            className={
              deleteArmed
                ? "h-8 !bg-white !bg-none !text-red-600 !shadow-none !duration-200"
                : "h-8 !bg-white !bg-none !shadow-none !duration-200"
            }
          >
            <TrashIcon weight="bold" />
            <motion.span
              key={deleteArmed ? "confirm" : "delete"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {deleteArmed ? "Confirm Delete" : "Delete"}
            </motion.span>
          </Button>
        </motion.div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-8">
        <ColorPickerPopover
          value={normalizeHexColor(draftBackground)}
          format={colorFormat}
          onChange={setDraftBackground}
        />
        <span className="mx-0.5 h-4 w-px bg-neutral-200" aria-hidden />
        {draftColors.map((color, index) => (
          <ColorPickerPopover
            key={index}
            value={normalizeHexColor(color)}
            format={colorFormat}
            onChange={(hex) =>
              setDraftColors((prev) =>
                prev.map((c, i) => (i === index ? hex : c))
              )
            }
          />
        ))}
      </div>
    </motion.div>
  );
};

export const ManagePresetsDialog = ({
  open,
  onOpenChange,
  presets,
  colorFormat,
  onUpdate,
  onRemove,
  onReorder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: UserPreset[];
  colorFormat: ColorFormat;
  onUpdate: (id: string, patch: PresetPatch) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
  onReorder: (orderedIds: string[]) => Promise<boolean>;
}) => {
  // Reorder applies optimistically in the hook, so rows swap (and animate
  // via layout) as soon as an arrow is pressed.
  const handleMove = async (id: string, direction: -1 | 1) => {
    const ids = presets.map((p) => p.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    if (!(await onReorder(ids))) toast("Could not reorder presets");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Fixed floor + viewport-capped ceiling: deleting rows doesn't
          shrink the dialog, and long lists scroll inside the flex column */}
      <DialogContent className="flex min-h-[420px] max-h-[85vh] flex-col">
        <DialogTitle>Presets</DialogTitle>
        <DialogDescription className="mt-1">
          Edits save per preset.
        </DialogDescription>
        {presets.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            No saved presets yet.
          </p>
        ) : (
          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {presets.map((preset, index) => (
              <PresetRow
                key={preset.id}
                preset={preset}
                isFirst={index === 0}
                isLast={index === presets.length - 1}
                colorFormat={colorFormat}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onMove={handleMove}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
