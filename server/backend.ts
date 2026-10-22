import { fetchLiveGameEmbed, type LiveGameEmbed } from "../src/lib/live-game";

const PORT = Number(process.env.BACKEND_PORT ?? 4323);
const LIVE_INDEX = new URL("../live/index.html", import.meta.url);
const TTL_MS = 10 * 60 * 1000;

let cached: { readonly game: LiveGameEmbed; readonly at: number } | null = null;

async function currentGame(): Promise<LiveGameEmbed | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.game;
  const fresh = await fetchLiveGameEmbed();
  if (fresh.iconUrl) {
    cached = { game: fresh, at: Date.now() };
    return fresh;
  }
  return cached?.game ?? null;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function setMeta(html: string, attr: "property" | "name", key: string, value: string): string {
  const tag = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(tag, (_m, open: string, close: string) => `${open}${escapeAttr(value)}${close}`);
}

async function homePage(): Promise<Response> {
  let html = await Bun.file(LIVE_INDEX).text();
  const game = await currentGame();
  if (game) {
    html = setMeta(html, "property", "og:title", game.name);
    html = setMeta(html, "name", "twitter:title", game.name);
    if (game.iconUrl) {
      html = setMeta(html, "property", "og:image", game.iconUrl);
      html = setMeta(html, "name", "twitter:image", game.iconUrl);
    }
  }
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" },
  });
}

const routes: Readonly<Record<string, () => Promise<Response> | Response>> = {
  "/": homePage,
  "/index.html": homePage,
  "/api/health": () => Response.json({ ok: true }),
};

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req) {
    const handler = routes[new URL(req.url).pathname];
    return handler ? handler() : new Response("Not found", { status: 404 });
  },
});
