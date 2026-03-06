# PhysicsHub Repository — Comprehensive Bug & Quality Report

**Repository:** `physicshub/physicshub.github.io`  
**Stack:** Next.js 16 · React 19 · TypeScript/JavaScript · p5.js · Planck.js · Tailwind CSS v4  
**Analysis Date:** 2026-03-03  
**Severity Legend:** 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## Executive Summary

The PhysicsHub codebase is a well-structured interactive physics simulation platform. The core architecture (centralized `PhysicsBody`, `ForceCalculator`, `ForceRenderer`, `DragController`) is thoughtfully designed. However, the audit identified **23 confirmed bugs and quality issues** across 4 severity tiers.

| Severity    | Count | Key Area                                     |
| ----------- | ----- | -------------------------------------------- |
| 🔴 Critical | 3     | Physics correctness, broken physics engine   |
| 🟠 High     | 5     | Integration bugs, null crashes, broken reset |
| 🟡 Medium   | 9     | Code quality, dead code, unit errors         |
| 🟢 Low      | 6     | Performance, UX, naming                      |

---

## Repository Structure Map

```
physicshub.github.io-main/
├── app/(core)/
│   ├── constants/         Config.js, Time.js, Utils.js
│   ├── physics/           PhysicsBody.js, ForceCalculator.js, ForceRenderer.js,
│   │                      InclinedPlaneBody.js, DragController.js, Spring.ts
│   ├── data/configs/      Per-simulation INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper
│   └── hooks/             useSimulationState, useSimInfo, useMobile, useTheme
└── simulations/           9 simulation components (BallGravity, BouncingBall, etc.)
```

**Core coordinate convention (critical context for all bugs):**
All physics runs in **Y-UP** (standard physics: y increases upward). Rendering converts to screen Y-DOWN only at draw time via `physicsToScreen()`. Most bugs arise where this conversion is missed, doubled, or reversed.

---

## 🔴 Critical Bugs

---

### BUG-001 — PhysicsBody.js: Spring.ts source accidentally appended to file

**File:** `app/(core)/physics/PhysicsBody.js` after line ~225  
**Category:** Build Correctness

The file contains the full source of `Spring.ts` (TypeScript `interface` declarations, class definition, methods) appended directly after `export default PhysicsBody`. This creates a `.js` file with TypeScript syntax, which will crash in any environment that does not transpile `.js` files as TypeScript. Two separate modules should not share one file.

**Fix:**

```js
// PhysicsBody.js — everything after this line must be removed:
export default PhysicsBody;
// ← file ends here. Spring.ts content below must be deleted.
```

Ensure `Spring.ts` is the sole location for the Spring class.

---

### BUG-002 — ForceRenderer + SpringConnection.jsx: Weight vector drawn pointing UP

**File:** `app/(core)/physics/ForceRenderer.js` line 140, `simulations/SpringConnection.jsx`  
**Category:** Physics Correctness

`ForceCalculator.gravity()` returns `{ y: -mass*g }` (Y-up convention, downward = negative). When this is passed directly to `drawVector` in `SpringConnection.jsx`, the vector renders with negative Y in screen space — pointing **upward** on screen instead of downward.

```js
// SpringConnection.jsx — BUGGY direct call:
renderer.drawVector(
  p,
  screenPos.x,
  screenPos.y,
  gravityForce.x,
  gravityForce.y, // gravityForce.y = -mass*g → draws UP on screen
  "#ef4444",
  "Weight"
);

// FIX — use the dedicated helper which handles direction correctly:
renderer.drawWeight(
  p,
  screenPos.x,
  screenPos.y,
  bodyRef.current.params.mass,
  inputsRef.current.gravity
);
```

---

### BUG-003 — VectorsOperations.jsx: Physics engine permanently disabled (hardcoded scale = 0)

**File:** `simulations/VectorsOperations.jsx` ~line 116  
**Category:** Functional — Physics Never Runs

```js
const scale = 0; //getTimeScale();  ← DEBUG LEFTOVER, never removed
if (!isPaused()) {
  accumulator += dt * Math.max(0, scale); // accumulator always stays 0
}
// worldRef.current.step() is never called → Planck.js body never moves
```

The `getTimeScale()` call was commented out. The physics body is created and displayed but completely frozen regardless of user interaction.

**Fix:**

```js
import { getTimeScale } from "../app/(core)/constants/Time.js";
// ...
const scale = getTimeScale(); // restore this line
```

---

## 🟠 High Severity Bugs

---

### BUG-004 — InclinedPlaneBody.stepAlongPlane(): Incorrect 2D state sync

