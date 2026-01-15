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
 * Semi-implicit Euler (Euler-Cromer) integration.
 * Conserves energy better than explicit Euler.
 */
export function integrate(pos, vel, acc, dt) {
  const newVel = vel.copy().add(acc.copy().mult(dt));
  const newPos = pos.copy().add(newVel.copy().mult(dt));
  return { pos: newPos, vel: newVel };
}

/**
 * Collision with canvas boundaries in world units.
 * bounds: { w, h }
 * radius: world units
 * restitution: 0..1
 */
export function collideBoundary(pos, vel, bounds, radius, restitution) {
  const newPos = pos.copy();
  const newVel = vel.copy();

  // X axis
  if (newPos.x - radius < 0) {
    newPos.x = radius;
    newVel.x = Math.abs(newVel.x) * restitution;
  } else if (newPos.x + radius > bounds.w) {
    newPos.x = bounds.w - radius;
    newVel.x = -Math.abs(newVel.x) * restitution;
  }

  // Y axis
  if (newPos.y - radius < 0) {
    newPos.y = radius;
    newVel.y = Math.abs(newVel.y) * restitution;
  } else if (newPos.y + radius > bounds.h) {
    newPos.y = bounds.h - radius;
    newVel.y = -Math.abs(newVel.y) * restitution;
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
