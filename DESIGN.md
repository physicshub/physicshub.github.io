---
name: PhysicsHub
description: Interactive physics simulations that behave like calibrated lab instruments.
colors:
  signal-cyan: "#00e6e6"
  signal-cyan-light: "#00b8b8"
  button-ink: "#001919"
  void: "#0b0f19"
  panel: "#111111"
  abyss-start: "#0a0a0a"
  abyss-end: "#141416"
  bg-darker: "#0d0d0d"
  paper: "#ffffff"
  paper-panel: "#f8f9fa"
  text-cool-white: "#e8eefb"
  text-cool-muted: "#cfd6e3"
  text-ink: "#1a1a1a"
  title-deep-teal: "#003344"
  subtitle-teal: "#005566"
  glow-white: "#ffffff"
  grid-blueprint: "rgba(115, 130, 175, 0.16)"
  hairline-dark: "rgba(255, 255, 255, 0.08)"
  hairline-light: "rgba(0, 0, 0, 0.15)"
  input-fill-dark: "rgba(0, 70, 70, 0.6)"
  input-fill-light: "#ffffff"
  success: "#10b981"
  warning: "#f59e0b"
  info: "#3b82f6"
  tip: "#8b5cf6"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "clamp(2.4rem, 5.7vw, 5.35rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.09em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Roboto Mono, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  card: "18px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.button-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0.78rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.button-ink}"
  button-ghost:
    textColor: "{colors.text-cool-white}"
    rounded: "{rounded.xl}"
    padding: "0.78rem 1.1rem"
  button-glow:
    textColor: "{colors.signal-cyan}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.5rem"
  input-text:
    backgroundColor: "{colors.input-fill-dark}"
    textColor: "{colors.text-cool-white}"
    rounded: "{rounded.lg}"
    padding: "0.5rem"
  chapter-card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.card}"
    padding: "18px"
  tag:
    textColor: "#000000"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.25rem 0.5rem"
  eyebrow-pill:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.75rem"
---

# Design System: PhysicsHub

## Overview

**Creative North Star: "The Live Instrument"**

PhysicsHub looks like a piece of calibrated laboratory equipment that happens to run in a browser. Every surface borrows from the vocabulary of a working instrument: a dark measurement field, a single phosphor-bright trace colour, blueprint grids that fade at the edges, scan sweeps, orbit rings and vector arrows. The aesthetic exists to back the product's core claim — the physics on screen is really being computed — so the interface carries itself with the precision of a readout, not the gloss of a marketing page.

The mood is **precise and luminous**. Technical exactness comes first: tight corners, hairline borders, tabular figures, restrained density. The luminance is the payoff — Signal Cyan is treated as emitted energy, glowing on hover and focus the way a CRT trace glows, never as flat decoration. Dark is the default theme and the one the identity is designed around; light theme is a faithful, deliberately flatter translation that trades the glow for conventional depth.

This world is defined as much by what it refuses. It is **not** a generic SaaS dashboard (flat grey cards, purple gradient buttons, no point of view). It is **not** a dated academic site (serif body text, beige page, cramped tables) — escaping exactly that look is part of the product's positioning. And it is **not** neon-overload cyberpunk: there is one accent hue, glow is rationed to moments of interaction, and contrast is never sacrificed for atmosphere.

**Key Characteristics:**

- One accent — Signal Cyan — carried mostly as translucent `color-mix` washes, not solid fills.
- Deep navy-black measurement field (`#0b0f19`) with faint blueprint-grid texture on stages and previews.
- Neon is behaviour: text-glow and cyan box-shadow appear on hover/focus/active, then recede.
- System font stack, no web fonts — zero latency, no layout shift on the static export.
- Uppercase micro-labels ("eyebrows") introduce almost every section and card.
- Motion is instrument-like: quick lifts, a 1.03 scale, recurring scan-sweep and orbit animations, all disabled under `prefers-reduced-motion`.

## Colors

A near-monochrome dark field with one high-chroma cyan doing all the accent work, plus a conventional five-colour status set.

### Primary

- **Signal Cyan** (`#00e6e6` dark, `#00b8b8` light): the only brand accent. Links, primary CTAs, focus rings, active nav underline, card hover borders, every eyebrow pill, and — through `color-mix` — every tinted surface, border and glow. It also feeds `--glow-color` behaviour and the p5 canvas render colours.
- **Button Ink** (`#001919`): near-black teal used for text sitting on a solid Signal Cyan button, where cyan-on-cyan would fail contrast.

### Neutral (dark theme — the default)

