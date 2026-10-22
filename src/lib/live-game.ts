const UNIVERSE_ID = "10765012427";

export interface LiveGameEmbed {
  readonly name: string;
  readonly iconUrl: string | null;
}

const FALLBACK: LiveGameEmbed = { name: "Build the Pyramid", iconUrl: null };

interface GamesResponse {
  readonly data?: ReadonlyArray<{ readonly name?: string }>;
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
    return {
      name: game?.data?.[0]?.name ?? FALLBACK.name,
      iconUrl: thumb?.data?.[0]?.imageUrl ?? null,
    };
  } catch {
    return FALLBACK;
  }
}
