---
name: new-simulation
description: How to build a new PhysicsHub simulation on the engine in app/(core)/engine — the four files to touch, the declarative createSimulation spec, the full catalogue of forces/constraints/renderers, and the physics rules that keep simulations correct. Use whenever adding, porting or substantially rewriting anything under simulations/, or when asked how a simulation is put together.
---

# Building a PhysicsHub simulation

Read this before writing any file. Then read one existing simulation end to end —
`simulations/SimplePendulum.jsx` is the shortest complete example.

## The mental model

A **World** owns **Bodies** and **Elements**.

- A **Body** is state only: position, velocity, accumulated force, plus display
  params. It never decides how it moves.
- An **Element** is every behaviour: forces, constraints, colliders, renderers,
  pointer handlers. A plain object with optional lifecycle hooks.

Nothing subclasses `Body`. Behaviours combine by _adding another element_, which
is the property the whole engine exists to protect. A pendulum hanging off a
flying projectile is one body with `Gravity`, a second body, and a `Distance`
between them — no new class, no new file.

If you find yourself writing a class that extends `Body`, or a `p.draw` loop that
integrates motion by hand, stop: the answer is an element.

## The four files

Adding a simulation named `<Name>` touches four places that must agree on the name.

1. **`simulations/<Name>.jsx`** — `"use client"`, default-exports
   `createSimulation({...})`. Nothing else. Imports use _relative_ paths
   (`../app/(core)/...`), not the `@/` alias.
2. **`app/(core)/data/configs/<Name>.js`** — `INITIAL_INPUTS`, `INPUT_FIELDS`,
   `SimInfoMapper`. UI and readout only; **never put forces here**.
3. **`app/(core)/data/chapters.js`** — the catalogue entry. Missing entry means a
   404 in the static export (`dynamicParams = false`).
4. Optionally `app/(core)/data/articles/<slug>.js`, registered in
   `articles/index.js`, referenced by `relatedBlogSlug`.

### 1. The config module

```js
// app/(core)/data/configs/Example.js
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  mass: 1, // SI units throughout: kg, m, s, N
  gravity: EARTH_G_SI,
  trailEnabled: true,
  ballColor: "#3b82f6",
};

export const INPUT_FIELDS = [
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "ballColor", label: "Ball color:", type: "color" },
];

// Receives whatever the simulation's `info` hook returns, plus long-lived refs.
export const SimInfoMapper = (state, context, refs) => ({
  "v (speed)": `${state.vel.mag().toFixed(2)} m/s`,
  "Eₖ (kinetic)": `${state.kineticEnergy.toFixed(2)} J`,
});
```

Field `type` is one of `number` (`min`/`max`/`step`/`placeholder`), `checkbox`,
`color`, `select` (`options: [{value, label}]`), `slider`, `text`. Label the
symbol as well as the name — these are teaching materials.

### 2. The simulation

```jsx
"use client";

import {
  createSimulation,
  Gravity,
  Drag,
  Bounds,
  Dragging,
  ForceVectors,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/Example.js";

export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, bounds }) {
    const ball = world.addBody({
      label: "ball",
      mass: () => inputs.mass,
      size: () => inputs.size,
      color: () => inputs.ballColor,
      at: [bounds.width / 2, bounds.height * 0.8],
      trail: () => inputs.trailEnabled,
    });

    world.add(
      Gravity({ g: () => inputs.gravity }),
      Drag({ c: () => inputs.dragCoeff }),
      Bounds(),
      Dragging(),
      ForceVectors({ bodies: ball })
    );

    return { ball }; // becomes `handles` in every later hook
  },

  info: ({ handles, inputs }) => ({
    state: {
      vel: handles.ball.state.velocity,
      kineticEnergy: handles.ball.getKineticEnergy(),
    },
    context: { gravity: inputs.gravity },
  }),
});
```

### 3. The catalogue entry

```js
{
  id: <next free integer>,
  name: "Human Readable Name",
  desc: "One or two sentences. This is the SEO description — say what the user
         can do and which concepts it teaches.",
  link: "/simulations/Example",          // must match the filename exactly
  tags: [TAGS.EASY, TAGS.DYNAMICS, TAGS.GRAVITY],
  thumbnail: "/thumbnails/example.webp",
  relatedBlogSlug: "some-article-slug",  // optional
}
```

Tags come from `data/tags.js`. Always include exactly one difficulty
(`EASY` / `MEDIUM` / `ADVANCED`) plus the topical ones.

## The createSimulation spec

`createSimulation` already owns: input state and localStorage, URL params, the
reset and load controls, canvas setup and resize, the fixed-timestep loop,
pointer dispatch, the background, and the sim-info panel. Never re-implement any
of it in a simulation.

