import { describe, expect, test } from "bun:test";

import { parseHiddenAutofillFields } from "./autofill-vote-pref";

describe("parseHiddenAutofillFields", () => {
  test("hides nothing when nothing is stored", () => {
    expect([...parseHiddenAutofillFields(null)]).toEqual([]);
  });

  test("treats the old global off flag as every field hidden", () => {
    expect([...parseHiddenAutofillFields("0")]).toEqual([
      "item",
      "totalUpgrades",
      "upgrades",
      "physical",
      "spell",
      "health",
    ]);
  });

  test("hides only the listed fields", () => {
    expect([...parseHiddenAutofillFields(JSON.stringify(["item", "health"]))]).toEqual([
      "item",
      "health",
    ]);
  });

  test("ignores unknown field names", () => {
    expect([...parseHiddenAutofillFields(JSON.stringify(["item", "stat"]))]).toEqual(["item"]);
  });
});
