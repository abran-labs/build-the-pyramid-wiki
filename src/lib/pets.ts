// Snapshot of PetConfig / EggConfig / PetPresentationConfig. The game repo owns
// the numbers. Luck is not applied here.

export type WorldId = "desert" | "halloween";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Secret" | "Exclusive";

export type PetStat = "Coins" | "CandyCorn";

export type Pet = {
  readonly id: string;
  readonly name: string;
  readonly rarity: Rarity;
  readonly eggId: string;
  readonly limited: boolean;
  readonly eventName: string | null;
  readonly coins: number;
  readonly candyCorn: number | null;
};

export type Egg = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly world: WorldId;
};

const eggIcon = (assetId: string): string =>
  `https://www.roblox.com/asset-thumbnail/image?assetId=${assetId}&width=150&height=150&format=png`;

export const RARITY_COLOR: Record<Rarity, string> = {
  Common: "rgb(200, 215, 230)",
  Uncommon: "rgb(127, 255, 80)",
  Rare: "rgb(50, 205, 255)",
  Epic: "rgb(210, 100, 255)",
  Legendary: "rgb(255, 200, 60)",
  Mythic: "rgb(195, 95, 255)",
  Secret: "rgb(255, 105, 200)",
  Exclusive: "rgb(255, 140, 140)",
};

const RARITY_RANK: Record<Rarity, number> = {
  Exclusive: 0,
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
  Mythic: 6,
  Secret: 7,
};

export const EGGS: readonly Egg[] = [
  { id: "Basic", name: "Basic Egg", icon: eggIcon("97217412497181"), world: "desert" },
  { id: "Sacred", name: "Sacred Egg", icon: eggIcon("108003423969757"), world: "desert" },
  { id: "Nile", name: "Nile Egg", icon: eggIcon("127176556074250"), world: "desert" },
  { id: "Cursed", name: "Cursed Egg", icon: eggIcon("92869190684020"), world: "halloween" },
];

const HALLOWEEN = "Halloween 2026";

function pet(
  id: string,
  name: string,
  rarity: Rarity,
  eggId: string,
  coins: number,
  candyCorn: number | null = null,
  limited = false,
): Pet {
  return {
    id,
    name,
    rarity,
    eggId,
    limited,
    eventName: limited ? HALLOWEEN : null,
    coins,
    candyCorn,
  };
}

export const PETS: readonly Pet[] = [
  pet("Cat", "Cat", "Common", "Basic", 0.1),
  pet("Tumbleweed", "Tumbleweed", "Uncommon", "Basic", 0.2),
  pet("Cobra", "Cobra", "Rare", "Basic", 0.4),
  pet("HermitCrab", "Hermit Crab", "Epic", "Basic", 1),
  pet("Apophis", "Apophis", "Secret", "Basic", 119),
  pet("Cactus", "Cactus", "Uncommon", "Sacred", 0.3),
  pet("OilLamp", "Oil Lamp", "Rare", "Sacred", 0.7),
  pet("Ankh", "Ankh", "Epic", "Sacred", 2),
  pet("Sarcophagus", "Sarcophagus", "Legendary", "Sacred", 5),
  pet("SandCastle", "Sand Castle", "Uncommon", "Nile", 0.9),
  pet("Mummy", "Mummy", "Rare", "Nile", 1.3),
  pet("Scorpion", "Scorpion", "Epic", "Nile", 3.3),
  pet("Anubis", "Anubis", "Legendary", "Nile", 16),
  pet("Mimic", "Mimic", "Mythic", "Nile", 35),
  pet("DragonOfRa", "Dragon of Ra", "Secret", "Nile", 74),
  pet("Scarab", "Scarab", "Uncommon", "Cursed", 1, 0.2, true),
  pet("Sandstorm", "Sandstorm", "Rare", "Cursed", 1.5, 0.5, true),
  pet("SkeletonCamel", "Skeleton Camel", "Epic", "Cursed", 4, 1.2, true),
  pet("WitchsPot", "Witch's Pot", "Legendary", "Cursed", 9, 4, true),
  pet("GhostMummy", "Ghost Mummy", "Legendary", "Cursed", 21, 11, true),
  pet("Scarecrow", "Scarecrow", "Mythic", "Cursed", 44, 24, true),
  pet("Osiris", "Osiris", "Secret", "Cursed", 99, 49, true),
  pet("GrimReaper", "Grim Reaper", "Secret", "Cursed", 199, 89, true),
];

export function eggsFor(world: WorldId): readonly Egg[] {
  return EGGS.filter((egg) => egg.world === world);
}

export function petsFor(world: WorldId): readonly Pet[] {
  const eggIds = new Set(eggsFor(world).map((egg) => egg.id));
  return PETS.filter((entry) => eggIds.has(entry.eggId)).sort((left, right) => {
    const eggOrder = EGGS.findIndex((egg) => egg.id === left.eggId) - EGGS.findIndex((egg) => egg.id === right.eggId);
    if (eggOrder !== 0) return eggOrder;
    return RARITY_RANK[right.rarity] - RARITY_RANK[left.rarity];
  });
}

function searchTags(entry: Pet): readonly string[] {
  const tags = [entry.rarity.toLowerCase()];
  if (entry.limited) tags.push("limited");
  if (entry.eventName !== null) {
    const name = entry.eventName.toLowerCase();
    tags.push(name, ...name.split(/\s+/));
  }
  return tags;
}

/** In-game pet menu search: name contains the query; rarity, limited, and event match as prefixes. */
export function petMatches(entry: Pet, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return true;
  if (entry.name.toLowerCase().includes(normalized)) return true;
  return searchTags(entry).some((tag) => tag.startsWith(normalized));
}

export function multiplier(bonus: number): string {
  const value = 1 + bonus;
  const text = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(6)));
  return `x${text}`;
}

export function statRows(entry: Pet, world: WorldId): readonly { readonly label: string; readonly value: string }[] {
  const coins = { label: "Coins", value: multiplier(entry.coins) };
  const candy = entry.candyCorn === null ? null : { label: "Candy Corn", value: multiplier(entry.candyCorn) };
  if (world === "halloween" && candy !== null) return [candy, coins];
  return candy === null ? [coins] : [coins, candy];
}
