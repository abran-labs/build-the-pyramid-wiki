import { expect, test } from "bun:test";

import { hatchesText, oddsText, oneIn, petMatches, PETS } from "./pets";

const pet = (name: string) => {
  const found = PETS.find((entry) => entry.name === name);
  if (found === undefined) throw new Error(`missing ${name}`);
  return found;
};

test("name match is a substring", () => {
  expect(petMatches(pet("Hermit Crab"), "crab")).toBe(true);
  expect(petMatches(pet("Hermit Crab"), "mit c")).toBe(true);
});

test("rarity match is a prefix, not a substring", () => {
  expect(petMatches(pet("Cat"), "rare")).toBe(false);
  expect(petMatches(pet("Cobra"), "rar")).toBe(true);
  expect(petMatches(pet("Cobra"), "are")).toBe(false);
});

test("common pets show a real percent, not 1 in 1", () => {
  expect(oddsText(pet("Cactus"))).toBe("68.8%");
  expect(oddsText(pet("Cat"))).toBe("58%");
  expect(oddsText(pet("Scarab"))).not.toBe("1 in 1");
});

test("base odds match the egg roll", () => {
  expect(oneIn(pet("Apophis"))).toBe(25000000);
  expect(oneIn(pet("Dragon of Ra"))).toBe(5000000);
  expect(oneIn(pet("Grim Reaper"))).toBe(50000000);
});

test("chase odds scale by 1 plus luck", () => {
  expect(oneIn(pet("Apophis"), 1)).toBe(12500000);
  expect(oneIn(pet("Apophis"), 11.5)).toBe(2000000);
});

test("average hatches is one over the chance", () => {
  expect(hatchesText(pet("Apophis"))).toBe("25,000,000");
  expect(hatchesText(pet("Apophis"), 11.5)).toBe("2,000,000");
  expect(hatchesText(pet("Cat"))).toBe("1.7");
});

test("limited and event words are prefixes", () => {
  expect(petMatches(pet("Scarab"), "lim")).toBe(true);
  expect(petMatches(pet("Cat"), "lim")).toBe(false);
  expect(petMatches(pet("Osiris"), "halloween")).toBe(true);
  expect(petMatches(pet("Osiris"), "2026")).toBe(true);
});
