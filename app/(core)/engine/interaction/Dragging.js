/**
 * Dragging — pointer control over bodies.
 *
 * Registered as a World element, so a simulation enables mouse interaction with
 * `world.add(Dragging())` and never wires p5 mouse callbacks itself; the runtime
 * forwards pointer events to every element that declares them.
 */

import { toMeters, screenYToPhysicsY } from "../../constants/Utils.js";
import { resolve } from "../utils/params.js";

/**
 * @param {object} [options]
 * @param {Body|Body[]} [options.bodies] - Restrict dragging to these bodies.
 * @param {boolean} [options.throwOnRelease=false] - Keep the pointer velocity on
 *   release, so the body can be flung. Otherwise it is dropped at rest.
 * @param {number} [options.smoothing=0] - 0 follows the pointer exactly; 0..1 lags behind it.
 * @param {(body: Body, ctx: object) => {x: number, y: number}} [options.project] -
 *   Constrain the drag target, e.g. onto a pendulum's arc or an incline.
 * @param {(body: Body) => void} [options.onGrab]
 * @param {(body: Body) => void} [options.onRelease]
 */
export const Dragging = (options = {}) => ({
  type: "interaction",
  target: null,
  offset: { x: 0, y: 0 },
  /** Pointer velocity in m/s, tracked so a released body can be thrown. */
  pointerVelocity: { x: 0, y: 0 },
  _lastPoint: null,

  get isDragging() {
    return this.target !== null;
  },

  attach(world) {
    this.world = world;
  },

  candidates(ctx) {
    if (!options.bodies) return ctx.world.bodies;
    return [].concat(options.bodies);
  },

  onPointerDown(ctx) {
    if (resolve(options.enabled, ctx) === false) return false;

    const { p } = ctx;
    for (let i = this.candidates(ctx).length - 1; i >= 0; i--) {
      const body = this.candidates(ctx)[i];
      if (!body.params.draggable || body.params.fixed) continue;
      if (!body.checkHover(p)) continue;

      this.target = body;
      body.isDragged = true;
      body.state.velocity.set(0, 0);

      const screen = body.toScreenPosition();
      this.offset = { x: screen.x - p.mouseX, y: screen.y - p.mouseY };
      this._lastPoint = { x: body.state.position.x, y: body.state.position.y };
      this.pointerVelocity = { x: 0, y: 0 };

      options.onGrab?.(body, ctx);
      return true;
    }
    return false;
  },

  onPointerMove(ctx) {
    if (!this.target) return;
    const { p } = ctx;

    let target = {
      x: toMeters(p.mouseX + this.offset.x),
      y: screenYToPhysicsY(p.mouseY + this.offset.y),
    };
    if (options.project) {
      target = options.project(this.target, { ...ctx, target }) ?? target;
    }

    const position = this.target.state.position;
    const smoothing = options.smoothing ?? 0;
    if (smoothing > 0) {
      position.x += (target.x - position.x) * (1 - smoothing);
      position.y += (target.y - position.y) * (1 - smoothing);
    } else {
      position.set(target.x, target.y);
    }

    // Track pointer velocity over the frame so a throw has a sensible speed.
    if (this._lastPoint) {
      const dt = Math.max(ctx.p.deltaTime / 1000, 1e-3);
      this.pointerVelocity = {
        x: (position.x - this._lastPoint.x) / dt,
        y: (position.y - this._lastPoint.y) / dt,
      };
    }
    this._lastPoint = { x: position.x, y: position.y };
    this.target.state.previousPosition.set(position.x, position.y);
  },

  onPointerUp(ctx) {
    const body = this.target;
    if (!body) return;

    if (options.throwOnRelease) {
      body.state.velocity.set(this.pointerVelocity.x, this.pointerVelocity.y);
    } else {
      body.state.velocity.set(0, 0);
    }
    body.state.acceleration.set(0, 0);
    body.isDragged = false;

    this.target = null;
    this._lastPoint = null;
    options.onRelease?.(body, ctx);
  },
});

export default Dragging;
