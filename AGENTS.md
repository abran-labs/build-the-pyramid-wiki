# Build the Pyramid Wiki agent guide

## Mounted workspace

      allowedHosts: true,
- Read, edit, search, and inspect Git read-only through the mounted path like a normal repo.
- Edits already write to the server repo. Never copy, upload, `scp`, or sync the repo.

Remote pattern:

```bash
```


## Project

Player-facing wiki for Build the Pyramid. First pages: true hatch odds. Players pick the luck passes they own and see the real chance for every pet, grouped by world and egg. Later pages cover the rest of the game. Not a developer docs site.


The tree still contains the DQR calculator (OCR, pot math, stats sidecar, item CSV). That is leftover template code. Do not extend it, and do not delete it until a deliberate strip pass.

## Route

- UI and implementation rules: `docs/ai/design-system.md`.
- Astro and Bun conventions: `docs/ai/dev-rules-astro.md`.
- Reuse and optimization guidance: `docs/ai/optimization-principles.md`.
- Commands: `docs/CMDS.md`.
- Setup: `docs/SETUP.md`.
- What to build: `docs/PLAN.md`. Treat `docs/Info/` as leftover DQR notes, not this game.

## Laws

- Preserve Astro static output, React islands, TypeScript strict, and Tailwind CSS v3 + TweakCN token patterns. Do not add a server adapter.
- Publish true odds (`EggRoll.trueChance`, secrets included). Menu odds drop secrets and rescale. Do not label those as true.
- Luck is three passes, added, not a flat multiply of every pet. Chase pets (`LuckBoosted`) get `1 + luck`. Middle tiers ramp. The common tier pays, down to 10% of its base weight. Explain that on the home page. Do not simplify it to "2x luck".
- Do not print a hatch speed until the game server enforces the cadence. The animated cycle is not the enforced interval yet. Until that lands, the page may describe the rule and must not state a seconds number as fact.
- Home page plus one page per world. Luck passes are checkboxes that recompute the tables.
- Prefer extending the existing shell (layout, tokens, nav) before adding a new visual system.
- `node_modules/`, `.astro/`, `dist/`, and `.env*` are runtime or generated. Never commit them.
- No live site yet. Do not invent a public URL, nginx path, or deploy step.
- One fact has one canonical owner. Link to it instead of duplicating it.

## Verify

- Documentation-only changes need no build.
