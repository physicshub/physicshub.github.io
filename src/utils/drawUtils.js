// src/utils/drawUtils.js
/**
 * Draw background or trail depending on flag.
 */
export const drawBackground = (p, bg, trailEnabled) => {
  p.colorMode && p.colorMode(p.RGB, 255);
  const bgColor =
    Array.isArray(bg) && bg.length >= 3
      ? p.color(bg[0], bg[1], bg[2])
      : p.color(0, 0, 0);

  if (!trailEnabled) {
    p.background(p.red(bgColor), p.green(bgColor), p.blue(bgColor));
    return;
  }
  const trailAlpha = 60;
  p.push();
  p.rectMode && p.rectMode(p.CORNER);
  p.noStroke();
  p.blendMode && p.blendMode(p.BLEND);
  p.fill(p.red(bgColor), p.green(bgColor), p.blue(bgColor), trailAlpha);
  p.rect(0, 0, p.width, p.height);
  p.pop();
};

/**
 * Draw any shape with hover glow.
 * @param {p5} p - p5 instance
 * @param {boolean} isHover - hover state
 * @param {string} color - glow color
 * @param {Function} drawFn - function that draws the shape
 * @param {number} blur - glow blur radius
 */
export const drawGlow = (p, isHover, color, drawFn, blur = 20) => {
  p.cursor(isHover ? "grab" : "default");

  if (isHover) {
    const ctx = p.drawingContext;
    ctx.save();
    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    drawFn();
    ctx.restore();
  } else {
    drawFn();
  }
};



// --- Force visualization constants ---
const FORCE_PIXEL_SCALE = 10; // pixels per Newton (tune to your scene)
// Minimum and maximum on-screen arrow length (in pixels) to keep vectors readable
const MIN_ARROW_PIXELS = 8;
const MAX_ARROW_PIXELS = 120;

/**
 * Draw a force vector as an arrow
 * - Ensures the shaft stops before the head, so no body extends beyond the tip.
 * @param {p5} p - p5 instance
 * @param {number} originX - x coordinate of the origin
 * @param {number} originY - y coordinate of the origin
 * @param {{x: number, y: number}} forceVec - force vector
 * @param {string} color - arrow color
 */
export const drawForceVector = (p, originX, originY, forceVec, color = "red") => {
  const fx = forceVec.x;
  const fy = forceVec.y;

  const mag = Math.hypot(fx, fy);
  if (mag === 0) return;

  // Scale to pixels and clamp
  let pxLen = mag * FORCE_PIXEL_SCALE;
  pxLen = Math.max(MIN_ARROW_PIXELS, Math.min(MAX_ARROW_PIXELS, pxLen));

  // Direction unit vector
  const ux = fx / mag;
  const uy = fy / mag;

  // Arrowhead geometry (in pixels)
  const headLen = 12;   // length of the triangle head along the direction
  const headWidth = 6;  // half-width of the triangle head

  // End point (tip of the arrow)
  const tipX = originX + ux * pxLen;
  const tipY = originY + uy * pxLen;

  // Shaft end point (stop before the head begins)
  const shaftEndX = tipX - ux * headLen;
  const shaftEndY = tipY - uy * headLen;

  // Shaft
  p.push();
  p.stroke(color);
  p.strokeWeight(2);
  p.line(originX, originY, shaftEndX, shaftEndY);

  // Head (triangle)
  p.translate(tipX, tipY);
  const angle = Math.atan2(uy, ux);
  p.rotate(angle);
  p.fill(color);
  p.noStroke();
  // Triangle pointing forward: tip at (0,0), base behind the tip
  p.triangle(0, 0, -headLen, headWidth, -headLen, -headWidth);
  p.pop();
};


/**
 * Generic force collector.
 * Reads force definitions from config and evaluates them.
 * @param {Array} forceDefs - array of force definitions from config
 * @param {Object} state - { pos, vel, radius, mass }
 * @param {Object} inputs - simulation inputs (gravity, restitution, ecc.)
 * @param {Object} context - extra context (canvasHeightMeters, ecc.)
 * @returns {Array} list of { key, color, vec }
 */
export const getActiveForces = (forceDefs, state, inputs, context) => {
  const forces = [];
  for (const def of forceDefs) {
    if (typeof def.computeFn === "function") {
      const vec = def.computeFn(state, inputs, context);
      if (vec && (vec.x !== 0 || vec.y !== 0)) {
        forces.push({ key: def.key, color: def.color, vec });
      }
    }
  }
  return forces;
};