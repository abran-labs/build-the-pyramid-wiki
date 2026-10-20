/*
  Name-matching torture test — scripts/test-name-matching.ts.

  Feeds OCR-style perturbed item names through extractTooltip and checks
  the match. Perturbations model real Tesseract noise: letter/digit
 *confusions, dropped/duplicated/swapped characters, injected junk, lost
  spaces, and armor-piece qualifiers. Run: `bun scripts/test-name-matching.ts`.
*/

import { ITEMS } from "../src/lib/dqr-items.ts";
import { extractTooltip } from "../src/lib/ocr-extract.ts";

// Deterministic LCG so runs are reproducible.
let seed = 1;
const rand = (): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)] as T;

const CONFUSIONS: ReadonlyArray<readonly [string, string]> = [
  ["o", "0"], ["l", "1"], ["i", "1"], ["s", "5"], ["b", "8"],
  ["g", "9"], ["t", "7"], ["z", "2"], ["e", "c"], ["a", "e"],
];

const JUNK = ["|", ")", "]", ".", ",", "'", ":", ";", "‘", "\""];

function perturb(word: string): string {
  if (word.length < 2) return word;
  const ops = 1 + Math.floor(rand() * 2);
  let w = word;
  for (let i = 0; i < ops; i++) {
    const kind = Math.floor(rand() * 5);
    const pos = Math.floor(rand() * w.length);
    if (kind === 0) {
      const conf = CONFUSIONS.find(([x]) => x === w[pos]);
      if (conf) w = w.slice(0, pos) + conf[1] + w.slice(pos + 1);
    } else if (kind === 1) {
      w = w.slice(0, pos) + w.slice(pos + 1);
    } else if (kind === 2) {
      w = w.slice(0, pos) + (w[pos] ?? "") + w.slice(pos);
    } else if (kind === 3) {
      w = w.slice(0, pos) + pick(JUNK) + w.slice(pos);
    } else if (pos < w.length - 1) {
      w = w.slice(0, pos) + (w[pos + 1] ?? "") + (w[pos] ?? "") + w.slice(pos + 2);
    }
  }
  return w;
}

const PIECE_WORDS = ["Helmet", "Chestplate", "Armor", "Boots", "Gauntlets"];

function noisyName(name: string): string {
  let words = name.split(" ").map((w) => (rand() < 0.5 ? perturb(w) : w));
  if (rand() < 0.15) words = [words.join("")]; // lost a space
  if (rand() < 0.15) words = ["|", ...words]; // border artifact
  if (rand() < 0.15) words = [...words, pick(PIECE_WORDS)]; // piece qualifier
  return words.join(" ");
}

const VARIANTS = 6;

let ok = 0;
let wrong = 0;
let missed = 0;
const failures: string[] = [];

ITEMS.forEach((item, itemIdx) => {
  for (let v = 0; v < VARIANTS; v++) {
    seed = itemIdx * 7919 + v * 104729 + 42;
    const line = noisyName(item.name);
    const scan = {
      imageDataUrl: null,
      nameText: "",
      processedText: `${line}\nUpgrades: 1/2`,
      rarity: null,
      rawText: `${line}\nUpgrades: 1/2`,
    };
    const ex = extractTooltip(scan);
    if (ex.item?.id === item.id) {
      ok++;
    } else if (ex.item) {
      wrong++;
      if (failures.length < 40) failures.push(`WRONG ${item.name} => ${ex.item.name} <= "${line}"`);
    } else {
      missed++;
      if (failures.length < 40) failures.push(`MISS ${item.name} <= "${line}"`);
    }
  }
});

const total = ITEMS.length * VARIANTS;
console.log(`total=${total} ok=${ok} (${((ok / total) * 100).toFixed(1)}%) wrong=${wrong} missed=${missed}`);
for (const f of failures) console.log(f);
