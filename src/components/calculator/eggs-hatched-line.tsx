import * as React from "react";

import { EGGS, type Pet } from "@/lib/pets";
import { fetchGlobalStats, type GlobalStats } from "@/lib/rolink";

const REFRESH_MS = 60_000;

type View = { readonly count: number; readonly label: string };

function viewFor(stats: GlobalStats, browseId: string | null, pet: Pet | null): View | null {
  if (pet !== null) {
    const count = pet.rarity === "Secret" ? stats.Secrets?.[pet.id] : undefined;
    return typeof count === "number" ? { count, label: count === 1 ? `${pet.name} exists` : `${pet.name} exist` } : null;
  }
  if (browseId !== null) {
    const egg = EGGS.find((entry) => entry.id === browseId);
    const count = egg === undefined ? undefined : stats.EggsHatchedByEgg?.[egg.id];
    return egg !== undefined && typeof count === "number" ? { count, label: `${egg.name}s hatched` } : null;
  }
  return typeof stats.EggsHatched === "number" ? { count: stats.EggsHatched, label: "eggs hatched" } : null;
}

/** Live game count for what is on screen. Renders nothing when the game has not reported it. */
export function EggsHatchedLine({ browseId, pet }: { readonly browseId: string | null; readonly pet: Pet | null }) {
  const [stats, setStats] = React.useState<GlobalStats | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = () =>
      void fetchGlobalStats().then((next) => {
        if (active && next !== null) setStats(next);
      });
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const view = stats === null ? null : viewFor(stats, browseId, pet);
  return (
    <p className="min-h-5 text-center text-sm leading-5 text-muted-foreground">
      {view !== null && (
        <>
          <span className="font-semibold text-foreground">{view.count.toLocaleString("en-US")}</span> {view.label}
        </>
      )}
    </p>
  );
}
