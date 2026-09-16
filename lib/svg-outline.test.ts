import { describe, expect, test } from "vitest";
import { svgToOutline } from "./svg-outline";

describe("svgToOutline", () => {
  test("keeps path data and reads the viewBox", () => {
    const out = svgToOutline(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><path d="M2 2L22 22" fill="#000" stroke="blue"/></svg>`
    );
    expect(out.box).toEqual([0, 0, 24, 24]);
    expect(out.d).toBe("M2 2L22 22");
  });

  test("converts basic shapes to path segments", () => {
    const out = svgToOutline(
      `<svg viewBox="0 0 10 10"><rect x="1" y="2" width="3" height="4"/><circle cx="5" cy="5" r="2"/><line x1="0" y1="0" x2="1" y2="1"/><polygon points="0,0 2,0 1,2"/><polyline points="3 3, 4 4"/></svg>`
    );
    expect(out.d).toContain("M1 2h3v4h-3z");
    expect(out.d).toContain("M3 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z");
    expect(out.d).toContain("M0 0L1 1");
    expect(out.d).toContain("M0 0L2 0L1 2z");
    expect(out.d).toContain("M3 3L4 4");
  });

  test("ignores defs, clip paths and masks", () => {
    const out = svgToOutline(
      `<svg viewBox="0 0 10 10"><defs><rect width="9" height="9"/></defs><clipPath id="c"><circle r="1"/></clipPath><path d="M1 1h1"/></svg>`
    );
    expect(out.d).toBe("M1 1h1");
  });

  test("falls back to width/height when there is no viewBox", () => {
    expect(svgToOutline(`<svg width="30" height="20"><path d="M0 0h1"/></svg>`).box).toEqual([
      0, 0, 30, 20,
    ]);
  });

  test("rejects files with nothing to outline", () => {
    expect(() => svgToOutline(`<svg viewBox="0 0 1 1"><text>hi</text></svg>`)).toThrow();
    expect(() => svgToOutline(`<div>nope</div>`)).toThrow();
  });
});
