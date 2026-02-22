import { SCALE } from "./Config.js";

// Store canvas height for coordinate conversion
let CANVAS_HEIGHT = 600; // Default, will be updated

export function setCanvasHeight(height) {
  CANVAS_HEIGHT = height;
}

export function getCanvasHeight() {
  return CANVAS_HEIGHT;
}

/**
 * Convert physics Y (bottom=0, up=positive) to screen Y (top=0, down=positive)
 */
export const physicsYToScreenY = (physicsY) => {
  //const physicsHeightMeters = CANVAS_HEIGHT / SCALE;
  return CANVAS_HEIGHT - physicsY * SCALE;
};

/**
 * Convert screen Y (top=0, down=positive) to physics Y (bottom=0, up=positive)
 */
export const screenYToPhysicsY = (screenY) => {
  //const physicsHeightMeters = CANVAS_HEIGHT / SCALE;
  return (CANVAS_HEIGHT - screenY) / SCALE;
};

/**
 * Convert meters to pixels (no Y-axis change, just scale)
 */
export const toPixels = (meters) => meters * SCALE;

/**
 * Convert pixels to meters (no Y-axis change, just scale)
 */
export const toMeters = (pixels) => pixels / SCALE;

/**
 * Convert physics position (Y-up) to screen position (Y-down)
 */
export const physicsToScreen = (physicsPos, p) => {
  return p.createVector(
    toPixels(physicsPos.x),
    physicsYToScreenY(physicsPos.y)
  );
};

/**
 * Convert screen position (Y-down) to physics position (Y-up)
 */
export const screenToPhysics = (screenPos, p) => {
  return p.createVector(toMeters(screenPos.x), screenYToPhysicsY(screenPos.y));
};

// Accelerazione: m/s² → px/frame²
export const accelSI_to_pxSec = (a_SI) => a_SI * SCALE;
export const accelPxSec_to_SI = (a_px) => a_px / SCALE;

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
 * bounds: { w, h } in meters
 * radius: meters
 * restitution: 0..1
 * acc: current acceleration
 */
export function collideBoundary(pos, vel, bounds, radius, restitution, acc) {
  const newPos = pos.copy();
  const newVel = vel.copy();
  const gravity = acc ? Math.abs(acc.y) : 0; // Gravity magnitude

  // X bounds (left/right walls)
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

  // Y bounds (floor/ceiling) - Physics coords (Y-up)
  const ballTopEdge = newPos.y + radius; // Top of ball
  const ballBottomEdge = newPos.y - radius; // Bottom of ball
  const hitCeiling = ballTopEdge > bounds.h; // Top boundary
  const hitFloor = ballBottomEdge < 0; // Bottom boundary (floor)

  if (hitCeiling) {
    const collisionPenetration = ballTopEdge - bounds.h;
    newPos.y = bounds.h - radius - collisionPenetration;
    newVel.y = -Math.abs(newVel.y) * restitution;
  } else if (hitFloor) {
    const collisionPenetration = 0 - ballBottomEdge;
    const velSquared = newVel.y ** 2;
    const liftDistance = 2 * collisionPenetration;
    const work = gravity > 0 ? 2 * gravity * liftDistance : 0;

    if (velSquared > work) {
      // Bounce with energy conservation
      newPos.y = radius + collisionPenetration;
      const vNew = Math.sqrt(velSquared - work);
      newVel.y = vNew * restitution; // Positive (upward) velocity
    } else {
      // Not enough energy to bounce
      newPos.y = radius;
      newVel.y = 0;
    }
  }

  return { pos: newPos, vel: newVel };
}

/**
 * @deprecated Use physicsYToScreenY instead
 */
export function invertYAxis(h, y) {
  const scaledH = h / SCALE;
  if (h != null && y != null) {
    return scaledH - y;
  }
  return undefined;
}
