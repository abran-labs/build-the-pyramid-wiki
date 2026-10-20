import * as React from "react";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  EMPTY_HATCH_OPTIONS,
  HATCH_TOGGLES,
  luckTotal,
  readHatchOptions,
  writeHatchOptions,
  type HatchOptionKey,
  type HatchOptions,
} from "@/lib/hatch-options";
import {
  averageHatchTime,
  eggsFor,
  oddsText,
  petMatches,
  petsFor,
  RARITY_COLOR,
  statRows,
  type Pet,
  type WorldId,
} from "@/lib/pets";
import { cn } from "@/lib/utils";

type PetCalculatorProps = {
  readonly world: WorldId;
};

export function PetCalculator({ world }: PetCalculatorProps) {
  const [petId, setPetId] = React.useState("");
  const [options, setOptions] = React.useState<HatchOptions>(EMPTY_HATCH_OPTIONS);
  const pets = React.useMemo(() => petsFor(world), [world]);
  const eggs = React.useMemo(() => new Map(eggsFor(world).map((egg) => [egg.id, egg])), [world]);
  const selected = pets.find((entry) => entry.id === petId) ?? null;

  React.useEffect(() => {
    setPetId("");
  }, [world]);

  React.useEffect(() => {
    setOptions(readHatchOptions());
  }, []);

  const toggle = (key: HatchOptionKey) => {
    setOptions((current) => {
      const next = { ...current, [key]: !current[key] };
      writeHatchOptions(next);
      return next;
    });
  };

  const luck = luckTotal(options);

  const petOptions: ComboboxOption[] = pets.map((entry) => {
    const egg = eggs.get(entry.eggId);
    return {
      color: RARITY_COLOR[entry.rarity],
      description: entry.rarity,
      group: egg?.name ?? entry.eggId,
      ...(egg === undefined ? {} : { groupIcon: egg.icon }),
      icon: entry.icon,
      label: entry.name,
      matches: (query) => petMatches(entry, query),
      value: entry.id,
    };
  });

  return (
    <div className="flex items-start gap-3">
    <form
      autoComplete="off"
      className="min-w-0 flex-1 space-y-4 rounded-lg border border-border bg-surface-lowest p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="pet-picker">
            Pet
          </label>
          {petId !== "" && (
            <Button
              className="h-auto px-1 py-0 hover:bg-transparent"
              onClick={() => setPetId("")}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
          )}
        </div>
        <Combobox
          id="pet-picker"
          onChange={setPetId}
          options={petOptions}
          placeholder="Search pets…"
          searchPlaceholder="Search pets…"
          value={petId}
        />
      </div>
      {selected !== null && <StatSummary pet={selected} world={world} options={options} luck={luck} />}
    </form>
    <div className="flex w-[4.5rem] shrink-0 flex-col gap-2">
      {HATCH_TOGGLES.map((toggleDef) => {
        const on = options[toggleDef.key];
        return (
          <Button
            aria-pressed={on}
            className={cn("h-auto min-h-10 whitespace-normal px-1 py-1 text-[0.65rem] leading-tight", on && "border-primary text-primary")}
            key={toggleDef.key}
            onClick={() => toggle(toggleDef.key)}
            size="sm"
            title={toggleDef.title}
            type="button"
            variant={on ? "outline" : "secondary"}
          >
            {toggleDef.label}
          </Button>
        );
      })}
    </div>
    </div>
  );
}

function StatSummary({
  pet,
  world,
  options,
  luck,
}: {
  readonly pet: Pet;
  readonly world: WorldId;
  readonly options: HatchOptions;
  readonly luck: number;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface-low p-4">
      <div className="flex items-center gap-3 border-b border-foreground/20 pb-3">
        <img alt="" className="h-16 w-16 object-contain" src={pet.icon} />
        <div>
          <div className="text-sm font-semibold text-foreground">{pet.name}</div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: RARITY_COLOR[pet.rarity] }}>
            {pet.rarity}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {statRows(pet, world).map((row) => (
          <div className="flex items-center justify-between gap-2 text-sm" key={row.label}>
            <span className="flex items-center gap-1.5" style={{ color: row.color }}>
              <img alt="" aria-hidden className="h-4 w-4 object-contain" src={row.icon} />
              {row.label}
            </span>
            <span className="font-semibold" style={{ color: row.color }}>
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Odds</span>
          <span className="font-semibold text-foreground">{oddsText(pet, luck)}</span>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Average</span>
          <span className="font-semibold text-foreground">{averageHatchTime(pet, luck, options.fast, options.triple)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Average time uses the hatch animation. The server does not enforce that speed yet.
      </p>
    </div>
  );
}
