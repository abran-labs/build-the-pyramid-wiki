import * as React from "react";

import { navigate } from "astro:transitions/client";
import { ChevronLeft } from "lucide-react";
import { EggsHatchedLine } from "@/components/calculator/eggs-hatched-line";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  EMPTY_HATCH_OPTIONS,
  HATCH_TOGGLES,
  hatchSpeed,
  luckTotal,
  POTION_TOGGLES,
  readHatchOptions,
  writeHatchOptions,
  type HatchOptionKey,
  type HatchOptions,
} from "@/lib/hatch-options";
import {
  averageHatchTime,
  allPets,
  blackMarketListing,
  CURRENCY,
  EGGS,
  eggPath,
  eventColor,
  isHatchable,
  oddsText,
  petMatches,
  petPath,
  RARITY_COLOR,
  statRows,
  type BlackMarketListing,
  type Pet,
} from "@/lib/pets";
import { POTIONS, type PotionTier } from "@/lib/potions";
import { cn } from "@/lib/utils";

/** Same wording as the pass toggles: "+0.3 hatch luck", "1.2× faster". */
function potionNote(kind: "Luck" | "HatchSpeed", bonusPercent: number): string {
  const value = Number((bonusPercent / 100).toFixed(2));
  return kind === "Luck" ? `+${value} hatch luck` : `${Number((1 + value).toFixed(2))}× faster`;
}

