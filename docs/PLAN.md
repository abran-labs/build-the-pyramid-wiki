# Build the Pyramid Wiki — plan

Odds reference for Build the Pyramid. Shell cloned from DQR-Calc. The DQR calculator, OCR, pot math, stats sidecar, and `docs/Info/` are leftover. Do not build on them. Strip them in a later pass.

## Pages

- Home: how luck adds, how it changes a roll, links to each world. No hatch-speed number until the game server enforces the cadence.
- One page per world. Eggs in that world, pets in each egg, true odds.
- Luck passes are checkboxes (Luck, Super Luck, Ultra Luck). The tables recompute. Eight combinations, not a slider.

## Numbers


- `src/ReplicatedStorage/Shared/Pets/EggRoll.lua` — the roll. Port or generate from this. Do not invent a second formula.
- `src/ReplicatedStorage/Shared/Config/EggConfig.lua` — eggs, weights, worlds, prices.
- `src/ReplicatedStorage/Shared/Config/PetConfig.lua` — names, rarities, boosts.
- `src/ReplicatedStorage/Shared/Config/PetPassConfig.lua` — luck pass values (+1 / +3 / +7).

True odds include secrets. The in-game menu drops secrets and rescales. The site shows the true number, and says so.

## Not yet

- Hatch speed in seconds. Fast Hatch is the only speed boost, but the server still only rejects requests under 0.5s and does not check the pass. A separate session is fixing that. Do not print a speed until it lands.
- Strip of DQR OCR, pot, stats, and item data.
- Hosting. No domain yet.
