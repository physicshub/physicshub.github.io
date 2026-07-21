/**
 * Body — a point mass with a shape.
 *
 * A Body carries *only* state: it never decides how it moves. Motion comes from
 * the forces and constraints registered on the World, which is what lets any
 * combination of them act on the same body (a projectile that is also the pivot
 * of a pendulum is just a body with a gravity force and a distance constraint).
 *
 * Coordinates: metres, Y-up, origin bottom-left. Conversion to screen space
 * happens only at render time via constants/Utils.js.
 */

import { physicsToScreen, toPixels } from "../constants/Utils.js";

let nextId = 1;

export class Body {
  /**
   * @param {import("p5")} p
   * @param {object} [options]
   * @param {number} [options.mass=1] - kg. Ignored when `fixed` is true.
   * @param {number} [options.size=1] - Diameter (circle) or side (square), in metres.
   * @param {"circle"|"square"} [options.shape="circle"]
   * @param {string} [options.color]
   * @param {number} [options.restitution=1] - Bounciness, 0..1.
   * @param {boolean} [options.fixed=false] - Infinite mass: anchors, walls, pivots.
   * @param {boolean} [options.kinematic=false] - Skip integration; some element
   *   sets this body's position directly (a prescribed path, an exact solver).
   * @param {import("p5").Vector} [options.position]
   * @param {import("p5").Vector} [options.velocity]
   * @param {string} [options.label] - Shown by debug renderers and sim info.
   */
  constructor(p, options = {}) {
    this.p = p;
    this.id = nextId++;
    this.label = options.label ?? `body-${this.id}`;

    this.params = {
      mass: options.mass ?? 1,
      size: options.size ?? 1,
      shape: options.shape ?? "circle",
      color: options.color ?? "#3b82f6",
      restitution: options.restitution ?? 1,
      fixed: options.fixed ?? false,
      kinematic: options.kinematic ?? false,
      visible: options.visible !== false,
      draggable: options.draggable !== false,
      ...options,
    };

    this.state = {
      position: options.position?.copy() ?? p.createVector(0, 0),
      velocity: options.velocity?.copy() ?? p.createVector(0, 0),
      /** Accumulated force for the current step, in newtons. Cleared by the integrator. */
      force: p.createVector(0, 0),
      /** Last integrated acceleration, kept for readouts and force rendering. */
      acceleration: p.createVector(0, 0),
      /** Previous position, maintained for Verlet integration. */
      previousPosition: (
        options.position?.copy() ?? p.createVector(0, 0)
      ).copy(),
      rotation: options.rotation ?? 0,
      angularVelocity: options.angularVelocity ?? 0,
      torque: 0,
    };

    /** Forces applied this step, keyed by label — used by the force renderer. */
    this.appliedForces = new Map();

    this.trail = {
      enabled: options.trail ?? false,
      points: [],
      maxLength: options.trailLength ?? 150,
      color: options.trailColor ?? this.params.color,
      weight: options.trailWeight ?? 2,
    };
    /** Without an explicit trailColor the trail simply matches the body. */
    this._trailFollowsColor = options.trailColor === undefined;

    this.isHovered = false;
    this.isMoving = false;
    /** Set by whoever owns the interaction (DragController). */
    this.isDragged = false;

    this.initial = {
      position: this.state.position.copy(),
      velocity: this.state.velocity.copy(),
    };

    // Any of these may be given as a getter, in which case the World refreshes
    // it every step — that is how a body follows a slider without being rebuilt.
    this._dynamicParams = {};
    for (const key of Body.DYNAMIC_PARAMS) {
      if (typeof this.params[key] === "function") {
        this._dynamicParams[key] = this.params[key];
      }
    }
    this._dynamicTrail = {};
    for (const [key, source] of Object.entries(Body.DYNAMIC_TRAIL)) {
      if (typeof options[source] === "function") {
        this._dynamicTrail[key] = options[source];
      }
    }
    this.sync();
  }

  /** Body parameters that accept a getter. */
  static DYNAMIC_PARAMS = [
    "mass",
    "size",
    "color",
    "restitution",
    "visible",
    "draggable",
    "shape",
  ];

  /** Trail fields that accept a getter, mapped from their option name. */
  static DYNAMIC_TRAIL = {
    enabled: "trail",
    color: "trailColor",
    maxLength: "trailLength",
  };

