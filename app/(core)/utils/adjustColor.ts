/**
 * Clamps a number between a minimum and maximum value.
 */
const clamp = (value: number, min = 0, max = 255): number =>
  Math.min(Math.max(value, min), max);

/**
 * Converts a HEX color string to an RGB tuple.
 * Supports both 3-digit (#abc) and 6-digit (#aabbcc) formats.
 */
const hexToRgb = (hex: string): [number, number, number] | null => {
  const cleanHex = hex.replace(/^#/, "");
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : cleanHex;

  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) return null;

  const num = parseInt(fullHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

/**
 * Converts an RGB string (e.g. "rgb(120, 200, 150)") to an RGB tuple.
 */
const rgbStringToRgb = (rgb: string): [number, number, number] | null => {
  const parts = rgb.match(/\d+/g)?.map(Number);
  return parts && parts.length >= 3 ? [parts[0], parts[1], parts[2]] : null;
};

/**
 * Computes the relative luminance of an RGB color.
 * Formula based on ITU-R BT.601 standard.
 */
const getLuminance = (r: number, g: number, b: number): number =>
  0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Adjusts a color (HEX or RGB string) by darkening or lightening it
 * depending on its luminance.
 *
 * @param color - Input color in HEX (#abc, #aabbcc) or RGB ("rgb(r,g,b)") format.
 * @param amount - Adjustment factor (0 = no change, 1 = max change). Default = 0.7.
 * @returns Adjusted color as an RGB string.
 */
export function adjustColor(color: string, amount = 0.7): string {
  let rgb: [number, number, number] | null = null;

  if (color.startsWith("#")) {
    rgb = hexToRgb(color);
  } else if (color.startsWith("rgb")) {
    rgb = rgbStringToRgb(color);
  }

  if (!rgb) return color;

  let [r, g, b] = rgb;
  const luminance = getLuminance(r, g, b);

  if (luminance > 128) {
    // Darken bright colors
    r = clamp(Math.floor(r * (1 - amount)));
    g = clamp(Math.floor(g * (1 - amount)));
    b = clamp(Math.floor(b * (1 - amount)));
  } else {
    // Lighten dark colors
    r = clamp(Math.floor(r + (255 - r) * (1 - amount)));
    g = clamp(Math.floor(g + (255 - g) * (1 - amount)));
    b = clamp(Math.floor(b + (255 - b) * (1 - amount)));
  }

  return `rgb(${r}, ${g}, ${b})`;
}
