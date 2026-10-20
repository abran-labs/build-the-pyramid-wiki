# Commands


| Purpose | Command |
|---|---|
| Dev server | `bun run dev` |
| Dev on local network | `bun run dev -- --host 0.0.0.0` |
| Typecheck | `bun run check` |
| Build | `bun run build` (writes `dist/`, not the live site) |
| Publish to the live site | `bun run publish` (builds, then swaps `live/`) |
| Preview built site | `bun run preview` |

`bun run stats` starts the leftover DQR stats sidecar. The odds site does not use it.
