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
  readonly icon: string;
  readonly weight: number;
};

export type Egg = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly world: WorldId;
};

const HATCH_CYCLE_SECONDS = 2.6;
const FAST_HATCH_SCALE = 0.42;

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
  { id: "Basic", name: "Basic Egg", icon: "/eggs/basic.png", world: "desert" },
  { id: "Sacred", name: "Sacred Egg", icon: "/eggs/sacred.png", world: "desert" },
  { id: "Nile", name: "Nile Egg", icon: "/eggs/nile.png", world: "desert" },
  { id: "Cursed", name: "Cursed Egg", icon: "/eggs/cursed.png", world: "halloween" },
];

export const CURRENCY = {
  Coins: { label: "Coins", icon: "/currency/coins.png", color: "rgb(255, 215, 0)" },
  CandyCorn: { label: "Candy Corn", icon: "/currency/candy-corn.png", color: "rgb(255, 140, 40)" },
} as const;

const HALLOWEEN = "Halloween 2026";

function pet(
  id: string,
  name: string,
  rarity: Rarity,
  eggId: string,
  icon: string,
  weight: number,
  coins: number,
  candyCorn: number | null = null,
  limited = false,
): Pet {
  return {
    id,
    name,
    rarity,
    eggId,
    icon,
    weight,
    limited,
    eventName: limited ? HALLOWEEN : null,
    coins,
    candyCorn,
  };
}

const apophisWeight = 10000 / 24999999;
const dragonOfRaWeight = 10000 / 4999999;
const cursedTotal = 10000 / (1 - 1 / 5000000 - 1 / 50000000);

export const PETS: readonly Pet[] = [
  pet("Cat", "Cat", "Common", "Basic", "/pets/cat.png", 5800, 0.1),
  pet("Tumbleweed", "Tumbleweed", "Uncommon", "Basic", "/pets/tumbleweed.png", 2800, 0.2),
  pet("Cobra", "Cobra", "Rare", "Basic", "/pets/cobra.png", 1000, 0.4),
  pet("HermitCrab", "Hermit Crab", "Epic", "Basic", "/pets/hermit-crab.png", 400, 1),
  pet("Apophis", "Apophis", "Secret", "Basic", "/pets/apophis.png", apophisWeight, 119),
  pet("Cactus", "Cactus", "Uncommon", "Sacred", "/pets/cactus.png", 6880, 0.3),
  pet("OilLamp", "Oil Lamp", "Rare", "Sacred", "/pets/oil-lamp.png", 2800, 0.7),
  pet("Ankh", "Ankh", "Epic", "Sacred", "/pets/ankh.png", 300, 2),
  pet("Sarcophagus", "Sarcophagus", "Legendary", "Sacred", "/pets/sarcophagus.png", 20, 5),
  pet("SandCastle", "Sand Castle", "Uncommon", "Nile", "/pets/sand-castle.png", 6997.8, 0.9),
  pet("Mummy", "Mummy", "Rare", "Nile", "/pets/mummy.png", 2800, 1.3),
  pet("Scorpion", "Scorpion", "Epic", "Nile", "/pets/scorpion.png", 200, 3.3),
  pet("Anubis", "Anubis", "Legendary", "Nile", "/pets/anubis.png", 2, 16),
  pet("Mimic", "Mimic", "Mythic", "Nile", "/pets/mimic.png", 0.2, 35),
  pet("DragonOfRa", "Dragon of Ra", "Secret", "Nile", "/pets/dragon-of-ra.png", dragonOfRaWeight, 74),
  pet("Scarab", "Scarab", "Uncommon", "Cursed", "/pets/scarab.png", 7997.76, 1, 0.2, true),
  pet("Sandstorm", "Sandstorm", "Rare", "Cursed", "/pets/sandstorm.png", 1700, 1.5, 0.5, true),
  pet("SkeletonCamel", "Skeleton Camel", "Epic", "Cursed", "/pets/skeleton-camel.png", 300, 4, 1.2, true),
  pet("WitchsPot", "Witch's Pot", "Legendary", "Cursed", "/pets/witchs-pot.png", 2, 9, 4, true),
  pet("GhostMummy", "Ghost Mummy", "Legendary", "Cursed", "/pets/ghost-mummy.png", 0.2, 21, 11, true),
  pet("Scarecrow", "Scarecrow", "Mythic", "Cursed", "/pets/scarecrow.png", 0.04, 44, 24, true),
  pet("Osiris", "Osiris", "Secret", "Cursed", "/pets/osiris.png", cursedTotal / 5000000, 99, 49, true),
  pet("GrimReaper", "Grim Reaper", "Secret", "Cursed", "/pets/grim-reaper.png", cursedTotal / 50000000, 199, 89, true),
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

export function oneIn(entry: Pet): number {
  const total = PETS.filter((other) => other.eggId === entry.eggId).reduce((sum, other) => sum + other.weight, 0);
  const chance = entry.weight / total;
  return Math.max(1, Math.floor(1 / chance + 0.5));
}

export function oddsText(entry: Pet): string {
  return `1 in ${oneIn(entry).toLocaleString("en-US")}`;
}

function duration(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return days === 1 ? "1 day" : `${days.toLocaleString("en-US")} days`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }
  const whole = Math.max(0, Math.floor(seconds));
  return whole === 1 ? "1 second" : `${whole} seconds`;
}

/** Expected time at the current animation cycle. The server does not enforce this yet. */
export function averageHatchTime(entry: Pet, fast: boolean): string {
  const cycle = HATCH_CYCLE_SECONDS * (fast ? FAST_HATCH_SCALE : 1);
  return duration(oneIn(entry) * cycle);
}

export function multiplier(bonus: number): string {
  const value = 1 + bonus;
  const text = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(6)));
  return `x${text}`;
}

export function statRows(
  entry: Pet,
  world: WorldId,
): readonly { readonly label: string; readonly value: string; readonly icon: string; readonly color: string }[] {
  const coins = { ...CURRENCY.Coins, value: multiplier(entry.coins) };
  const candy = entry.candyCorn === null ? null : { ...CURRENCY.CandyCorn, value: multiplier(entry.candyCorn) };
  if (world === "halloween" && candy !== null) return [candy, coins];
  return candy === null ? [coins] : [coins, candy];
}
