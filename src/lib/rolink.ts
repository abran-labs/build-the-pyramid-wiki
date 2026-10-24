import { fetchState } from "@abran-labs/rolink/client";

/** Where the backend mounts the game link. */
export const ROLINK_BASE = "/api/rolink";

/** State keys browsers may read. */
export const ROLINK_PUBLIC_STATE = ["global_stats", "black_market"] as const;

/** Experience-wide totals the game publishes. Only Ready stats are present. */
export type GlobalStats = {
  readonly EggsHatched?: number;
  /** By egg id (`Basic`, `Sacred`, ...). */
  readonly EggsHatchedByEgg?: Readonly<Record<string, number>>;
  /** Surviving hatched secrets by pet id. */
  readonly Secrets?: Readonly<Record<string, number>>;
};

export async function fetchGlobalStats(): Promise<GlobalStats | null> {
  const entry = await fetchState<GlobalStats>("global_stats", { baseUrl: ROLINK_BASE });
  return entry?.value ?? null;
}

export type BlackMarketSlot = {
  readonly slot: number;
  readonly kind: "Pet" | "Potion" | "Hint";
  readonly id: string;
  readonly name: string;
  readonly rarity?: string;
  readonly tier?: number;
  readonly bonus?: string;
  readonly price: number;
  readonly stock: number;
  readonly remaining: number;
  readonly icon?: string;
};

export type BlackMarketStall = {
  readonly id: "pets" | "potions" | "hints";
  readonly title: string;
  readonly slots: readonly BlackMarketSlot[];
};

export type BlackMarketState = {
  readonly rotation: number;
  readonly endsAt: number;
  readonly updatedAt: number;
  readonly stalls: readonly BlackMarketStall[];
};

export async function fetchBlackMarket(): Promise<BlackMarketState | null> {
  const entry = await fetchState<BlackMarketState>("black_market", { baseUrl: ROLINK_BASE });
  return entry?.value ?? null;
}
