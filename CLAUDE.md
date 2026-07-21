# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PhysicsHub — a free, open-source educational site of interactive physics simulations plus written theory. Next.js 15 App Router, React 19, p5.js for rendering, Tailwind v4, statically exported (`output: "export"`) and deployed to GitHub Pages. Physics is our own engine (below), not a library; `planck` is still in package.json but no longer imported anywhere.

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

- `app/(core)/` — everything shared: `engine/`, `components/`, `constants/`, `data/`, `hooks/`, `utils/`, `locales/`, `styles/`. Not a route segment.
- `app/(pages)/` — the actual pages (`about`, `blog`, `contribute`, `simulations`).
- `app/api/publish/route.ts` — a POST handler that opens a GitHub PR with a proposed blog JSON via Octokit. Note this cannot run on the statically exported GitHub Pages deploy; it only works in `next dev` / a Node host.
- Import alias: `@/*` → repo root (e.g. `@/app/(core)/data/chapters`). Simulations under `simulations/` use relative paths instead.

### How a simulation is wired (the central pattern)

Adding a simulation touches four places that must agree on the same name:

1. `simulations/<Name>.jsx` — the `"use client"` component. Loaded dynamically with `ssr: false` by `app/(pages)/simulations/[id]/_components/SimulationWrapper.tsx` via `import("@/simulations/${id}")`.
2. `app/(core)/data/configs/<Name>.js` — exports `INITIAL_INPUTS`, `INPUT_FIELDS` (declarative form schema rendered by `components/inputs/DynamicInputs`) and `SimInfoMapper(state, context, refs)`. Configs describe the UI and the readout only: forces belong in the world, never here.
3. `app/(core)/data/chapters.js` — the catalog entry: `link: "/simulations/<Name>"`, tags from `data/tags.js`, thumbnail, `relatedBlogSlug`. `[id]/page.tsx` derives `generateStaticParams` and metadata from this file, with `dynamicParams = false` — a simulation missing from `chapters.js` will 404 in the export.
4. Optionally `app/(core)/data/articles/<slug>.js`, registered in `articles/index.js`.

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

`scripts/sitemap-generator.js` reads `routes.js` + `data/articles/index.js` + `data/chapters.js`, writes `public/sitemap.xml` **and rewrites `routes.js` in place** — so `routes.js` diffs (lastmod churn) are expected build output, not hand edits.

`content/blogs/*.json` holds community-submitted blog proposals created by the publish API; curated articles live as JS modules in `app/(core)/data/articles/`.

### i18n

Custom, not a library: `hooks/useTranslation.ts` reads the Google Translate `googtrans` cookie to pick a language, loads `app/(core)/locales/<lang>.json`, and `locales/meta.json` marks which languages are `completed`. Incomplete languages fall back to Google Translate widget behaviour (`notranslate` is applied when a locale is complete). Extract new keys with `npm run i18n:extract`.

## Conventions

- Mixed JS/TS by design; new shared code trends toward `.tsx`/`.ts`, simulations stay `.jsx`. The engine is `.js` with JSDoc types, so it stays readable to contributors writing plain-JS simulations.
- When you change the project's structure or add a subsystem, update this file in the same change — it is the only architecture documentation contributors (and their Claude) get.
- Some comments are in Italian — fine to keep, write new ones in English.
- Significant UI changes: add screenshots under `public/screenshots/<NEW_VERSION>/`, homepage shot named `main.png`.
