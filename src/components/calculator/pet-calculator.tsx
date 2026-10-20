import * as React from "react";

import { ChevronLeft } from "lucide-react";
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
  const [browseId, setBrowseId] = React.useState<string | null>(null);
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
    <div className="mx-auto flex w-full max-w-4xl items-stretch gap-3">
    <form
      autoComplete="off"
      className="flex min-h-[28rem] min-w-0 flex-1 flex-col space-y-4 rounded-lg border border-border bg-surface-lowest p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-2">
        {(browseId !== null || selected !== null) && (
          <button
            aria-label="Back"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => {
              if (selected !== null) {
                setPetId("");
                return;
              }
              setBrowseId(null);
            }}
            type="button"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
        <Combobox
          id="pet-picker"
          onChange={setPetId}
          options={petOptions}
          menuClassName="h-[calc(28rem-6.25rem)]"
          placeholder="Search pets…"
          searchPlaceholder="Search pets…"
          value={petId}
        />
        </div>
      </div>
      {selected !== null ? (
        <StatSummary pet={selected} options={options} luck={luck} />
      ) : (
        <Browse
          browseId={browseId}
          pets={pets}
          onBrowse={setBrowseId}
          onPick={setPetId}
        />
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

const BROWSE_GROUPS = [
  ...EGGS.map((egg) => ({
    id: egg.id,
    icon: egg.icon,
    label: egg.name,
    suffix: egg.id === "Cursed" ? "Halloween 2026" : null,
  })),
  { id: "Exclusive", icon: "/exclusive.svg", label: "Exclusive", suffix: null },
];

function Browse({
  browseId,
  pets,
  onBrowse,
  onPick,
}: {
  readonly browseId: string | null;
  readonly pets: readonly Pet[];
  readonly onBrowse: (id: string | null) => void;
  readonly onPick: (id: string) => void;
}) {
  const group = BROWSE_GROUPS.find((entry) => entry.id === browseId) ?? null;
  const listed =
    group === null
      ? []
      : pets.filter((entry) => (group.id === "Exclusive" ? !isHatchable(entry) : entry.eggId === group.id));
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-md border border-border bg-surface-low p-4">
      {group === null ? (
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {BROWSE_GROUPS.map((entry) => (
            <button
              className="flex flex-col items-center justify-center gap-2 rounded-sm border border-border bg-surface-lowest px-3 py-4 text-sm transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              key={entry.id}
              onClick={() => onBrowse(entry.id)}
              type="button"
            >
              <img alt="" className="h-14 w-14 object-contain" src={entry.icon} />
              <span className="text-foreground">{entry.label}</span>
              {entry.suffix !== null && (
                <span className="text-[0.65rem] leading-tight" style={{ color: "rgb(255, 145, 40)" }}>
                  {entry.suffix}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {listed.map((entry) => (
              <button
                className="flex items-center gap-2 rounded-sm border border-border bg-surface-lowest px-2 py-2 text-left text-sm transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                key={entry.id}
                onClick={() => onPick(entry.id)}
                type="button"
              >
                <img alt="" className="h-10 w-10 shrink-0 object-contain" src={entry.icon} />
                <span className="min-w-0">
                  <span className="block truncate" style={{ color: RARITY_COLOR[entry.rarity] }}>
                    {entry.name}
                  </span>
                  <span className="block text-[0.65rem] leading-tight text-muted-foreground/45">{entry.rarity}</span>
                </span>
              </button>
            ))}
          </div>
      )}
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
