export type HatchOptionKey = "fast" | "triple" | "luck" | "superLuck" | "ultraLuck" | "jack";

export type HatchOptions = {
  readonly fast: boolean;
  readonly triple: boolean;
  readonly luck: boolean;
  readonly superLuck: boolean;
  readonly ultraLuck: boolean;
  readonly jack: boolean;
};

export const HATCH_TOGGLES: readonly { readonly key: HatchOptionKey; readonly label: string; readonly title: string }[] = [
  { key: "fast", label: "Fast Hatch", title: "Eggs hatch faster" },
  { key: "triple", label: "3x Hatch", title: "Hatch 3 eggs at once" },
  { key: "luck", label: "Luck", title: "+1 hatch luck" },
  { key: "superLuck", label: "Super Luck", title: "+3 hatch luck" },
  { key: "ultraLuck", label: "Ultra Luck", title: "+7 hatch luck" },
  { key: "jack", label: "Jack", title: "+0.5 hatch luck" },
];

export const EMPTY_HATCH_OPTIONS: HatchOptions = {
  fast: false,
  triple: false,
  luck: false,
  superLuck: false,
  ultraLuck: false,
  jack: false,
};

const STORAGE_KEY = "btp-wiki-hatch-options";

export function luckTotal(options: HatchOptions): number {
  return (options.luck ? 1 : 0) + (options.superLuck ? 3 : 0) + (options.ultraLuck ? 7 : 0) + (options.jack ? 0.5 : 0);
}

export function readHatchOptions(): HatchOptions {
  if (typeof window === "undefined") return EMPTY_HATCH_OPTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY_HATCH_OPTIONS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_HATCH_OPTIONS;
    const record = parsed as Record<string, unknown>;
    return {
      fast: record.fast === true,
      triple: record.triple === true,
      luck: record.luck === true,
      superLuck: record.superLuck === true,
      ultraLuck: record.ultraLuck === true,
      jack: record.jack === true,
    };
  } catch {
    return EMPTY_HATCH_OPTIONS;
  }
}

export function writeHatchOptions(options: HatchOptions): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}
