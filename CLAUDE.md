# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PhysicsHub — a free, open-source educational site of interactive physics simulations plus written theory. Next.js 15 App Router, React 19, p5.js for rendering, Tailwind v4, deployed as a static export to GitHub Pages (see "Two build modes"). Physics is our own engine (below), not a library; `planck` is still in package.json but no longer imported anywhere.

## Commands

```bash
npm run dev            # next dev + nodemon regenerating the sitemap on routes.js changes
npm run build          # generate:sitemap, then next build — server mode, API routes live
npm run build:static   # the GitHub Pages export: strips app/api, then exports to out/
npm run preview        # build:static + serve out/
npm run lint           # eslint  (lint:fix to autofix)
npm run format         # prettier --write .  (format:check for CI parity)
npm run generate:sitemap
npm run contributors   # regenerate the all-contributors table (needs GH_TOKEN)
npm run deploy         # gh-pages -d out
```

There is no test suite. CI (`.github/workflows/prchecks.yml`) only runs `prettier --check .` and `eslint .` — run both before proposing a PR. A husky pre-commit hook runs `scripts/check-package-lock.js` and `lint-staged`. Node >= 24.

Versioning is fully automatic via semantic-release; **never edit `version` in package.json**. PR titles must be conventional commits (`feat:`, `fix:`, `ci:` …) — the squashed title becomes the changelog entry.

## Architecture

### Two build modes

`output: "export"` in `next.config.js` is conditional on **`app/api` being absent**, and that is the only switch:

- `npm run build` — `app/api` present, so no static export: a normal Next.js app whose route handlers actually run. This is what Vercel builds and what you should run locally.
- `npm run build:static` — `scripts/strip-api-for-static-export.js` moves `app/api` aside (a rename), `next build` produces the export in `out/`, then `scripts/restore-api-after-static-export.js` moves it back. `.github/workflows/release.yml` uses this for the Pages deploy.

The strip exists because a static export cannot contain route handlers that read request-time data, and every `app/api/auth/*` handler reads cookies. Keying off the directory rather than an env var keeps CI, Vercel and every contributor's machine in agreement. If a build crashes mid-way `app/api` shows as deleted in `git status` — the next `build:static` restores it, or `git checkout app/api` does.

The consequence for features: **anything under `app/api` does not exist on `physicshub.github.io`**. The blog editor calls `/api/publish` with a relative URL, so publishing only works on the Vercel deploy or in `next dev`.

### Route groups

- `app/(core)/` — everything shared: `engine/`, `components/`, `constants/`, `data/`, `hooks/`, `lib/`, `utils/`, `locales/`, `styles/`. Not a route segment.
- `app/(pages)/` — the actual pages (`about`, `blog`, `contribute`, `simulations`).
- `app/api/auth/` — GitHub OAuth: `github/` starts the flow (random `state` in a short-lived cookie), `github/callback/` verifies `state` and exchanges the code for a token, `github/logout/` clears it, `me/` reports the signed-in user. The token lives in an `httpOnly` `gh_session` cookie (8h) via `app/(core)/lib/githubSession.ts`; needs `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`.
- `app/api/publish/route.ts` — a POST handler that publishes a blog proposal **as the signed-in contributor**: it reads their token from the session, ensures their fork of the repo exists, branches from upstream `main`, commits the JSON and opens a PR against `physicshub`. Returns `401 { requiresAuth: true }` when there is no session, which the editor turns into a sign-in redirect.
- Import alias: `@/*` → repo root (e.g. `@/app/(core)/data/chapters`). Simulations under `simulations/` use relative paths instead.

### How a simulation is wired (the central pattern)

> **Writing or porting a simulation? Load the `new-simulation` skill first**
> (`.claude/skills/new-simulation/SKILL.md`). It is the step-by-step guide: the
> four files, the full `createSimulation` contract, the catalogue of every force,
> constraint and renderer, and the physics checks to run before calling it done.
> This section is the summary; the skill is the reference, and it must be updated
> whenever the engine changes.

Adding a simulation touches four places that must agree on the same name:

