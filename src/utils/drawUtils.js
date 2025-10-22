// src/utils/drawUtils.js
/**
 * Draw background or trail depending on flag.
 */
export const drawBackground = (p, bg, trailEnabled) => {
  if (trailEnabled) {
    p.noStroke();
    p.fill(bg[0], bg[1], bg[2], 60);
    p.rect(0, 0, p.width, p.height);
  } else {
    p.background(bg);
  }
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
