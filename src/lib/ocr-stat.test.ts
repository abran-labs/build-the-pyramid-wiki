import { describe, expect, test } from "bun:test";

import { ITEMS } from "./dqr-items";
import type { ExtractedTooltip } from "./ocr-extract";
import { pickTooltipStat, statFieldLabel } from "./ocr-stat";

function extract(partial: Partial<ExtractedTooltip>): ExtractedTooltip {
  return {
    health: null,
    item: null,
    physical: null,
    spell: null,
    title: null,
    upsDone: null,
    upsTotal: null,
    ...partial,
  };
}

const lava = ITEMS.find((item) => item.id === "VC:Lava King's");

describe("pickTooltipStat", () => {
  test("picks physical for Lava King's warrior armor when both lines exist", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    const picked = pickTooltipStat(
      extract({
        health: 9380777,
        item: lava,
        physical: 739072,
        spell: 476,
        title: "Lava King's Warrior Armor",
      }),
      lava,
    );
    expect(picked.value).toBe(739072);
    expect(picked.kind).toBe("physical");
  });

  test("picks spell for mage-titled DPS armor", () => {
    const mid = ITEMS.find((item) => item.id === "NL:Midgardian");
    if (mid === undefined) throw new Error("missing Midgardian");
    const picked = pickTooltipStat(
      extract({
        physical: 203,
        spell: 4350147,
        title: "Midgardian Mage Helmet",
      }),
      mid,
    );
    expect(picked.value).toBe(4350147);
    expect(picked.kind).toBe("spell");
  });

  test("picks the in-range stat when title has no warrior/mage hint", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    const picked = pickTooltipStat(
      extract({ physical: 739072, spell: 476, title: "Lava King's Armor" }),
      lava,
    );
    expect(picked.value).toBe(739072);
    expect(picked.kind).toBe("physical");
  });

  test("keeps an out-of-range warrior stat for form validation", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    const picked = pickTooltipStat(
      extract({ item: lava, physical: 1, title: "Lava King's Warrior Armor" }),
      lava,
    );

    expect(picked.kind).toBe("physical");
    expect(picked.value).toBe(1);
  });

  test("keeps a DPS Mage title on spell track when spell OCR is missing", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    const picked = pickTooltipStat(
      extract({ item: lava, physical: 739072, title: "Lava King's Mage Armor" }),
      lava,
    );

    expect(picked.kind).toBe("spell");
    expect(picked.value).toBeNull();
  });
});

describe("statFieldLabel", () => {
  test("CSV Legendary items are hybrid class", () => {
    expect(ITEMS.find((item) => item.id === "DT:Desert Fury")?.class).toBe("hybrid");
    expect(ITEMS.find((item) => item.id === "WO:Crystalised Greatsword")?.class).toBe("hybrid");
  });

  test("names DPS warrior armor Physical Power, not Physical / Spell Power", () => {
    if (lava === undefined) throw new Error("missing Lava King's");
    expect(statFieldLabel(lava, "physical")).toBe("Physical Power");
    expect(statFieldLabel(lava, "spell")).toBe("Spell Power");
  });
});
