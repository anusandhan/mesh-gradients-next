import { describe, expect, test } from "vitest";
import {
  DEFAULT_PLAN,
  FREE_PRESET_LIMIT,
  PLANS,
  formatPrice,
  isPlanId,
  parsePlanId,
} from "./plans";
import { MAX_PRESETS_PER_USER } from "./presets";

describe("plans", () => {
  test("headline plan is a $39 one-year pass", () => {
    expect(PLANS.year.priceUsd).toBe(39);
    expect(PLANS.year.days).toBe(365);
    expect(DEFAULT_PLAN).toBe("year");
  });

  test("week pass is $9 for 7 days", () => {
    expect(PLANS.week.priceUsd).toBe(9);
    expect(PLANS.week.days).toBe(7);
  });

  test("the year pass is the obvious value against the week pass", () => {
    const yearPerDay = PLANS.year.priceUsd / PLANS.year.days;
    const weekPerDay = PLANS.week.priceUsd / PLANS.week.days;
    expect(yearPerDay).toBeLessThan(weekPerDay);
  });

  test("free palette cap is below the Pro cap", () => {
    expect(FREE_PRESET_LIMIT).toBeGreaterThan(0);
    expect(FREE_PRESET_LIMIT).toBeLessThan(MAX_PRESETS_PER_USER);
  });

  test("formats whole-dollar prices", () => {
    expect(formatPrice(PLANS.year)).toBe("$39");
    expect(formatPrice(PLANS.week)).toBe("$9");
  });
});

describe("parsePlanId", () => {
  test("accepts known plan ids", () => {
    expect(parsePlanId("year")).toBe("year");
    expect(parsePlanId("week")).toBe("week");
    expect(isPlanId("week")).toBe(true);
  });

  test("falls back to the default for unknown or missing input", () => {
    expect(parsePlanId(undefined)).toBe("year");
    expect(parsePlanId(null)).toBe("year");
    expect(parsePlanId("lifetime")).toBe("year");
    expect(parsePlanId(42)).toBe("year");
    expect(isPlanId("lifetime")).toBe(false);
  });
});
