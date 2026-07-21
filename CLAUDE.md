# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PhysicsHub — a free, open-source educational site of interactive physics simulations plus written theory. Next.js 15 App Router, React 19, p5.js + planck.js, Tailwind v4, statically exported (`output: "export"`) and deployed to GitHub Pages.

## Commands

```bash
npm run dev            # next dev + nodemon regenerating the sitemap on routes.js changes
npm run build          # generate:sitemap, then next build (static export to out/)
npm run preview        # build + serve out/
npm run lint           # eslint  (lint:fix to autofix)
npm run format         # prettier --write .  (format:check for CI parity)
npm run generate:sitemap
npm run contributors   # regenerate the all-contributors table (needs GH_TOKEN)
npm run deploy         # gh-pages -d out
```

There is no test suite. CI (`.github/workflows/prchecks.yml`) only runs `prettier --check .` and `eslint .` — run both before proposing a PR. A husky pre-commit hook runs `scripts/check-package-lock.js` and `lint-staged`. Node >= 24.

Versioning is fully automatic via semantic-release; **never edit `version` in package.json**. PR titles must be conventional commits (`feat:`, `fix:`, `ci:` …) — the squashed title becomes the changelog entry.

## Architecture

### Route groups

- `app/(core)/` — everything shared: `components/`, `physics/`, `constants/`, `data/`, `hooks/`, `utils/`, `locales/`, `styles/`. Not a route segment.
- `app/(pages)/` — the actual pages (`about`, `blog`, `contribute`, `simulations`).
- `app/api/publish/route.ts` — a POST handler that opens a GitHub PR with a proposed blog JSON via Octokit. Note this cannot run on the statically exported GitHub Pages deploy; it only works in `next dev` / a Node host.
- Import alias: `@/*` → repo root (e.g. `@/app/(core)/data/chapters`). Simulations under `simulations/` use relative paths instead.

### How a simulation is wired (the central pattern)

Adding a simulation touches four places that must agree on the same name:

1. `simulations/<Name>.jsx` — the `"use client"` component. Loaded dynamically with `ssr: false` by `app/(pages)/simulations/[id]/_components/SimulationWrapper.tsx` via `import("@/simulations/${id}")`.
2. `app/(core)/data/configs/<Name>.js` — exports `INITIAL_INPUTS`, `INPUT_FIELDS` (declarative form schema rendered by `components/inputs/DynamicInputs`), usually `FORCES` (each with a `computeFn`) and `SimInfoMapper`.
3. `app/(core)/data/chapters.js` — the catalog entry: `link: "/simulations/<Name>"`, tags from `data/tags.js`, thumbnail, `relatedBlogSlug`. `[id]/page.tsx` derives `generateStaticParams` and metadata from this file, with `dynamicParams = false` — a simulation missing from `chapters.js` will 404 in the export.
4. Optionally `app/(core)/data/articles/<slug>.js`, registered in `articles/index.js`.

Simulation components compose: `useSimulationState` (inputs + localStorage keyed by pathname), `P5Wrapper`, `SimulationLayout`, `DynamicInputs`, `SimInfoPanel`/`useSimInfo`, and the physics classes below.

### Physics core (`app/(core)/physics/`)

`PhysicsBody`, `ForceCalculator`, `ForceRenderer`, `DragController`, `Spring`, `InclinedPlaneBody`.

Two conventions matter and are easy to break:

- **Coordinates**: all physics is in **meters, Y-up, origin bottom-left**. Conversion to screen space (Y-down, pixels) happens only at render time, through `constants/Utils.js` (`toPixels`/`toMeters`/`physicsToScreen`, `SCALE` from `constants/Config.js`). `Utils.js` holds a module-global `CANVAS_HEIGHT` set by `setCanvasHeight()`.
- **Time**: `constants/Time.js` is a module-level singleton owning timeScale, pause, manual stepping, and per-p5-instance fixed-timestep accumulators (`FIXED_DT = 1/120`). Simulations call `computeDelta(p)` and step with a fixed-timestep accumulator rather than raw frame delta.

### Content & SEO

`scripts/sitemap-generator.js` reads `routes.js` + `data/articles/index.js` + `data/chapters.js`, writes `public/sitemap.xml` **and rewrites `routes.js` in place** — so `routes.js` diffs (lastmod churn) are expected build output, not hand edits.

`content/blogs/*.json` holds community-submitted blog proposals created by the publish API; curated articles live as JS modules in `app/(core)/data/articles/`.

### i18n

Custom, not a library: `hooks/useTranslation.ts` reads the Google Translate `googtrans` cookie to pick a language, loads `app/(core)/locales/<lang>.json`, and `locales/meta.json` marks which languages are `completed`. Incomplete languages fall back to Google Translate widget behaviour (`notranslate` is applied when a locale is complete). Extract new keys with `npm run i18n:extract`.

## Conventions

- Mixed JS/TS by design; new shared code trends toward `.tsx`/`.ts`, simulations stay `.jsx`.
- Some comments are in Italian — fine to keep, write new ones in English.
- Significant UI changes: add screenshots under `public/screenshots/<NEW_VERSION>/`, homepage shot named `main.png`.
