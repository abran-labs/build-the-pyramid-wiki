# Build the Pyramid Wiki — plan

Player-facing wiki and hatch-odds reference for Build the Pyramid.

## Pages

- Home: live game overview, player/visit/favorite stats, and links to play and join Discord.
- Pets (`/pets`): browse eggs and pets, search by name/rarity/event, toggle hatch passes (Fast Hatch, Triple Hatch, Luck, Super Luck, Ultra Luck, Jack), and inspect true odds and average hatch time.
- Items (`/items`): upcoming item reference.

## Numbers

Source of truth is the Build the Pyramid game config (`EggRoll`, `EggConfig`, `PetConfig`, `PetPassConfig`), mirrored in `src/lib/pets.ts` and `src/lib/hatch-options.ts`.

True odds include secrets. The in-game menu drops secrets and rescales; the wiki shows the true chance.
