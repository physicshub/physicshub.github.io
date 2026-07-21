/**
 * ForceRenderer — draws force vectors.
 *
 * The important difference from drawing forces by hand: bodies record every
 * force applied to them during the step (`body.appliedForces`), so the diagram
 * is generated from the forces that actually ran. A force can never be drawn
 * differently from how it was integrated, and nothing is computed twice.
 */

import { toPixels, physicsYToScreenY } from "../../constants/Utils.js";
import { FORCE_COLORS } from "./colors.js";
import { resolve } from "../utils/params.js";

export class ForceRenderer {
  constructor(options = {}) {
    this.config = {
      scale: options.scale ?? 5, // pixels per newton
      arrowSize: options.arrowSize ?? 10,
      strokeWeight: options.strokeWeight ?? 3,
      showLabels: options.showLabels !== false,
      showMagnitude: options.showMagnitude !== false,
      labelSize: options.labelSize ?? 12,
      labelOffset: options.labelOffset ?? 15,
      minMagnitude: options.minMagnitude ?? 0.01,
    };
    this.colors = { ...FORCE_COLORS, ...options.colors };
  }

  /**
   * Draw a vector in newtons anchored at a screen point.
   * Y is negated because forces are Y-up and the canvas is Y-down.
   */
  drawVector(p, screenX, screenY, fx, fy, color, label, options = {}) {
    const magnitude = Math.hypot(fx, fy);
    if (magnitude < this.config.minMagnitude) return;

    const scale = options.scale ?? this.config.scale;
    const endX = screenX + fx * scale;
    const endY = screenY - fy * scale;

    p.push();
    if (options.dashed) p.drawingContext.setLineDash([5, 5]);

    p.stroke(color);
    p.strokeWeight(options.strokeWeight ?? this.config.strokeWeight);
    p.line(screenX, screenY, endX, endY);

    if (!options.noArrow) {
      this.drawArrowhead(p, screenX, screenY, endX, endY, color, options);
    }
    if (options.dashed) p.drawingContext.setLineDash([]);

    if (this.config.showLabels && label) {
      this.drawLabel(p, endX, endY, label, magnitude, color, options);
    }
    p.pop();
  }

  drawArrowhead(p, startX, startY, endX, endY, color, options = {}) {
    const angle = Math.atan2(endY - startY, endX - startX);
    const size = options.arrowSize ?? this.config.arrowSize;

    p.push();
    p.translate(endX, endY);
    p.rotate(angle);
    p.noStroke();
    p.fill(color);
    p.triangle(0, 0, -size, -size / 2, -size, size / 2);
    p.pop();
  }

  drawLabel(p, x, y, text, magnitude, color, options = {}) {
    const offset = options.labelOffset ?? this.config.labelOffset;
    const showMagnitude =
      options.showMagnitude !== false && this.config.showMagnitude;

    const content = showMagnitude
      ? `${text} (${magnitude.toFixed(1)}${options.unit ?? "N"})`
      : text;

    p.push();
    p.noStroke();
    p.textSize(this.config.labelSize);

    p.fill(0, 0, 0, 150);
    p.rect(
      x + offset - 4,
      y - (this.config.labelSize + 4) / 2 - 2,
      p.textWidth(content) + 8,
      this.config.labelSize + 4,
      3
    );

    p.fill(color);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(content, x + offset, y);
    p.pop();
  }

  /**
   * Draw every force recorded on a body during the last step.
   * @param {object} options
   * @param {string[]} [options.only] - Restrict to these labels.
   * @param {string[]} [options.exclude]
   * @param {boolean} [options.net=false] - Also draw the resultant.
   */
  drawBodyForces(p, body, options = {}) {
    const screenX = toPixels(body.state.position.x);
    const screenY = physicsYToScreenY(body.state.position.y);

    let net = { x: 0, y: 0 };
    for (const [label, force] of body.appliedForces) {
      net = { x: net.x + force.x, y: net.y + force.y };
      if (options.only && !options.only.includes(label)) continue;
      if (options.exclude?.includes(label)) continue;

      this.drawVector(
        p,
        screenX,
        screenY,
        force.x,
        force.y,
        this.colors[label] ?? this.colors.net,
        this.label(label),
        options
      );
    }

    if (options.net) {
      this.drawVector(
        p,
        screenX,
        screenY,
        net.x,
        net.y,
        this.colors.net,
        "Fnet",
        {
          ...options,
          strokeWeight: 4,
        }
      );
    }
    return { x: screenX, y: screenY };
  }

