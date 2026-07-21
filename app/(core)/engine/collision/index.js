/**
 * Collisions — body-against-body contact resolution.
 *
 * Kept separate from the wall handling in constraints/Bounds so a simulation can
 * have one without the other (projectiles need walls but no mutual contact;
 * a Newton's cradle needs contact but no walls).
 */

import { resolve, resolveNumber } from "../utils/params.js";

/**
 * Impulse for a 1-D elastic-to-inelastic collision along the contact normal.
 * @param {number} restitution 0 = perfectly inelastic, 1 = perfectly elastic.
 * @returns {number} Impulse magnitude, N·s.
 */
export function contactImpulse(
  relativeNormalVelocity,
  inverseMassSum,
  restitution
) {
  if (inverseMassSum === 0) return 0;
  return (-(1 + restitution) * relativeNormalVelocity) / inverseMassSum;
}

/**
 * Closed-form velocities after a 1-D collision, exact for any restitution.
 * Used by simulations that want the textbook result rather than an impulse
 * solver (elastic collision demos, the π-digits block collisions).
 */
export function collide1D(m1, v1, m2, v2, restitution = 1) {
  const total = m1 + m2;
  const momentum = m1 * v1 + m2 * v2;
  const approach = v1 - v2;
  return {
    v1: (momentum - m2 * restitution * approach) / total,
    v2: (momentum + m1 * restitution * approach) / total,
  };
}

/**
 * Resolve contacts between circular bodies: positional de-overlap plus a
 * normal impulse. Squares are treated as their bounding circle.
 *
 * Emits `"collision"` with `{ a, b, impulse, speed }`.
 *
 * @param {object} [options]
 * @param {Body[]} [options.bodies] - Defaults to every body.
 * @param {number|Function} [options.restitution] - Overrides the pair's own values.
 */
export const Collisions = (options = {}) => ({
  type: "collider",
  options,

  resolveCollisions(ctx) {
    if (resolve(options.enabled, ctx) === false) return;
    const bodies = options.bodies
      ? [].concat(options.bodies)
      : ctx.world.bodies;

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        if (a.inverseMass === 0 && b.inverseMass === 0) continue;

        const dx = b.state.position.x - a.state.position.x;
        const dy = b.state.position.y - a.state.position.y;
        const distance = Math.hypot(dx, dy);
        const minDistance = a.radius + b.radius;
        if (distance >= minDistance || distance < 1e-9) continue;

        const nx = dx / distance;
        const ny = dy / distance;

        // Separate along the normal, weighted by inverse mass.
        const inverseMassSum = a.inverseMass + b.inverseMass;
        if (inverseMassSum === 0) continue;
        const penetration = minDistance - distance;
        a.state.position.x -=
          nx * penetration * (a.inverseMass / inverseMassSum);
        a.state.position.y -=
          ny * penetration * (a.inverseMass / inverseMassSum);
        b.state.position.x +=
          nx * penetration * (b.inverseMass / inverseMassSum);
        b.state.position.y +=
          ny * penetration * (b.inverseMass / inverseMassSum);

        const relativeNormal =
          (b.state.velocity.x - a.state.velocity.x) * nx +
          (b.state.velocity.y - a.state.velocity.y) * ny;
        if (relativeNormal > 0) continue; // already separating

        const restitution = resolveNumber(
          options.restitution,
          Math.min(a.params.restitution, b.params.restitution),
          ctx
        );
        const impulse = contactImpulse(
          relativeNormal,
          inverseMassSum,
          restitution
        );

        a.applyImpulse({ x: -nx * impulse, y: -ny * impulse });
        b.applyImpulse({ x: nx * impulse, y: ny * impulse });

        ctx.world.emit("collision", {
          a,
          b,
          impulse,
          speed: Math.abs(relativeNormal),
        });
      }
    }
  },
});

export default { Collisions, collide1D, contactImpulse };
