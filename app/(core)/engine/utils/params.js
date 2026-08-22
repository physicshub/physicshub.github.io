/**
 * Dynamic parameters.
 *
 * Every engine element accepts its numeric options either as a plain value or
 * as a getter. Getters are what make a simulation "live": the element reads the
 * current input on every frame instead of being rebuilt whenever a slider moves.
 *
 *   Gravity({ g: 9.81 })                  // fixed
 *   Gravity({ g: () => inputs.gravity })  // follows the UI
 */

/**
 * Resolve a value that may be a getter.
 * @template T
 * @param {T | ((ctx: object) => T)} value
 * @param {object} [ctx] - Step context, forwarded to the getter.
 * @returns {T}
 */
export function resolve(value, ctx) {
  return typeof value === "function" ? value(ctx) : value;
}

/**
 * Resolve every own property of an options object.
 * @param {Record<string, unknown>} options
 * @param {object} [ctx]
 * @returns {Record<string, unknown>}
 */
export function resolveAll(options, ctx) {
  const out = {};
  for (const key of Object.keys(options)) {
    out[key] = resolve(options[key], ctx);
  }
  return out;
}

/**
 * Resolve a value and fall back when it is null/undefined/NaN.
 */
export function resolveNumber(value, fallback, ctx) {
  const v = resolve(value, ctx);
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
