"use client";

import { useCallback, useEffect, useState } from "react";

export type UserPreset = {
  id: string;
  name: string;
  background: string;
  colors: string[];
};

export type SaveResult =
  | { ok: true; preset: UserPreset }
  | { ok: false; code: "pro_required" | "preset_cap" | "error" };

// Server-backed user palettes. Loaded once the user is signed in; delete and
// rename apply optimistically and roll back if the API rejects them.
export function useColorPresets(isSignedIn: boolean | undefined) {
  const [presets, setPresets] = useState<UserPreset[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      setPresets([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/presets");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.presets)) {
          setPresets(data.presets);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const save = useCallback(
    async (input: Omit<UserPreset, "id">): Promise<SaveResult> => {
      try {
        const res = await fetch("/api/presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const code =
            data?.code === "pro_required" || data?.code === "preset_cap"
              ? data.code
              : "error";
          return { ok: false, code };
        }
        setPresets((prev) => [data.preset, ...prev]);
        return { ok: true, preset: data.preset };
      } catch {
        return { ok: false, code: "error" };
      }
    },
    []
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = presets;
      setPresets((prev) => prev.filter((p) => p.id !== id));
      try {
        const res = await fetch(`/api/presets/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        return true;
      } catch {
        setPresets(previous);
        return false;
      }
    },
    [presets]
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<Omit<UserPreset, "id">>
    ): Promise<boolean> => {
      const previous = presets;
      setPresets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      try {
        const res = await fetch(`/api/presets/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error();
        return true;
      } catch {
        setPresets(previous);
        return false;
      }
    },
    [presets]
  );

  // Optimistically applies the new order; the server write happens behind it.
  const reorder = useCallback(
    async (orderedIds: string[]): Promise<boolean> => {
      const previous = presets;
      const byId = new Map(previous.map((p) => [p.id, p]));
      const next = orderedIds
        .map((id) => byId.get(id))
        .filter((p): p is UserPreset => Boolean(p));
      if (next.length !== previous.length) return false;
      setPresets(next);
      try {
        const res = await fetch("/api/presets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: orderedIds }),
        });
        if (!res.ok) throw new Error();
        return true;
      } catch {
        setPresets(previous);
        return false;
      }
    },
    [presets]
  );

  return { presets, save, remove, update, reorder };
}
