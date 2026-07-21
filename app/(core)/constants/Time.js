// constants/Time.js
let timeScale = 1;
let paused = false;
let manualStepDelta = 0;
let simulationInstances = new Map(); // Mappa per tenere traccia di ogni istanza
let accumulators = new Map(); // Fixed timestep accumulators per instance
const FIXED_DT = 1 / 120; // 120Hz fixed physics timestep

/**
 * Fixed-timestep scheduling for one frame.
 *
 * Returns how many fixed steps the frame is owed, which is what a simulation
 * loop actually needs — advancing a single FIXED_DT per frame would run 120 Hz
 * physics at half speed on a 60 fps display:
 *
 *   const { dt, steps } = computeSteps(p);
 *   for (let i = 0; i < steps; i++) world.step(dt);
 *
 * @param {object} p - The p5 instance.
 * @param {number} [maxSteps=8] - Upper bound per frame; prevents a spiral of
 *   death when the tab has been backgrounded.
 * @returns {{dt: number, steps: number}}
 */
export function computeSteps(p, maxSteps = 8) {
  const instanceId = p._instanceId || p._userNode?.id;

  if (manualStepDelta !== 0) {
    const steps = Math.max(1, Math.round(manualStepDelta / FIXED_DT));
    manualStepDelta = 0;
    return { dt: FIXED_DT, steps: Math.min(steps, maxSteps) };
  }
  if (paused) return { dt: FIXED_DT, steps: 0 };

  const now = p.millis();
  if (!simulationInstances.has(instanceId)) {
    simulationInstances.set(instanceId, now);
    return { dt: FIXED_DT, steps: 0 };
  }

  let rawDt = (now - simulationInstances.get(instanceId)) / 1000;
  simulationInstances.set(instanceId, now);

  // Limit bursts (tab regaining focus) before scaling.
  rawDt = Math.min(rawDt, 1 / 30) * timeScale;

  const accumulated = (accumulators.get(instanceId) || 0) + rawDt;
  const steps = Math.floor(accumulated / FIXED_DT);

  if (steps > maxSteps) {
    // Drop the backlog rather than trying to catch up.
    accumulators.set(instanceId, 0);
    return { dt: FIXED_DT, steps: maxSteps };
  }

  accumulators.set(instanceId, accumulated - steps * FIXED_DT);
  return { dt: FIXED_DT, steps };
}

export function getFixedDt() {
  return FIXED_DT;
}

export function setTimeScale(scale) {
  timeScale = Math.max(0, scale); // Previeni scale negative
}

export function togglePause() {
  paused = !paused;
  // Quando mettiamo in pausa, resettiamo i lastMillis per evitare salti al resume
  if (paused) {
    simulationInstances.clear();
    accumulators.clear();
  }
}

export function setPause(value) {
  paused = value;
  if (paused) {
    simulationInstances.clear();
    accumulators.clear();
  }
}

export function stepSimulation(delta) {
  if (!paused) return;

  manualStepDelta += delta;
}

export function resetTime() {
  paused = false;
  simulationInstances.clear(); // Pulisci tutte le istanze
  accumulators.clear();
}

export function isPaused() {
  return paused;
}

export function getTimeScale() {
  return timeScale;
}

// Nuova funzione per pulire istanze specifiche (utile quando un componente viene smontato)
export function cleanupInstance(p) {
  if (p) {
    const instanceId = p._instanceId || p._userNode?.id;
    if (instanceId) {
      simulationInstances.delete(instanceId);
    }
  }
}
