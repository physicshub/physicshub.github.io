/**
 * Integrators — how accumulated forces become motion.
 *
 * All of them consume `body.state.force` (newtons) and clear it, so an element
 * that wants to influence a body only ever has to call `body.applyForce()`.
 */

/**
 * Semi-implicit (symplectic) Euler. The default: stable for oscillators and
 * cheap, unlike explicit Euler which pumps energy into springs and pendulums.
 */
export function semiImplicitEuler(body, dt) {
  const inverseMass = body.inverseMass;
  if (inverseMass === 0) {
    body.state.force.set(0, 0);
    return;
  }

  const { state } = body;
  state.acceleration.set(
    state.force.x * inverseMass,
    state.force.y * inverseMass
  );

  state.previousPosition.set(state.position.x, state.position.y);

  // v ← v + a·dt, then x ← x + v·dt (velocity first: this is what makes it symplectic)
  state.velocity.x += state.acceleration.x * dt;
  state.velocity.y += state.acceleration.y * dt;
  state.position.x += state.velocity.x * dt;
  state.position.y += state.velocity.y * dt;

  state.angularVelocity += state.torque * inverseMass * dt;
  state.rotation += state.angularVelocity * dt;
  state.torque = 0;

  // Only the accumulator is cleared: `appliedForces` survives the step so the
  // force renderer can draw exactly what was integrated.
  state.force.set(0, 0);
}

/**
 * Position Verlet. More faithful over long runs and naturally compatible with
 * positional constraints, at the cost of a velocity that is one step behind.
 */
export function verlet(body, dt) {
  const inverseMass = body.inverseMass;
  if (inverseMass === 0) {
    body.state.force.set(0, 0);
    return;
  }

  const { state } = body;
  state.acceleration.set(
    state.force.x * inverseMass,
    state.force.y * inverseMass
  );

  const previousX = state.position.x;
  const previousY = state.position.y;

  // x(t+dt) = 2x(t) − x(t−dt) + a·dt²
  state.position.x +=
    previousX - state.previousPosition.x + state.acceleration.x * dt * dt;
  state.position.y +=
    previousY - state.previousPosition.y + state.acceleration.y * dt * dt;

  state.previousPosition.set(previousX, previousY);
  state.velocity.set(
    (state.position.x - previousX) / dt,
    (state.position.y - previousY) / dt
  );

  state.force.set(0, 0);
}

/**
 * Classical RK4 over an arbitrary first-order ODE system.
 *
 * Used by simulations whose state is not a set of independent point masses
 * (double pendulum: [θ₁, θ₂, ω₁, ω₂]), where per-body integration does not apply.
 *
 * @param {number[]} y - State vector.
 * @param {(y: number[]) => number[]} derivative - dy/dt.
 * @param {number} dt
 * @returns {number[]} New state vector.
 */
export function rk4(y, derivative, dt) {
  const add = (a, b, scale) => a.map((v, i) => v + b[i] * scale);

  const k1 = derivative(y);
  const k2 = derivative(add(y, k1, dt / 2));
  const k3 = derivative(add(y, k2, dt / 2));
  const k4 = derivative(add(y, k3, dt));

  return y.map(
    (v, i) => v + ((k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt) / 6
  );
}

export const INTEGRATORS = { semiImplicitEuler, verlet };

export default INTEGRATORS;
