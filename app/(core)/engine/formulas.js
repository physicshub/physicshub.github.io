/**
 * Formulas — the textbook expressions, as pure functions.
 *
 * The engine's force elements are built on these, and simulations reuse them
 * directly for readouts and predicted trajectories. Nothing here touches a Body,
 * a World or p5: it is all numbers in, numbers out.
 *
 * Sign convention matches the engine: metres, seconds, newtons, Y-up.
 */

// -----------------------------------------------------------------------------
// Forces
// -----------------------------------------------------------------------------

/** Weight magnitude: F = mg. */
export const weight = (mass, g = 9.81) => mass * g;

/** Normal force on a slope: N = mg·cos θ, minus any extra perpendicular load. */
export const normalForce = (mass, g, angleRad, perpendicularLoad = 0) =>
  Math.max(0, mass * g * Math.cos(angleRad) - perpendicularLoad);

/**
 * Static friction. Returns the balancing force, or null when the applied force
 * exceeds μₛ·N and the body breaks away into kinetic friction.
 */
export function staticFriction(normal, mu, appliedForce) {
  const max = mu * normal;
  return Math.abs(appliedForce) <= max ? -appliedForce : null;
}

/** Kinetic friction: F = −μₖ·N·sgn(v). */
export function kineticFriction(normal, mu, velocity) {
  if (Math.abs(velocity) < 1e-3) return 0;
  return -Math.sign(velocity) * mu * normal;
}

/** Picks static or kinetic friction based on whether the body is moving. */
export function friction(
  normal,
  muStatic,
  muKinetic,
  velocity,
  appliedForce = 0
) {
  if (Math.abs(velocity) > 1e-3) {
    return kineticFriction(normal, muKinetic, velocity);
  }
  const stuck = staticFriction(normal, muStatic, appliedForce);
  return stuck ?? -Math.sign(appliedForce) * muKinetic * normal;
}

/** Fluid drag: F = −c·v² (or −c·v when `linear`). */
export function airResistance(velocity, c, linear = false) {
  const speed = Math.abs(velocity);
  if (speed < 1e-3) return 0;
  return -Math.sign(velocity) * (linear ? c * speed : c * speed * speed);
}

/** Hooke's law: F = −kx. */
export const springForce = (displacement, k) => -k * displacement;

/** Viscous damping: F = −cv. */
export const dampingForce = (velocity, c) => -c * velocity;

/** Rope tension for a mass accelerating at `a` (positive upward). */
export const tension = (mass, g, a = 0) => mass * (g + a);

/** Centripetal force: F = mv²/r. */
export const centripetal = (mass, speed, radius) =>
  (mass * speed * speed) / radius;

/** Archimedes: F = ρVg. */
export const buoyancy = (fluidDensity, volume, g = 9.81) =>
  fluidDensity * volume * g;

// -----------------------------------------------------------------------------
// Vectors & components
// -----------------------------------------------------------------------------

/** Split a magnitude into x/y at `angleRad` (0 = right, π/2 = up). */
export const resolveForce = (magnitude, angleRad) => ({
  x: magnitude * Math.cos(angleRad),
  y: magnitude * Math.sin(angleRad),
});

/** Weight components on an incline: down-slope and into the surface. */
export const inclineComponents = (weightMagnitude, angleRad) => ({
  parallel: weightMagnitude * Math.sin(angleRad),
  perpendicular: weightMagnitude * Math.cos(angleRad),
});

/** Vector sum of force-like objects. */
export const netForce = (forces) =>
  forces.reduce(
    (sum, f) => ({ x: sum.x + (f?.x ?? 0), y: sum.y + (f?.y ?? 0) }),
    { x: 0, y: 0 }
  );

/** Work: W = F · d. */
export const work = (force, displacement) =>
  force.x * displacement.x + force.y * displacement.y;

/** Power: P = F · v. */
export const power = (force, velocity) =>
  force.x * velocity.x + force.y * velocity.y;

// -----------------------------------------------------------------------------
// Energy
// -----------------------------------------------------------------------------

export const kineticEnergy = (mass, speed) => 0.5 * mass * speed * speed;
export const potentialEnergy = (mass, g, height) => mass * g * height;
export const elasticEnergy = (k, displacement) =>
  0.5 * k * displacement * displacement;

// -----------------------------------------------------------------------------
// Motion
// -----------------------------------------------------------------------------

/** Small-oscillation pendulum period: T = 2π√(L/g). */
export const pendulumPeriod = (length, g = 9.81) =>
  2 * Math.PI * Math.sqrt(length / g);

/** Mass–spring period: T = 2π√(m/k). */
export const springPeriod = (mass, k) => 2 * Math.PI * Math.sqrt(mass / k);

/**
 * Drag-free projectile analytics for a launch of speed v₀ at `angleDeg`
 * from height h₀.
 */
export function projectile({ v0, angleDeg, h0 = 0, g = 9.81 }) {
  const angle = (angleDeg * Math.PI) / 180;
  const vx0 = v0 * Math.cos(angle);
  const vy0 = v0 * Math.sin(angle);

  const apex = h0 + (vy0 * vy0) / (2 * g);
  const timeToApex = vy0 / g;
  const flightTime =
    g > 0 ? (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * h0)) / g : Infinity;
  const range = vx0 * flightTime;

  return { angle, vx0, vy0, apex, timeToApex, flightTime, range };
}

/** Sample a drag-free projectile path as physics-space points. */
export function projectilePath(start, { vx0, vy0, flightTime }, g, steps = 96) {
  if (!Number.isFinite(flightTime) || flightTime <= 0) return [];
  const dt = flightTime / steps;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = dt * i;
    return {
      x: start.x + vx0 * t,
      y: start.y + vy0 * t - 0.5 * g * t * t,
    };
  });
}

export default {
  weight,
  normalForce,
  staticFriction,
  kineticFriction,
  friction,
  airResistance,
  springForce,
  dampingForce,
  tension,
  centripetal,
  buoyancy,
  resolveForce,
  inclineComponents,
  netForce,
  work,
  power,
  kineticEnergy,
  potentialEnergy,
  elasticEnergy,
  pendulumPeriod,
  springPeriod,
  projectile,
  projectilePath,
};
