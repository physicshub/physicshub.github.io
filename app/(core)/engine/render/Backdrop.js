/**
 * Backdrop — clears the canvas to the current theme colour before anything else
 * is drawn, and optionally leaves a motion-blur trail behind moving bodies.
 *
 * This replaces the offscreen `trailLayer` that every simulation used to build
 * by hand: painting the background at partial alpha achieves the same fade with
 * no second graphics buffer.
 */

import getBackgroundColor from "../../utils/getBackgroundColor";
import { resolve, resolveNumber } from "../utils/params.js";

const FALLBACK = [20, 20, 30];

/** The theme background as an [r, g, b] triple. */
export function themeColor() {
  const color = getBackgroundColor();
  return Array.isArray(color) && color.length >= 3 ? color : FALLBACK;
}

/**
 * @param {object} [options]
 * @param {number|Function} [options.fade=1] - 1 clears completely; lower values
 *   (0.05–0.3) leave a fading afterimage of everything drawn previously.
 * @param {boolean|Function} [options.enabled=true] - When the fade should apply;
 *   a full clear is used whenever it resolves false.
 */
export const Backdrop = (options = {}) => ({
  type: "renderer",
  zIndex: options.zIndex ?? -1000,

  render(ctx) {
    const [r, g, b] = themeColor();
    const active = resolve(options.enabled, ctx) !== false;
    const fade = active ? resolveNumber(options.fade, 1, ctx) : 1;

    if (fade >= 1) {
      ctx.p.background(r, g, b);
    } else {
      ctx.p.push();
      ctx.p.noStroke();
      ctx.p.fill(r, g, b, Math.max(0, Math.min(1, fade)) * 255);
      ctx.p.rect(0, 0, ctx.p.width, ctx.p.height);
      ctx.p.pop();
    }
  },
});

export default Backdrop;
