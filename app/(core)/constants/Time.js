// constants/Time.js
let timeScale = 1;
let paused = false;
let lastMillis = null;
let simulationInstances = new Map(); // Mappa per tenere traccia di ogni istanza

/**
 * Returns dt in seconds, limited to a max step for stability.
 * Uses p.millis() to compute real delta.
 */
export function computeDelta(p) {
  if (paused) return 0;

  const now = p.millis();
  const instanceId = p._instanceId || p._userNode?.id; // Identificatore unico per ogni sketch
  
  // Se non abbiamo un lastMillis per questa istanza, inizializzalo
  if (!simulationInstances.has(instanceId)) {
    simulationInstances.set(instanceId, now);
    return 0;
  }

  let lastInstanceMillis = simulationInstances.get(instanceId);
  let dt = (now - lastInstanceMillis) / 1000; // seconds
  
  // Aggiorna lastMillis per questa istanza
  simulationInstances.set(instanceId, now);

  // limit burst (e.g. when tab regains focus)
  const maxStep = 1 / 30; // ~33ms
  if (dt > maxStep) dt = maxStep;

  return dt * timeScale;
}

export function setTimeScale(scale) {
  timeScale = Math.max(0, scale); // Previeni scale negative
}

export function togglePause() {
  paused = !paused;
  // Quando mettiamo in pausa, resettiamo i lastMillis per evitare salti al resume
  if (paused) {
    simulationInstances.clear();
  }
}

export function setPause(value) {
  paused = value;
  if (paused) {
    simulationInstances.clear();
  }
}

export function resetTime() {
  timeScale = 1;
  paused = false;
  simulationInstances.clear(); // Pulisci tutte le istanze
  lastMillis = null;
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