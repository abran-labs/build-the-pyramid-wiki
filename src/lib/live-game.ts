const UNIVERSE_ID = "10765012427";

export interface LiveGameEmbed {
  readonly name: string;
  readonly iconUrl: string | null;
  readonly visits: number;
  readonly favorites: number;
  readonly playing: number;
}

const FALLBACK: LiveGameEmbed = {
  name: "Build the Pyramid",
  iconUrl: null,
  visits: 0,
  favorites: 0,
  playing: 0,
};

interface GamesResponse {
  readonly data?: ReadonlyArray<{
    readonly name?: string;
    readonly visits?: number;
    readonly favoritedCount?: number;
    readonly playing?: number;
  }>;
}

interface ThumbsResponse {
  readonly data?: ReadonlyArray<{ readonly imageUrl?: string }>;
}

export async function fetchLiveGameEmbed(): Promise<LiveGameEmbed> {
  try {
    const [gameRes, thumbRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`),
      fetch(
        `https://thumbnails.roblox.com/v1/games/icons?universeIds=${UNIVERSE_ID}&size=512x512&format=Png&isCircular=false`,
      ),
    ]);
    const game = gameRes.ok ? ((await gameRes.json()) as GamesResponse) : null;
    const thumb = thumbRes.ok ? ((await thumbRes.json()) as ThumbsResponse) : null;
    const row = game?.data?.[0];
    return {
      name: row?.name ?? FALLBACK.name,
      iconUrl: thumb?.data?.[0]?.imageUrl ?? null,
      visits: typeof row?.visits === "number" ? row.visits : 0,
      favorites: typeof row?.favoritedCount === "number" ? row.favoritedCount : 0,
      playing: typeof row?.playing === "number" ? row.playing : 0,
    };
  } catch {
    return FALLBACK;
  }
}
