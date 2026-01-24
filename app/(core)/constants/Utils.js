import { SCALE } from "./Config.js";

// Conversion functions
export const toPixels = (meters) => meters * SCALE;
export const toMeters = (pixels) => pixels / SCALE;

// Accelerazione: m/s² → px/frame²
export const accelSI_to_pxSec = (a_SI) => a_SI * SCALE; // a_SI * SCALE * Math.pow(SECONDS_PER_FRAME(p), 2);
export const accelPxSec_to_SI = (a_px) => a_px / SCALE; //a_px / SCALE * Math.pow(SECONDS_PER_FRAME(p), 2);

// Costante elastica: N/m → N/pixel
export const springK_SI_to_px = (k_SI) => k_SI / SCALE;
export const springK_px_to_SI = (k_px) => k_px * SCALE;

/**
 * Velocity verlet integration
 */
export function integrate(pos, vel, acc, dt) {
  const newPos = pos.copy();
  const newVel = vel.copy();

  const velDt = vel.copy().mult(dt);
  const accDt2 = acc.copy().mult(0.5 * dt * dt);
  newPos.add(velDt).add(accDt2);

  const accDt = acc.copy().mult(dt);
  newVel.add(accDt);

  return { pos: newPos, vel: newVel };
}

/**
 * Collision with Energy Conservation.
 * bounds: { w, h }
 * radius: world units
 * restitution: 0..1
 * acc: current acceleration
 */
export function collideBoundary(pos, vel, bounds, radius, restitution, acc) {
  const newPos = pos.copy();
  const newVel = vel.copy();
  const gravity = acc ? acc.y : 0;

  const ballLeftEdge = newPos.x - radius;
  const ballRightEdge = newPos.x + radius;
  const hitLeftWall = ballLeftEdge < 0;
  const hitRightWall = ballRightEdge > bounds.w;
  if (hitLeftWall) {
    const collisionPenetration = 0 - ballLeftEdge;
    newPos.x = radius + collisionPenetration;
    newVel.x = Math.abs(newVel.x) * restitution;
  } else if (hitRightWall) {
    const collisionPenetration = ballRightEdge - bounds.w;
    newPos.x = bounds.w - radius - collisionPenetration;
    newVel.x = -Math.abs(newVel.x) * restitution;
  }

  const ballTopEdge = newPos.y - radius;
  const ballBottomEdge = newPos.y + radius;
  const hitCeiling = ballTopEdge < 0;
  const hitFloor = ballBottomEdge > bounds.h;
  if (hitCeiling) {
    const collisionPenetration = 0 - ballTopEdge;
    newPos.y = radius + collisionPenetration;
    newVel.y = Math.abs(newVel.y) * restitution;
  } else if (hitFloor) {
    const collisionPenetration = ballBottomEdge - bounds.h;
    const velSquared = newVel.y ** 2;
    const liftDistance = 2 * collisionPenetration;
    const work = gravity > 0 ? 2 * gravity * liftDistance : 0;

    if (velSquared > work) {
      // mirror
      newPos.y = bounds.h - radius - collisionPenetration;
      const vNew = Math.sqrt(velSquared - work);
      newVel.y = -vNew * restitution;
    } else {
      // clamp
      newPos.y = bounds.h - radius;
      newVel.y = 0;
    }
  }

  return { pos: newPos, vel: newVel };
}

/**
 * Converte coordinate in base alla scala e dimensioni canvas
 */
export function invertYAxis(h, y) {
  const scaledH = h / SCALE;
  if (h != null && y != null) {
    return scaledH - y;
  }
  return undefined;
}

/* 
// Aerodynamic drag force (quadratic)
export function dragForce(vel, rho, Cd, A) {
  const speed = Math.hypot(vel.x, vel.y);
  if (speed === 0) return { x: 0, y: 0 };
  const magnitude = 0.5 * rho * Cd * A * speed * speed;
  return {
    x: -magnitude * (vel.x / speed),
    y: -magnitude * (vel.y / speed),
  };
}
*/
