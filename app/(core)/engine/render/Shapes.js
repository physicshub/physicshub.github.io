/**
 * Shapes — every physics-to-screen drawing primitive lives here, so no
 * simulation ever has to convert coordinates by hand.
 */

import { toPixels, physicsYToScreenY } from "../../constants/Utils.js";
import { SCENE_COLORS } from "./colors.js";

/** Convert a physics point (metres, Y-up) to canvas pixels (Y-down). */
export function toScreen(point) {
  return { x: toPixels(point.x), y: physicsYToScreenY(point.y) };
}

/**
 * Draw a body plus its trail.
 * @returns {{x: number, y: number}} The body's screen position, for follow-up drawing.
 */
export function drawBody(p, body, options = {}) {
  const screen = toScreen(body.state.position);
  const sizePx = toPixels(body.params.size);

  if (body.trail.enabled && body.trail.points.length > 1) {
    drawTrail(p, body);
  }

  p.push();
  p.translate(screen.x, screen.y);
  p.rotate(body.state.rotation);

  if (body.isHovered && options.hoverEffect !== false) {
    p.drawingContext.shadowBlur = 20;
    p.drawingContext.shadowColor = body.params.color;
  }

  p.noStroke();
  p.fill(body.params.color);

  if (body.params.shape === "circle") {
    p.circle(0, 0, sizePx);
  } else {
    p.rectMode(p.CENTER);
    p.rect(0, 0, sizePx, sizePx);
  }

  p.drawingContext.shadowBlur = 0;
  p.pop();

  return screen;
}

export function drawTrail(p, body) {
  p.push();
  p.noFill();
  p.stroke(body.trail.color);
  p.strokeWeight(body.trail.weight);
  p.beginShape();
  for (const point of body.trail.points) {
    const screen = toScreen(point);
    p.vertex(screen.x, screen.y);
  }
  p.endShape();
  p.pop();
}

/** A line between two physics points. */
export function drawSegment(p, from, to, options = {}) {
  const a = toScreen(from);
  const b = toScreen(to);
  p.push();
  if (options.dashed)
    p.drawingContext.setLineDash(
      options.dashed === true ? [5, 5] : options.dashed
    );
  p.stroke(options.color ?? SCENE_COLORS.rope);
  p.strokeWeight(options.weight ?? 2);
  p.line(a.x, a.y, b.x, b.y);
  if (options.dashed) p.drawingContext.setLineDash([]);
  p.pop();
}

/** The classic hatched pivot marker used for anchors and spring mounts. */
export function drawAnchor(p, position, options = {}) {
  const screen = toScreen(position);
  const color = options.color ?? SCENE_COLORS.anchor;
  const radius = options.radius ?? 6;

  p.push();
  p.noStroke();
  p.fill(color);
  p.circle(screen.x, screen.y, radius * 2);

  if (options.bracket !== false) {
    p.stroke(color);
    p.strokeWeight(3);
    p.line(screen.x - 15, screen.y - 8, screen.x + 15, screen.y - 8);
  }
  p.pop();
}

/** A zig-zag coil between two physics points. */
export function drawCoil(p, from, to, options = {}) {
  const a = toScreen(from);
  const b = toScreen(to);
  const coils = options.coils ?? 12;
  const width = options.width ?? 8;
  const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;

  p.push();
  p.noFill();
  p.stroke(options.color ?? "#ec4899");
  p.strokeWeight(options.weight ?? 2);
  p.beginShape();
  for (let i = 0; i <= coils; i++) {
    const t = i / coils;
    let x = p.lerp(a.x, b.x, t);
    let y = p.lerp(a.y, b.y, t);
    if (i > 0 && i < coils) {
      const offset = (i % 2 === 0 ? 1 : -1) * width;
      x += Math.cos(angle) * offset;
      y += Math.sin(angle) * offset;
    }
    p.vertex(x, y);
  }
  p.endShape();
  p.pop();
}

/** A polyline through physics points, e.g. a predicted trajectory. */
export function drawPath(p, points, options = {}) {
  if (!points || points.length < 2) return;
  p.push();
  p.noFill();
  if (options.dashed) p.drawingContext.setLineDash([6, 6]);
  p.stroke(options.color ?? SCENE_COLORS.guide);
  p.strokeWeight(options.weight ?? 2);
  p.beginShape();
  for (const point of points) {
    const screen = toScreen(point);
    p.vertex(screen.x, screen.y);
  }
  p.endShape();
  if (options.dashed) p.drawingContext.setLineDash([]);
  p.pop();
}

/** A horizontal rule at a given physics height — the ground line. */
export function drawGround(p, y = 0, options = {}) {
  const screenY = physicsYToScreenY(y);
  p.push();
  p.stroke(options.color ?? SCENE_COLORS.ground);
  p.strokeWeight(options.weight ?? 2);
  p.line(0, screenY, p.width, screenY);
  p.pop();
}

export default {
  toScreen,
  drawBody,
  drawTrail,
  drawSegment,
  drawAnchor,
  drawCoil,
  drawPath,
  drawGround,
};