**File:** `app/(core)/physics/InclinedPlaneBody.js` line 27  
**Category:** Physics Correctness

The method signature `stepAlongPlane(dt, netForceParallel)` ignores the `angleRad` argument passed by the caller. The 2D `state.velocity` is set as `(velAlongPlane, 0)` instead of being projected onto the plane's actual direction. This makes `state.velocity` incorrect for energy calculations.

**Fix:**

```js
stepAlongPlane(dt, netForceParallel, angleRad = 0) {
  if (dt <= 0) return;
  this.planeState.accAlongPlane = netForceParallel / this.params.mass;
  this.planeState.velAlongPlane += this.planeState.accAlongPlane * dt;
  this.planeState.posAlongPlane += this.planeState.velAlongPlane * dt;

  // Project onto 2D axes correctly
  const v = this.planeState.velAlongPlane;
  const a = this.planeState.accAlongPlane;
  this.state.velocity.set(v * Math.cos(angleRad), v * Math.sin(angleRad));
  this.state.acceleration.set(a * Math.cos(angleRad), a * Math.sin(angleRad));
  this.isMoving = Math.abs(v) > 0.001;
}
```

---

### BUG-005 — SimplePendulum.jsx: Angle in info panel computed from screen origin, not anchor

**File:** `simulations/SimplePendulum.jsx` ~line 95 (SimInfoMapper)  
**Category:** Physics Correctness — Wrong Display Values

```js
// BUGGY — measures angle from (0,0), not from the anchor pivot
const angle =
  (Math.atan2(bodyState.position.x, -bodyState.position.y) * 180) / Math.PI;
```

The anchor is at `(w/2 meters, h*0.2 meters)` in physics space — not at origin. This formula produces completely wrong angle values. The `PendulumBody.getAngle()` method is already correct and should be used instead.

**Fix:** Pass `body.getAngle()` directly into `SimInfoMapper` via the state object:

```js
// In sketch p.draw():
updateSimInfo(p, {
  ...
  angle: bodyRef.current.getAngle(), // already correct: atan2(dx,dy) from anchor
  ...
}, ...);

// In SimInfoMapper:
Angle: `${(state.angle * 180 / Math.PI).toFixed(1)}°`,
```

---

### BUG-006 — BallGravity.jsx: Reset uses hardcoded canvas dimensions (800×600)

**File:** `simulations/BallGravity.jsx` ~lines 200–215  
**Category:** Functional Bug

```js
const w = 800; // default width  ← ignores actual canvas size
const h = 600; // default height
bodyRef.current.reset({
  position: bodyRef.current.p.createVector(toMeters(w / 2), toMeters(h / 4)),
});
```

On any canvas other than 800×600 (every real device), the ball resets to the wrong position. Since `setResetVersion` triggers a full re-mount that calls `setupSimulation()` with correct `p.width/p.height`, this explicit reset is both wrong and redundant.

**Fix:** Remove the explicit position reset from `onReset`. Let `setupSimulation()` handle initial placement.

---

### BUG-007 — PhysicsBody.getPotentialEnergy(): Callers pass wrong reference height

**File:** `simulations/BouncingBall.jsx`, `BallGravity.jsx`  
**Category:** Physics Correctness — Wrong Energy Values

```js
// In BouncingBall.jsx and BallGravity.jsx — BUGGY:
potentialEnergy: bodyRef.current.getPotentialEnergy(gravity, toMeters(p.height)),
```

In Y-up coordinates, the ground is at `y = 0`. `toMeters(p.height)` is the **canvas top** in meters (a large positive number). So `PE = mass * g * (position.y - large_number)` is almost always large and negative — incorrect.

**Fix:**

```js
// Ground reference in Y-up space is y = 0 (or ball radius for center-of-mass)
potentialEnergy: bodyRef.current.getPotentialEnergy(gravity, 0),
```

---

### BUG-008 — Spring.connect(): Hooke's Law force direction inverted

**File:** `app/(core)/physics/Spring.ts` lines 44–55  
**Category:** Physics Correctness

```ts
const force = p5.Vector.sub(this.anchor, body.state.position); // points TOWARD anchor
const displacement = currentLength - this.restLength;
const springForceMag = -this.k * displacement; // negative when extended
force.normalize().mult(springForceMag); // flips to point AWAY from anchor
body.applyForce(force);
```

When the spring is extended (`displacement > 0`), `springForceMag` is negative, which flips the direction vector to point **away** from the anchor. An extended spring should pull the body toward the anchor.

**Fix:**