| key                          | required | purpose                                            |
| ---------------------------- | -------- | -------------------------------------------------- |
| `config`                     | yes      | `{ INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper }`  |
| `build(ctx)`                 | yes      | populate the world, return named handles           |
| `update(ctx)`                | no       | per-frame logic that is _not_ a force              |
| `draw(ctx)`                  | no       | extra rendering; prefer a render element           |
| `info(ctx)`                  | no       | `{ state, context }` fed to `SimInfoMapper`        |
| `overlay({ inputs, state })` | no       | DOM over the canvas                                |
| `world`                      | no       | `{ integrator, solverIterations, substeps, fade }` |
| `simInfoRefs`                | no       | factory for refs that accumulate across frames     |

Hook context: `{ p, world, inputs, handles, refs, infoRefs, bounds, dt, steps,
setOverlay, rebuild }`.

- **`inputs` is a live proxy.** Safe to capture in a closure; always current.
- **`bounds`** is `{ width, height }` in metres, kept in sync with the canvas.
- **`refs`** is free-form per-simulation storage, reset on reset.
- **`rebuild()`** discards the world and re-runs `build` — use it when an input
  changes _what exists_ (a body count), not merely a parameter.
- **`build` re-runs on every resize, so it must be idempotent.** Never mutate
  module-level state from it.

## Catalogue

Import everything from the barrel: `../app/(core)/engine/index.js`.

**Forces** — `applyForces` phase, accumulate newtons.

|                                                  |                                               |
| ------------------------------------------------ | --------------------------------------------- |
| `Gravity({ g })`                                 | uniform F = mg downward                       |
| `Constant({ x, y, perMass })`                    | fixed force, or acceleration with `perMass`   |
| `Wind({ strength })`                             | horizontal `Constant`, conventional label     |
| `Drag({ c, linear })`                            | fluid drag, F = −cv² (or −cv)                 |
| `Damping({ c, perMass })`                        | dashpot N·s/m; `perMass` makes it a rate s⁻¹  |
| `Buoyancy({ density, surfaceY, g })`             | Archimedes, with partial submersion           |
| `MutualGravity({ G, softening })`                | every pair, F = Gm₁m₂/r²                      |
| `PointAttraction({ center, strength, falloff })` | `inverseSquare` \| `constant` \| `linear`     |
| `CustomForce(fn, { label })`                     | escape hatch: `(body, ctx) => {x, y} \| null` |

**Constraints** — positional, solved after integration.

|                                                                   |                                         |
| ----------------------------------------------------------------- | --------------------------------------- |
| `Distance(a, b, len, { limit, stiffness })`                       | rod; `limit: "max"` rope, `"min"` strut |
| `Rope` / `Strut`                                                  | the two presets above                   |
| `Spring(a, b, rest, { k, damping, oneWay })`                      | Hooke; `oneWay: "push" \| "pull"`       |
| `Bounds({ sides, restitution, friction, ... })`                   | walls, energy-correct bounce            |
| `Ground({ y, friction })`                                         | floor only, with a drawn line           |
| `SurfaceFriction({ mu, surfaceY, g })`                            | kinetic friction on a flat surface      |
| `Incline(bodies, { origin, angle, length, muStatic, muKinetic })` | ramp; N emerges                         |
| `CircularPath(body, centre, r, { omega })`                        | prescribed uniform circular motion      |
| `Pin(body, point)`                                                | hold at a point                         |
| `LockAxis(bodies, { x \| y })`                                    | confine to one axis                     |
| `SpeedLimit(bodies, max)`                                         | kinematic speed cap                     |

**Collision**: `Collisions({ restitution })`, plus `collide1D` and
`contactImpulse` for closed-form work.

**Rendering**: `ForceVectors({ bodies, only, exclude, net, scale, enabled })`
draws recorded forces; `Vectors({ show: ["velocity", "acceleration"] })` draws
kinematic ones. Primitives: `toScreen`, `drawSegment`, `drawAnchor`, `drawCoil`,
`drawPath`, `drawGround`, `drawBody`. Palette: `FORCE_COLORS`, `SCENE_COLORS`.

**Interaction**: `Dragging({ project, throwOnRelease, onGrab, onRelease })`.
`project` constrains the grab (onto an arc, a ramp, an axis).

**Maths**: `formulas.*` — pure textbook expressions, no Body/World/p5. Use these
for readouts and predicted paths instead of re-deriving anything.

## Writing a one-off element

When a behaviour is genuinely specific to one simulation, write it inline rather
than bending a general element or adding a narrow option to the engine:

