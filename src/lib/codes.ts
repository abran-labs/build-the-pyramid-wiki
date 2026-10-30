import { CURRENCY, PETS, petPath } from "@/lib/pets";
import { POTIONS } from "@/lib/potions";

/** A code the wiki lists for discovery. The game feed supplies live rewards and status. */
export type CodeEntry = {
  readonly code: string;
  readonly rewards: readonly CodeRewardView[];
};

export type CodeRewardView = {
  readonly label: string;
  readonly image: string;
  readonly href?: string;
};

/**
 * Hardcoded code list. Kept handwritten so the community can find a code and
 * add it here; rewards and status come from the game's `codes` Rolink state
 * once it arrives, falling back to these values.
 */
export const CODE_ENTRIES: readonly CodeEntry[] = [
  { code: "MAZERUNNER", rewards: [
    { label: "35,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "3× Luck Potion V", image: "/potions/luck-5.png" },
    { label: "3× Currency Potion V", image: "/potions/currency-5.png" },
    { label: "3× Hatch Speed Potion V", image: "/potions/hatch-speed-5.png" },
  ] },
  { code: "NEEDMOREBOOST", rewards: [
    { label: "10× Luck Potion V", image: "/potions/luck-5.png" },
    { label: "10× Hatch Speed Potion V", image: "/potions/hatch-speed-5.png" },
    { label: "10× Currency Potion V", image: "/potions/currency-5.png" },
  ] },
  { code: "HALLOWEENPART2", rewards: [
    { label: "10,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "Luck Potion V", image: "/potions/luck-5.png" },
    { label: "Currency Potion V", image: "/potions/currency-5.png" },
  ] },
  { code: "WHATISTHISPLACE", rewards: [
    { label: "35,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "3× Luck Potion V", image: "/potions/luck-5.png" },
    { label: "3× Currency Potion V", image: "/potions/currency-5.png" },
    { label: "3× Hatch Speed Potion V", image: "/potions/hatch-speed-5.png" },
  ] },
  { code: "UPDATEDELAY3", rewards: [
    { label: "15,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "Luck Potion V", image: "/potions/luck-5.png" },
    { label: "Hatch Speed Potion V", image: "/potions/hatch-speed-5.png" },
    { label: "Currency Potion V", image: "/potions/currency-5.png" },
  ] },
  { code: "DEADEND", rewards: [
    { label: "35,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "3× Luck Potion V", image: "/potions/luck-5.png" },
    { label: "3× Currency Potion V", image: "/potions/currency-5.png" },
    { label: "3× Hatch Speed Potion V", image: "/potions/hatch-speed-5.png" },
  ] },
  { code: "PETS", rewards: [{ label: "25,000 Coins", image: "/currency/coins.png" }] },
  { code: "SORRYFORDELAY", rewards: [{ label: "50,000 Coins", image: "/currency/coins.png" }] },
  { code: "SECRETSPHINX", rewards: [{ label: "50,000 Coins", image: "/currency/coins.png" }] },
  { code: "DEADBYMELOL", rewards: [{ label: "1 Coin", image: "/currency/coins.png" }] },
  { code: "FREECODE", rewards: [{ label: "500 Coins", image: "/currency/coins.png" }] },
  { code: "WELCOME", rewards: [
    { label: "500 Speed", image: "/stats/speed.png" },
    { label: "500 Strength", image: "/stats/strength.png" },
  ] },
  { code: "JACKVSZED", rewards: [
    { label: "50,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "10,000 Speed", image: "/stats/speed.png" },
    { label: "10,000 Strength", image: "/stats/strength.png" },
  ] },
  { code: "HAPPYHALLOWEEN", rewards: [{ label: "Skeleton Camel Pet", image: "/pets/skeleton-camel.png", href: petPath("SkeletonCamel") }] },
  { code: "HALLOWEEN", rewards: [{ label: "5,000 Candy Corn", image: "/currency/candy-corn.png" }] },
  { code: "SECRETBAT", rewards: [{ label: "Bat Pet", image: "/pets/bat.png", href: petPath("Bat") }] },
  { code: "ARISUNA", rewards: [
    { label: "100,000 Candy Corn", image: "/currency/candy-corn.png" },
    { label: "100,000 Coins", image: "/currency/coins.png" },
  ] },
  { code: "CURSEDSECRET", rewards: [{ label: "Witch's Pot Pet", image: "/pets/witchs-pot.png", href: petPath("WitchsPot") }] },
];

/** Game reward kinds the wiki knows how to draw. */
export type LiveReward =
  | { readonly kind: "coins" | "candyCorn" | "speed" | "strength"; readonly amount: number }
  | { readonly kind: "pet"; readonly petId: string; readonly amount: number }
  | { readonly kind: "potion"; readonly potion: string; readonly tier: number; readonly amount: number };

export type LiveCode = {
  readonly enabled: boolean;
  readonly rewards?: readonly LiveReward[];
  readonly expiresAt?: number;
  readonly maxClaims?: number;
  readonly claimed?: number;
};

/** Shape of the game's `codes` Rolink state (`CodeFeed.build`). */
export type CodesState = {
  readonly updatedAt: number;
  readonly codes: Readonly<Record<string, LiveCode>>;
};

export type CodeStatus = "Working" | "Expired" | "Fully claimed" | "Disabled";

export type CodeView = {
  readonly code: string;
  readonly status: CodeStatus;
  readonly rewards: readonly CodeRewardView[];
};

const REWARD_KINDS = new Set(["coins", "candyCorn", "speed", "strength", "pet", "potion"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLiveReward(value: unknown): value is LiveReward {
  if (!isRecord(value) || typeof value.kind !== "string" || !REWARD_KINDS.has(value.kind)) return false;
  if (value.kind === "pet") {
    return typeof value.petId === "string" && isFiniteNumber(value.amount);
  }
  if (value.kind === "potion") {
    return typeof value.potion === "string" && isFiniteNumber(value.tier) && isFiniteNumber(value.amount);
  }
  return isFiniteNumber(value.amount);
}

function optNumber(value: unknown): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

/** Null for anything that is not a game `codes` snapshot; the page then keeps its hardcoded values. */
export function parseCodesState(value: unknown): CodesState | null {
  if (!isRecord(value) || !isFiniteNumber(value.updatedAt) || !isRecord(value.codes)) return null;
  const codes: Record<string, LiveCode> = {};
  for (const [code, raw] of Object.entries(value.codes)) {
    if (!isRecord(raw) || typeof raw.enabled !== "boolean") continue;
    const rewards = Array.isArray(raw.rewards) ? raw.rewards.filter(isLiveReward) : undefined;
    const expiresAt = optNumber(raw.expiresAt);
    const maxClaims = optNumber(raw.maxClaims);
    const claimed = optNumber(raw.claimed);
    codes[code] = {
      enabled: raw.enabled,
      ...(rewards !== undefined && rewards.length > 0 ? { rewards } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
      ...(maxClaims !== undefined ? { maxClaims } : {}),
      ...(claimed !== undefined ? { claimed } : {}),
    };
  }
  return { updatedAt: value.updatedAt, codes };
}

function count(value: number): string {
  return value.toLocaleString("en-US");
}

function rewardView(reward: LiveReward): CodeRewardView | null {
  switch (reward.kind) {
    case "coins":
      return { label: `${count(reward.amount)} ${reward.amount === 1 ? "Coin" : "Coins"}`, image: CURRENCY.Coins.icon };
    case "candyCorn":
      return { label: `${count(reward.amount)} Candy Corn`, image: CURRENCY.CandyCorn.icon };
    case "speed":
      return { label: `${count(reward.amount)} Speed`, image: "/stats/speed.png" };
    case "strength":
      return { label: `${count(reward.amount)} Strength`, image: "/stats/strength.png" };
    case "pet": {
      const pet = PETS.find((entry) => entry.id === reward.petId);
      const label = `${reward.amount > 1 ? `${count(reward.amount)}× ` : ""}${pet?.name ?? reward.petId} Pet`;
      return pet === undefined
        ? { label, image: "/exclusive.svg" }
        : { label, image: pet.icon, href: petPath(pet.id) };
    }
    case "potion": {
      const potion = POTIONS.find((entry) => entry.kind === reward.potion && entry.tier === reward.tier);
      if (potion === undefined) return null;
      return {
        label: `${reward.amount > 1 ? `${count(reward.amount)}× ` : ""}${potion.name}`,
        image: potion.icon,
      };
    }
  }
}

function liveRewards(code: LiveCode | undefined): readonly CodeRewardView[] | null {
  if (code?.rewards === undefined) return null;
  const views = code.rewards.map(rewardView).filter((view): view is CodeRewardView => view !== null);
  return views.length > 0 ? views : null;
}

function statusFor(code: LiveCode | undefined, nowSeconds: number): CodeStatus {
  if (code === undefined || code.enabled) {
    if (code?.expiresAt !== undefined && code.expiresAt <= nowSeconds) return "Expired";
    if (
      code?.maxClaims !== undefined &&
      code.claimed !== undefined &&
      code.claimed >= code.maxClaims
    ) {
      return "Fully claimed";
    }
    return "Working";
  }
  return "Disabled";
}

/** Joins the handwritten list to the live snapshot by code name. Unknown live codes are ignored. */
export function codeViews(state: CodesState | null, nowSeconds: number): readonly CodeView[] {
  // Tallest cards first so equal-height cards sit together; code name breaks ties.
  const ordered = [...CODE_ENTRIES].sort(
    (left, right) => right.rewards.length - left.rewards.length || left.code.localeCompare(right.code),
  );
  return ordered.map((entry) => {
    const live = state?.codes[entry.code];
    return {
      code: entry.code,
      status: statusFor(live, nowSeconds),
      rewards: liveRewards(live) ?? entry.rewards,
    };
  });
}

export const STATUS_STYLE: Readonly<Record<CodeStatus, { readonly pill: string; readonly dot: string }>> = {
  Working: {
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  Expired: {
    pill: "border-border bg-surface-high text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "Fully claimed": {
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
  Disabled: {
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    dot: "bg-rose-400",
  },
};
