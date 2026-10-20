/*
  One-off generator: docs/Info/DQR_Min_Max_List.csv -> src/lib/dqr-items.ts

  Run: bun run scripts/build-dqr-items.ts   (script `bun run gen:items`)

  Rules (docs/Info/Item-Data.md):
  - Skip blank padding rows.
  - Normalize the `Pi` initials typo to `PI`; trim names, collapse inner
    whitespace, unify curly apostrophes.
  - Multi-row items: rows sorted by Min Ups are rarities in ascending order
    Common / Uncommon / Rare / Epic.
  - Single-row items: rarity from the `Class` suffix (`War Legend` ->
    Legendary, `Mage Ultimate` -> Ultimate). Bare `Legendary` (Desert Fury,
    Crystalised Greatsword) is class `hybrid` — two offense tracks.
  - `Min/Max Potential` derived via base + ups * 10 when the row checks out
    (PI onward), stored explicitly otherwise (WO/DT legacy, PI Godly).
  - Health fields stored only when present/nonzero.
*/

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const CSV_PATH = resolve(ROOT, "docs/Info/DQR_Min_Max_List.csv");
const OUT_PATH = resolve(ROOT, "src/lib/dqr-items.ts");

// DQR release order (easiest → hardest). Generated DUNGEONS + ITEMS reverse
// this so the calculator lists and searches hardest first.
// Boss Raids (between SS and OO in-game) has no sheet data yet; add rows + an
// entry here when it does.
const DUNGEONS: readonly { code: string; name: string; color: string }[] = [
  { code: "DT", name: "Desert Temple", color: "#D4B483" },
  { code: "WO", name: "Winter Outpost", color: "#8EB8FF" },
  { code: "PI", name: "Pirate Island", color: "#4DB6AC" },
  { code: "KC", name: "King's Castle", color: "#E25C5C" },
  { code: "UW", name: "The Underworld", color: "#E53935" },
  { code: "SP", name: "Samurai Palace", color: "#F5C542" },
  { code: "TC", name: "The Canals", color: "#B388FF" },
  { code: "GH", name: "Ghastly Harbor", color: "#2BB673" },
  { code: "SS", name: "Steampunk Sewers", color: "#F0A202" },
  { code: "OO", name: "Orbital Outpost", color: "#00E5FF" },
  { code: "VC", name: "Volcanic Chambers", color: "#FF6B1A" },
  { code: "AT", name: "Aquatic Temple", color: "#1EA0FF" },
  { code: "EF", name: "Enchanted Forest", color: "#C4B5FD" },
  { code: "NL", name: "Northern Lands", color: "#5EEAD4" },
  { code: "GS", name: "Gilded Skies", color: "#FACC15" },
];

const DUNGEON_ORDER = new Map<string, number>(DUNGEONS.map((d, i) => [d.code, i] as const));
const ROW_RARITIES = ["common", "uncommon", "rare", "epic"] as const;