export function PetCalculator({
  initialPetId = "",
  initialBrowseId = null,
}: {
  readonly initialPetId?: string;
  readonly initialBrowseId?: string | null;
}) {
  const [petId, setPetId] = React.useState(initialPetId);
  const browseId = initialBrowseId;
  const [options, setOptions] = React.useState<HatchOptions>(EMPTY_HATCH_OPTIONS);
  const pets = React.useMemo(() => allPets(), []);
  const eggs = React.useMemo(() => new Map(EGGS.map((egg) => [egg.id, egg])), []);
  const selected = pets.find((entry) => entry.id === petId) ?? null;
  const backHref =
    selected !== null && isHatchable(selected) ? eggPath(selected.eggId) : "/pets";

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

  const pickPotion = (key: "luckPotion" | "speedPotion", tier: PotionTier | 0) => {
    setOptions((current) => {
      const next = { ...current, [key]: current[key] === tier ? 0 : tier };
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
      ...(egg?.eventName
        ? { groupSuffix: egg.eventName, groupSuffixColor: eventColor(egg.eventName) }
        : {}),
      icon: entry.icon,
      label: entry.name,
      matches: (query) => petMatches(entry, query),
      value: entry.id,
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
    <div className="flex w-full flex-col items-stretch gap-3 md:flex-row">
    <form
      autoComplete="off"
      className="order-2 flex min-w-0 flex-1 flex-col space-y-4 rounded-lg border border-border bg-surface-lowest p-4 md:order-1"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-2">
        {(browseId !== null || selected !== null) && (
          <a
            aria-label="Back"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            href={backHref}
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </a>
        )}
        <div className="min-w-0 flex-1">
        <Combobox
          id="pet-picker"
          onChange={(nextPetId) => {
            setPetId(nextPetId);
            void navigate(petPath(nextPetId));
          }}
          options={petOptions}
          placeholder="Search pets…"
          searchPlaceholder="Search pets…"
          value={petId}
        />
        </div>
      </div>
      <div className="flex min-h-[18rem] flex-1 flex-col">
      {selected !== null ? (
        <StatSummary pet={selected} options={options} luck={luck} />
      ) : (
        <Browse browseId={browseId} pets={pets} />
      )}
      </div>
    </form>
    <div className="order-1 grid w-full shrink-0 grid-cols-2 gap-2 rounded-lg border border-border bg-surface-lowest p-2 md:order-2 md:flex md:w-52 md:flex-col">
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
    <div className="grid w-full grid-cols-1 gap-3 rounded-lg border border-border bg-surface-lowest p-2 sm:grid-cols-2">
      {POTION_TOGGLES.map((row) => {
        const picked = options[row.key];
        const tiers = POTIONS.filter((potion) => potion.kind === row.kind);
        const active = tiers.find((potion) => potion.tier === picked);
        return (
          <div className="flex flex-col gap-1.5 px-2 py-1.5" key={row.key}>
            <span className="min-w-0">
              <span className={cn("block truncate text-sm", picked !== 0 ? "text-foreground" : "text-muted-foreground")}>
                {row.label}
              </span>
              <span className="mt-1.5 block text-[0.65rem] leading-tight text-muted-foreground/45">
                {active === undefined ? "None" : potionNote(row.kind, active.bonusPercent)}
              </span>
            </span>
            <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label={row.label}>
              {tiers.map((potion) => {
                const on = picked === potion.tier;
                return (
                  <button
                    aria-checked={on}
                    aria-label={potion.name}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-sm border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      on ? "border-foreground/70 bg-surface-high" : "border-border opacity-50 hover:opacity-100",
                    )}
                    key={potion.tier}
                    onClick={() => pickPotion(row.key, potion.tier)}
                    role="radio"
                    title={`${potion.name} · +${potion.bonusPercent}%`}
                    type="button"
                  >
                    <img alt="" className="h-full w-full object-contain" src={potion.icon} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
    <EggsHatchedLine browseId={selected === null ? browseId : null} pet={selected} />
    </div>
  );
}

const BROWSE_GROUPS = [
  ...EGGS.map((egg) => ({
    id: egg.id,
    href: eggPath(egg.id),
    icon: egg.icon,
    label: egg.name,
    suffix: egg.eventName,
    suffixColor: egg.eventName === null ? undefined : eventColor(egg.eventName),
  })),
  {
    id: "Exclusive",
    href: "/pets/exclusive",
    icon: "/exclusive.svg",
    label: "Exclusive",
    suffix: null,
    suffixColor: undefined,
  },
];

function Browse({
  browseId,
  pets,
}: {
  readonly browseId: string | null;
  readonly pets: readonly Pet[];
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
            <a
              className="flex flex-col items-center justify-center gap-2 rounded-sm border border-border bg-surface-lowest px-3 py-4 text-sm transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              href={entry.href}
              key={entry.id}
            >
              <img alt="" className="h-14 w-14 object-contain" src={entry.icon} />
              <span className="text-foreground">{entry.label}</span>
              {entry.suffix !== null && (
                <span className="text-[0.65rem] leading-tight" style={{ color: entry.suffixColor }}>
                  {entry.suffix}
                </span>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="grid content-start grid-cols-2 gap-2 sm:grid-cols-3">
            {listed.map((entry) => (
              <a
                className="flex items-center gap-3 rounded-sm border border-border bg-surface-lowest px-3 py-3 text-left text-base transition-colors hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                href={petPath(entry.id)}
                key={entry.id}
              >
                <img alt="" className="h-14 w-14 shrink-0 object-contain" src={entry.icon} />
                <span className="min-w-0">
                  <span className="block truncate" style={{ color: RARITY_COLOR[entry.rarity] }}>
                    {entry.name}
                  </span>
                  <span className="block text-[0.65rem] leading-tight text-muted-foreground/45">{entry.rarity}</span>
                </span>
              </a>
            ))}
          </div>
      )}
    </div>
  );
}

function BlackMarketSection({ pet }: { readonly pet: Pet }) {
  const listing = blackMarketListing(pet);
  return (
    <div className="space-y-1 border-t border-foreground/20 pt-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Black Market</div>
      {listing === null ? (
        <div className="text-sm text-muted-foreground">Not sold</div>
      ) : (
        <BlackMarketRows listing={listing} />
      )}
    </div>
  );
}

function BlackMarketRows({ listing }: { readonly listing: BlackMarketListing }) {
  return (
    <>
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-muted-foreground">Price</span>
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: CURRENCY.CandyCorn.color }}>
          <img alt="" aria-hidden className="h-4 w-4 object-contain" src={CURRENCY.CandyCorn.icon} />
          {listing.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-muted-foreground">Chance</span>
        <span className="font-semibold text-foreground">
          {Number((listing.hourlyChance * 100).toFixed(1))}%
        </span>
      </div>
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-muted-foreground">Stock</span>
        <span className="font-semibold text-foreground">{listing.stock.toLocaleString("en-US")}</span>
      </div>
    </>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: RARITY_COLOR[pet.rarity] }}>
              {pet.rarity}
            </span>
            {pet.eventName !== null && (
              <>
                <span aria-hidden className="text-xs text-muted-foreground/50">
                  ·
                </span>
                <span className="text-xs font-semibold" style={{ color: eventColor(pet.eventName) }}>
                  {pet.eventName}
                </span>
              </>
            )}
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
              <span className="text-muted-foreground">Average hatch time</span>
              <span className="font-semibold text-foreground">{averageHatchTime(pet, luck, options.fast, options.triple, hatchSpeed(options))}</span>
            </div>
          </>
        )}
      </div>
      <BlackMarketSection pet={pet} />
    </div>
  );
}