1. `simulations/<Name>.jsx` — the `"use client"` component. Loaded dynamically with `ssr: false` by `app/(pages)/simulations/[id]/_components/SimulationWrapper.tsx` via `import("@/simulations/${id}")`.
2. `app/(core)/data/configs/<Name>.js` — exports `INITIAL_INPUTS`, `INPUT_FIELDS` (declarative form schema rendered by `components/inputs/DynamicInputs`) and `SimInfoMapper(state, context, refs)`. Configs describe the UI and the readout only: forces belong in the world, never here. Each `INPUT_FIELDS` entry carries a plain-name `label` plus optional `symbol` (physics symbol → accent pill) and `unit` (unit of measure → standardized chip) — units and symbols are **never** written into `label`. A `number` field with both `min` and `max` renders as a slider + editable value box (typed values are clamped to the range); without a full range it renders as a −/+ stepper. See the `.sim-field` system in `styles/components/forms.css` and the `new-simulation` skill.
3. `app/(core)/data/chapters.js` — the catalog entry: `link: "/simulations/<Name>"`, topical tags from `data/tags.js`, and the school-level contract `level` / `alsoFor` / `difficulty` (see below). `[id]/page.tsx` derives `generateStaticParams` and metadata from this file, with `dynamicParams = false` — a simulation missing from `chapters.js` will 404 in the export.

**School levels.** Every simulation is classified for an international school level so teachers can match it to their curriculum. `data/tags.js` exports `LEVELS` (elementary, lowerSecondary, upperSecondary, undergraduate, tool) with age range and curriculum equivalences (US grades, IGCSE, A-Level, IB), `LEVEL_ORDER`, and `DIFFICULTIES` (`core`/`extended`/`advanced`, the challenge _within_ a level). The old `EASY`/`MEDIUM`/`ADVANCED` tags are gone. `chapters.js` entries carry `level` (primary band), optional `alsoFor` (bands the sim still works for), and `difficulty`. Articles in `data/articles/` carry `LEVELS`/`DIFFICULTIES` objects in their `tags` array so the same classification shows on blog cards. 4. Optionally `app/(core)/data/articles/<slug>.js`, registered in `articles/index.js`.

