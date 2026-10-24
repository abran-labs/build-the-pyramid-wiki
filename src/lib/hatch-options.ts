import { POTIONS, type PotionTier } from "@/lib/potions";

export type HatchOptionKey = "fast" | "triple" | "luck" | "superLuck" | "ultraLuck" | "jack";

export type HatchOptions = {
  readonly fast: boolean;
  readonly triple: boolean;
  readonly luck: boolean;
  readonly superLuck: boolean;
  readonly ultraLuck: boolean;
  readonly jack: boolean;
  /** Running Luck potion tier, 0 for none. */
  readonly luckPotion: PotionTier | 0;
  /** Running Hatch Speed potion tier, 0 for none. */
  readonly speedPotion: PotionTier | 0;
};

/** Potion rows in the calculator: one picker per kind that changes hatching. */
export const POTION_TOGGLES: readonly { readonly key: "luckPotion" | "speedPotion"; readonly kind: "Luck" | "HatchSpeed"; readonly label: string }[] = [
  { key: "luckPotion", kind: "Luck", label: "Luck Potion" },
  { key: "speedPotion", kind: "HatchSpeed", label: "Hatch Speed Potion" },
];

function potionBonus(kind: "Luck" | "HatchSpeed", tier: number): number {
  return POTIONS.find((potion) => potion.kind === kind && potion.tier === tier)?.bonusPercent ?? 0;
}

/** Hatch speed multiplier from a Hatch Speed potion (1 when none), as the game divides the cycle by it. */
export function hatchSpeed(options: HatchOptions): number {
  return 1 + potionBonus("HatchSpeed", options.speedPotion) / 100;
}

function tier(value: unknown): PotionTier | 0 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : 0;
}

export const HATCH_TOGGLES: readonly { readonly key: HatchOptionKey; readonly label: string; readonly note: string }[] = [
  { key: "fast", label: "Fast Hatch", note: "2.38× faster" },
  { key: "triple", label: "Triple Hatch", note: "Hatch 3 eggs at once" },
  { key: "luck", label: "Luck", note: "+1 hatch luck" },
  { key: "superLuck", label: "Super Luck", note: "+3 hatch luck" },
  { key: "ultraLuck", label: "Ultra Luck", note: "+7 hatch luck" },
  { key: "jack", label: "Jack", note: "+0.5 hatch luck" },
];

export const EMPTY_HATCH_OPTIONS: HatchOptions = {
  fast: false,
  triple: false,
  luck: false,
  superLuck: false,
  ultraLuck: false,
  jack: false,
  luckPotion: 0,
  speedPotion: 0,
};

const STORAGE_KEY = "btp-wiki-hatch-options";

export function luckTotal(options: HatchOptions): number {
  return (
    (options.luck ? 1 : 0) +
    (options.superLuck ? 3 : 0) +
    (options.ultraLuck ? 7 : 0) +
    (options.jack ? 0.5 : 0) +
    potionBonus("Luck", options.luckPotion) / 100
  );
}

export function readHatchOptions(): HatchOptions {
  if (typeof window === "undefined") return EMPTY_HATCH_OPTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY_HATCH_OPTIONS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_HATCH_OPTIONS;
    const record = parsed as Record<string, unknown>;
    return {
      fast: record.fast === true,
      triple: record.triple === true,
      luck: record.luck === true,
      superLuck: record.superLuck === true,
      ultraLuck: record.ultraLuck === true,
      jack: record.jack === true,
      luckPotion: tier(record.luckPotion),
      speedPotion: tier(record.speedPotion),
    };
  } catch {
    return EMPTY_HATCH_OPTIONS;
  }
}

export function writeHatchOptions(options: HatchOptions): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}
