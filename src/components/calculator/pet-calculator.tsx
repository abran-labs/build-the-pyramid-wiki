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
  allPets,
  EGGS,
  isHatchable,
  oddsText,
  petMatches,
  RARITY_COLOR,
  statRows,
  type Pet,
} from "@/lib/pets";
import { cn } from "@/lib/utils";

export function PetCalculator() {
  const [petId, setPetId] = React.useState("");
  const [options, setOptions] = React.useState<HatchOptions>(EMPTY_HATCH_OPTIONS);
  const pets = React.useMemo(() => allPets(), []);
  const eggs = React.useMemo(() => new Map(EGGS.map((egg) => [egg.id, egg])), []);
  const selected = pets.find((entry) => entry.id === petId) ?? null;

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
      group: egg?.name ?? "Exclusive",
      groupIcon: egg?.icon ?? "/exclusive.svg",
      ...(egg?.id === "Cursed"
        ? { groupSuffix: "Halloween 2026", groupSuffixColor: "rgb(255, 145, 40)" }
        : {}),
      icon: entry.icon,
      label: entry.name,
      matches: (query) => petMatches(entry, query),
      value: entry.id,
    };
  });

  return (
    <div className="flex items-stretch gap-3">
    <form
      autoComplete="off"
      className="flex min-h-[28rem] min-w-0 flex-1 flex-col space-y-4 rounded-lg border border-border bg-surface-lowest p-4"
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
      {selected !== null ? (
        <StatSummary pet={selected} options={options} luck={luck} />
      ) : (
        <EmptySummary />
      )}
    </form>
    <div className="flex w-52 shrink-0 flex-col gap-2 rounded-lg border border-border bg-surface-lowest p-2">
      {HATCH_TOGGLES.map((toggleDef) => {
        const on = options[toggleDef.key];
        return (
          <button
            aria-checked={on}
            className="flex items-center justify-between gap-2 rounded-sm bg-surface-lowest px-2 py-1.5 text-left text-sm shadow-none transition-colors hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            key={toggleDef.key}
            onClick={() => toggle(toggleDef.key)}
            role="switch"
            type="button"
          >
            <span className="min-w-0">
              <span className={cn("block truncate", on ? "text-foreground" : "text-muted-foreground")}>{toggleDef.label}</span>
              <span className="mt-1.5 block text-[0.65rem] leading-tight text-muted-foreground/45">{toggleDef.note}</span>
            </span>
            <span
              aria-hidden
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                on ? "border-foreground/70 bg-foreground/80" : "border-border bg-surface-high",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform",
                  on ? "left-4 bg-surface-lowest" : "left-0.5 bg-muted-foreground",
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
    </div>
  );
}

function EmptySummary() {
  const marks = [
    ...EGGS.map((egg) => ({ id: egg.id, icon: egg.icon, label: egg.name })),
    { id: "Exclusive", icon: "/exclusive.svg", label: "Exclusive" },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-md border border-border bg-surface-low px-6 py-10 text-center">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {marks.map((mark) => (
          <img alt={mark.label} className="h-14 w-14 object-contain" key={mark.id} src={mark.icon} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Select a pet to see its stats and odds.</p>
    </div>
  );
}

function StatSummary({
  pet,
  options,
  luck,
}: {
  readonly pet: Pet;
  readonly options: HatchOptions;
  readonly luck: number;
}) {
  return (
    <div className="flex-1 space-y-3 rounded-md border border-border bg-surface-low p-4">
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
        {statRows(pet).map((row) => (
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
        {isHatchable(pet) && (
          <>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Odds</span>
              <span className="font-semibold text-foreground">{oddsText(pet, luck)}</span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Average</span>
              <span className="font-semibold text-foreground">{averageHatchTime(pet, luck, options.fast, options.triple)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
