import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Fully static client-side app — no adapter, no server output.
export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        // Game link lives on the backend (bun run backend, :4323).
        "/api/rolink": "http://localhost:4323",
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
