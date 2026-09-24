// app/(core)/utils/simulationUrl.js
//
// The one place simulation inputs cross a trust boundary: read from a URL,
// written to a URL, or loaded from JSON someone else wrote (a community preset,
// a cloud-saved configuration). Everything funnels through `acceptValue`, so a
// shared link, an embed code and a preset are all held to the same rules.

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// A free string (no options known) may only be a short plain token.
const SAFE_TOKEN = /^[\w+\-*/.]{1,32}$/;

const sameNumber = (a, b) => Math.abs(a - b) < 1e-9;

/**
 * Decide whether `value` is acceptable for input `key`, and return it in its
 * canonical form (or `undefined` to drop it).
 *
 * - the key must exist in `initialInputs` (drops `fbclid`, `utm_*`, `embed`…);
 * - the type must match the default's type; numbers must be finite (no
 *   clamping — a typed value may go past the slider range by design);
 * - a field with `options` (a select) only takes one of its option values;
 * - a colour (the default is a hex colour) only takes a hex colour — it ends up
 *   in inline CSS, where `url(...)` would make every viewer fetch a URL;
 * - any other string must be a short plain token.
 *
 * @param {string} key
 * @param {unknown} value
 * @param {Record<string, unknown>} initialInputs
 * @param {{ name: string, options?: { value: unknown }[] }[]} [fields]
 */
function acceptValue(key, value, initialInputs, fields) {
  if (!Object.hasOwn(initialInputs, key)) return undefined;
  if (value === null || value === undefined || typeof value === "object") {
    return undefined;
  }
  const fallback = initialInputs[key];

  // A select only takes one of its option values, returned in the option's own
  // type (the <select> element reports even numeric options as strings).
  const options = fields?.find((field) => field.name === key)?.options;
  if (Array.isArray(options) && options.length > 0) {
    const asNumber = Number(value);
    const match = options.find(
      (option) =>
        option.value === value ||
        String(option.value) === String(value) ||
        (typeof option.value === "number" &&
          Number.isFinite(asNumber) &&
          sameNumber(option.value, asNumber))
    );
    return match ? match.value : undefined;
  }

  switch (typeof fallback) {
    case "number": {
      // Numbers may arrive as text (a URL, a field mid-edit like "5.").
      const num =
        typeof value === "number"
          ? value
          : typeof value === "string" && value.trim() !== ""
            ? Number(value)
            : NaN;
      return Number.isFinite(num) ? num : undefined;
    }
    case "boolean":
      return typeof value === "boolean" ? value : undefined;
    case "string":
      if (typeof value !== "string") return undefined;
      if (HEX_COLOR.test(fallback)) {
        return HEX_COLOR.test(value) ? value : undefined;
      }
      return SAFE_TOKEN.test(value) ? value : undefined;
    default:
      // Objects/arrays can't round-trip through a query string or a preset.
      return undefined;
  }
}

/**
 * Parse simulation inputs out of a query string.
 *
 * @param {string} search  e.g. `window.location.search`
 * @param {Record<string, unknown>} initialInputs  the config's INITIAL_INPUTS
 * @param {object[]} [fields]  the config's INPUT_FIELDS (validates selects)
 * @returns {Record<string, unknown> | null}  null when nothing usable was found
 */
export function parseInputsFromSearch(search, initialInputs, fields) {
  if (!search) return null;

  const params = new URLSearchParams(search);
  const parsed = {};

  params.forEach((raw, key) => {
    if (!Object.hasOwn(initialInputs, key)) return;
    // Everything in a URL is text; only booleans need converting up front
    // (acceptValue parses numbers and matches select options itself).
    const value =
      typeof initialInputs[key] === "boolean"
        ? raw === "true"
          ? true
          : raw === "false"
            ? false
            : undefined
        : raw;
    const accepted = acceptValue(key, value, initialInputs, fields);
    if (accepted !== undefined) parsed[key] = accepted;
  });

  return Object.keys(parsed).length > 0 ? parsed : null;
}

/**
 * Keep only the inputs a simulation knows and would accept — the object-shaped
 * twin of `parseInputsFromSearch`, for inputs that arrive as JSON (community
 * presets, cloud-saved configurations, localStorage).
 *
 * @param {Record<string, unknown> | null | undefined} inputs
 * @param {Record<string, unknown>} initialInputs
 * @param {object[]} [fields]  the config's INPUT_FIELDS (validates selects)
 * @returns {Record<string, unknown>}
 */
export function sanitizeInputs(inputs, initialInputs, fields) {
  const clean = {};
  if (!inputs || typeof inputs !== "object") return clean;
  for (const [key, value] of Object.entries(inputs)) {
    const accepted = acceptValue(key, value, initialInputs, fields);
    if (accepted !== undefined) clean[key] = accepted;
  }
  return clean;
}

/** True for a hex colour string — the only thing allowed into inline CSS. */
export function isHexColor(value) {
  return typeof value === "string" && HEX_COLOR.test(value);
}

/** "/simulations/ParabolicMotion/" → "ParabolicMotion" */
export function simIdFromPath(path) {
  return (
    String(path ?? "")
      .split(/[?#]/)[0]
      .split("/")
      .filter(Boolean)
      .pop() ?? ""
  );
}

/**
 * Build an absolute URL to a simulation carrying only the inputs that differ
 * from their defaults, so links stay short and keep working if a default
 * changes later.
 *
 * @param {string} path  the simulation route, e.g. "/simulations/ParabolicMotion"
 * @param {Record<string, unknown>} inputs  current inputs
 * @param {Record<string, unknown>} initialInputs  the config's INITIAL_INPUTS
 * @param {{ embed?: boolean }} [options]
 * @returns {string}  "" during SSR, where there is no origin
 */
export function buildSimulationUrl(
  path,
  inputs,
  initialInputs,
  { embed = false } = {}
) {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(inputs ?? {})) {
    if (!Object.hasOwn(initialInputs, key)) continue;
    if (value === initialInputs[key]) continue;
    if (value === null || typeof value === "object") continue;
    params.set(key, String(value));
  }
  if (embed) params.set("embed", "1");

  const cleanPath = "/" + String(path).replace(/^\/+/, "");
  const query = params.toString();
  return `${window.location.origin}${cleanPath}${query ? `?${query}` : ""}`;
}
