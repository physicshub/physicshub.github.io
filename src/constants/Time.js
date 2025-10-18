// constants/Time.js
let timeScale = 1;
let paused = false;

export function computeDelta(p) {
  if (paused) return 0;
  return (p.deltaTime / 1000) * timeScale; // convert ms to s
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
  timeScale = 1;
  paused = false;
}

export function isPaused() {
  return paused;
}

export function getTimeScale() {
  return timeScale;
}
