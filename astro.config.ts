import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Fully static client-side app — no adapter, no server output.
// Dev-only: /api proxies to the stats sidecar (bun run stats, :4322).
// In production nginx routes /api to the sidecar instead.
export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        // Game link lives on the backend (bun run backend, :4323); listed first so it wins over /api.
        "/api/rolink": "http://localhost:4323",
        "/api": "http://localhost:4322",
        "/roblox-games": {
          target: "https://games.roblox.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/roblox-games/, ""),
        },
        "/roblox-thumbs": {
          target: "https://thumbnails.roblox.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/roblox-thumbs/, ""),
        },
        "/roblox-icon": {
          target: "https://tr.rbxcdn.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/roblox-icon/, ""),
        },
      },
    },
  },
});
