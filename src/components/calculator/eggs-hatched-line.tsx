import * as React from "react";

import { fetchGlobalStats } from "@/lib/rolink";

const REFRESH_MS = 60_000;

/** "1,248,033 eggs hatched" from the live game. Renders nothing until the game has reported. */
export function EggsHatchedLine() {
  const [total, setTotal] = React.useState<number | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = () =>
      void fetchGlobalStats().then((stats) => {
        if (active && typeof stats?.EggsHatched === "number") setTotal(stats.EggsHatched);
      });
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (total === null) return null;
  return (
    <p className="text-center text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{total.toLocaleString("en-US")}</span> eggs hatched
    </p>
  );
}
