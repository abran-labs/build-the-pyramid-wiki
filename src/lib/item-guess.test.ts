import { describe, expect, test } from "bun:test";

import { ITEMS } from "./dqr-items";
import { guessItem, type StatFingerprint } from "./item-guess";

const mid = ITEMS.find((item) => item.id === "NL:Midgardian");
const lava = ITEMS.find((item) => item.id === "VC:Lava King's");
const hofund = ITEMS.find((item) => item.id === "NL:Hofund");

const fingerprint = (partial: Partial<StatFingerprint>): StatFingerprint => ({
  health: null,
  physical: null,
  rarity: null,
  spell: null,
  upsDone: null,
  upsTotal: null,
  ...partial,
});

describe("guessItem", () => {
  test("identifies Midgardian from upgrades plus spell when the title is missing", () => {
    // Given: assets/1.png numbers, no name
    if (mid === undefined) throw new Error("missing Midgardian");
    // When
    const item = guessItem(fingerprint({ spell: 4350147, upsDone: 94812, upsTotal: 94812 }));
    // Then
    expect(item?.id).toBe(mid.id);
  });

  test("identifies Hofund from a unique ultimate physical fingerprint", () => {
    if (hofund === undefined) throw new Error("missing Hofund");
    const row = hofund.rows[0];
    if (row === undefined) throw new Error("missing Hofund row");
    const item = guessItem(
      fingerprint({
        physical: row.minBase + row.minUps * 10,
        rarity: "ultimate",
        upsDone: row.minUps,
        upsTotal: row.minUps,
      }),
    );
    expect(item?.id).toBe(hofund.id);
  });

  test("identifies Lava King's when chrome rarity breaks a Molten Forged collision", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    const item = guessItem(
      fingerprint({
        health: 9380777,
        physical: 739072,
        rarity: "common",
        spell: 476,
        upsDone: 28540,
        upsTotal: 28540,
      }),
    );
    expect(item?.id).toBe(lava.id);
  });

  test("does not guess Lava King's when Molten Forged shares the same numbers", () => {
    const item = guessItem(
      fingerprint({
        health: 9380777,
        physical: 739072,
        spell: 476,
        upsDone: 28540,
        upsTotal: 28540,
      }),
    );
    expect(item).toBeNull();
  });

  test("does not guess Crystalline Shard Staff when Northern Spellstaff also fits", () => {
    const item = guessItem(
      fingerprint({ spell: 27154454, upsDone: 0, upsTotal: 282463 }),
    );
    expect(item).toBeNull();
  });

  test("does not guess without an upgrade pair", () => {
    const item = guessItem(fingerprint({ spell: 4350147 }));
    expect(item).toBeNull();
  });
});