  /** Resolve every dynamic parameter. Called by World at the top of each step. */
  sync(ctx) {
    for (const key of Object.keys(this._dynamicParams)) {
      const value = this._dynamicParams[key](ctx);
      if (value !== undefined) this.params[key] = value;
    }
    for (const key of Object.keys(this._dynamicTrail)) {
      const value = this._dynamicTrail[key](ctx);
      if (value !== undefined) this.trail[key] = value;
    }
    if (this._trailFollowsColor) this.trail.color = this.params.color;
    if (!this.trail.enabled && this.trail.points.length) this.clearTrail();
    if (this.trail.points.length > this.trail.maxLength) {
      this.trail.points.splice(
        0,
        this.trail.points.length - this.trail.maxLength
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Mass
  // ---------------------------------------------------------------------------

  /** Inverse mass. 0 for fixed bodies, which makes constraint solving uniform. */
  get inverseMass() {
    return this.params.fixed || this.params.mass <= 0
      ? 0
      : 1 / this.params.mass;
  }

  get radius() {
    return this.params.size / 2;
  }

  // ---------------------------------------------------------------------------
  // Force accumulation
  // ---------------------------------------------------------------------------

  /**
   * Accumulate a force (newtons) for this step.
   * @param {{x: number, y: number}} force
   * @param {string} [label] - Records the force for visualisation.
   */
  applyForce(force, label) {
    if (this.params.fixed) return;
    this.state.force.x += force.x;
    this.state.force.y += force.y;
    if (label) {
      const previous = this.appliedForces.get(label);
      if (previous) {
        previous.x += force.x;
        previous.y += force.y;
      } else {
        this.appliedForces.set(label, { x: force.x, y: force.y });
      }
    }
  }

  /** Apply an instantaneous velocity change: Δv = J / m. */
  applyImpulse(impulse) {
    const inverseMass = this.inverseMass;
    if (inverseMass === 0) return;
    this.state.velocity.x += impulse.x * inverseMass;
    this.state.velocity.y += impulse.y * inverseMass;
  }

  clearForces() {
    this.state.force.set(0, 0);
    this.appliedForces.clear();
  }

  // ---------------------------------------------------------------------------
  // Derived quantities
  // ---------------------------------------------------------------------------

  get speed() {
    return this.state.velocity.mag();
  }

  /** KE = ½mv² */
  getKineticEnergy() {
    return 0.5 * this.params.mass * this.state.velocity.magSq();
  }

  /** PE = mgh, measured from `reference` metres. */
  getPotentialEnergy(gravity = 9.81, reference = 0) {
    return this.params.mass * gravity * (this.state.position.y - reference);
  }

  /** p = mv */
  getMomentum() {
    return this.p.constructor.Vector.mult(
      this.state.velocity,
      this.params.mass
    );
  }

  // ---------------------------------------------------------------------------
  // Geometry / hit testing
  // ---------------------------------------------------------------------------

  /** @returns {{type: string, center?: object, radius?: number, min?: object, max?: object}} */
  getBounds() {
    const pos = this.state.position;
    if (this.params.shape === "circle") {
      return { type: "circle", center: pos, radius: this.radius };
    }
    return {
      type: "rect",
      min: { x: pos.x - this.radius, y: pos.y - this.radius },
      max: { x: pos.x + this.radius, y: pos.y + this.radius },
    };
  }

  /** Point-in-body test, in physics coordinates. */
  contains(point) {
    const dx = point.x - this.state.position.x;
    const dy = point.y - this.state.position.y;
    if (this.params.shape === "circle") {
      return Math.hypot(dx, dy) <= this.radius;
    }
    return Math.abs(dx) <= this.radius && Math.abs(dy) <= this.radius;
  }

  /** Screen-space hit test against the current mouse position. */
  checkHover(p) {
    const screen = this.toScreenPosition();
    const sizePx = toPixels(this.params.size);
    if (this.params.shape === "circle") {
      this.isHovered =
        Math.hypot(p.mouseX - screen.x, p.mouseY - screen.y) <= sizePx / 2;
    } else {
      this.isHovered =
        Math.abs(p.mouseX - screen.x) <= sizePx / 2 &&
        Math.abs(p.mouseY - screen.y) <= sizePx / 2;
    }
    return this.isHovered;
  }

  toScreenPosition() {
    return physicsToScreen(this.state.position, this.p);
  }

  // ---------------------------------------------------------------------------
  // Mutation
  // ---------------------------------------------------------------------------

  /** Merge new parameters (typically synced from the UI inputs each frame). */
  set(params) {
    Object.assign(this.params, params);
    return this;
  }

  setPosition(x, y) {
    this.state.position.set(x, y);
    this.state.previousPosition.set(x, y);
    return this;
  }

  setVelocity(x, y) {
    this.state.velocity.set(x, y);
    return this;
  }

  recordTrailPoint() {
    if (!this.trail.enabled) return;
    this.trail.points.push({
      x: this.state.position.x,
      y: this.state.position.y,
    });
    if (this.trail.points.length > this.trail.maxLength) {
      this.trail.points.shift();
    }
  }

  clearTrail() {
    this.trail.points.length = 0;
  }

  /** Restore the spawn state (or an explicit one) and drop accumulated history. */
  reset(state = {}) {
    const position = state.position ?? this.initial.position;
    const velocity = state.velocity ?? this.initial.velocity;
    this.state.position.set(position.x, position.y);
    this.state.previousPosition.set(position.x, position.y);
    this.state.velocity.set(velocity.x, velocity.y);
    this.state.force.set(0, 0);
    this.state.acceleration.set(0, 0);
    this.state.rotation = state.rotation ?? 0;
    this.state.angularVelocity = state.angularVelocity ?? 0;
    this.appliedForces.clear();
    this.clearTrail();
    return this;
  }
}

export default Body;