- **Void** (`#0b0f19`): the page background — a deep blue-leaning black that reads as a measurement field.
- **Abyss Gradient** (`#0a0a0a` → `#141416`): the body's `linear-gradient(135deg, …)`, a barely-there vertical shift under the void.
- **Panel** (`#111111`): card and canvas-frame fill.
- **BG Darker** (`#0d0d0d`): recessed wells — disabled inputs, tooltip bodies, copy-feedback chips.
- **Cool White** (`#e8eefb`): primary text and headings — white with a faint blue cast so it belongs to the field.
- **Cool Muted** (`#cfd6e3`): subtitles, card descriptions, secondary copy.
- **Hairline** (`rgba(255,255,255,0.08)`): default border/divider — a whisper, not a line.
- **Blueprint Grid** (`rgba(115,130,175,0.16)`): the grid-overlay stroke on hero preview and chapter-card stages.

### Neutral (light theme)

- **Paper** (`#ffffff`): page background; the abyss gradient collapses to flat white.
- **Paper Panel** (`#f8f9fa`): card fill.
- **Ink** (`#1a1a1a`): body text.
- **Deep Teal** (`#003344`) / **Subtitle Teal** (`#005566`): headings and subtitles — light theme swaps cool-white text for teal to keep the instrument identity without glow.
- **Hairline Light** (`rgba(0,0,0,0.15)`): borders.

### Status

- **Success** (`#10b981`), **Warning** (`#f59e0b`), **Info** (`#3b82f6`), **Tip** (`#8b5cf6`), **Error** (`#ef4444`): callouts, form validation, the note block. Each pairs with a ~8–15% alpha tint of itself as the fill. These are the only hues allowed outside the cyan/neutral system, and only for state.

### Named Rules

**The One Voice Rule.** Signal Cyan is the single accent on any screen. If a second saturated hue appears and it is not communicating status (success/warning/info/tip/error), it is wrong.

**The color-mix Rule.** Accent surfaces, borders and glows are derived at use-site with `color-mix(in oklab, var(--accent-color), transparent N%)` (washes commonly sit at 60–94% transparency). Never hard-code a dimmed cyan — the mix must retint automatically when the theme's `--accent-color` changes.

**The Tint-Not-Fill Rule.** Accent regions are overwhelmingly translucent washes over the dark field. A solid Signal Cyan fill is reserved for the primary button and the active/selected state of a control.

## Typography