```js
world.add({
  zIndex: 11, // bodies are 0; negative draws behind them
  beforeStep(ctx) {
    /* … */
  },
  applyForces(ctx) {
    /* … */
  },
  solve(ctx) {
    /* … */
  }, // runs solverIterations times
  resolveCollisions(ctx) {
    /* … */
  },
  afterStep(ctx) {
    /* … */
  },
  render(ctx) {
    /* … */
  },
  onPointerDown(ctx) {
    /* … */
  }, // also Move / Up / onDoubleClick
});
```

Promote it into `app/(core)/engine/` only once a second simulation needs it.

## Rules that must not be broken

1. **Units and axes.** Metres, kilograms, seconds, newtons. Y-up, origin
   bottom-left. Conversion to screen space happens only at render time, via
   `engine/render/Shapes.js` or `constants/Utils.js`. A raw pixel value in a
   physics expression is a bug.
2. **Getters, not manual syncing.** Every numeric option and body param accepts
   `() => inputs.x`. Never re-assign parameters inside a loop, and never rebuild
   the world because a slider moved.
3. **Forces only call `body.applyForce(f, label)`.** The label records the force
   in `body.appliedForces`, which is exactly what `ForceVectors` draws. Never
   compute a force a second time for rendering — that is how the two silently
   drift apart.
4. **Never touch time.** No `p.deltaTime`, no accumulators, no `frameCount`
   physics. The runtime calls `computeSteps` and hands you a fixed `dt`.
5. **Derive, don't hardcode.** If a quantity follows from others, let it. The
   ramp does not assume N = mg·cos θ; it sums the applied forces and supplies
   what the surface must push back. That is what makes adding wind to a ramp
   work without touching the ramp.

## Getting the physics right

This is a teaching site: a plausible-looking animation that is subtly wrong is
worse than no simulation. Before you finish:

- **Check the conserved quantities.** With no dissipation, does total energy
  stay flat? Does momentum survive a collision? If restitution is 1, does the
  ball return to its release height _forever_? These catch integration bugs that
  look fine for ten seconds.
- **Check the limits.** Zero gravity, zero mass, zero radius, θ = 0 and θ = 90°,
  μ = 0. Anything dividing by an input needs a guard.
- **Prefer the symplectic default.** `semiImplicitEuler` conserves energy in
  oscillators; explicit Euler pumps it in. Only change the integrator with a
  reason written in a comment.
- **Reach for exactness when the answer is exact.** `PiCollisions` counts
  collisions to produce the digits of π, so it solves for contact times instead
  of stepping. `CircularMotion` prescribes ω = v/r rather than integrating a
  centripetal force that would drift.
- **Raise `substeps` for stiff systems**, don't shrink the global timestep.
  `ThreeBody` uses 40 because close approaches are violent.
- **Write the derivation in a comment** when a formula is not obvious (the
  Lagrange configuration in `ThreeBody`, the tension in `Distance`). A wrong
  constant that nobody can check is the failure mode here.

## Precedents worth copying

|                           |                                                            |
| ------------------------- | ---------------------------------------------------------- |
| `SimplePendulum.jsx`      | constraint _as_ the pendulum; drag projected onto the arc  |
| `ParabolicMotion.jsx`     | analytic guide vs numerical flight; relaunch via `update`  |
| `InclinedPlane.jsx`       | emergent normal force; element ordering matters            |
| `BallGravity.jsx`         | DOM overlay driven from the sketch via `setOverlay`        |
| `CollisionSimulation.jsx` | `LockAxis` reduces the 2-D solver to exact 1-D             |
| `ThreeBody.jsx`           | `substeps`, and initial conditions that are real solutions |
| `DoublePendulum.jsx`      | when to leave the pipeline: exact Lagrangian + `rk4`       |
| `PiCollisions.jsx`        | event-driven element, `kinematic: true` bodies             |

## Before you call it done

```bash
npx prettier --write <changed files>
npx eslint <changed files>
```

CI runs `prettier --check .` and `eslint .` and nothing else — there is no test
suite, so these plus your own reasoning about conservation laws are the only
safety net.

Never edit `version` in `package.json` (semantic-release owns it). PR titles are
conventional commits; the squashed title becomes the changelog entry. Significant
UI changes want a screenshot under `public/screenshots/<NEW_VERSION>/`.

## Keeping this file true

**This guide is part of the engine's public surface.** Whenever you add or change
anything in `app/(core)/engine/` — a new force, constraint, renderer, hook, or
option; a renamed export; a different `createSimulation` contract — update this
file _in the same change_, and `CLAUDE.md` too if the architecture moved. A
contributor's Claude will follow this document literally, so a stale catalogue
entry here becomes a broken simulation there.
