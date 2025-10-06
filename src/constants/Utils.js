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
  if (pos.x + radius > bounds.w) {
    pos.x = bounds.w - radius;
    vel.x *= -restitution;
  }
  if (pos.x - radius < 0) {
    pos.x = radius;
    vel.x *= -restitution;
  }
  if (pos.y + radius > bounds.h) {
    pos.y = bounds.h - radius;
    vel.y *= -restitution;
  }
  if (pos.y - radius < 0) {
    pos.y = radius;
    vel.y *= -restitution;
  }
  return { pos, vel };
}

// Forza di drag aerodinamico (quadratico)
export function dragForce(vel, rho, Cd, A) {
  const v = Math.hypot(vel.x, vel.y);
  const F = 0.5 * rho * Cd * A * v * v;
  return { x: -F * (vel.x / v), y: -F * (vel.y / v) };
}
