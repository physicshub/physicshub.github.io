

export function adjustColor(color, amount = 0.7) {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  let r, g, b;
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full = hex.length === 3
      ? hex.split("").map(ch => ch + ch).join("")
      : hex;
    const n = parseInt(full, 16);
    r = (n >> 16) & 255;
    g = (n >> 8) & 255;
    b = n & 255;
  } else if (color.startsWith("rgb")) {
    const parts = color.match(/\d+/g);
    if (!parts || parts.length < 3) return color;
    [r, g, b] = parts.map(Number);
  } else {
    return color;
  }
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum > 128) {
    r = clamp(Math.floor(r * (1 - amount)), 0, 255);
    g = clamp(Math.floor(g * (1 - amount)), 0, 255);
    b = clamp(Math.floor(b * (1 - amount)), 0, 255);
  } else {
    r = clamp(Math.floor(r + (255 - r) * (1-amount)), 0, 255);
    g = clamp(Math.floor(g + (255 - g) * (1-amount)), 0, 255);
    b = clamp(Math.floor(b + (255 - b) * (1-amount)), 0, 255);
  }
  return `rgb(${r}, ${g}, ${b})`;
}