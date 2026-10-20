import { describe, expect, test } from "bun:test";

import { ITEMS } from "./dqr-items";
import type { ExtractedTooltip } from "./ocr-extract";
import {
  autofillFromExtract,
  autofillFailureMessage,
  isAutofillField,
  missingAutofillFields,
  parseFeedbackPayload,
} from "./autofill-feedback";

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

function requireItem(id: string) {
  const item = ITEMS.find((row) => row.id === id);
  if (item === undefined) throw new Error(`missing ${id}`);
  return item;
}

describe("autofillFromExtract", () => {
  test("records item, upgrades, physical, and health for DPS warrior — not the garbage spell line", () => {
    const item = requireItem("VC:Lava King's");
    const fill = autofillFromExtract(
      extract({
        health: 9380777,
        item,
        physical: 739072,
        spell: 476,
        title: "Lava King's Warrior Armor",
        upsDone: 12000,
        upsTotal: 30000,
      }),
    );
    expect(fill.itemId).toBe(item.id);
    expect(fill.statStr).toBe("739072");
    expect(fill.spellStr).toBe("");
    expect(fill.healthStr).toBe("9380777");
    expect(fill.upsDoneStr).toBe("12000");
    expect(fill.upsTotalStr).toBe("30000");
    expect(fill.fields).toEqual(["item", "totalUpgrades", "upgrades", "physical", "health"]);
  });

  test("records spell not physical for mage-titled DPS armor", () => {
    const item = requireItem("NL:Midgardian");
    const fill = autofillFromExtract(
      extract({
        health: 65000000,
        item,
        physical: 203,
        spell: 4350147,
        title: "Midgardian Mage Helmet",
        upsDone: 90000,
        upsTotal: 96000,
      }),
    );
    expect(fill.statStr).toBe("4350147");
    expect(fill.fields).toEqual(["item", "totalUpgrades", "upgrades", "spell", "health"]);
  });

  test("records physical and spell separately on hybrid when both sit in range", () => {
    const item = requireItem("DT:Desert Fury");
    const fill = autofillFromExtract(
      extract({
        item,
        physical: 120,
        spell: 118,
        upsDone: 10,
        upsTotal: 24,
      }),
    );
    expect(fill.statStr).toBe("120");
    expect(fill.spellStr).toBe("118");
    expect(fill.fields).toEqual(["item", "totalUpgrades", "upgrades", "physical", "spell"]);
  });

  test("drops an out-of-range hybrid physical instead of autofilling an impossible number", () => {
    const item = requireItem("DT:Desert Fury");
    const fill = autofillFromExtract(extract({ item, physical: 9999, spell: 118 }));
    expect(fill.statStr).toBe("");
    expect(fill.spellStr).toBe("118");
    expect(fill.fields).toEqual(["item", "spell"]);
  });

  test("records health as the guardian primary and does not also tag physical", () => {
    const item = requireItem("NL:Jotunn Guardian");
    const fill = autofillFromExtract(
      extract({
        health: 140000000,
        item,
        physical: 12,
        upsDone: 100000,
        upsTotal: 105000,
      }),
    );
    expect(fill.statStr).toBe("140000000");
    expect(fill.healthStr).toBe("140000000");
    expect(fill.fields).toEqual(["item", "totalUpgrades", "upgrades", "health"]);
  });

  test("drops an impossible guardian health instead of autofilling it", () => {
    const item = requireItem("NL:Jotunn Guardian");
    const fill = autofillFromExtract(extract({ health: 1, item }));

    expect(fill.statStr).toBe("");
    expect(fill.healthStr).toBe("");
    expect(fill.fields).toEqual(["item"]);
  });

  test("drops an impossible upgrades total but keeps the plausible physical (Norse sliver read)", () => {
    const item = requireItem("NL:Norse Greataxe");
    const fill = autofillFromExtract(
      extract({ item, physical: 47584378, upsDone: null, upsTotal: 1 }),
    );
    expect(fill.upsTotalStr).toBe("");
    expect(fill.upsDoneStr).toBe("");
    expect(fill.statStr).toBe("47584378");
    expect(fill.fields).toEqual(["item", "physical"]);
  });

  test("omits item when the name missed, still records numbers that landed", () => {
    const fill = autofillFromExtract(
      extract({
        physical: 739072,
        upsDone: 12000,
        upsTotal: 30000,
      }),
    );
    expect(fill.itemId).toBe("");
    expect(fill.statStr).toBe("739072");
    expect(fill.fields).toEqual(["totalUpgrades", "upgrades", "physical"]);
  });

  test("omits a field OCR did not produce", () => {
    const item = requireItem("VC:Lava King's");
    const fill = autofillFromExtract(extract({ item, physical: 739072 }));
    expect(fill.fields).toEqual(["item", "physical"]);
    expect(fill.upsDoneStr).toBe("");
    expect(fill.healthStr).toBe("");
  });
});

describe("autofill failure messaging", () => {
  test("reports fields missed by an image scan", () => {
    const missing = missingAutofillFields(true, ["item", "physical"]);

    expect(missing).toEqual(["totalUpgrades", "upgrades", "spell", "health"]);
    expect(autofillFailureMessage("health", "", missing)).toBe("Failed to autofill.");
  });

  test("does not report missing fields before a scan or after manual entry", () => {
    expect(missingAutofillFields(false, [])).toEqual([]);
    expect(autofillFailureMessage("health", "9380777", ["health"])).toBeUndefined();
  });

  test("does not report an item cleared after OCR filled it", () => {
    const missing = missingAutofillFields(true, ["item"]);

    expect(autofillFailureMessage("item", "", missing)).toBeUndefined();
  });
});

describe("isAutofillField", () => {
  test("accepts the six OCR vote fields and rejects a lumped stat", () => {
    expect(isAutofillField("item")).toBe(true);
    expect(isAutofillField("totalUpgrades")).toBe(true);
    expect(isAutofillField("upgrades")).toBe(true);
    expect(isAutofillField("physical")).toBe(true);
    expect(isAutofillField("spell")).toBe(true);
    expect(isAutofillField("health")).toBe(true);
    expect(isAutofillField("stat")).toBe(false);
    expect(isAutofillField("rarity")).toBe(false);
  });
});

describe("parseFeedbackPayload", () => {
  test("parses a per-field vote", () => {
    expect(parseFeedbackPayload({ accurate: false, calculationId: 3, field: "upgrades" })).toEqual({
      accurate: false,
      calculationId: 3,
      field: "upgrades",
    });
  });

  test("rejects a whole-calc vote with no field", () => {
    expect(parseFeedbackPayload({ accurate: true, calculationId: 3 })).toBeNull();
  });

  test("rejects an unknown field name", () => {
    expect(parseFeedbackPayload({ accurate: true, calculationId: 3, field: "stat" })).toBeNull();
  });
});
