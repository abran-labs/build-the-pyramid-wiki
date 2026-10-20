import { describe, expect, test } from "bun:test";

import { ITEMS } from "./dqr-items";
import { numberRuns, readFieldPaste, type PasteField } from "./ocr-field";
import type { TooltipScan } from "./ocr";

function scan(rawText: string, processedText = ""): TooltipScan {
  return { imageDataUrl: null, nameText: "", processedText, rarity: null, rawText };
}

describe("numberRuns", () => {
  test("reads a bare number with group separators", () => {
    expect(numberRuns(" 1,284,000 ")).toEqual([1284000]);
  });

  test("reads slash- and space-separated runs", () => {
    expect(numberRuns("33/331")).toEqual([33, 331]);
    expect(numberRuns("33 331")).toEqual([33, 331]);
  });

  test("rejects letters and oversized digits", () => {
    expect(numberRuns("Health: 9380777")).toEqual([]);
    expect(numberRuns("12345678901234567890")).toEqual([]);
  });
});

describe("readFieldPaste — bare number crops", () => {
  test("a zoomed-in number pastes as-is into any field", () => {
    const s = scan("1,284,000", "1,284,000");
    expect(readFieldPaste("health", s, null).value).toBe(1284000);
    expect(readFieldPaste("upsDone", s, null).value).toBe(1284000);
  });

  test("duplicate reads across the two passes collapse to one value", () => {
    expect(readFieldPaste("stat", scan("739072", "739072"), null).value).toBe(739072);
  });

  test("a two-number crop fills the upgrade pair", () => {
    const read = readFieldPaste("upsDone", scan("33/331"), null);
    expect(read.value).toBe(33);
    expect(read.done).toBe(33);
    expect(read.total).toBe(331);

    const fromTotal = readFieldPaste("upsTotal", scan("33 331"), null);
    expect(fromTotal.value).toBe(331);
  });

  test("letters in the crop mean no bare read", () => {
    expect(readFieldPaste("health", scan("938o777"), null).value).toBeNull();
  });
});

describe("readFieldPaste — tooltip crops", () => {
  const tooltip = scan(
    "Midgardian Mage Helmet\nPhysical Damage: 739072\nSpell Power: 476\nHealth: 9380777\nUpgrades: 33/331",
    "",
  );

  test("labels win over the pasted field's own perspective", () => {
    expect(readFieldPaste("health", tooltip, null).value).toBe(9380777);
    expect(readFieldPaste("spell", tooltip, null).value).toBe(476);
    expect(readFieldPaste("upsTotal", tooltip, null).value).toBe(331);
    expect(readFieldPaste("upsDone", tooltip, null).done).toBe(33);
  });

  test("stat field picks the item's primary track", () => {
    const mid = ITEMS.find((item) => item.id === "NL:Midgardian");
    if (mid === undefined) throw new Error("missing Midgardian");
    const mageTooltip = scan(
      "Midgardian Mage Helmet\nPhysical Damage: 203\nSpell Power: 4350147\nHealth: 9380777\nUpgrades: 33/331",
      "",
    );
    expect(readFieldPaste("stat", mageTooltip, mid).value).toBe(4350147);
  });

  test("guardian stat field reads the health line", () => {
    const guardian = ITEMS.find((item) => item.class === "guardian");
    if (guardian === undefined) throw new Error("missing guardian item");
    expect(readFieldPaste("stat", tooltip, guardian).value).toBe(9380777);
  });

  test("a tooltip never yields a bare-number read for stat fields", () => {
    const messy = scan("Sell: 50912345\nsomething 123 456");
    expect(readFieldPaste("stat", messy, null).value).toBeNull();
  });

  test("upgrade pair survives the done/total glue misread", () => {
    const glued = scan("Upgrades: 2854028540");
    const read = readFieldPaste("upsDone", glued, null);
    expect(read.done).toBe(28540);
    expect(read.total).toBe(28540);
  });
});

describe("readFieldPaste — no plausible read", () => {
  test("field without its label and no bare number stays null", () => {
    const physicalOnly = scan("Physical Damage: 739072");
    for (const field of ["health", "spell", "upsTotal"] as const satisfies readonly PasteField[]) {
      expect(readFieldPaste(field, physicalOnly, null).value).toBeNull();
    }
  });
});
