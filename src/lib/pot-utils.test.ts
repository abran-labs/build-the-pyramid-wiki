import { describe, expect, test } from "bun:test";

import type { ItemRarityRow } from "./dqr-items";
import { healthPercentile } from "./pot-utils";

const row = (partial: Partial<ItemRarityRow> = {}): ItemRarityRow => ({
  maxBase: 100,
  maxUps: 10,
  minBase: 80,
  minUps: 8,
  rarity: "epic",
  ...partial,
});

describe("healthPercentile", () => {
  test("returns null when the row has no health band", () => {
    // Given: Guardian-style row — health is the primary track, no lowest/highest
    // When
    const pct = healthPercentile(1000, row());
    // Then
    expect(pct).toBeNull();
  });

  test("places current health in the unupgraded band", () => {
    // Given: DPS-armor health roll, no remaining upgrades applied
    const band = row({ highestHealth: 100, lowestHealth: 50 });
    // When / Then
    expect(healthPercentile(50, band)).toBe(0);
    expect(healthPercentile(75, band)).toBe(50);
    expect(healthPercentile(100, band)).toBe(100);
  });

  test("clamps health outside the band", () => {
    const band = row({ highestHealth: 100, lowestHealth: 50 });
    expect(healthPercentile(40, band)).toBe(0);
    expect(healthPercentile(120, band)).toBe(100);
  });
});