/** Minimal CSV parser — quoted fields with commas exist in item names. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const num = (value: string): number => {
  const trimmed = value.trim();
  if (trimmed === "") return Number.NaN;
  const parsed = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const normalizeName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").replace(/[\u2018\u2019]/g, "'");

interface RawRow {
  dungeon: string;
  name: string;
  minUps: number;
  maxUps: number;
  minBase: number;
  maxBase: number;
  class: string;
  health: number;
  minPot: number;
  maxPot: number;
  lowestHp: number;
  highestHp: number;
}

const raw: RawRow[] = [];
let skippedRows = 0;
const skippedDungeons = new Set<string>();
{
  const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));
  const header = rows[0]?.map((h) => h.trim()) ?? [];
  const col = (name: string): number => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`CSV header missing column: ${name}`);
    return index;
  };
  const cInit = col("Initials");
  const cName = col("Item Name");
  const cMinUps = col("Min Ups");
  const cMaxUps = col("Max Ups");
  const cMinBase = col("Min Base");
  const cMaxBase = col("Max Base");
  const cClass = col("Class");
  const cHealth = col("Health");
  const cMinPot = col("Min Potential");
  const cMaxPot = col("Max Potential");
  const cLowHp = col("Lowest Health");
  const cHighHp = col("Highest Health");

  for (const cells of rows.slice(1)) {
    const dungeon = (cells[cInit] ?? "").trim().toUpperCase();
    const name = normalizeName(cells[cName] ?? "");
    if (dungeon === "" || name === "") continue; // blank padding rows
    if (!DUNGEON_ORDER.has(dungeon)) {
      // Outside DQR's current content (e.g. GS) — skip, but surface it.
      skippedRows++;
      skippedDungeons.add(dungeon);
      continue;
    }
    raw.push({
      class: (cells[cClass] ?? "").trim(),
      dungeon,
      health: num(cells[cHealth] ?? ""),
      highestHp: num(cells[cHighHp] ?? ""),
      maxBase: num(cells[cMaxBase] ?? ""),
      maxPot: num(cells[cMaxPot] ?? ""),
      maxUps: num(cells[cMaxUps] ?? ""),
      minBase: num(cells[cMinBase] ?? ""),
      minPot: num(cells[cMinPot] ?? ""),
      minUps: num(cells[cMinUps] ?? ""),
      name,
      lowestHp: num(cells[cLowHp] ?? ""),
    });
  }
}

interface Group {
  dungeon: string;
  name: string;
  rows: RawRow[];
}

const groups = new Map<string, Group>();
for (const row of raw) {
  const key = `${row.dungeon}\u0000${row.name}`;
  const existing = groups.get(key);
  if (existing) existing.rows.push(row);
  else groups.set(key, { dungeon: row.dungeon, name: row.name, rows: [row] });
}

const classOf = (klass: string): "war" | "mage" | "guardian" | "dps" | "hybrid" => {
  if (klass === "Legendary") return "hybrid";
  if (klass.startsWith("War")) return "war";
  if (klass.startsWith("Mage")) return "mage";
  if (klass === "Guardian") return "guardian";
  if (klass === "DPS Armor") return "dps";
  throw new Error(`Unknown class: ${klass}`);
};

const singleRarityOf = (klass: string): "legendary" | "ultimate" => {
  if (klass.endsWith("Ultimate")) return "ultimate";
  if (klass.endsWith("Legend") || klass === "Legendary") return "legendary";
  throw new Error(`Single-row item without rarity suffix: ${klass}`);
};

type OutRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "ultimate";
type OutClass = "war" | "mage" | "guardian" | "dps" | "hybrid";

interface OutRow {
  rarity: OutRarity;
  minUps: number;
  maxUps: number;
  minBase: number;
  maxBase: number;
  minPot?: number;
  maxPot?: number;
  health?: number;
  lowestHealth?: number;
  highestHealth?: number;
}

interface OutItem {
  id: string;
  dungeon: string;
  name: string;
  class: OutClass;
  /** Best rarity this item can be — drives dropdown coloring. */
  maxRarity: OutRarity;
  glitched?: true;
  rows: OutRow[];
}

const items: OutItem[] = [];
let derivedCount = 0;
let storedCount = 0;
const storedSamples: string[] = [];

for (const group of groups.values()) {
  const rows = [...group.rows].sort((a, b) => a.minUps - b.minUps);
  const first = rows[0];
  if (!first) continue;
  const single = rows.length === 1;
  const outRows: OutRow[] = [];
  for (const [index, row] of rows.entries()) {
    // Ultimates carry no stat cells in the sheet yet — keep the item, drop the row.
    if (
      !Number.isFinite(row.minUps) || !Number.isFinite(row.maxUps) ||
      !Number.isFinite(row.minBase) || !Number.isFinite(row.maxBase)
    ) continue;
    const rarity = single
      ? singleRarityOf(row.class)
      : (ROW_RARITIES[index] ?? "epic");
    const derived =
      row.minPot === row.minBase + row.minUps * 10 &&
      row.maxPot === row.maxBase + row.maxUps * 10;
    if (derived) derivedCount++;
    else {
      storedCount++;
      if (storedSamples.length < 8) storedSamples.push(`${group.dungeon} ${group.name} (${rarity})`);
    }
    const out: OutRow = {
      maxBase: row.maxBase,
      maxUps: row.maxUps,
      minBase: row.minBase,
      minUps: row.minUps,
      rarity,
    };
    if (!derived) {
      out.minPot = row.minPot;
      out.maxPot = row.maxPot;
    }
    if (Number.isFinite(row.health) && row.health > 0) out.health = row.health;
    if (Number.isFinite(row.lowestHp) && row.lowestHp > 0) out.lowestHealth = row.lowestHp;
    if (Number.isFinite(row.highestHp) && row.highestHp > 0) out.highestHealth = row.highestHp;
    outRows.push(out);
  }

  items.push({
    class: classOf(first.class),
    dungeon: group.dungeon,
    maxRarity:
      outRows.length > 0
        ? (outRows[outRows.length - 1]?.rarity ?? "common")
        : singleRarityOf(first.class),
    ...(group.name.startsWith("(Glitched)") ? { glitched: true as const } : {}),
    id: `${group.dungeon}:${group.name}`,
    name: group.name,
    rows: outRows,
  });
}