```ts
public connect(body: PhysicsBody): void {
  const toAnchor = p5.Vector.sub(this.anchor, body.state.position);
  const currentLength = toAnchor.mag();
  if (currentLength < 0.0001) return;
  const displacement = currentLength - this.restLength;
  // Positive displacement = extended = pull toward anchor (positive direction)
  toAnchor.normalize().mult(this.k * displacement); // no negative sign
  body.applyForce(toAnchor);
}
```

---

## 🟡 Medium Severity Bugs

---

### BUG-009 — InclinedPlane.jsx: Plane length uses magic constant instead of toMeters()

**File:** `simulations/InclinedPlane.jsx` ~line 65

```js
length: planeLength / 100, // Manual /100 instead of toMeters(planeLength)
```

If `SCALE` is ever changed from 100, this silently breaks. Use `toMeters()` consistently.

---

### BUG-010 — ParabolicMotion.jsx: Drag labeled "Linear" but computed as Quadratic

**File:** `simulations/ParabolicMotion.jsx`, `configs/ParabolicMotion.js`

The input field is labeled `"c_d - Linear drag (1/s):"` but the simulation calls `ForceCalculator.airResistance(speed, coeff, false)` where `false` means **quadratic** drag. Units of quadratic drag are kg/m, not 1/s. This mislabels the physical quantity and will confuse students.

**Fix:** Change the call to `true` for linear drag (matching the label), or fix the label to say "Quadratic drag (kg/m)".

---

### BUG-011 — SimplePendulum.jsx: Config not in configs/ directory (violates project convention)

**File:** `simulations/SimplePendulum.jsx`

`INITIAL_INPUTS`, `INPUT_FIELDS`, and `SimInfoMapper` are inline in the simulation file. Every other simulation uses `app/(core)/data/configs/[Name].js`. This inconsistency breaks the project's own architecture.

**Fix:** Create `app/(core)/data/configs/SimplePendulum.js` and move all three exports there.

---

### BUG-012 — ForceRenderer.drawInclinedPlaneForces(): Hardcoded gravity 9.81 ignores user setting

**File:** `app/(core)/physics/ForceRenderer.js` line 254

```js
this.drawWeight(p, x, y, forces.weight.magnitude / 9.81, 9.81, { label: "mg" });
```

`forces.weight.magnitude` is already in Newtons. Dividing by 9.81 to get kg, then multiplying back by 9.81 works numerically **only** when gravity = 9.81. With Moon gravity (1.62 m/s²) selected, this displays the wrong force magnitude.

**Fix:** Pass the actual gravity value from the caller context, not the hardcoded 9.81.

---

### BUG-013 — Time.js: simulationInstances Map is a memory leak

**File:** `app/(core)/constants/Time.js`

The module-level `Map` accumulates entries for every simulation instance ever visited. No simulation component calls `cleanupInstance()` on unmount. Over multiple SPA navigations, this grows indefinitely.

**Fix:** In `P5Wrapper.jsx`, call `cleanupInstance(p)` in the p5 instance cleanup/remove handler.

---

### BUG-014 — InclinedPlaneForces.calculate(): Kinetic friction uses wrong velocity component

**File:** `app/(core)/physics/ForceCalculator.js` ~line 198

```js
const vel = body.state.velocity?.x || body.state.vel || 0; // uses x component
friction = ForceCalculator.kineticFriction(normal, frictionKinetic, vel);
```

Should use `body.planeState.velAlongPlane` (the scalar velocity along the plane). `state.velocity.x` is only the horizontal projection, underestimating friction when the angle is non-zero.

**Fix:**

```js
const vel = body.planeState?.velAlongPlane ?? body.state.velocity?.x ?? 0;
```

---

### BUG-015 — collideBoundary() and integrate() in Utils.js: dead code

**File:** `app/(core)/constants/Utils.js`

Both functions are fully implemented but never called anywhere in the codebase. `collideBoundary()` is actually more physically accurate than the current `constrainToBounds()` (energy-conserving bounces). This dead code adds confusion about which system is canonical.

**Fix:** Either remove both unused functions, or migrate `PhysicsBody.constrainToBounds()` to use `collideBoundary()` for better bounce physics.

---

### BUG-016 — BallAcceleration.jsx: "Acceleration" vector label shows units in Newtons

**File:** `simulations/BallAcceleration.jsx`

The vector renderer's `drawLabel` appends "(N)" to all magnitudes. The acceleration vector is correctly computed as `F/m = a`, but the label reads "Acceleration (X.XN)" — showing acceleration in Newtons, which is physically wrong and confusing for students.

