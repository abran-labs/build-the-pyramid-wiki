# Astro and Bun Conventions

These rules apply to Astro, Bun, TypeScript, and `src/pages` work. UI mechanics live in [`design-system.md`](design-system.md).

## Rendering and boundaries

- Pyramid-Odds is a fully static client-side app: no adapter, no server output, no API routes.
- Use `.astro` components and static markup by default.
- Hydrate React islands only for browser APIs, event handlers, state, effects, or client-only libraries (the luck controls are the island). Choose the narrowest suitable `client:*` directive. The OCR paste zone is leftover DQR-Calc code; do not extend it.
- Read build-time content in Astro frontmatter rather than fetching it from a client effect.

## TypeScript and imports

- Keep TypeScript strict (`astro/tsconfigs/strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`). Define props and boundary data explicitly, and don't use `any`.
- Use the `@/*` alias for imports from `src/*`.
- Reusable TypeScript components use named exports and follow the surrounding component style. Astro pages and layouts use Astro frontmatter and templates.

```tsx
interface PasteZoneProps {
  readonly onScan: (scan: TooltipScan) => void;
}

export function ImagePasteZone({ onScan }: PasteZoneProps) {
  return <div>{/* … */}</div>;
}

// Astro route markup lives in src/pages/example.astro.
```

## Astro route files

| File | Role |
| --- | --- |
| `src/layouts/BaseLayout.astro` | Shared shell, fonts, metadata |
| `src/pages/*.astro` | File-based route content |

## Platform components

- Use native images (`<img>`) with explicit sizing classes; no `next/image`.
- Pass page metadata through `BaseLayout.astro` props.
- Tailwind CSS 3 runs through `postcss.config.mjs`; do not add the deprecated `@astrojs/tailwind` integration or upgrade to Tailwind 4.
- Follow [`design-system.md`](design-system.md) for Tailwind-only styling and class composition.

## Commands


- `bun run dev` — dev server
- `bun run check` — `astro check` typecheck
- `bun run build` — static build to `dist/`
