// app/(core)/utils/simulationEvents.js
//
// The running simulation (client-only, inside createSimulation) and the page
// sections around it (the community presets list) are separate React trees.
// They talk through two window events instead of a shared provider.

const APPLY_INPUTS = "physicshub:apply-inputs";
const GET_INPUTS = "physicshub:get-inputs";
const PRESETS_CHANGED = "physicshub:presets-changed";

/**
 * Read the simulation's current inputs. dispatchEvent is synchronous, so the
 * simulation's listener has filled `detail.inputs` by the time it returns.
 * @returns {Record<string, unknown> | null}  null if no simulation is mounted
 */
export function getCurrentInputs() {
  const detail = { inputs: null };
  window.dispatchEvent(new CustomEvent(GET_INPUTS, { detail }));
  return detail.inputs;
}

/** @returns {() => void} unsubscribe */
export function onGetCurrentInputs(read) {
  const listener = (event) => {
    event.detail.inputs = read();
  };
  window.addEventListener(GET_INPUTS, listener);
  return () => window.removeEventListener(GET_INPUTS, listener);
}

/** Ask the simulation on this page to load a set of inputs (e.g. a preset). */
export function applyInputs(inputs) {
  window.dispatchEvent(new CustomEvent(APPLY_INPUTS, { detail: { inputs } }));
}

/** @returns {() => void} unsubscribe */
export function onApplyInputs(handler) {
  const listener = (event) => handler(event.detail?.inputs ?? {});
  window.addEventListener(APPLY_INPUTS, listener);
  return () => window.removeEventListener(APPLY_INPUTS, listener);
}

/** A preset was published or deleted: lists should refetch. */
export function notifyPresetsChanged(simId) {
  window.dispatchEvent(new CustomEvent(PRESETS_CHANGED, { detail: { simId } }));
}

/** @returns {() => void} unsubscribe */
export function onPresetsChanged(handler) {
  const listener = (event) => handler(event.detail?.simId);
  window.addEventListener(PRESETS_CHANGED, listener);
  return () => window.removeEventListener(PRESETS_CHANGED, listener);
}
