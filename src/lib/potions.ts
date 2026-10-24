// Snapshot of PotionConfig. The game repo owns the numbers.
//
// A Luck potion's bonus adds to hatch luck on the same scale as the luck
// passes: +10% counts as +0.1 luck, up to +150% counting as +1.5. Luck is
// not applied here; see `luckTotal` in hatch-options.ts and `trueChance` in
// pets.ts.

export type PotionKindId = "Luck" | "HatchSpeed" | "Currency";

export type PotionTier = 1 | 2 | 3 | 4 | 5;

export type PotionKind = {
  readonly id: PotionKindId;
  readonly name: string;
  /** Icon stem under /potions, e.g. "luck" for /potions/luck-1.png. */
  readonly file: string;
  readonly blurb: string;
};

export const POTION_KINDS: readonly PotionKind[] = [
  {
    id: "Luck",
    name: "Luck Potion",
    file: "luck",
    blurb: "Better odds on rare pets.",
  },
  {
    id: "HatchSpeed",
    name: "Hatch Speed Potion",
    file: "hatch-speed",
    blurb: "Eggs hatch faster.",
  },
  {
    id: "Currency",
    name: "Currency Potion",
    file: "currency",
    blurb: "Earn more from placing blocks.",
  },
];

export type Potion = {
  readonly kind: PotionKindId;
  readonly tier: PotionTier;
  readonly name: string;
  readonly icon: string;
  readonly durationMinutes: number;
  /** Bonus in percent points: 10 renders as +10%. */
  readonly bonusPercent: number;
  /** Hatch-luck contribution. Zero for non-Luck potions. */
  readonly luck: number;
};

const ROMAN: readonly string[] = ["I", "II", "III", "IV", "V"];

const TIER_MINUTES: readonly number[] = [5, 10, 15, 20, 30];

const TIER_BONUS: Record<PotionKindId, readonly number[]> = {
  Luck: [10, 20, 30, 65, 150],
  HatchSpeed: [10, 15, 20, 25, 40],
  Currency: [15, 35, 100, 150, 225],
};

/** Cap on banked time per potion kind. */
export const MAX_BANKED_HOURS = 6;

export const POTIONS: readonly Potion[] = POTION_KINDS.flatMap((kind) =>
  TIER_MINUTES.map((minutes, index) => {
    const tier = (index + 1) as PotionTier;
    const bonus = TIER_BONUS[kind.id][index] ?? 0;
    return {
      kind: kind.id,
      tier,
      name: `${kind.name} ${ROMAN[index] ?? tier}`,
      icon: `/potions/${kind.file}-${tier}.png`,
      durationMinutes: minutes,
      bonusPercent: bonus,
      luck: kind.id === "Luck" ? bonus / 100 : 0,
    };
  }),
);

export function potionsFor(kind: PotionKindId): readonly Potion[] {
  return POTIONS.filter((potion) => potion.kind === kind);
}

export function bonusText(potion: Potion): string {
  return `+${potion.bonusPercent}%`;
}

export function durationText(minutes: number): string {
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
