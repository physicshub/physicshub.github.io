# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

In priority order:

1. **Self-learners and students** — ages 6+ through university, using the site independently to build intuition or prep for exams. `data/tags.js` classifies every simulation and article by school level (Elementary 6-11, Middle School 11-14, High School 14-18, University 18+) with US/UK/IGCSE/IB curriculum equivalences, so learners can match content to their own curriculum.
2. **Physics enthusiasts** — curious people exploring how the universe works outside any curriculum (the `tool`/`Reference & fun` level exists for this group).
3. **Teachers** — may assign or demo simulations in class; not yet designed for separately (no teacher-specific workflows exist today).
4. **Open-source contributors** — developers who fork the repo, add simulations, fix bugs, or translate content.

## Product Purpose

PhysicsHub turns abstract physics equations into reactive, hands-on simulations paired with clearly written theory, so a learner can pull a lever, change a variable, and immediately see how the math behaves — instead of memorizing a formula. Success means a learner leaves with visual/intuitive understanding a static textbook diagram doesn't give them.

## Positioning

Most high-quality physics software is either paywalled or stuck in a dated interface. PhysicsHub's mechanism a competitor can't casually copy: it runs on its own from-scratch physics engine (`app/(core)/engine/`, not a wrapper around a physics library) built specifically so behaviour composes (forces/constraints/renderers as plain-object elements on shared bodies), it is completely free with zero ads, paywalls, or accounts, and it is fully open-source — a learner can inspect the exact code computing the gravity they're watching, or fork it to build their own experiment.

## Operating Context

- Runs in-browser as a static site (`npm run build:static` → GitHub Pages export at physicshub.github.io); see CLAUDE.md "Two build modes" for the constraint this puts on any feature touching `app/api`.
- Every simulation and article is tagged with a school level + difficulty (`core`/`extended`/`advanced`) so the catalogue and search can be filtered to match a curriculum.
- Supports light/dark mode natively.
- Custom i18n: language is picked via a Google Translate cookie, complete translations live in `app/(core)/locales/*.json` (currently includes at least ar, de, en, es, fr, it, rw), incomplete languages fall back to the Google Translate widget.
- Community and support channel: a public Discord (linked from the About page).
- Contribution workflow: GitHub OAuth sign-in lets a contributor publish a blog proposal directly from the in-app editor, which opens a PR against the repo on their behalf (`app/api/publish`).

## Capabilities and Constraints

- Physics is real, not decorative: every simulation runs on the shared engine's force/constraint/integrator pipeline (or, for three specific simulations, an exact analytic/event-driven method where the pipeline would be measurably less accurate — see CLAUDE.md).
- Anything under `app/api` (GitHub OAuth, blog publishing) does not exist on the static GitHub Pages export — it only works on the Vercel deploy or in local `next dev`.
- No accounts or sign-in are required to use any simulation or read any theory; sign-in exists only for the contributor blog-publishing flow.
- No test suite; correctness is enforced by prettier/eslint in CI and by the physics engine's own invariants, not by automated UI or physics tests.
- Mixed JS/TS by design: simulations stay `.jsx`, the engine is `.js` with JSDoc so contributors writing plain JS can read it, shared app code trends `.tsx`/`.ts`.

## Brand Commitments

- Name: **PhysicsHub**. Tagline used in copy: "Learn physics the visual way" / "Stop memorizing formulas. Start visualizing them."
- Logo exists at `public/Logo.png`.
- Voice: direct, technical-but-approachable, written for learners rather than textbook register (per About page copy).
- Non-negotiable commitments repeated across README and About page: completely free, no ads, no paywalls, no required accounts, open-source.
- Created and maintained by @mattqdev and the PhysicsHub community/Discord — credited on the About page.

## Evidence on Hand

- Live GitHub stats (star count, contributor count) are fetched at runtime from the GitHub API on the About page — real, not fabricated, but dynamic (defaults to "-" before load).
- Discord community link (real, linked from About page).
- Homepage/product screenshot convention: `public/screenshots/<VERSION>/main.png`, referenced from README.
- **Nothing further exists.** No testimonials, case studies, press mentions, or named notable users are on hand — future design or copy work must not invent any.

## Product Principles

1. **Simulate the math, don't just animate it.** Every visual must trace back to the engine actually computing the physics shown — accuracy is the product's core credibility claim.
2. **Zero friction to learn.** No paywall, no account, no ads — anything that adds friction between a curious visitor and a working simulation works against the product's purpose.
3. **Curriculum-legible, not curriculum-locked.** School-level/difficulty tagging helps a learner find the right content fast, but the product also serves curiosity-driven exploration outside any curriculum (`tool` level).
4. **Open by construction.** The codebase itself is a teaching artifact for contributors — clean, forkable structure matters as much as the UI a learner sees.

## Accessibility & Inclusion

No formal accessibility standard (e.g. WCAG level) has been committed to yet. Existing accessibility-relevant features are light/dark mode and multi-language i18n support; treat as not-yet-established rather than inventing a compliance target.
