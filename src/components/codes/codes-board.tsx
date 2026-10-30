import * as React from "react";

import { watchState } from "@abran-labs/rolink/client";
import { codeViews, parseCodesState, STATUS_STYLE, type CodesState } from "@/lib/codes";
import { ROLINK_BASE } from "@/lib/rolink";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

type CopyState = "idle" | "copied" | "failed";

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back for browsers or preview environments that block Clipboard API access.
  }
  try {
    return fallbackCopy(text);
  } catch {
    return false;
  }
}

function CopyButton({ code }: { readonly code: string }) {
  const [state, setState] = React.useState<CopyState>("idle");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const copied = await copyText(code);
    setState(copied ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 3000);
  };

  const label = state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : "Copy code";
  const ariaLabel =
    state === "copied" ? `Copied code ${code}` : state === "failed" ? `Could not copy code ${code}` : `Copy code ${code}`;

  return (
    <button
      type="button"
      data-copy-code={code}
      data-state={state}
      onClick={() => void copy()}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-surface-high"
      aria-label={ariaLabel}
    >
      <span aria-hidden className="copy-icon copy-icon-copy">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
      </span>
      <span aria-hidden className="copy-icon copy-icon-check">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path className="copy-check-path" d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      </span>
      <span>{label}</span>
    </button>
  );
}

/** Hardcoded code list, patched with live rewards and status from the game. */
export function CodesBoard() {
  const [live, setLive] = React.useState<CodesState | null>(null);
  const [now, setNow] = React.useState(() => Math.floor(Date.now() / 1000));

  React.useEffect(() => {
    const stop = watchState<unknown>(
      "codes",
      (entry) => setLive(entry === null ? null : parseCodesState(entry.value)),
      { baseUrl: ROLINK_BASE, intervalMs: POLL_MS },
    );
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), POLL_MS);
    return () => {
      stop();
      window.clearInterval(timer);
    };
  }, []);

  const views = React.useMemo(() => codeViews(live, now), [live, now]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">Codes</h1>
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            {views.length} codes listed
          </span>
        </div>
      </div>

      <section aria-label="Build the Pyramid codes" className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {views.map(({ code, status, rewards }) => (
          <article className="flex flex-col gap-4 rounded-lg border border-border bg-surface-lowest p-5" key={code}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="font-mono text-base font-semibold tracking-wide text-foreground">{code}</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                    STATUS_STYLE[status].pill,
                  )}
                >
                  <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLE[status].dot)} />
                  {status}
                </span>
              </div>
              <CopyButton code={code} />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rewards</span>
              <ul className="flex flex-col gap-2.5 text-sm text-foreground">
                {rewards.map(({ label, image, href }) => (
                  <li key={`${label}-${image}`}>
                    {href ? (
                      <a className="group flex items-center gap-3 text-foreground transition-colors duration-150" href={href}>
                        <img src={image} alt="" loading="lazy" className="h-8 w-8 shrink-0 object-contain" />
                        <span className="underline decoration-muted-foreground/60 underline-offset-4 transition-colors duration-150 group-hover:decoration-foreground">
                          {label}
                        </span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-3">
                        <img src={image} alt="" loading="lazy" className="h-8 w-8 shrink-0 object-contain" />
                        <span>{label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
