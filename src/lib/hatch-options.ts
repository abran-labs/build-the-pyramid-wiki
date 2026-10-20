export type HatchOptionKey = "fast" | "triple" | "luck" | "superLuck" | "ultraLuck" | "jack";

export type HatchOptions = {
  readonly fast: boolean;
  readonly triple: boolean;
  readonly luck: boolean;
  readonly superLuck: boolean;
  readonly ultraLuck: boolean;
  readonly jack: boolean;
};

export const HATCH_TOGGLES: readonly { readonly key: HatchOptionKey; readonly label: string; readonly note: string }[] = [
  { key: "fast", label: "Fast Hatch", note: "2.38× faster" },
  { key: "triple", label: "Triple Hatch", note: "3 at once" },
  { key: "luck", label: "Luck", note: "+1" },
  { key: "superLuck", label: "Super Luck", note: "+3" },
  { key: "ultraLuck", label: "Ultra Luck", note: "+7" },
  { key: "jack", label: "Jack", note: "+0.5" },
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