  /** Human-readable name for an internal force label. */
  label(key) {
    const names = {
      weight: "Weight",
      gravity: "Gravity",
      normal: "Normal",
      friction: "Friction",
      applied: "Applied",
      tension: "Tension",
      spring: "Spring",
      drag: "Drag",
      damping: "Damping",
      wind: "Wind",
      buoyancy: "Buoyancy",
      centripetal: "Centripetal",
    };
    return names[key] ?? key;
  }

  /** Decompose a vector into dashed x/y components at the same origin. */
  drawComponents(p, screenX, screenY, fx, fy, options = {}) {
    const style = {
      dashed: true,
      strokeWeight: 2,
      showMagnitude: false,
      ...options,
    };
    if (Math.abs(fx) > this.config.minMagnitude) {
      this.drawVector(
        p,
        screenX,
        screenY,
        fx,
        0,
        this.colors.component,
        options.xLabel ?? "Fx",
        style
      );
    }
    if (Math.abs(fy) > this.config.minMagnitude) {
      this.drawVector(
        p,
        screenX,
        screenY,
        0,
        fy,
        this.colors.component,
        options.yLabel ?? "Fy",
        style
      );
    }
  }

  /**
   * Split a force into components parallel and perpendicular to an axis and
   * draw both dashed — the standard free-body decomposition on an incline or
   * along a pendulum's rod.
   *
   * @param {number} axisAngle - Axis direction in radians, physics convention
   *   (0 = +x, π/2 = +y).
   */
  decompose(p, screenX, screenY, force, axisAngle, options = {}) {
    const ux = Math.cos(axisAngle);
    const uy = Math.sin(axisAngle);
    const along = force.x * ux + force.y * uy;
    const across = -force.x * uy + force.y * ux;

    const style = {
      dashed: true,
      strokeWeight: 2,
      showMagnitude: false,
      ...options,
    };
    this.drawVector(
      p,
      screenX,
      screenY,
      along * ux,
      along * uy,
      this.colors.component,
      options.parallelLabel ?? "F∥",
      style
    );
    this.drawVector(
      p,
      screenX,
      screenY,
      -across * uy,
      across * ux,
      this.colors.component,
      options.perpendicularLabel ?? "F⊥",
      style
    );

    return { parallel: along, perpendicular: across };
  }

  update(config) {
    Object.assign(this.config, config);
    return this;
  }
}

/**
 * A World element that draws force diagrams for the selected bodies.
 *
 *   world.add(ForceVectors({ enabled: () => inputs.showForces, net: true }));
 *
 * @param {object} [options] - ForceRenderer config, plus `bodies`, `only`,
 *   `exclude`, `net`, `components`, `enabled`.
 */
export const ForceVectors = (options = {}) => {
  const renderer = new ForceRenderer(options);
  return {
    type: "renderer",
    zIndex: options.zIndex ?? 10,
    renderer,
    render(ctx) {
      if (resolve(options.enabled, ctx) === false) return;
      const bodies = options.bodies
        ? [].concat(options.bodies)
        : ctx.world.bodies;
      for (const body of bodies) {
        if (body.params.fixed && !options.includeFixed) continue;
        renderer.drawBodyForces(ctx.p, body, options);
      }
    },
  };
};

/**
 * Draw kinematic vectors — velocity and acceleration — which are not forces and
 * so never appear in `appliedForces`.
 *
 *   world.add(Vectors({ show: ["velocity"], scale: 10 }));
 *
 * @param {object} [options]
 * @param {("velocity"|"acceleration")[]} [options.show=["velocity"]]
 * @param {Body|Body[]} [options.bodies]
 * @param {number} [options.scale=10] - Pixels per unit.
 * @param {boolean|Function} [options.enabled]
 */
export const Vectors = (options = {}) => {
  const renderer = new ForceRenderer({
    showMagnitude: options.showMagnitude ?? true,
    ...options,
  });
  const show = options.show ?? ["velocity"];
  const units = { velocity: "m/s", acceleration: "m/s²" };

  return {
    type: "renderer",
    zIndex: options.zIndex ?? 9,
    renderer,
    render(ctx) {
      if (resolve(options.enabled, ctx) === false) return;
      const bodies = options.bodies
        ? [].concat(options.bodies)
        : ctx.world.bodies;

      for (const body of bodies) {
        if (body.params.fixed && !options.includeFixed) continue;
        const screenX = toPixels(body.state.position.x);
        const screenY = physicsYToScreenY(body.state.position.y);

        for (const kind of show) {
          const vector = body.state[kind];
          if (!vector) continue;
          renderer.drawVector(
            ctx.p,
            screenX,
            screenY,
            vector.x,
            vector.y,
            renderer.colors[kind],
            options.labels === false
              ? null
              : kind[0].toUpperCase() + kind.slice(1),
            { unit: units[kind], scale: options.scale ?? 10 }
          );
        }
      }
    },
  };
};

export default ForceRenderer;
