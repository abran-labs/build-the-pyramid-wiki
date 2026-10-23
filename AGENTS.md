# Build the Pyramid Wiki — Agent Guide

Instructions for AI coding agents (ChatGPT Work / Codex, Claude Code on the web, OpenCode) working on Build the Pyramid Wiki.

## Workflow (Read First)

Before making edits, switching branches, committing, pushing, or opening a pull request, read and follow [`.agents/skills/git-workflow/SKILL.md`](.agents/skills/git-workflow/SKILL.md).

- **Never push to `master`.** `master` is locked to `@abran-labs` via required pull request and Code Owner review.
- **Work on `dev` or a `wiki/<topic>` branch off `dev`.** Prefer `wiki/<topic>` when making multi-step edits so teammates do not collide on `dev`.
- **Push after each meaningful edit and share the preview link.** Every push to `dev` or `wiki/<topic>` deploys a private preview behind Cloudflare Access (GitHub login):
  - `dev` → `https://dev.build-the-pyramid-wiki.pages.dev`
  - `wiki/<topic>` → `https://wiki-<topic>.build-the-pyramid-wiki.pages.dev`
  - Give the user the preview link after pushing (and open it if your environment supports opening links).
- **Never run `bun run publish`.** Publishing to `https://build-the-pyramid.abran.dev` is performed only by the repository owner.

## Project

Player-facing wiki for the Roblox game **Build the Pyramid** (`https://build-the-pyramid.abran.dev`).

Stack: Astro 7 (static output) + React 19 islands, Tailwind CSS v3 with dark theme tokens, Bun, strict TypeScript.

## Route

- Git & preview workflow: `.agents/skills/git-workflow/SKILL.md`
- UI and design rules: `docs/ai/design-system.md`
- Astro and Bun conventions: `docs/ai/dev-rules-astro.md`
- Reuse and optimization guidance: `docs/ai/optimization-principles.md`
- Commands: `docs/CMDS.md`
- Setup: `docs/SETUP.md`
- Site plan: `docs/PLAN.md`

## Rules

- Preserve Astro static output, React islands, strict TypeScript, and Tailwind CSS v3 token patterns. Do not add an SSR server adapter.
- **Reuse existing components and layouts.** Edit page content, data, and existing views first. Avoid creating new components or layouts unless the task genuinely cannot be expressed with existing ones.
- **Never invent or hand-type game odds or weights.** Pet and egg numbers in `src/lib/pets.ts` and `src/lib/hatch-options.ts` mirror the game's `EggRoll`, `PetConfig`, `EggConfig`, and `PetPassConfig`. If a task needs game numbers, icons, or mechanics not yet in the repo, tell the contributor to request them from `@abran-labs` on Discord.
- Publish true odds (`trueChance`, secrets included). In-game menu odds omit secrets and rescale; never label menu odds as true odds.
- Luck passes (`Luck` +1, `Super Luck` +3, `Ultra Luck` +7, plus `Jack` +0.5) add together rather than flat-multiplying every pet. Chase pets (`luckBoosted`) scale by `1 + luck`, middle tiers ramp, and the bottom tier absorbs the difference down to a 10% weight floor.
- Do not commit `node_modules/`, `.astro/`, `dist/`, `live/`, or `.env*`.
- One fact has one canonical owner. Link to it instead of duplicating it.

## Verify

- Documentation-only changes need no build.
- For code or page changes, run `bun test`, `bun run check`, and `bun run build` before pushing.
