# AGENTS.md

PhysicsHub — free, open-source interactive physics simulations + written theory.
Next.js 15 App Router, React 19, p5.js rendering, Tailwind v4. `CLAUDE.md` is the
canonical architecture doc — read it before building anything, and update it when
you change the project structure.

## Commands & verification

```bash
npm run dev           # next dev + sitemap regen on routes.js changes
npm run build         # generate:sitemap, then next build (server mode, API live)
npm run build:static  # Pages export: strips app/api, exports to out/, restores
npm run lint          # eslint (lint:fix to autofix)
npm run format:check  # prettier --check .  — CI parity
npm run format        # prettier --write .
```

**There is no test suite.** CI (`.github/workflows/prchecks.yml`) runs only
`prettier --check .` and `eslint .` — run both before proposing a PR. Husky
pre-commit runs `scripts/check-package-lock.js` and lint-staged. Node >= 24 (see `.nvmrc`).

## Gotchas

- **Never edit `version` in package.json** — semantic-release owns it. PR titles
  must be conventional commits (`feat:`, `fix:`, `ci:` …); the squashed title is the changelog.
- **`routes.js` at the repo root is generated** — `scripts/sitemap-generator.js`
  rewrites it in place (lastmod churn) and writes `public/sitemap.xml`. Don't hand-edit it.
- **Two build modes, switched by `app/api` presence** (see `next.config.js`):
  - `npm run build` — API present → normal Next.js app (Vercel, local dev).
  - `npm run build:static` — strips `app/api` via `scripts/strip-api-for-static-export.js`, exports to `out/`.
  - If a static build crashes mid-way, `app/api` shows as deleted in `git status` — it's a rename away; the next `build:static` (or `git checkout app/api`) restores it.
  - Anything under `app/api` (OAuth, blog publishing) does **not** exist on `physicshub.github.io`; publishing only works on Vercel or in `next dev`.
- Node/Next env: OAuth and publishing need `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` in `.env.local` (gitignored); the committed `.env` only holds a webhook URL and contributors-token placeholder.

## Architecture

- **Import alias `@/*` → repo root.** Simulations under `simulations/` use relative paths instead.
- `app/(core)/` — shared code (engine, components, data, hooks, lib, utils, locales), not a route segment.
- `app/(pages)/` — actual pages (`about`, `blog`, `contribute`, `simulations`).

### Simulations

Adding or porting a simulation: **load the `new-simulation` skill first**
(`.claude/skills/new-simulation/SKILL.md`) — step-by-step for the four files that
must agree on one `<Name>`:

1. `simulations/<Name>.jsx` (`"use client"`, loaded dynamically, `ssr: false`)
2. `app/(core)/data/configs/<Name>.js` — form schema + readout only, never forces
3. `app/(core)/data/chapters.js` — catalog entry; **a simulation missing here 404s in the static export** (`dynamicParams = false`)
4. optionally `app/(core)/data/articles/<slug>.js`

### Engine (`app/(core)/engine/`) — the only physics core

Bodies hold state; everything else is an element (plain object with hooks), composed by addition. Rules that keep it composable:

- Every numeric option accepts a **getter**: `Gravity({ g: () => inputs.gravity })` — never hand-re-sync params or rebuild the world on slider change.
- Forces only call `body.applyForce(f, label)`; the integrator converts to motion. Never recompute a force for rendering — `ForceVectors` draws the recorded `appliedForces`.
- Coordinates are **meters, Y-up, origin bottom-left**; conversion to pixels happens only at render time (`constants/Utils.js`, `engine/render/Shapes.js`).
- Time is owned by `constants/Time.js` (`FIXED_DT = 1/120`, `computeSteps(p)`); a simulation never touches time directly.

See `CLAUDE.md` → “How a simulation is wired” for the full `createSimulation(spec)` contract and which simulations bypass the pipeline (and why the reasons are physical, not convenience).

## Conventions

- Mixed JS/TS by design: new shared code → `.tsx`/`.ts`, simulations stay `.jsx`, the engine stays `.js` with JSDoc types.
- Some comments are in Italian — fine to keep; write new ones in English.
- i18n is **custom, not a library**: `hooks/useTranslation.ts` reads the `googtrans` cookie, loads `app/(core)/locales/<lang>.json`; `locales/meta.json` marks completed languages. Extract new keys with `npm run i18n:extract` — don't introduce next-intl/i18next.
- Changing the engine or how simulations are written: update `CLAUDE.md` **and** `.claude/skills/new-simulation/SKILL.md` in the same change.