**Catalogue filtering & sort.** `components/Search.jsx` is the one filter bar for both the `/simulations` and `/blog` indexes: a search field plus popover triggers (School level · Difficulty · Topic · Sort) that become bottom sheets under 768px. It takes `dataset` + `getFacets` (for per-option result counts) and emits `{ text, tags, levels, difficulties, sort }` through `onChange`, round-tripping the whole state through the URL (`?q=&levels=&difficulty=&tags=&sort=`) so a narrowed view is shareable. The matching and sorting rules live in `utils/catalogFilters.js` — `getSimulationFacets`/`getBlogFacets` normalise an item to `{ levels, difficulties, topics }` (blogs fold all three into their `tags` array, so they're classified by identity against `LEVELS`/`DIFFICULTIES`), `facetMatches` applies them (level/difficulty OR within a group, topics AND), and `sortCatalog` handles the `SORT_OPTIONS` (recommended / name / level / newest-oldest, with original order as the stable tie-break). Each page keeps only its own text matcher.

### The engine (`app/(core)/engine/`) — the only physics core

Every simulation is built on it; there is no second way to do physics in this repo.

A **World** owns **Bodies** (state only — position, velocity, accumulated force) and **Elements** (all behaviour). Nothing subclasses a body: forces, constraints, colliders, renderers and pointer handlers are all elements, so behaviours compose by addition. A pendulum hanging off a projectile is one body with `Gravity`, one more body, and a `Distance` constraint between them.

```
engine/
  World.js          step order: beforeStep → applyForces → integrate → solve ×N → resolveCollisions → afterStep
  Body.js           state + params; `inverseMass` is 0 for fixed bodies, so anchors need no special case
  integrators.js    semiImplicitEuler (default), verlet, rk4 (for ODE systems like the double pendulum)
  formulas.js       pure textbook expressions — no Body, no World, no p5
  forces/           Gravity Constant Wind Drag Buoyancy MutualGravity PointAttraction Damping Custom
  constraints/      Distance Rope Strut Spring Bounds Ground SurfaceFriction Incline
                    Pin CircularPath LockAxis SpeedLimit
  collision/        Collisions (impulse solver), collide1D, contactImpulse
  render/           Shapes, ForceRenderer + ForceVectors + Vectors, Backdrop, colors
  interaction/      Dragging
  runtime/          createSimulation.jsx
```

Import everything from the barrel: `import { createSimulation, Gravity, Distance } from "../app/(core)/engine/index.js"`.

Rules that keep it composable — breaking any of them reintroduces the duplication this replaced:

- **An element is a plain object with optional hooks**, never a class hierarchy. Adding `render` puts it in the draw order (`zIndex`; bodies are 0, so negative draws behind them). Adding `onPointerDown/Move/Up/onDoubleClick` gets pointer events from the runtime. Write one inline in a simulation when the behaviour is genuinely one-off.
- **Every numeric option accepts a getter**, resolved each frame via `utils/params.js`: `Gravity({ g: () => inputs.gravity })`. Body params (`mass`, `size`, `color`, `restitution`, `trail`, …) accept getters too. Never re-sync parameters by hand in a draw loop, and never rebuild the world because a slider moved.
- **Forces only ever call `body.applyForce(f, label)`**; the integrator converts to motion. The label records the force in `body.appliedForces`, which is what `ForceVectors` draws — so a force can never be drawn differently from how it was integrated. Never compute a force a second time for rendering.
- **Constraints are positional**: `solve` projects positions (repeated `solverIterations` times), then `afterStep` cancels the constraint-violating velocity. `Distance` also publishes its tension as a pseudo-force so it appears in free-body diagrams.

`createSimulation(spec)` owns all the boilerplate — input state and localStorage, reset/load controls, canvas setup and resize, the fixed-timestep loop, pointer dispatch, background, sim-info panel. A simulation supplies only `config` and `build({ world, p, inputs, bounds, refs, infoRefs, setOverlay })`, plus optional `update`, `draw`, `info`, `overlay`, `world` and `simInfoRefs`. `build` re-runs on every resize, so it must be idempotent. `inputs` is a live proxy: safe to capture in a closure, always current.

`SimplePendulum.jsx` (constraint as pendulum), `ParabolicMotion.jsx` (analytic guide vs numerical flight) and `InclinedPlane.jsx` (emergent normal force) are the clearest references — read one before writing a new simulation.

Three simulations deliberately bypass the force/integrate pipeline, and the reason is always physical rather than convenience:

- `DoublePendulum.jsx` — two rigid rods leave two degrees of freedom, so it integrates the exact Lagrangian equations for (θ₁, θ₂) with `rk4`. A constraint solver on free point masses would be far less accurate, and the system is chaotic enough to amplify that.
- `PiCollisions.jsx` — the collision count _is_ the answer (the digits of π), so it must be exact. An inline element advances the blocks event by event, solving for each contact time, so no collision can be missed.
- `ThreeBody.jsx` — uses the normal pipeline but with `world: { substeps: 40 }`, because close approaches are too stiff for a single 1/120 s step.

Bodies those elements position themselves are marked `kinematic: true`, which tells World to skip integration while still recording forces.

### Conventions that still hold

- **Coordinates**: all physics is in **meters, Y-up, origin bottom-left**. Conversion to screen space (Y-down, pixels) happens only at render time, through `constants/Utils.js` (`toPixels`/`toMeters`/`physicsToScreen`, `SCALE` from `constants/Config.js`) or `engine/render/Shapes.js`. `Utils.js` holds a module-global `CANVAS_HEIGHT` set by `setCanvasHeight()`.
- **Time**: `constants/Time.js` is a module-level singleton owning timeScale, pause, manual stepping, and per-p5-instance fixed-timestep accumulators (`FIXED_DT = 1/120`). `computeSteps(p)` → `{ dt, steps }` is the only scheduler; `createSimulation` already calls it, so a simulation never touches time directly.

### Content & SEO

`scripts/sitemap-generator.js` reads `routes.js` + `data/articles/index.js` + `data/chapters.js`, writes `public/sitemap.xml` **and rewrites `routes.js` in place** — so `routes.js` diffs (lastmod churn) are expected build output, not hand edits. It strips the duplicate XML prolog the `sitemap` + `xml-formatter` combo would otherwise emit, and `assertValidSitemap()` fails the build if the output is not well-formed. `NOINDEX_PATHS` (currently `/blog/create`, `/simulations/test`) are excluded from both the sitemap and `routes.js`; blog `lastmod` comes from each article's `date` (DD/MM/YYYY), everything else from the build date.

**Metadata & structured data.** Page metadata is Next's App Router `metadata` / `generateMetadata`. Client-only pages (`/simulations`, `/blog`, `/about`, `/contribute`, `/blog/create`) carry their metadata in a sibling server `layout.tsx` — each sets a self-referencing `alternates.canonical`; `/blog/create` also sets `robots.index:false`. `/simulations/[id]` and `/blog/[slug]` set their own canonical/robots in `generateMetadata` (they'd otherwise inherit the listing's). Use the public name **PhysicsHub** in every meta field (not "Physics Portal"). The OG image is `/Thumbnail.jpg` (1200×800). JSON-LD: `app/layout.tsx` emits an `Organization` + `WebSite` `@graph` (the `Organization` `@id` is `…/#organization`, referenced as `publisher` elsewhere); `/blog/[slug]` adds `BlogPosting` + `BreadcrumbList`; `/simulations/[id]` adds `LearningResource` + `BreadcrumbList`.

**Simulation page content.** `/simulations/[id]` renders `SimulationOverview` (server component) — an `<h1>`, intro, "what you can change", key concepts, KaTeX-rendered formulas, and a link to the related article. Its copy lives in `app/(core)/data/simulationOverviews.js`, keyed by the URL segment; `relatedBlogSlug` in `chapters.js` must match a real article slug in `data/articles/index.js`. `page.tsx` passes `<SimulationOverview>` as the `overview` prop of `SimulationWrapper` → `createSimulation`'s component → `SimulationLayout`, which renders it (a server component slotted through the client tree) **between** the interactive stage and the full `TheoryRenderer` article, so the concise summary is not buried under the long theory.

**Simulation shell layout.** `SimulationLayout` wraps the canvas and the controls+parameters in `.simulation-stage`: below 1080px everything stacks (canvas → toolbar → parameters → overview → theory); at ≥1080px it is a CSS grid with the canvas as a tall left stage and `.simulation-stage__panel` — the playback toolbar plus `DynamicInputs` — as a sticky right rail. The full-width bands (`.simulation-breadcrumb`, `.simulation-level-banner`, `.top-nav-sim`, `.simulation-stage`) share `--sim-max-width` / `--sim-gutter` / `--sim-panel-width` (declared on `.simulation-page`) so they align. The canvas height is viewport-driven (`min(78vh, 780px)` wide, `min(64vh, 560px)` stacked); `.screen` fills `.simulation-stage__canvas`. The old mobile controls drawer is retired — every control is always visible and wraps. All styles are in `styles/components/simulation.css`; the parameter panel — `.inputs-container` (the grid) and the `.sim-field` control system every input shares (range / stepper / select / toggle / color, each with a `symbol` pill and a `unit` chip in its head) — is in `forms.css`.

`content/blogs/*.json` holds community-submitted blog proposals created by the publish API; curated articles live as JS modules in `app/(core)/data/articles/`. Each should carry a `date` (DD/MM/YYYY) — it feeds the visible byline, `datePublished`, and the sitemap `lastmod`.

**Article prose & the theory renderer.** `components/theory/` renders a `theory` document (an array of `sections`, each a list of typed `blocks` — `paragraph`, `sectionTitle`, `subtitle`, `callout`, `formula`, `list`, `table`, `image`, `toggle`, …). Running-text fields (`paragraph`/`list`/`callout`/`toggle` bodies) are parsed by `parseInlineText` in `components/theory/utils.tsx` for a small inline syntax: `$…$` → KaTeX inline math, `**bold**`, `` `code` ``, and `[label](url)`. Add an inline form there, not per block. The article view (`/blog/[slug]`) is styled as a long-form _reading_ surface — held ~70ch measure (`.blog-main-column`), bright body text, one vertical rhythm — in `styles/components/theory.css`; block markup and classes are shared with the `/blog/create` editor, whose editing affordances live in `styles/components/blog-editor.css`.

### i18n

Custom, not a library: `hooks/useTranslation.ts` reads the Google Translate `googtrans` cookie to pick a language, loads `app/(core)/locales/<lang>.json`, and `locales/meta.json` marks which languages are `completed`. Incomplete languages fall back to Google Translate widget behaviour (`notranslate` is applied when a locale is complete). Extract new keys with `npm run i18n:extract`.

## Conventions

- Mixed JS/TS by design; new shared code trends toward `.tsx`/`.ts`, simulations stay `.jsx`. The engine is `.js` with JSDoc types, so it stays readable to contributors writing plain-JS simulations.
- When you change the project's structure or add a subsystem, update this file in the same change — it is the only architecture documentation contributors (and their Claude) get.
- When you change anything in `app/(core)/engine/` or the way simulations are written, update `.claude/skills/new-simulation/SKILL.md` in the same change too. It is checked in, so every contributor's Claude loads it, and a stale catalogue there produces broken simulations elsewhere.
- Some comments are in Italian — fine to keep, write new ones in English.
- Significant UI changes: add screenshots under `public/screenshots/<NEW_VERSION>/`, homepage shot named `main.png`.