**Display / Body Font:** Segoe UI (with Tahoma, Geneva, Verdana, sans-serif)
**Label / Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace` — used for the ghost serial number on chapter cards, formula code, and the simulation info panel readout.

**Character:** One system sans carries the whole hierarchy; there is no display face. Personality comes from treatment, not typeface — very tight negative tracking and a sub-1 line-height on the hero, wide positive tracking and uppercase on labels. The monospace is the "instrument readout" voice: serials, live values, formulas.

### Hierarchy

- **Display** (600, `clamp(2.4rem, 5.7vw, 5.35rem)`, line-height 0.98, tracking −0.05em, max ~11ch): the landing hero title only. Deliberately over-tightened so it reads as a machined nameplate.
- **Headline** (700, `clamp(2.4rem, 5vw, 3.2rem)`, line-height 1.2): page-level H1 (simulations index hero, section intros). The 404 uses an outsized 8rem variant with a glow.
- **Title** (700, ~1.06–2.25rem depending on context, line-height 1.2–1.4): card headings, panel headings, blog article title (2.25rem / 800). Card titles clamp to two lines for a uniform grid.
- **Body** (400, 1rem, line-height 1.6–1.7): running text. Reading measures are held to ~58–75ch (`--ph-hero__subtitle` max 58ch; theory paragraphs run wider inside the article column).
- **Label** (700–800, 0.68–0.85rem, tracking 0.06–0.2em, UPPERCASE): eyebrows, metric labels, TOC title, nav labels, chip text, the school-level banner. This is the workhorse accent-of-type.

### Named Rules

**The System-Stack Rule.** No web font is loaded anywhere. The Segoe UI stack is a deliberate constraint — it costs zero network latency and produces no layout shift on a static GitHub Pages export. Do not add `next/font` or `@font-face` without a hard reason.

**The Eyebrow Rule.** A section, card or panel is introduced by an uppercase micro-label before its heading: 0.68–0.85rem, letter-spacing ≥ 0.06em, weight 700–800, in Signal Cyan or a lightened mix of it. It is the connective tissue of the whole system.

**The Readout Rule.** Anything that represents a measured or computed value — live physics readouts, serial numbers, formulas, stat figures — is set in the mono stack, often with `font-variant-numeric: tabular-nums`.

## Layout

Centred single-column content with a fixed, blurred top bar. The primary container is `min(1200px, …)` (`--max-content-width`); card-grid pages widen to 1400px. Horizontal page padding is `2rem` on desktop, tightening to `1–1.5rem` on small screens; hero and section vertical padding uses `clamp()` (roughly `2rem`–`7rem`).

**Grid.** Card collections are `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` with a `1.5–1.75rem` gap — simulations index, related articles, contributors, footer columns all follow this. The landing hero is the one bespoke layout: a two-column `minmax(0,1.02fr) minmax(330px,0.78fr)` grid that collapses to one column at 960px.

**Chrome.** `header` is `position: fixed`, full-width, `backdrop-filter: blur(10px)`, `z-index: 2000`, with a hairline bottom border; it nudges partly off-screen on scroll-down (`.sticky`). Because the header is fixed, page content carries a top offset of roughly `6–8rem` (or a school-level banner that absorbs it). Below 840px the nav becomes a right-hand drawer with a blurred backdrop and staggered link entrance.

**Rhythm.** Vertical spacing steps through `0.5 / 0.75 / 1 / 1.5 / 2 / 3 rem`. Section-to-section gaps are `1.5–3rem`; intra-component gaps `0.5–1rem`. Density is moderate — generous but never sparse.

**Responsive breakpoints** (max-width unless noted): 640 (stack CTAs, full-width buttons), 768 (single-column sections), 840 (nav drawer, hide GitHub badge), 960 (hero to one column), 1024 min (blog TOC sidebar appears), 1200 (container ceiling).

## Elevation & Depth

Hybrid, with a strict division of labour: **glow is state, shadow is structure.**

Resting depth is carried by large, soft, black ambient shadows — panels and hero cards float on `0 25px 50px rgba(0,0,0,0.35)` and heavier. Interaction is carried by Signal Cyan: a cyan box-shadow or text-shadow appears only on `:hover`, `:focus-visible` or `:active`, then fades. A primary button additionally rests on a cyan-tinted lift shadow and an `inset 0 1px 0 rgba(255,255,255,0.42)` top highlight, so it reads as a physical key.

Light theme deliberately flattens this: `reset.css` strips `text-shadow`/`box-shadow` glow from headings, logos, glow buttons and labels, and depth falls back to plain neutral shadow.

### Shadow Vocabulary

- **Ambient Panel** (`box-shadow: 0 25px 50px rgba(0,0,0,0.35)`): hero, about hero, about panels — the resting lift for large surfaces.
- **Ambient Card** (`box-shadow: 0 8px 32px rgba(0,0,0,0.35)`): standard card / fun-fact / contribution-card rest.
- **Ambient Deep** (`box-shadow: 0 30px 80px rgba(0,0,0,0.38)`): the landing frosted card behind the hero columns.
- **Primary Lift** (`box-shadow: 0 18px 38px color-mix(in oklab, var(--accent-color), transparent 68%)`): the resting shadow under `.ph-btn--primary` — the one place cyan glow is allowed at rest.
- **Glow Focus** (`box-shadow: 0 0 8px rgba(0,230,230,0.6)`): input / search focus.
- **Glow Ring** (`box-shadow: 0 0 12px var(--accent-color)`): `.btn-glow` hover, back-to-top button, contributor card hover.
- **Glow Bloom** (`box-shadow: 0 0 24px 4px color-mix(in oklab, var(--accent-color), transparent 72%)`): chapter-card hover.
- **Inset Highlight** (`inset 0 1px 0 rgba(255,255,255,0.42)`): top edge of the primary button and the frosted hero card.

### Named Rules

**The Glow-Is-State Rule.** Signal Cyan glow (box-shadow or text-shadow) never appears on an element at rest. It is a response to hover, focus or active. The lone sanctioned exception is `.ph-btn--primary`, whose resting cyan lift shadow is part of its "physical key" identity.

**The Light-Flattens Rule.** In light theme, glow is removed, not recoloured. `[data-theme="light"]` blocks in `reset.css` and component files zero out `text-shadow` and glow `box-shadow`; depth becomes conventional soft neutral shadow.

## Shapes

Rectilinear with softened corners, plus a hard binary for round elements. The radius scale is `4 / 6 / 8 / 10 / 14 / 18px` (`--radius-xs` through the chapter card). `10px` (`--border-radius`) is the default for inputs, tags, small controls and most containers; `14px` (`--ph-radius`) is the button and hero-frame radius; cards land at `12–18px`, and a few showcase surfaces (about hero, landing frosted card, hero preview) go to `20–28px`.

Borders are hairlines — `1px solid` at low alpha (`rgba(255,255,255,0.08)` neutral, or a `color-mix` cyan at 55–85% transparency for accented containers). Dashed borders mark "example / editable" regions in theory content.

Two recurring geometric motifs define the world:

- **The blueprint grid**: a two-axis `linear-gradient` grid (24–34px cells) at `--ph-grid` / low-alpha white, masked with `radial-gradient(circle at center, black, transparent ~78%)` so it fades at the edges. It textures the hero preview and every chapter-card stage.
- **The scan sweep**: a soft gradient bar that travels across a surface (`@keyframes ph-scan`, `chapter-scan`, `ph-preview-shine`) — a "the instrument is live" signal. Plus orbit ellipses, pulse rings and vector arrows as hero decoration.

### Named Rules

**The Pill-or-Panel Rule.** Interactive chips, eyebrows, topic links, avatars and toggle tracks are fully round (`999px`). Containers are `10–18px`. Avoid intermediate values like `24–40px` except on the two or three intentionally showcase surfaces.

**The Blueprint Grid Rule.** Any "stage", preview or thumbnail frame gets the masked grid overlay. It is the signature texture — reach for it before reaching for a photo or a flat fill.

## Components

Buttons, cards and inputs should feel **calibrated and responsive**: tight radii, precise hairline borders, and an immediate confident reaction to input (a small lift, a 1.03 scale, a glow that switches on) — the way real equipment responds when you touch it.

### Buttons

- **Shape:** `14px` radius (`.ph-btn`), `inline-flex` with a `0.5rem` gap for an optional leading icon; padding `0.78rem 1.1rem` (the `.main-btn` CTA variant bumps to `0.9rem 1.35rem` / 1.05rem text). Transitions run `0.4s ease` across transform, box-shadow, background.
- **Primary** (`.ph-btn--primary`): a vertical gradient from a 20%-lightened Signal Cyan to Signal Cyan, `#001919` text, Primary Lift shadow + inset top highlight. Hover: `scale3d(1.03,1.03,1)` and a tighter shadow.
- **Ghost** (`.ph-btn--ghost`): cyan wash fill (`color-mix … transparent 92%`), cyan border at 60% transparency, cool-white text. Hover: wash darkens slightly, `translateY(-1px)`.
- **Glow** (`.btn-glow`, legacy — 404 page, simulation controls): transparent body, `2px` solid Signal Cyan border, cyan text with a faint glow; a radial-gradient bloom fades in from center on hover with `scale(1.05)`, and `scale(0.95)` on active.
- **Mobile:** `.ph-btn` goes full-width and centred below 640px.

