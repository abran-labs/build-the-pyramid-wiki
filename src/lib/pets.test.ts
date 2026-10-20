import { expect, test } from "bun:test";

import { petMatches, PETS } from "./pets";

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

test("limited and event words are prefixes", () => {
  expect(petMatches(pet("Scarab"), "lim")).toBe(true);
  expect(petMatches(pet("Cat"), "lim")).toBe(false);
  expect(petMatches(pet("Osiris"), "halloween")).toBe(true);
  expect(petMatches(pet("Osiris"), "2026")).toBe(true);
});
