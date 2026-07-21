/**
 * Forces — elements that accumulate newtons on bodies during the force phase.
 *
 * Each factory returns a plain element object, so they are combined by simply
 * adding several to the same World. Every numeric option accepts a getter
 * (see utils/params.js) to stay in sync with the UI inputs.
 *
 * Options shared by all of them:
 *   bodies  - Body, Body[] or a predicate. Defaults to every body in the world.
 *   label   - Name under which the force is recorded for visualisation.
 *   color   - Colour used by the force renderer.
 *   enabled - Set false (or a getter) to switch the force off without removing it.
 */

import { resolve, resolveNumber } from "../utils/params.js";
import { FORCE_COLORS } from "../render/colors.js";

/**
 * Normalise the `bodies` option into a selector function.
 * @param {Body|Body[]|((body: Body) => boolean)|undefined} target
 */
function selector(target) {
  if (!target) return () => true;
  if (typeof target === "function") return target;
  const list = Array.isArray(target) ? target : [target];
  return (body) => list.includes(body);
}

/** Shared plumbing: iterate the selected bodies, honouring `enabled`. */
function forEachBody(options, ctx, callback) {
  if (resolve(options.enabled, ctx) === false) return;
  const matches = options._selector;
  for (const body of ctx.world.bodies) {
    if (body.params.fixed || !matches(body)) continue;
    callback(body);
  }
}

/**
 * Build a force element from a per-body force function.
 * @param {string} defaultLabel
 * @param {object} options
 * @param {(body: Body, ctx: object, options: object) => {x: number, y: number}|null} compute
 */
function makeForce(defaultLabel, options, compute) {
  const element = {
    type: "force",
    label: options.label ?? defaultLabel,
    color: options.color ?? FORCE_COLORS[defaultLabel] ?? FORCE_COLORS.net,
    options: { ...options, _selector: selector(options.bodies) },

    applyForces(ctx) {
      forEachBody(this.options, ctx, (body) => {
        const force = compute(body, ctx, this.options);
        if (force) body.applyForce(force, this.label);
      });
    },

    /** The force currently acting on `body`, for the force renderer. */
    vector(body, ctx) {
      if (resolve(this.options.enabled, ctx) === false) return null;
      if (body.params.fixed || !this.options._selector(body)) return null;
      return compute(body, ctx, this.options);
    },
  };
  return element;
}

// -----------------------------------------------------------------------------
// Fields
// -----------------------------------------------------------------------------

/**
 * Uniform gravity: F = m·g, pointing down (−Y).
 * @param {object} [options]
 * @param {number|Function} [options.g=9.81] - Magnitude, positive.
 */
export const Gravity = (options = {}) =>
  makeForce("weight", options, (body, ctx, o) => ({
    x: 0,
    y: -body.params.mass * resolveNumber(o.g, 9.81, ctx),
  }));

/**
 * A constant force, e.g. wind or a thruster.
 * @param {object} options
 * @param {number|Function} [options.x=0] - Newtons, or m/s² when `perMass` is true.
 * @param {number|Function} [options.y=0]
 * @param {boolean} [options.perMass=false] - Scale by the body's mass (an acceleration, not a force).
 */
export const Constant = (options = {}) =>
  makeForce("applied", options, (body, ctx, o) => {
    const scale = o.perMass ? body.params.mass : 1;
    return {
      x: resolveNumber(o.x, 0, ctx) * scale,
      y: resolveNumber(o.y, 0, ctx) * scale,
    };
  });

/** Horizontal wind. Thin wrapper over Constant with the conventional label. */
export const Wind = (options = {}) =>
  makeForce("wind", options, (body, ctx, o) => {
    const strength = resolveNumber(o.strength ?? o.x, 0, ctx);
    if (strength === 0) return null;
    return { x: strength * (o.perMass ? body.params.mass : 1), y: 0 };
  });

/**
 * Fluid drag opposing velocity.
 * @param {object} options
 * @param {number|Function} options.c - Drag coefficient.
 * @param {boolean} [options.linear=false] - F = −c·v instead of F = −c·v²·v̂.
 */
export const Drag = (options = {}) =>
  makeForce("drag", options, (body, ctx, o) => {
    const c = resolveNumber(o.c, 0, ctx);
    if (c <= 0) return null;
    const speed = body.speed;
    if (speed < 1e-4) return null;
    const magnitude = o.linear ? c * speed : c * speed * speed;
    return {
      x: (-body.state.velocity.x / speed) * magnitude,
      y: (-body.state.velocity.y / speed) * magnitude,
    };
  });

/**
 * Archimedes' buoyancy for bodies below `surfaceY`: F = ρ·V·g, upward.
 * @param {object} options
 * @param {number|Function} options.density - Fluid density, kg/m³.
 * @param {number|Function} [options.surfaceY=Infinity] - Fluid surface height, metres.
 * @param {number|Function} [options.g=9.81]
 */