### Chips & Tags

- **Tag** (`.tag`): rectangular (`10px` radius), UPPERCASE, `font-weight: bold`, `0.25rem 0.5rem` padding, **black text on a solid data-driven colour** (the colour comes from `data/tags.js` as an inline style). Selected state (`.tag-selected`): solid Signal Cyan fill, white text, `2px` cyan outline + border. The school-level badge adds an `inset 0 0 0 1px rgba(255,255,255,0.35)` ring so it reads first.
- **Eyebrow / topic pill:** fully round (`999px`), uppercase label type, cyan wash background, cyan border at 54–64% transparency, lightened-cyan text. Hover on interactive ones: `translateY(-2px)` + soft cyan shadow.

### Cards / Containers

- **Corner style:** `12–18px` (chapter card `18px`, contributor card `12px`, related card `--radius`/8px, contribution card `1.5rem`).
- **Background:** Panel (`#111`) or a black-shifted mix of Void; accented containers use a cyan wash.
- **Border:** `1px` hairline, shifting to a `color-mix` cyan at ~58% transparency on hover.
- **Shadow strategy:** Ambient Card at rest; on hover, `translateY(-4px)` and Glow Bloom (see Elevation).
- **Internal padding:** `18px`–`2rem` depending on card size.
- **Signature — the chapter card** (`components/Chapter.jsx`): a "laboratory instrument" treatment. A `3:2` stage carries the blueprint grid, a hover scan sweep, and a screen-blend glow fading it into the body; when no thumbnail exists a generated fallback draws orbit rings and an icon from per-card `--chapter-accent` / `--chapter-accent-2`. The body has a giant ghost mono serial number (3.4rem, 800, cyan at 82% transparency) behind an eyebrow pill, a two-line-clamped title, a three-line-clamped description, a metrics footer of icon + label + value tiles, and a stretched-link CTA whose arrow slides `4px` on hover.

