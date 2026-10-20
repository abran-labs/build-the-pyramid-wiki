import * as React from "react";

const UNIVERSE_ID = "10765012427";
const PLAY_URL = "https://www.roblox.com/games/123720558354386/Build-the-Pyramid";
const DISCORD_URL = "https://discord.gg/9sksDM6r8M";

type LiveGame = {
  readonly name: string;
  readonly visits: number;
  readonly favorites: number;
  readonly playing: number;
  readonly iconUrl: string | null;
};

function formatCount(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function HomeHero() {
  const [game, setGame] = React.useState<LiveGame | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const [gameRes, thumbRes] = await Promise.all([
        fetch(`/roblox-games/v1/games?universeIds=${UNIVERSE_ID}`),
        fetch(
          `/roblox-thumbs/v1/games/icons?universeIds=${UNIVERSE_ID}&size=512x512&format=Png&isCircular=false`,
        ),
      ]);
      if (!gameRes.ok) return;
      const gameJson: unknown = await gameRes.json();
      const row =
        typeof gameJson === "object" &&
        gameJson !== null &&
        "data" in gameJson &&
        Array.isArray(gameJson.data)
          ? gameJson.data[0]
          : null;
      if (typeof row !== "object" || row === null) return;
      const record = row as Record<string, unknown>;
      let iconUrl: string | null = null;
      if (thumbRes.ok) {
        const thumbJson: unknown = await thumbRes.json();
        const thumb =
          typeof thumbJson === "object" &&
          thumbJson !== null &&
          "data" in thumbJson &&
          Array.isArray(thumbJson.data)
            ? thumbJson.data[0]
            : null;
        if (typeof thumb === "object" && thumb !== null && "imageUrl" in thumb && typeof thumb.imageUrl === "string") {
          iconUrl = thumb.imageUrl;
        }
      }
      setGame({
        name: typeof record.name === "string" ? record.name : "Build the Pyramid",
        visits: typeof record.visits === "number" ? record.visits : 0,
        favorites: typeof record.favoritedCount === "number" ? record.favoritedCount : 0,
        playing: typeof record.playing === "number" ? record.playing : 0,
        iconUrl,
      });
    };
    void load().catch(() => undefined);
  }, []);

  const title = game?.name ?? "Build the Pyramid";
  const icon = game?.iconUrl ?? "/favicon.png";

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <img alt="" className="h-32 w-32 rounded-2xl object-cover" src={icon} />
      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-4xl">{title}</h1>
      <div className="flex flex-wrap justify-center gap-3">
        <Stat label="Visits" value={game === null ? "—" : formatCount(game.visits)} />
        <Stat label="Favorites" value={game === null ? "—" : formatCount(game.favorites)} />
        <Stat label="Playing" value={game === null ? "—" : formatCount(game.playing)} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <a
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          href={PLAY_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play on Roblox
        </a>
        <a
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          href={DISCORD_URL}
          rel="noreferrer"
          target="_blank"
        >
          Join the Discord
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-28 flex-col items-center gap-1 rounded-md border border-border bg-surface-lowest px-5 py-4">
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