export const Buoyancy = (options = {}) =>
  makeForce("buoyancy", options, (body, ctx, o) => {
    const surfaceY = resolveNumber(o.surfaceY, Infinity, ctx);
    if (body.state.position.y - body.radius >= surfaceY) return null;

    const density = resolveNumber(o.density, 1000, ctx);
    const g = resolveNumber(o.g, 9.81, ctx);
    // Circles are treated as spheres, squares as cubes, both per unit depth.
    const volume =
      body.params.shape === "circle"
        ? Math.PI * body.radius ** 2
        : body.params.size ** 2;

    // Partial submersion: fraction of the body under the surface.
    const submerged = Math.min(
      1,
      Math.max(
        0,
        (surfaceY - (body.state.position.y - body.radius)) / body.params.size
      )
    );

    return { x: 0, y: density * volume * g * submerged };
  });

/**
 * Newtonian attraction between every pair of bodies: F = G·m₁·m₂ / r².
 * This is a global force — it needs the whole body list, not one body.
 *
 * @param {object} [options]
 * @param {number|Function} [options.G=1] - Gravitational constant, in simulation units.
 * @param {number|Function} [options.softening=0.1] - Minimum separation, prevents the r → 0 singularity.
 */
export const MutualGravity = (options = {}) => ({
  type: "force",
  label: options.label ?? "gravity",
  color: options.color ?? FORCE_COLORS.weight,
  options,

  applyForces(ctx) {
    if (resolve(options.enabled, ctx) === false) return;
    const G = resolveNumber(options.G, 1, ctx);
    const softening = resolveNumber(options.softening, 0.1, ctx);
    const bodies = options.bodies
      ? ctx.world.bodies.filter(selector(options.bodies))
      : ctx.world.bodies;

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.state.position.x - a.state.position.x;
        const dy = b.state.position.y - a.state.position.y;
        const distanceSq = dx * dx + dy * dy + softening * softening;
        const distance = Math.sqrt(distanceSq);

        const magnitude = (G * a.params.mass * b.params.mass) / distanceSq;
        const fx = (dx / distance) * magnitude;
        const fy = (dy / distance) * magnitude;

        a.applyForce({ x: fx, y: fy }, this.label);
        b.applyForce({ x: -fx, y: -fy }, this.label);
      }
    }
  },
});

/**
 * Attraction toward a fixed point or a body.
 *
 * @param {object} options
 * @param {Body|{x: number, y: number}|Function} options.center
 * @param {number|Function} [options.strength=1] - G·M for inverse-square, or the
 *   acceleration in m/s² when `falloff` is "constant".
 * @param {"inverseSquare"|"constant"|"linear"} [options.falloff="inverseSquare"] -
 *   "inverseSquare" is Newtonian gravity; "constant" pulls with the same
 *   acceleration at any distance; "linear" grows with distance, like a spring
 *   anchored at the centre.
 * @param {number|Function} [options.softening=0.1] - Avoids the r → 0 singularity.
 */
export const PointAttraction = (options = {}) =>
  makeForce("gravity", options, (body, ctx, o) => {
    const rawCenter = resolve(o.center, ctx);
    const center = rawCenter?.state?.position ?? rawCenter;
    if (!center || center === body.state.position) return null;

    const dx = center.x - body.state.position.x;
    const dy = center.y - body.state.position.y;
    const softening = resolveNumber(o.softening, 0.1, ctx);
    const distanceSq = dx * dx + dy * dy + softening * softening;
    const distance = Math.sqrt(distanceSq);
    if (distance < 1e-6) return null;

    const strength = resolveNumber(o.strength, 1, ctx);
    let magnitude;
    switch (o.falloff ?? "inverseSquare") {
      case "constant":
        magnitude = strength * body.params.mass;
        break;
      case "linear":
        magnitude = strength * body.params.mass * distance;
        break;
      default:
        magnitude = (strength * body.params.mass) / distanceSq;
    }

    return { x: (dx / distance) * magnitude, y: (dy / distance) * magnitude };
  });

/**
 * Velocity damping: F = −c·v. Distinct from Drag in that it models internal
 * losses (a pivot's friction, a dashpot) rather than a surrounding fluid.
 *
 * @param {object} options
 * @param {number|Function} options.c - Dashpot coefficient in N·s/m, or a
 *   damping rate in s⁻¹ when `perMass` is set.
 * @param {boolean} [options.perMass=false] - Scale by mass, making `c` a damping
 *   *acceleration* per unit velocity. This is the convention behind the textbook
 *   damped pendulum, where the equation of motion is α = −(g/L)sin θ − c·ω
 *   independently of the bob's mass.
 */
export const Damping = (options = {}) =>
  makeForce("damping", options, (body, ctx, o) => {
    const c = resolveNumber(o.c, 0, ctx);
    if (c <= 0) return null;
    const scale = o.perMass ? body.params.mass : 1;
    return {
      x: -c * body.state.velocity.x * scale,
      y: -c * body.state.velocity.y * scale,
    };
  });

/**
 * Escape hatch for a force with no general formula. The callback receives the
 * body and the step context and returns newtons (or null).
 * @param {(body: Body, ctx: object) => {x: number, y: number}|null} compute
 */
export const Custom = (compute, options = {}) =>
  makeForce(options.label ?? "applied", options, (body, ctx) =>
    compute(body, ctx)
  );

export default {
  Gravity,
  Constant,
  Wind,
  Drag,
  Buoyancy,
  MutualGravity,
  PointAttraction,
  Damping,
  Custom,
};
