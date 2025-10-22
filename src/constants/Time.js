// constants/Time.js
let timeScale = 1;
let paused = false;
let lastMillis = null;

/**
 * Returns dt in seconds, limited to a max step for stability.
 * Uses p.millis() to compute real delta.
 */
export function computeDelta(p) {
  if (paused) return 0;

  const now = p.millis();
  if (lastMillis == null) {
    lastMillis = now;
    return 0;
  }

  let dt = (now - lastMillis) / 1000; // seconds
  lastMillis = now;

  // limit burst (e.g. when tab regains focus)
  const maxStep = 1 / 30; // ~33ms
  if (dt > maxStep) dt = maxStep;

  return dt * timeScale;
}

export function setTimeScale(scale) {
  timeScale = scale;
}

export function togglePause() {
  paused = !paused;
}

export function setPause(value) {
  paused = value;
}

export function resetTime() {
  console.trace("ResetTime")
  timeScale = 1;
  paused = false;
  lastMillis = null;
}

export function isPaused() {
  return paused;
}

export function getTimeScale() {
  return timeScale;
}