**Fix:** Pass a `unitLabel: "m/s²"` option to suppress the default "N" suffix for acceleration vectors, or create a dedicated `drawAcceleration()` method.

---

### BUG-017 — VectorsOperations.jsx: Addition visualization runs without coordinate translation

**File:** `simulations/VectorsOperations.jsx` case `"+"`

The `+` operation draws from absolute screen coordinates (origin = top-left corner) without `p.translate(center)`, while operations `"x"` and `"normalize"` correctly call `p.translate(p.width/2, p.height/2)`. Vector A (`center.copy()`) represents the half-diagonal of the canvas rather than a meaningful fixed vector from origin. This is visually inconsistent with the other operations.

---

## 🟢 Low Priority Issues

---

### BUG-018 — package.json: engines.node uses exact version instead of range

```json
"engines": { "node": "24.8.0" }  // should be ">=24.0.0"
```

### BUG-019 — Config.js: Mars gravity label shows 3.71 m/s² (actual: 3.72 m/s²)

```js
{ value: 0.379 * earthG, label: "Mars (3.71 m/s²)" }
// 0.379 * 9.81 = 3.719 ≈ 3.72, label should read "Mars (3.72 m/s²)"
```

### BUG-020 — VectorsOperations.jsx: "dot" and "cross" case renderers are identical

Both cases draw the exact same three lines. The cross product should show a shaded parallelogram (area = |A×B|), the dot product should show a projection onto A.

### BUG-021 — test.jsx: Collision separation check has inverted sign condition

```js
if (velAlongNormal < 0) continue; // "don't resolve if separating"
// relVel · normal > 0 means separating → should be: if (velAlongNormal > 0) continue
```

### BUG-022 — BallGravity.jsx: isBlowing state set but wind-overlay CSS class likely missing

`setIsBlowing(true/false)` updates state and toggles class `wind-overlay blowing`, but no CSS for this class was found in the uploaded styles. The wind animation has no visual effect.

### BUG-023 — DragController.js: Same file-concatenation artifact as BUG-001

The `DragController.js` file content contains appended source from other files (similar to BUG-001). Each physics module file should contain only its own source.

---

## Priority Fix Order

| #   | Bug              | File                                 | Effort |
| --- | ---------------- | ------------------------------------ | ------ |
| 1   | BUG-001, BUG-023 | Separate concatenated files          | 30 min |
| 2   | BUG-003          | Restore getTimeScale()               | 5 min  |
| 3   | BUG-008          | Fix Spring.connect() sign            | 15 min |
| 4   | BUG-002          | Fix weight vector direction          | 1 hr   |
| 5   | BUG-007          | Fix PE reference height              | 30 min |
| 6   | BUG-004          | Fix stepAlongPlane 2D projection     | 1 hr   |
| 7   | BUG-006          | Remove hardcoded reset dimensions    | 15 min |
| 8   | BUG-005          | Fix pendulum angle display           | 1 hr   |
| 9   | BUG-012          | Fix gravity hardcoding in renderer   | 30 min |
| 10  | BUG-014          | Fix kinetic friction velocity source | 15 min |
| 11  | BUG-011          | Move SimplePendulum config           | 30 min |
| 12  | BUG-021          | Fix collision sign                   | 5 min  |
| 13  | BUG-013          | Add cleanupInstance on unmount       | 30 min |
| 14  | BUG-010          | Fix drag label unit                  | 5 min  |
| 15  | BUG-015          | Remove/migrate dead utils            | 15 min |
| 16  | All others       | Remaining low-priority               | ~2 hr  |

**Estimated total fix time: ~10 hours**

---

## Architecture Recommendations

1. **Create `PHYSICS_CONVENTIONS.md`** — document the Y-up coordinate system, meters/pixels boundary, and which functions perform conversion. This prevents the whole class of coordinate bugs.

2. **Standardize SimInfoMapper contract** — all mappers should receive the same typed `{ pos, vel, mass }` state object. Currently some pass raw `position`/`velocity` and some pass `pos`/`vel`.

3. **Migrate constrainToBounds → collideBoundary** — the `collideBoundary()` function already implements energy-conserving bounces. Using it in `PhysicsBody` would improve bounce realism in all simulations.

4. **Add `drawAcceleration()` to ForceRenderer** — distinct from `drawVector`, so labels automatically show correct units (m/s² vs N).

5. **Extract PendulumBody to its own file** — currently defined inline in `SimplePendulum.jsx`. It's a proper physics class and should live in `physics/PendulumBody.js`.

---

_Report generated by static analysis of repository snapshot `physicshub.github.io-main`._
