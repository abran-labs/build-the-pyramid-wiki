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
  readonly luckBoosted: boolean;
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
  luckBoosted = false,
): Pet {
  return {
    id,
    name,
    rarity,
    eggId,
    icon,
    weight,
    luckBoosted,
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
  pet("HermitCrab", "Hermit Crab", "Epic", "Basic", "/pets/hermit-crab.png", 400, 1, null, false, true),
  pet("Apophis", "Apophis", "Secret", "Basic", "/pets/apophis.png", apophisWeight, 119, null, false, true),
  pet("Cactus", "Cactus", "Uncommon", "Sacred", "/pets/cactus.png", 6880, 0.3),
  pet("OilLamp", "Oil Lamp", "Rare", "Sacred", "/pets/oil-lamp.png", 2800, 0.7),
  pet("Ankh", "Ankh", "Epic", "Sacred", "/pets/ankh.png", 300, 2),
  pet("Sarcophagus", "Sarcophagus", "Legendary", "Sacred", "/pets/sarcophagus.png", 20, 5, null, false, true),
  pet("SandCastle", "Sand Castle", "Uncommon", "Nile", "/pets/sand-castle.png", 6997.8, 0.9),
  pet("Mummy", "Mummy", "Rare", "Nile", "/pets/mummy.png", 2800, 1.3),
  pet("Scorpion", "Scorpion", "Epic", "Nile", "/pets/scorpion.png", 200, 3.3),
  pet("Anubis", "Anubis", "Legendary", "Nile", "/pets/anubis.png", 2, 16, null, false, true),
  pet("Mimic", "Mimic", "Mythic", "Nile", "/pets/mimic.png", 0.2, 35, null, false, true),
  pet("DragonOfRa", "Dragon of Ra", "Secret", "Nile", "/pets/dragon-of-ra.png", dragonOfRaWeight, 74, null, false, true),
  pet("Scarab", "Scarab", "Uncommon", "Cursed", "/pets/scarab.png", 7997.76, 1, 0.2, true),
  pet("Sandstorm", "Sandstorm", "Rare", "Cursed", "/pets/sandstorm.png", 1700, 1.5, 0.5, true),
  pet("SkeletonCamel", "Skeleton Camel", "Epic", "Cursed", "/pets/skeleton-camel.png", 300, 4, 1.2, true),
  pet("WitchsPot", "Witch's Pot", "Legendary", "Cursed", "/pets/witchs-pot.png", 2, 9, 4, true, true),
  pet("GhostMummy", "Ghost Mummy", "Legendary", "Cursed", "/pets/ghost-mummy.png", 0.2, 21, 11, true, true),
  pet("Scarecrow", "Scarecrow", "Mythic", "Cursed", "/pets/scarecrow.png", 0.04, 44, 24, true, true),
  pet("Osiris", "Osiris", "Secret", "Cursed", "/pets/osiris.png", cursedTotal / 5000000, 99, 49, true, true),
  pet("GrimReaper", "Grim Reaper", "Secret", "Cursed", "/pets/grim-reaper.png", cursedTotal / 50000000, 199, 89, true, true),
  pet("Bat", "Bat", "Exclusive", "Exclusive", "/pets/bat.png", 0, 2.75, 0.85, true),
];

export function eggsFor(world: WorldId): readonly Egg[] {
  return EGGS.filter((egg) => egg.world === world);
}

export function isHatchable(entry: Pet): boolean {
  return EGGS.some((egg) => egg.id === entry.eggId);
}

export function allPets(): readonly Pet[] {
  return petsFor("desert").concat(petsFor("halloween"), PETS.filter((entry) => !isHatchable(entry)));
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

const MIDDLE_EXPONENT = 0.5;
const BOTTOM_FLOOR = 0.1;

function eggMates(entry: Pet): readonly Pet[] {
  return PETS.filter((other) => other.eggId === entry.eggId);
}

/** EggRoll.weights at a luck total. Chase pets stay base weight times 1 + luck. */
export function rolledWeights(mates: readonly Pet[], luck: number): readonly number[] {
  const total = mates.reduce((sum, other) => sum + other.weight, 0);
  let bottom = Infinity;
  let top = Infinity;
  let boosted = 0;
  for (const other of mates) {
    const rank = RARITY_RANK[other.rarity];
    if (other.luckBoosted) {
      top = Math.min(top, rank);
      boosted += other.weight;
    } else {
      bottom = Math.min(bottom, rank);
    }
  }
  const cap = boosted > 0 ? total / boosted : 1;
  const multiplier = Math.min(Math.max(1 + luck, 1), cap);
  const result: Array<number | undefined> = [];
  const middles: number[] = [];
  let bottomWeight = 0;
  let used = 0;
  for (const [index, other] of mates.entries()) {
    const rank = RARITY_RANK[other.rarity];
    if (other.luckBoosted) {
      result[index] = other.weight * multiplier;
    } else if (rank > bottom) {
      const step = top > bottom && top < Infinity ? (rank - bottom) / (top - bottom) : 0;
      result[index] = other.weight * multiplier ** (MIDDLE_EXPONENT * step);
      middles.push(index);
    } else {
      bottomWeight += other.weight;
    }
    used += result[index] ?? 0;
  }
  let need = bottomWeight * BOTTOM_FLOOR - (total - used);
  middles.sort((left, right) => RARITY_RANK[mates[left]?.rarity ?? "Common"] - RARITY_RANK[mates[right]?.rarity ?? "Common"]);
  for (const index of middles) {
    if (need <= 0) break;
    const current = result[index] ?? 0;
    const give = Math.min(need, current - (mates[index]?.weight ?? 0));
    result[index] = current - give;
    used -= give;
    need -= give;
  }
  const rest = Math.max(total - used, 0);
  return mates.map((other, index) => result[index] ?? (bottomWeight > 0 ? (rest * other.weight) / bottomWeight : 0));
}

export function trueChance(entry: Pet, luck = 0): number {
  if (!isHatchable(entry)) return 0;
  const mates = eggMates(entry);
  const weights = rolledWeights(mates, luck);
  const total = mates.reduce((sum, other) => sum + other.weight, 0);
  const weight = weights[mates.indexOf(entry)] ?? 0;
  if (weight <= 0 || total <= 0) return 0;
  return weight / total;
}

export function oneIn(entry: Pet, luck = 0): number {
  const chance = trueChance(entry, luck);
  if (chance <= 0) return 1;
  return Math.max(1, Math.floor(1 / chance + 0.5));
}

export function oddsText(entry: Pet, luck = 0): string {
  const chance = trueChance(entry, luck);
  if (chance <= 0) return "1 in ?";
  const exact = 1 / chance;
  if (exact < 100) {
    const percent = chance * 100;
    const digits = percent >= 10 ? 1 : 2;
    const text = percent.toFixed(digits).replace(/\.0+$/, "");
    return `${text}%`;
  }
  return `1 in ${Math.max(1, Math.round(exact)).toLocaleString("en-US")}`;
}

/** Expected egg hatches to see the pet once. Triple Hatch changes cycles, not the hatch count. */
export function averageHatches(entry: Pet, luck = 0): number {
  const chance = trueChance(entry, luck);
  if (chance <= 0) return Infinity;
  return 1 / chance;
}

export function hatchesText(entry: Pet, luck = 0): string {
  const hatches = averageHatches(entry, luck);
  if (!Number.isFinite(hatches)) return "?";
  const rounded = hatches < 10 ? Math.round(hatches * 10) / 10 : Math.round(hatches);
  return rounded.toLocaleString("en-US");
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

/** Expected time at the animation cycle. Triple opens 3 eggs per cycle. The server does not enforce the speed yet. */
export function averageHatchTime(entry: Pet, luck: number, fast: boolean, triple: boolean): string {
  const chance = trueChance(entry, luck);
  if (chance <= 0) return duration(0);
  const cycle = HATCH_CYCLE_SECONDS * (fast ? FAST_HATCH_SCALE : 1);
  const batch = triple ? 3 : 1;
  return duration((1 / chance / batch) * cycle);
}

export function multiplier(bonus: number): string {
  const value = 1 + bonus;
  const text = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(6)));
  return `x${text}`;
}

export function statRows(
  entry: Pet,
): readonly { readonly label: string; readonly value: string; readonly icon: string; readonly color: string }[] {
  const coins = { ...CURRENCY.Coins, value: multiplier(entry.coins) };
  const candy = entry.candyCorn === null ? null : { ...CURRENCY.CandyCorn, value: multiplier(entry.candyCorn) };
  const world = EGGS.find((egg) => egg.id === entry.eggId)?.world;
  if (world === "halloween" && candy !== null) return [candy, coins];
  return candy === null ? [coins] : [coins, candy];
}