items.sort((a, b) => {
  const da = DUNGEON_ORDER.get(a.dungeon) ?? 99;
  const db = DUNGEON_ORDER.get(b.dungeon) ?? 99;
  // Within a dungeon: best rarity first (ultimate -> common), then weapons
  // (warrior, mage) ahead of armor (DPS, Guardian), then name.
  const RARITY_RANK: Record<OutRarity, number> = {
    ultimate: 0, legendary: 1, epic: 2, rare: 3, uncommon: 4, common: 5,
  };
  const CLASS_RANK: Record<OutClass, number> = { war: 0, hybrid: 0, mage: 1, dps: 2, guardian: 3 };
  return (
    db - da ||
    RARITY_RANK[a.maxRarity] - RARITY_RANK[b.maxRarity] ||
    CLASS_RANK[a.class] - CLASS_RANK[b.class] ||
    a.name.localeCompare(b.name)
  );
});

const header = `/*
  GENERATED FILE — do not edit by hand.
  Source: docs/Info/DQR_Min_Max_List.csv via scripts/build-dqr-items.ts (bun run gen:items).
  Data rules and rarity mapping: docs/Info/Item-Data.md.
*/

export type ItemClass = "war" | "mage" | "guardian" | "dps" | "hybrid";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "ultimate";

/** Canonical rarity labels + colors (one owner). Colors match the game's
 *  scheme (gray/green/blue/purple/orange/red) tuned for the dark theme. */
export const RARITY_INFO: Record<Rarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#9CA3AF" },
  uncommon: { label: "Uncommon", color: "#4ADE80" },
  rare: { label: "Rare", color: "#60A5FA" },
  epic: { label: "Epic", color: "#C084FC" },
  legendary: { label: "Legendary", color: "#FB923C" },
  ultimate: { label: "Ultimate", color: "#F87171" },
};

export interface DungeonInfo {
  code: DungeonCode;
  name: string;
  color: string;
}

export type DungeonCode = ${DUNGEONS.map((d) => `"${d.code}"`).join(" | ")};

export const DUNGEONS: DungeonInfo[] = [
${[...DUNGEONS].reverse().map((d) => `  { code: "${d.code}", name: "${d.name}", color: "${d.color}" },`).join("\n")}
];

export interface ItemRarityRow {
  readonly rarity: Rarity;
  readonly minUps: number;
  readonly maxUps: number;
  readonly minBase: number;
  readonly maxBase: number;
  /** Present only when base + ups * 10 does not hold (legacy dungeons). */
  readonly minPot?: number;
  readonly maxPot?: number;
  /** Nominal armor health (DPS-armor rows). */
  readonly health?: number;
  /** Armor health roll range, when the track exists. */
  readonly lowestHealth?: number;
  readonly highestHealth?: number;
}

export interface DqrItem {
  readonly id: string;
  readonly dungeon: DungeonCode;
  readonly name: string;
  readonly class: ItemClass;
  /** Best rarity this item can be — drives dropdown coloring. */
  readonly maxRarity: Rarity;
  /** True only for the GH "(Glitched)" rows. */
  readonly glitched?: true;
  readonly rows: readonly ItemRarityRow[];
}

export const ITEMS: readonly DqrItem[] = [
`;

const body = items
  .map((item) => {
    const rows = item.rows
      .map((row) => {
        const parts = Object.entries(row)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(", ");
        return `    { ${parts} },`;
      })
      .join("\n");
    const glitched = item.glitched ? " glitched: true," : "";
    return `  {\n    id: ${JSON.stringify(item.id)},\n    dungeon: ${JSON.stringify(item.dungeon)},\n    name: ${JSON.stringify(item.name)},\n    class: ${JSON.stringify(item.class)},\n    maxRarity: ${JSON.stringify(item.maxRarity)},${glitched}\n    rows: [\n${rows}\n    ],\n  },`;
  })
  .join("\n");

const footer = `\n];\n`;

writeFileSync(OUT_PATH, header + body + footer);

const rarityTally = new Map<string, number>();
for (const item of items) {
  for (const row of item.rows) rarityTally.set(row.rarity, (rarityTally.get(row.rarity) ?? 0) + 1);
}
console.log(`[gen] ${raw.length} CSV rows -> ${items.length} items, ${items.reduce((n, i) => n + i.rows.length, 0)} rarity rows`);
if (skippedRows > 0) console.log(`[gen] skipped ${skippedRows} rows outside DQR content: ${[...skippedDungeons].join(", ")}`);
console.log(`[gen] pot formula: ${derivedCount} derived, ${storedCount} stored explicitly${storedCount > 0 ? ` (e.g. ${storedSamples.join("; ")})` : ""}`);
console.log(`[gen] rows per rarity: ${[...rarityTally.entries()].map(([k, v]) => `${k}=${v}`).join(" ")}`);
console.log(`[gen] wrote ${OUT_PATH}`);
