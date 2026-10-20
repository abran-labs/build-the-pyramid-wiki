import { describe, expect, test } from "bun:test";

import { extractTooltip } from "./ocr-extract";
import type { TooltipScan } from "./ocr";

function scan(partial: Partial<TooltipScan> & Pick<TooltipScan, "processedText" | "rawText">): TooltipScan {
  return {
    imageDataUrl: null,
    nameText: "",
    rarity: null,
    ...partial,
  };
}

describe("extractTooltip name matching", () => {
  test("reads Crystalline Shard Staff from the white name plate when other passes miss it", () => {
    // Given: assets/4.png — threshold/color passes drop the white title
    const ex = extractTooltip(
      scan({
        nameText: "Crystalline Shard Staff\nREQ Lvl 175",
        processedText: "Physical\nDamage: 1007\nSpell\nPower: 27154454\nUpgrades: 0/282463",
        rawText: "Physical\nDamage: 1007\nSpell\nPower: 27154454\nUpgrades: 0/282463",
      }),
    );
    // Then
    expect(ex.item?.name).toBe("Crystalline Shard Staff");
    expect(ex.title).toBe("Crystalline Shard Staff");
  });

  test("still reads Midgardian from the threshold pass when nameText is empty", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Midgardian Mage Helmet\nPhysical\nPower: 4350147",
        rawText: "Physical\nPower: 4350147",
      }),
    );
    expect(ex.item?.name).toBe("Midgardian");
    expect(ex.title).toBe("Midgardian Mage Helmet");
  });

  test("guesses Midgardian from stats when no title line is present", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Physical\nPower: 203\nSpell\nPower: 4350147\nUpgrades: 94812/94812",
        rawText: "Physical\nPower: 203\nSpell\nPower: 4350147\nUpgrades: 94812/94812",
      }),
    );
    expect(ex.item?.name).toBe("Midgardian");
    expect(ex.title).toBeNull();
  });
});

describe("extractTooltip upgrades", () => {
  test("keeps a slash pair including zero done", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Upgrades: 0/282463",
        rawText: "Upgrades: 0/282463",
      }),
    );
    expect(ex.upsDone).toBe(0);
    expect(ex.upsTotal).toBe(282463);
  });

  test("splits a missing-slash concat of two equal halves", () => {
    // Given: assets/Rarities/Common.png color pass — slash dropped
    const ex = extractTooltip(
      scan({
        processedText: "Upgrades: 2854028540",
        rawText: "Upgrades: 2854028540",
      }),
    );
    expect(ex.upsDone).toBe(28540);
    expect(ex.upsTotal).toBe(28540);
  });

  test("splits a slash read as 1 between equal halves", () => {
    // Given: Common.png threshold/1x pass — `/` → `1`
    const ex = extractTooltip(
      scan({
        processedText: "Upgrades: 28540128540",
        rawText: "Upgrades: 28540128540",
      }),
    );
    expect(ex.upsDone).toBe(28540);
    expect(ex.upsTotal).toBe(28540);
  });

  test("drops a doubled digit when done is one digit longer than total and exceeds it", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Upgrades: 288540/28540",
        rawText: "Upgrades: 288540/28540",
      }),
    );
    expect(ex.upsDone).toBe(28540);
    expect(ex.upsTotal).toBe(28540);
  });

  test("does not strip a genuine done that exceeds total without an extra doubled digit", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Upgrades: 30000/28000",
        rawText: "Upgrades: 30000/28000",
      }),
    );
    expect(ex.upsDone).toBe(30000);
    expect(ex.upsTotal).toBe(28000);
  });

  test("reads Common.png OCR text into Lava King's fields", () => {
    const ex = extractTooltip(
      scan({
        nameText: "Lava King's Warrior\nArmor",
        processedText:
          "Armor\nPhysical\nrower. 139072\nSpell\nPower: 476\nHealth: 9380777\nREQ LvL.156\nUpgrades: 28540128540\nSell: 514525578",
        rawText:
          "Armor\nPhysical\npower: 739072\nSpell\nPower: 476\nHealth: 9380777\nREQLVIL1I56\nUpgrades: 2854028540\nSell: 514525578",
      }),
    );
    expect(ex.item?.name).toBe("Lava King's");
    expect(ex.physical).toBe(739072);
    expect(ex.health).toBe(9380777);
    expect(ex.upsDone).toBe(28540);
    expect(ex.upsTotal).toBe(28540);
  });
});

describe("extractTooltip stats", () => {
  test("reads physical when OCR turns Power into DOWer", () => {
    const ex = extractTooltip(
      scan({
        processedText: "Physical\nDOWer: 739072\nSpell\nPower: 476",
        rawText: "Physical\nDOWer: 739072\nSpell\nPower: 476",
      }),
    );
    expect(ex.physical).toBe(739072);
  });

  test("reads physical when the number sits on the Physical line and power wraps", () => {
    // Given: Common.png layout — value right of "Physical", "power:" on the next line
    const ex = extractTooltip(
      scan({
        processedText: "Physical 739072\npower:\nSpell\nPower: 476",
        rawText: "Physical 739072\npower:\nSpell\nPower: 476",
      }),
    );
    expect(ex.physical).toBe(739072);
    expect(ex.spell).toBe(476);
  });
});

