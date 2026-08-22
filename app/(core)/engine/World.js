/**
 * World — the simulation container and the whole reason simulations compose.
 *
 * A World owns bodies and *elements*. An element is any object implementing one
 * or more of the lifecycle hooks below; forces, constraints, colliders and pure
 * decorations are all just elements, so combining behaviours never requires a
 * new class — you add another element.
 *
 *   const ball = world.addBody({ mass: 2, size: 0.4, at: [3, 8] });
 *   const bob  = world.addBody({ mass: 1, size: 0.2, at: [3, 6] });
 *   world.add(Gravity({ g: () => inputs.gravity }));   // both fall
 *   world.add(Distance(ball, bob, 2));                 // bob swings off the ball
 *   world.add(Bounds());                               // both stay on screen
 *
 * Element hooks, in the order World.step runs them:
 *   attach(world)            once, when added
 *   beforeStep(ctx)          sync parameters, read inputs
 *   applyForces(ctx)         accumulate forces on bodies
 *   -- integration --
 *   solve(ctx)               positional constraints, repeated solverIterations times
 *   resolveCollisions(ctx)   impulse-based contact resolution
 *   afterStep(ctx)           bookkeeping, events, measurements
 *   render(ctx)              drawing, ordered by zIndex
 */

import Body from "./Body.js";
import { semiImplicitEuler } from "./integrators.js";
import { drawBody } from "./render/Shapes.js";
import { toMeters } from "../constants/Utils.js";

export class World {
  /**
   * @param {import("p5")} p
   * @param {object} [options]
   * @param {(body: Body, dt: number) => void} [options.integrator=semiImplicitEuler]
   * @param {number} [options.solverIterations=4] - Constraint relaxation passes per step.
   * @param {object} [options.inputs] - The live simulation inputs, exposed on the step context.
   */
  constructor(p, options = {}) {
    this.p = p;
    this.bodies = [];
    this.elements = [];

    this.integrator = options.integrator ?? semiImplicitEuler;
    this.solverIterations = options.solverIterations ?? 4;
    /**
     * Physics sub-steps per call to `step`. Raise it for stiff or chaotic
     * systems (mutual gravity, close orbits) where one 1/120 s step is too
     * coarse to stay on the true trajectory.
     */
    this.substeps = options.substeps ?? 1;
    this.inputs = options.inputs ?? {};

    /** Simulated time in seconds since the world was built. */
    this.time = 0;
    /** Canvas extent in metres, refreshed every step from the p5 canvas. */
    this.bounds = { width: toMeters(p.width), height: toMeters(p.height) };

    this._listeners = new Map();
  }

  // ---------------------------------------------------------------------------
  // Composition
  // ---------------------------------------------------------------------------

  /**
   * Create and register a body.
   * @param {object} options - Body options, plus `at: [x, y]` and `velocity: [vx, vy]` shorthands.
   * @returns {Body}
   */
  addBody(options = {}) {
    const { at, velocity, ...rest } = options;
    const body = new Body(this.p, {
      ...rest,
      position: at ? this.p.createVector(at[0], at[1]) : rest.position,
      velocity: velocity
        ? this.p.createVector(velocity[0], velocity[1])
        : rest.velocity,
    });
    this.bodies.push(body);
    return body;
  }

  /**
   * A fixed body: pendulum pivots, spring anchors, walls. Invisible by default
   * because most anchors are drawn by the constraint that uses them.
   */
  addAnchor(x, y, options = {}) {
    return this.addBody({
      at: [x, y],
      fixed: true,
      size: options.size ?? 0.2,
      visible: options.visible ?? false,
      draggable: false,
      ...options,
    });
  }

  /** Register one or more elements. Accepts falsy entries so callers can inline conditionals. */
  add(...elements) {
    for (const element of elements.flat()) {
      if (!element) continue;
      this.elements.push(element);
      element.attach?.(this);
    }
    return elements.length === 1 ? elements[0] : elements;
  }

  remove(target) {
    const bodyIndex = this.bodies.indexOf(target);
    if (bodyIndex !== -1) this.bodies.splice(bodyIndex, 1);
    const elementIndex = this.elements.indexOf(target);
    if (elementIndex !== -1) {
      this.elements.splice(elementIndex, 1);
      target.detach?.(this);
    }
  }

  /** Find a body by its `label`. */
  body(label) {
    return this.bodies.find((b) => b.label === label);
  }

  // ---------------------------------------------------------------------------
  // Simulation
  // ---------------------------------------------------------------------------

  /** Build the context object handed to every hook. */
  context(dt = 0) {
    return {
      world: this,
      p: this.p,
      dt,
      time: this.time,
      inputs: this.inputs,
      bounds: this.bounds,
    };
  }

