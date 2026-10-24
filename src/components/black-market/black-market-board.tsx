import * as React from "react";

import { watchState } from "@abran-labs/rolink/client";
import { CURRENCY, PETS, RARITY_COLOR, type Rarity } from "@/lib/pets";
import { ROLINK_BASE, type BlackMarketSlot, type BlackMarketState } from "@/lib/rolink";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;
const STALE_AFTER_S = 5 * 60;
const NOTIFY_KEY = "btp-wiki-black-market-notify";
const ROMAN = ["I", "II", "III", "IV", "V"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMarket(value: unknown): value is BlackMarketState {
  if (!isRecord(value)) return false;
  if (
    typeof value.rotation !== "number" ||
    typeof value.endsAt !== "number" ||
    typeof value.updatedAt !== "number"
  ) {
    return false;
  }
  if (!Array.isArray(value.stalls)) return false;
  return value.stalls.every((stall: unknown) => isRecord(stall) && Array.isArray(stall.slots));
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatAgo(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return minutes === 1 ? "1m ago" : `${minutes}m ago`;
}

function rarityColor(rarity: string | undefined): string | undefined {
  if (rarity === undefined) return undefined;
  return rarity in RARITY_COLOR ? RARITY_COLOR[rarity as Rarity] : undefined;
}

function romanTier(tier: number): string {
  return ROMAN[tier - 1] ?? String(tier);
}

export function BlackMarketBoard() {
  const [market, setMarket] = React.useState<BlackMarketState | null | undefined>(undefined);
  const [now, setNow] = React.useState(() => Date.now());
  const [notify, setNotify] = React.useState(false);
  const [notifyBlocked, setNotifyBlocked] = React.useState(false);
  const [supported] = React.useState(() => typeof window !== "undefined" && "Notification" in window);
  const seenRotation = React.useRef<number | null>(null);
  const firedRotation = React.useRef<number | null>(null);

  React.useEffect(() => {
    try {
      if (window.localStorage.getItem(NOTIFY_KEY) === "1") setNotify(true);
    } catch {
      // Private mode: notifications simply stay off.
    }
  }, []);

  React.useEffect(
    () =>
      watchState<BlackMarketState>(
        "black_market",
        (entry) => {
          const value = entry?.value ?? null;
          setMarket(value !== null && isMarket(value) ? value : null);
        },
        { baseUrl: ROLINK_BASE, intervalMs: POLL_MS },
      ),
    [],
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (!notify || market === null || market === undefined) return;
    const firstSeen = seenRotation.current === null;
    const rotated = !firstSeen && seenRotation.current !== market.rotation;
    seenRotation.current = market.rotation;
    if (firstSeen) return;
    if (!rotated && now < market.endsAt * 1000) return;
    if (firedRotation.current === market.rotation) return;
    if (!("Notification" in window) || window.Notification.permission !== "granted") return;
    firedRotation.current = market.rotation;
    const note = new window.Notification("Black Market restocked", {
      body: "New stock is in. Open the wiki to see what's for sale.",
    });
    note.onclick = () => {
      window.focus();
      note.close();
    };
  }, [market, now, notify]);

  const toggleNotify = () => {
    void (async () => {
      if (notify) {
        setNotify(false);
        try {
          window.localStorage.setItem(NOTIFY_KEY, "0");
        } catch {
          // ignore
        }
        return;
      }
      if (!("Notification" in window)) {
        setNotifyBlocked(true);
        return;
      }
      const permission = await window.Notification.requestPermission();
      if (permission === "granted") {
        setNotify(true);
        setNotifyBlocked(false);
        try {
          window.localStorage.setItem(NOTIFY_KEY, "1");
        } catch {
          // ignore
        }
      } else {
        setNotifyBlocked(true);
      }
    })();
  };

  if (market === undefined || market === null) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-lowest p-8 text-center">
        <p className="text-sm font-semibold text-foreground">Waiting for the game to report the market…</p>
        <p className="text-sm text-muted-foreground">
          The Black Market publishes from the live game about every 30 seconds.
        </p>
      </div>
    );
  }

  const agoSec = Math.max(0, Math.floor(now / 1000 - market.updatedAt));
  const stale = agoSec > STALE_AFTER_S;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-surface-lowest px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Restocks in{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {formatCountdown(market.endsAt * 1000 - now)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated <span className="font-semibold text-foreground">{formatAgo(agoSec)}</span>
        </p>
        {stale && (
          <p className="text-sm text-muted-foreground">
            Data may be stale — the game has not reported for a while.
          </p>
        )}
        {supported && (
          <button
            aria-pressed={notify}
            className={cn(
              "ml-auto inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              notify
                ? "border-foreground/70 bg-foreground/80 text-surface-lowest"
                : "border-border text-foreground hover:bg-surface-low",
            )}
            onClick={toggleNotify}
            type="button"
          >
            {notify ? "Restock alerts on" : "Notify me on restock"}
          </button>
        )}
      </div>
      {notifyBlocked && (
        <p className="text-sm text-muted-foreground">
          Notifications are blocked — allow them in your browser to get restock alerts.
        </p>
      )}
      {market.stalls.map((stall) => (
        <section aria-label={stall.title} className="flex flex-col gap-3" key={stall.id}>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">{stall.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stall.slots.map((slot) => (
              <SlotCard key={`${stall.id}-${slot.slot}`} slot={slot} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({ slot }: { readonly slot: BlackMarketSlot }) {
  const soldOut = slot.remaining <= 0;
  const fraction =
    slot.stock > 0 ? Math.min(1, Math.max(0, slot.remaining / slot.stock)) : 0;
  const pet = slot.kind === "Pet" ? (PETS.find((entry) => entry.id === slot.id) ?? null) : null;
  const accent = slot.kind === "Pet" ? rarityColor(slot.rarity) : CURRENCY.CandyCorn.color;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-surface-lowest p-4",
        soldOut && "opacity-70",
      )}
    >
      <div className="flex items-center gap-3">
        <SlotArt name={slot.name} petIcon={pet?.icon} tier={slot.tier} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{slot.name}</h3>
          <SlotMeta slot={slot} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: CURRENCY.CandyCorn.color }}>
          <img alt="" aria-hidden className="h-4 w-4 object-contain" src={CURRENCY.CandyCorn.icon} />
          {slot.price.toLocaleString("en-US")}
        </span>
        <span className="text-xs text-muted-foreground">
          {soldOut ? "0" : slot.remaining.toLocaleString("en-US")} / {slot.stock.toLocaleString("en-US")} left
        </span>
      </div>
      <div
        aria-label={`${slot.remaining} of ${slot.stock} left`}
        className="h-2 overflow-hidden rounded-full bg-surface-high"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={slot.stock}
        aria-valuenow={Math.max(0, slot.remaining)}
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${Math.round(fraction * 100)}%`, backgroundColor: accent ?? "currentColor" }}
        />
      </div>
      {soldOut && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-widest text-foreground">Sold out</span>
          {" — buy with Robux in game."}
        </p>
      )}
    </article>
  );
}

function SlotMeta({ slot }: { readonly slot: BlackMarketSlot }) {
  if (slot.kind === "Potion") {
    const tier = slot.tier === undefined ? null : `Tier ${romanTier(slot.tier)}`;
    return (
      <p className="text-xs text-muted-foreground">
        {[tier, slot.bonus].filter((part) => part !== null && part !== undefined).join(" · ") || "Potion"}
      </p>
    );
  }
  const color = rarityColor(slot.rarity);
  return (
    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
      {slot.rarity ?? "Pet"}
    </p>
  );
}

function SlotArt({
  name,
  petIcon,
  tier,
}: {
  readonly name: string;
  readonly petIcon: string | null | undefined;
  readonly tier?: number | undefined;
}) {
  if (petIcon !== null && petIcon !== undefined) {
    return <img alt="" className="h-16 w-16 shrink-0 object-contain" src={petIcon} />;
  }
  return (
    <div
      aria-hidden
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-surface-low"
    >
      <span className="text-lg font-semibold leading-none" style={{ color: CURRENCY.CandyCorn.color }}>
        {tier === undefined ? name.slice(0, 1).toUpperCase() : romanTier(tier)}
      </span>
      <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
        Potion
      </span>
    </div>
  );
}
