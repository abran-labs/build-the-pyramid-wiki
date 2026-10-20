import { describe, expect, test } from "bun:test";

import { itemTracks, type TrackInput } from "./item-tracks";
import type { ItemRarityRow } from "./dqr-items";

const weaponRow: ItemRarityRow = {
  maxBase: 500,
  maxUps: 10,
  minBase: 400,
  minUps: 8,
  rarity: "rare",
};

const dpsRow: ItemRarityRow = {
  ...weaponRow,
  highestHealth: 100,
  lowestHealth: 50,
  rarity: "epic",
};

const base = (partial: Partial<TrackInput>): TrackInput => ({
  health: null,
  hybrid: null,
  itemClass: "war",
  offense: "physical",
  percentile: 80,
  pot: 1000,
  row: weaponRow,
  ...partial,
});

describe("itemTracks", () => {
  test("weapons expose a single DPS potential track", () => {
    // Given / When
    const tracks = itemTracks(base({ itemClass: "mage", offense: "spell" }));
    // Then
    expect(tracks).toEqual([
      { chrome: "spell", kind: "dps", percentile: 80, value: 1000, valueLabel: "Potential" },
    ]);
  });

  test("warrior weapons use physical chrome", () => {
    const tracks = itemTracks(base({ itemClass: "war" }));
    expect(tracks[0]?.chrome).toBe("physical");
  });

  test("guardian armor exposes a single Health potential track", () => {
    const tracks = itemTracks(base({ itemClass: "guardian" }));
    expect(tracks).toEqual([
      { chrome: "health", kind: "health", percentile: 80, value: 1000, valueLabel: "Potential" },
    ]);
  });

  test("DPS armor adds a Health roll track from current health, not remaining upgrades", () => {
    const tracks = itemTracks(
      base({ health: 75, itemClass: "dps", offense: "physical", row: dpsRow }),
    );
    expect(tracks).toEqual([
      { chrome: "physical", kind: "dps", percentile: 80, value: 1000, valueLabel: "Potential" },
      { chrome: "health", kind: "health", percentile: 50, value: 75, valueLabel: "Health" },
    ]);
  });

  test("DPS armor without a health read stays DPS-only", () => {
    const tracks = itemTracks(base({ itemClass: "dps", row: dpsRow }));
    expect(tracks.map((track) => track.kind)).toEqual(["dps"]);
  });

  test("hybrid legendaries expose Physical and Spell pots", () => {
    const tracks = itemTracks(
      base({
        hybrid: {
          physical: { percentile: 80, pot: 340 },
          spell: { percentile: 40, pot: 320 },
        },
        itemClass: "hybrid",
      }),
    );
    expect(tracks).toEqual([
      { chrome: "physical", kind: "dps", percentile: 80, value: 340, valueLabel: "Potential" },
      { chrome: "spell", kind: "dps", percentile: 40, value: 320, valueLabel: "Potential" },
    ]);
  });

  test("hybrid with only physical stays one offense track", () => {
    const tracks = itemTracks(
      base({
        hybrid: { physical: { percentile: 80, pot: 340 }, spell: null },
        itemClass: "hybrid",
      }),
    );
    expect(tracks.map((track) => track.chrome)).toEqual(["physical"]);
  });
});