  /**
   * Advance the simulation by one fixed step.
   * Callers should feed this a constant dt (see constants/Time.js).
   */
  step(dt) {
    if (!dt) return;

    this.bounds.width = toMeters(this.p.width);
    this.bounds.height = toMeters(this.p.height);

    if (this.substeps > 1) {
      const sub = dt / this.substeps;
      for (let i = 0; i < this.substeps; i++) this.substep(sub);
      return;
    }
    this.substep(dt);
  }

  /** One integration step. Use `step`, which applies `substeps`. */
  substep(dt) {
    const ctx = this.context(dt);
    const active = this.elements.filter((e) => e.enabled !== false);

    this.syncBodies(ctx);
    for (const element of active) element.beforeStep?.(ctx);

    for (const body of this.bodies) body.clearForces();
    for (const element of active) element.applyForces?.(ctx);

    for (const body of this.bodies) {
      // A dragged body is positioned by the pointer and a kinematic one by
      // whichever element owns it — but forces stay recorded either way, so
      // their free-body diagrams keep updating.
      if (body.isDragged || body.params.fixed || body.params.kinematic) {
        body.state.force.set(0, 0);
        continue;
      }
      this.integrator(body, dt);
    }

    for (let iteration = 0; iteration < this.solverIterations; iteration++) {
      const solveCtx = { ...ctx, iteration, iterations: this.solverIterations };
      for (const element of active) element.solve?.(solveCtx);
    }

    for (const element of active) element.resolveCollisions?.(ctx);

    for (const body of this.bodies) {
      body.isMoving = body.speed > 0.001;
      body.recordTrailPoint();
    }

    for (const element of active) element.afterStep?.(ctx);

    this.time += dt;
  }

  /** Resolve every body's dynamic parameters against the current inputs. */
  syncBodies(ctx = this.context(0)) {
    for (const body of this.bodies) body.sync(ctx);
  }

  /**
   * Draw every element in zIndex order. Bodies are drawn at zIndex 0, so an
   * element with a negative zIndex renders behind them (rope, spring, ground)
   * and a positive one in front (force vectors, labels).
   */
  render(extra = {}) {
    const ctx = { ...this.context(0), ...extra };
    // Rendering can happen without a step (paused, or between fixed steps),
    // so parameters are refreshed here too — colours and sizes stay live.
    this.syncBodies(ctx);
    this.updateHover(this.p);

    const drawables = [
      ...this.elements
        .filter((e) => e.enabled !== false && e.render)
        .map((e) => ({ z: e.zIndex ?? -1, draw: () => e.render(ctx) })),
      { z: 0, draw: () => this.renderBodies(ctx) },
    ].sort((a, b) => a.z - b.z);

    for (const drawable of drawables) drawable.draw();
  }

  renderBodies(ctx) {
    for (const body of this.bodies) {
      if (!body.params.visible) continue;
      drawBody(ctx.p, body);
    }
  }

  // ---------------------------------------------------------------------------
  // Interaction & lifecycle
  // ---------------------------------------------------------------------------

  /** Topmost draggable body under the mouse, or null. */
  pick(p) {
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      const body = this.bodies[i];
      if (!body.params.draggable || body.params.fixed) continue;
      if (body.checkHover(p)) return body;
    }
    return null;
  }

  /** Refresh hover flags on interactive bodies, so they glow under the cursor. */
  updateHover(p) {
    for (const body of this.bodies) {
      if (body.params.draggable && !body.params.fixed) body.checkHover(p);
      else body.isHovered = false;
    }
  }

  reset() {
    this.time = 0;
    for (const body of this.bodies) body.reset();
    for (const element of this.elements) element.reset?.(this.context(0));
  }

  clear() {
    for (const element of this.elements) element.detach?.(this);
    this.bodies.length = 0;
    this.elements.length = 0;
    this._listeners.clear();
    this.time = 0;
  }

  // ---------------------------------------------------------------------------
  // Events — how elements report physics occurrences (a bounce, a collision)
  // without the simulation having to poll for them.
  // ---------------------------------------------------------------------------

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  emit(event, payload) {
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) handler(payload);
  }

  // ---------------------------------------------------------------------------
  // Aggregate measurements
  // ---------------------------------------------------------------------------

  get kineticEnergy() {
    return this.bodies.reduce((sum, b) => sum + b.getKineticEnergy(), 0);
  }

  potentialEnergy(gravity = 9.81, reference = 0) {
    return this.bodies.reduce(
      (sum, b) => sum + b.getPotentialEnergy(gravity, reference),
      0
    );
  }

  get momentum() {
    return this.bodies.reduce(
      (sum, b) => {
        const momentum = b.getMomentum();
        return { x: sum.x + momentum.x, y: sum.y + momentum.y };
      },
      { x: 0, y: 0 }
    );
  }
}

export default World;