### Inputs / Fields

- **Style:** `0.5rem` padding, `10px` radius, `1px` solid `--input-border` (solid Signal Cyan in both themes), fill of a dark teal `rgba(0,70,70,0.6)` (dark) / white (light), cool-white text. Labels sit above at `0.9rem` with a faint glow in dark theme.
- **Focus:** border switches to `--accent-color` and Glow Focus shadow (`0 0 8px rgba(0,230,230,0.6)`) switches on. The search container expands its input `15rem → 20rem` on focus (disabled below 840px).
- **Slider:** `6px` track on the hairline colour; `16px` round cyan thumb with a `2px` black ring, `scale(1.2)` + white glow on hover.
- **Toggle** (checkbox rendered as a switch): `4rem × 2rem` pill track on the hairline colour; `1.7rem` cyan thumb; checked → track fills Signal Cyan, thumb slides and takes the card colour.
- **Disabled:** `#222` fill, `#888` text, `opacity 0.7`, `not-allowed` cursor.
- **Global focus-visible:** `2px solid var(--focus-ring)` (`rgba(59,130,246,0.5)`) at `2px` offset on every focusable element.

### Navigation

- **Header links:** body-size, `color 0.3s` transition, an underline that grows from width 0 on hover, plus a JS-positioned sliding `.nav-underline` indicator (`2px`, Signal Cyan) under the active route.
- **Mobile (≤840px):** a fixed right-hand drawer, `min(86vw, 360px)` wide, black-shifted Void background, cyan-tinted left border, `-20px 0 40px` shadow, blurred dimming backdrop; nav items stagger in on open. The `.nav-underline` is hidden here.
- **GitHub badge:** a pill (`0.75rem` radius) with a vertical carousel of stats (stars / forks) that transitions on a `0.35s` track; hidden below 840px.

### Simulation info panel (signature)

`position: absolute` top-left over the canvas, `rgba(0,0,0,0.6)` (dark) / `rgba(255,255,255,0.9)` (light), **monospace**, `0.7rem`, `10px` radius. Collapses to a `2rem` square badge. On phones it re-docks to the bottom edge and rows stack. This is the purest expression of the "live instrument" idea — a floating readout on top of the running physics.

## Do's and Don'ts

### Do:

- **Do** keep Signal Cyan as the only accent, and express it mostly as translucent `color-mix(in oklab, var(--accent-color), transparent N%)` washes rather than solid fills.
- **Do** reserve cyan glow (box-shadow / text-shadow) for `:hover` / `:focus-visible` / `:active` — the only resting exception is `.ph-btn--primary`.
- **Do** introduce sections and cards with an uppercase eyebrow label (0.68–0.85rem, tracking ≥ 0.06em, weight 700–800).
- **Do** set measured or computed values — live readouts, serials, formulas, stat figures — in the mono stack with tabular numerals.
- **Do** texture "stage" / preview / thumbnail surfaces with the masked blueprint grid (24–34px cells, radial-mask edge fade).
- **Do** use `auto-fit, minmax(280px, 1fr)` grids with a `1.5–1.75rem` gap for card collections, capped at 1200px (1400px for wide grids).
- **Do** give the light theme a genuinely flatter translation — drop the glow, keep the identity in the teal headings and cyan accents.
- **Do** honour `prefers-reduced-motion`: the scan sweeps, orbits, hero canvas and staggered entrances must all switch off.
- **Do** keep radii on the `4 / 6 / 8 / 10 / 14 / 18px` scale, with `999px` for anything pill-shaped.

### Don't:

- **Don't** introduce a second saturated hue unless it is communicating status (success / warning / info / tip / error).
- **Don't** hard-code a dimmed cyan (`#0a8`, `rgba(0,230,230,0.3)`, …) where a `color-mix` off `--accent-color` would retint with the theme.
- **Don't** add a web font or `@font-face` — the system stack is a deliberate performance/no-shift constraint for the static export.
- **Don't** drift toward the generic SaaS-dashboard look: flat grey cards, purple gradient CTAs, uniform Inter, no point of view.
- **Don't** drift toward the dated-academic look: serif body copy, beige/paper backgrounds, cramped bordered tables, math as the only styled element.
- **Don't** over-glow: multiple neon hues, glow on resting elements, or atmosphere that costs text contrast — that is the cyberpunk failure mode this system rejects.
- **Don't** put resting cyan borders/shadows at full opacity; accented containers sit at ~55–85% border transparency.
- **Don't** use intermediate corner radii (24–40px) except on the two or three intentional showcase surfaces (about hero, landing frosted card, hero preview).
