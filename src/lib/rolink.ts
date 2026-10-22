import { fetchState } from "@abran-labs/rolink/client";

/** Where the backend mounts the game link. */
export const ROLINK_BASE = "/api/rolink";

/** State keys browsers may read. */
export const ROLINK_PUBLIC_STATE = ["global_stats"] as const;

/** Experience-wide totals the game publishes, keyed by stat id. Only Ready stats are present. */
export type GlobalStats = Readonly<Partial<Record<"EggsHatched", number>>>;

export async function fetchGlobalStats(): Promise<GlobalStats | null> {
  const entry = await fetchState<GlobalStats>("global_stats", { baseUrl: ROLINK_BASE });
  return entry?.value ?? null;
}
