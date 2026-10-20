import { describe, expect, test } from "bun:test";

import { armorPiece, displayItemName } from "./item-display";

describe("displayItemName", () => {
  test("weapon uses the dataset name verbatim", () => {
    expect(displayItemName({ class: "mage", name: "Ice Spellblade" }, "spell", "Ice Spellblado")).toBe(
      "Ice Spellblade",
    );
  });

  test("no item renders empty", () => {
    expect(displayItemName(undefined, "physical", null)).toBe("");
  });

  test("DPS spell track renders Mage Helmet, ignoring OCR type words", () => {
    // Given a Mage-rolled set with a garbled/wrong OCR title
    // When spell is our offense classification
    // Then the type word is Mage regardless of the title string
    expect(
      displayItemName({ class: "dps", name: "Midgardian" }, "spell", "Midgardian Warrior Helmet"),
    ).toBe("Midgardian Mage Helmet");
  });

  test("DPS physical track renders Warrior Armor", () => {
    expect(
      displayItemName({ class: "dps", name: "Midgardian" }, "physical", "Midgardian Warrior Armor"),
    ).toBe("Midgardian Warrior Armor");
  });

  test("DPS chest synonyms normalize to Armor", () => {
    expect(
      displayItemName({ class: "dps", name: "Midgardian" }, "spell", "Midgardian Mage Chestplate"),
    ).toBe("Midgardian Mage Armor");
  });

  test("DPS without a piece word defaults to Armor", () => {
    expect(displayItemName({ class: "dps", name: "Midgardian" }, "spell", null)).toBe(
      "Midgardian Mage Armor",
    );
  });

  test("guardian appends only the slot (dataset name already has Guardian)", () => {
    expect(
      displayItemName({ class: "guardian", name: "Midgardian Guardian" }, "physical", "whatever Helmet"),
    ).toBe("Midgardian Guardian Helmet");
  });

  test("guardian without a piece word defaults to Armor", () => {
    expect(displayItemName({ class: "guardian", name: "Midgardian Guardian" }, "physical", null)).toBe(
      "Midgardian Guardian Armor",
    );
  });
});

describe("armorPiece", () => {
  test("closed set only", () => {
    const pieces = [
      armorPiece({ class: "dps", name: "Midgardian" }, "spell", "Midgardian Mage Helmet"),
      armorPiece({ class: "dps", name: "Midgardian" }, "spell", "Midgardian Mage Armor"),
      armorPiece({ class: "dps", name: "Midgardian" }, "physical", "x Helmet"),
      armorPiece({ class: "dps", name: "Midgardian" }, "physical", "x Armor"),
      armorPiece({ class: "guardian", name: "Midgardian Guardian" }, "physical", "x Helmet"),
      armorPiece({ class: "guardian", name: "Midgardian Guardian" }, "physical", "x Armor"),
    ];
    expect(pieces).toEqual([
      "Mage Helmet",
      "Mage Armor",
      "Warrior Helmet",
      "Warrior Armor",
      "Guardian Helmet",
      "Guardian Armor",
    ]);
  });

  test("weapons have no piece", () => {
    expect(armorPiece({ class: "war", name: "Hofund" }, "physical", null)).toBeNull();
    expect(armorPiece({ class: "hybrid", name: "Desert Fury" }, "spell", null)).toBeNull();
  });
});
