/** Ideal light string over a massless, frictionless pulley. */
export function cartPulleyModel(cartMass, hangingMass, gravity) {
  const M = Math.max(0.01, Number(cartMass) || 0.01);
  const m = Math.max(0.01, Number(hangingMass) || 0.01);
  const g = Math.max(0, Number(gravity) || 0);
  // T = M a and m g - T = m a; the two bodies share a.
  const acceleration = (m * g) / (M + m);
  return { acceleration, tension: M * acceleration, weight: m * g };
}

/** Forces and a bounded travel stop for the two constrained bodies. */
export function cartPulley(cart, hanger, inputs, start, travel) {
  let stopped = false;
  return {
    get stopped() {
      return stopped;
    },
    applyForces() {
      if (stopped) return;
      const { tension } = cartPulleyModel(
        inputs.cartMass,
        inputs.hangingMass,
        inputs.gravity
      );
      const g = Math.max(0, Number(inputs.gravity) || 0);
      cart.applyForce({ x: 0, y: -cart.params.mass * g }, "weight");
      cart.applyForce({ x: 0, y: cart.params.mass * g }, "normal");
      cart.applyForce({ x: tension, y: 0 }, "tension");
      hanger.applyForce({ x: 0, y: -hanger.params.mass * g }, "weight");
      hanger.applyForce({ x: 0, y: tension }, "tension");
    },
    solve() {
      const distance = cart.state.position.x - start.cartX;
      if (distance >= travel) stopped = true;
      if (stopped) {
        cart.state.position.x = start.cartX + travel;
        hanger.state.position.y = start.hangerY - travel;
        cart.state.velocity.set(0, 0);
        hanger.state.velocity.set(0, 0);
        cart.state.acceleration.set(0, 0);
        hanger.state.acceleration.set(0, 0);
      }
    },
  };
}
