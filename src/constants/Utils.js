// constants/Utils.js
import { SCALE } from "./Config.js";

// Conversioni
export const toPixels = (meters) => meters * SCALE;
export const toMeters = (pixels) => pixels / SCALE;

// Integrazione semplice (Eulero)
export function integrate(pos, vel, acc, dt) {
  vel.x += acc.x * dt;
  vel.y += acc.y * dt;
  pos.x += vel.x * dt;
  pos.y += vel.y * dt;
  return { pos, vel };
}

// Collisione con restituzione
export function collideBoundary(pos, vel, bounds, radius, restitution) {
  const newPos = pos.copy();
  const newVel = vel.copy();

  // Asse X
  if (newPos.x - radius < 0) {
    newPos.x = radius; // correggi posizione
    newVel.x = Math.abs(newVel.x) * restitution; // inverti verso positivo
  } else if (newPos.x + radius > bounds.w) {
    newPos.x = bounds.w - radius;
    newVel.x = -Math.abs(newVel.x) * restitution; // inverti verso negativo
  }

  // Asse Y
  if (newPos.y - radius < 0) {
    newPos.y = radius;
    newVel.y = Math.abs(newVel.y) * restitution;
  } else if (newPos.y + radius > bounds.h) {
    newPos.y = bounds.h - radius;
    newVel.y = -Math.abs(vel.y) * restitution;
  }

  return { pos: newPos, vel: newVel };
}
/* 
// Forza di drag aerodinamico (quadratico)
export function dragForce(vel, rho, Cd, A) {
  const speed = Math.hypot(vel.x, vel.y);
  const magnitude = 0.5 * rho * Cd * A * speed * speed;
  return {
    x: -magnitude * (vel.x / speed),
    y: -magnitude * (vel.y / speed),
  };
}
 */