/**
 * Constraints — elements that restrict where bodies may be.
 *
 * Positional constraints are solved with Gauss–Seidel relaxation after
 * integration (World runs `solve` once per solver iteration) and then correct
 * velocities in `afterStep`, so they neither create nor destroy energy.
 *
 * This is what replaces specialised body subclasses: a pendulum is a Distance
 * constraint between a bob and a pivot, and because the pivot is just another
 * body, attaching a pendulum to a flying projectile costs one line.
 */

import { resolve, resolveNumber } from "../utils/params.js";
import { FORCE_COLORS, SCENE_COLORS } from "../render/colors.js";
import {
  drawSegment,
  drawAnchor,
  drawCoil,
  drawGround,
  drawPath,
} from "../render/Shapes.js";

/**
 * Accept a Body, a literal point, or a getter as an endpoint.
 * Returns an accessor exposing the position and the inverse mass.
 */
function endpoint(target) {
  if (target && typeof target === "object" && target.state?.position) {
    return {
      body: target,
      position: () => target.state.position,
      inverseMass: () => target.inverseMass,
      velocity: () => target.state.velocity,
    };
  }
  const point = () => resolve(target) ?? { x: 0, y: 0 };
  return {
    body: null,
    position: point,
    inverseMass: () => 0,
    velocity: () => ({ x: 0, y: 0 }),
  };
}

// -----------------------------------------------------------------------------
// Distance / rod
// -----------------------------------------------------------------------------

/**
 * Hold two endpoints a fixed distance apart — a rigid rod, a rope, a pendulum arm.
 *
 * @param {Body} a
 * @param {Body|{x: number, y: number}|Function} b - The other end; a fixed body or a point.
 * @param {number|Function} length - Rest distance in metres.
 * @param {object} [options]
 * @param {number} [options.stiffness=1] - 0..1. 1 is rigid, lower values give a stretchy rope.
 * @param {"rope"|"rod"|"none"} [options.render="rope"]
 * @param {"both"|"max"|"min"} [options.limit="both"] - "max" is a rope that can
 *   go slack but not stretch; "min" is a strut that can be pulled apart but not
 *   compressed; "both" is a rigid rod.
 * @param {string} [options.color]
 * @param {boolean} [options.showAnchor=true] - Draw a pivot marker on a fixed endpoint.
 */
export const Distance = (a, b, length, options = {}) => ({
  type: "constraint",
  zIndex: options.zIndex ?? -1,
  a,
  b,
  _a: endpoint(a),
  _b: endpoint(b),
  options,

  /** Current separation, in metres. */
  get currentLength() {
    const pa = this._a.position();
    const pb = this._b.position();
    return Math.hypot(pb.x - pa.x, pb.y - pa.y);
  },

  /** Angle from the b-endpoint down to a, measured from the downward vertical. */
  get angle() {
    const pa = this._a.position();
    const pb = this._b.position();
    return Math.atan2(pa.x - pb.x, -(pa.y - pb.y));
  },

  /** Tension magnitude in newtons, as computed during the last step. */
  get tension() {
    const force = this._a.body?.appliedForces.get("tension");
    return force ? Math.hypot(force.x, force.y) : 0;
  },

  /**
   * Angular velocity of the a-endpoint about b, in rad/s.
   * ω = (r × v) / |r|², with r measured from the pivot.
   */
  get angularVelocity() {
    const pa = this._a.position();
    const pb = this._b.position();
    const rx = pa.x - pb.x;
    const ry = pa.y - pb.y;
    const lengthSq = rx * rx + ry * ry;
    if (lengthSq < 1e-9) return 0;
    const v = this._a.velocity();
    return (rx * v.y - ry * v.x) / lengthSq;
  },

  solve(ctx) {
    const target = resolveNumber(length, 1, ctx);
    const pa = this._a.position();
    const pb = this._b.position();

    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1e-9) return;

    const limit = options.limit ?? "both";
    if (limit === "max" && distance <= target) return; // rope is slack
    if (limit === "min" && distance >= target) return; // strut is not compressed

    const inverseMassA = this._a.inverseMass();
    const inverseMassB = this._b.inverseMass();
    const total = inverseMassA + inverseMassB;
    if (total === 0) return;

    const stiffness = options.stiffness ?? 1;
    const correction = ((distance - target) / distance) * stiffness;

    if (inverseMassA > 0) {
      pa.x += dx * correction * (inverseMassA / total);
      pa.y += dy * correction * (inverseMassA / total);
    }
    if (inverseMassB > 0) {
      pb.x -= dx * correction * (inverseMassB / total);
      pb.y -= dy * correction * (inverseMassB / total);
    }
  },

  /**
   * Cancel the relative velocity along the rod. Without this the positional
   * projection silently removes energy and the pendulum decays on its own.
   */
  afterStep() {
    const inverseMassA = this._a.inverseMass();
    const inverseMassB = this._b.inverseMass();
    const total = inverseMassA + inverseMassB;
    if (total === 0) return;

    const pa = this._a.position();
    const pb = this._b.position();
    const distance = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    if (distance < 1e-9) return;

    const nx = (pb.x - pa.x) / distance;
    const ny = (pb.y - pa.y) / distance;

    const va = this._a.velocity();
    const vb = this._b.velocity();
    // radial > 0 means the endpoints are separating.
    const radial = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
    const limit = options.limit ?? "both";
    if (limit === "max" && radial < 0) return; // slack rope: closing is free
    if (limit === "min" && radial > 0) return; // strut: separating is free

    if (inverseMassA > 0) {
      va.x += nx * radial * (inverseMassA / total);
      va.y += ny * radial * (inverseMassA / total);
    }
    if (inverseMassB > 0) {
      vb.x -= nx * radial * (inverseMassB / total);
      vb.y -= ny * radial * (inverseMassB / total);
    }

    if (options.recordTension !== false) {
      this.recordTension(this._a, nx, ny, distance);
      this.recordTension(this._b, -nx, -ny, distance);
    }
  },

  /**
   * Publish the constraint force as a "tension" entry on the body, so it shows
   * up in force diagrams alongside the real forces.
   *
   * The rod must supply whatever radial force is missing to keep the body on
   * its circle: T = mv²/L − Σ(F·n̂), with n̂ pointing at the other endpoint.
   */
  recordTension(accessor, nx, ny, distance) {
    const body = accessor.body;
    if (!body || body.params.fixed || distance < 1e-6) return;

    let radial = 0;
    for (const [label, force] of body.appliedForces) {
      if (label === "tension") continue;
      radial += force.x * nx + force.y * ny;
    }

    const velocity = body.state.velocity;
    const alongRod = velocity.x * nx + velocity.y * ny;
    const tangentialSq = Math.max(
      0,
      velocity.x ** 2 + velocity.y ** 2 - alongRod ** 2
    );
    const magnitude = (body.params.mass * tangentialSq) / distance - radial;

    body.appliedForces.set("tension", { x: nx * magnitude, y: ny * magnitude });
  },

  render(ctx) {
    if (options.render === "none") return;
    const pa = this._a.position();
    const pb = this._b.position();
    drawSegment(ctx.p, pa, pb, {
      color: resolve(options.color, ctx) ?? SCENE_COLORS.rope,
      weight: options.weight ?? 2,
    });
    if (options.showAnchor !== false && this._b.inverseMass() === 0) {
      drawAnchor(ctx.p, pb, { color: resolve(options.color, ctx) });
    }
  },
});

/** A Distance constraint that only stops stretching, so the link can go slack. */
export const Rope = (a, b, length, options = {}) =>
  Distance(a, b, length, { ...options, limit: "max" });

/** A Distance constraint that only stops compression — a minimum separation. */
export const Strut = (a, b, length, options = {}) =>
  Distance(a, b, length, { ...options, limit: "min" });

// -----------------------------------------------------------------------------
// Spring
// -----------------------------------------------------------------------------

/**
 * Hooke spring with optional dashpot damping: F = −k·x − c·ẋ.
 * Acts during the force phase, so it superposes with every other force.
 *
 * @param {Body} a
 * @param {Body|{x: number, y: number}|Function} b
 * @param {number|Function} restLength - Metres.
 * @param {object} [options]
 * @param {number|Function} [options.k=50] - Stiffness, N/m.
 * @param {number|Function} [options.damping=0] - Dashpot coefficient, N·s/m.
 * @param {"coil"|"line"|"none"} [options.render="coil"]
 */
export const Spring = (a, b, restLength, options = {}) => ({
  type: "constraint",
  label: options.label ?? "spring",
  zIndex: options.zIndex ?? -1,
  a,
  b,
  _a: endpoint(a),
  _b: endpoint(b),
  options,

  get currentLength() {
    const pa = this._a.position();
    const pb = this._b.position();
    return Math.hypot(pb.x - pa.x, pb.y - pa.y);
  },

  /** Signed extension from rest, in metres. Positive means stretched. */
  displacement(ctx) {
    return this.currentLength - resolveNumber(restLength, 1, ctx);
  },

  /** Elastic potential energy: U = ½kx². */
  potentialEnergy(ctx) {
    const x = this.displacement(ctx);
    return 0.5 * resolveNumber(options.k, 50, ctx) * x * x;
  },

  /** Signed force magnitude: F = −kx. */
  force(ctx) {
    return -resolveNumber(options.k, 50, ctx) * this.displacement(ctx);
  },

  applyForces(ctx) {
    if (resolve(options.enabled, ctx) === false) return;

    const pa = this._a.position();
    const pb = this._b.position();
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1e-6) return;

    const extension = distance - resolveNumber(restLength, 1, ctx);

    // A real coil spring that is not attached at both ends can only push, and a
    // rubber band can only pull. `oneWay` models that: the force is dropped on
    // the half of the cycle the connector cannot sustain.
    if (options.oneWay === "push" && extension > 0) return;
    if (options.oneWay === "pull" && extension < 0) return;

    const magnitude = resolveNumber(options.k, 50, ctx) * extension;
    const nx = dx / distance;
    const ny = dy / distance;

    let fx = nx * magnitude;
    let fy = ny * magnitude;

    const damping = resolveNumber(options.damping, 0, ctx);
    if (damping > 0) {
      const va = this._a.velocity();
      const vb = this._b.velocity();
      const radial = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
      fx += nx * damping * radial;
      fy += ny * damping * radial;
    }

    // Newton's third law: the pull on a is the push on b.
    this._a.body?.applyForce({ x: fx, y: fy }, this.label);
    this._b.body?.applyForce({ x: -fx, y: -fy }, this.label);
  },

  render(ctx) {
    if (options.render === "none") return;
    const pa = this._a.position();
    const pb = this._b.position();
    const color = resolve(options.color, ctx) ?? FORCE_COLORS.spring;

    if (options.render === "line") {
      drawSegment(ctx.p, pa, pb, { color, weight: options.weight ?? 2 });
    } else {
      drawCoil(ctx.p, pa, pb, {
        color,
        coils: options.coils,
        width: options.coilWidth,
      });
    }
    if (options.showAnchor !== false && this._b.inverseMass() === 0) {
      drawAnchor(ctx.p, pb);
    }
  },
});

// -----------------------------------------------------------------------------
// Boundaries
// -----------------------------------------------------------------------------

/**
 * Keep bodies inside a rectangle, bouncing off the walls.
 * Defaults to the canvas extent, so `world.add(Bounds())` is usually enough.
 *
 * Emits `"bounce"` with `{ body, side, speed }` on each wall contact — useful
 * for sound, counters, or highlighting.
 *
 * @param {object} [options]
 * @param {number|Function} [options.left=0]
 * @param {number|Function} [options.right] - Defaults to the canvas width in metres.
 * @param {number|Function} [options.bottom=0]
 * @param {number|Function} [options.top] - Defaults to the canvas height in metres.
 * @param {string[]} [options.sides] - Subset of ["left","right","bottom","top"].
 * @param {number|Function} [options.restitution] - Overrides each body's own restitution.
 * @param {number|Function} [options.friction=0] - Tangential velocity loss per contact, 0..1.
 */
export const Bounds = (options = {}) => ({
  type: "collider",
  options,

  resolveCollisions(ctx) {
    if (resolve(options.enabled, ctx) === false) return;

    const sides = options.sides ?? ["left", "right", "bottom", "top"];
    const left = resolveNumber(options.left, 0, ctx);
    const right = resolveNumber(options.right, ctx.bounds.width, ctx);
    const bottom = resolveNumber(options.bottom, 0, ctx);
    const top = resolveNumber(options.top, ctx.bounds.height, ctx);
    const friction = resolveNumber(options.friction, 0, ctx);

    const bodies = options.bodies
      ? ctx.world.bodies.filter((b) =>
          Array.isArray(options.bodies)
            ? options.bodies.includes(b)
            : options.bodies === b
        )
      : ctx.world.bodies;

    for (const body of bodies) {
      if (body.params.fixed || body.isDragged) continue;

      const restitution =
        resolveNumber(options.restitution, body.params.restitution, ctx) ?? 1;
      const { position, velocity } = body.state;
      const r = body.radius;

      /**
       * @param {string} axis - "x" or "y".
       * @param {number} surface - Coordinate of the body centre at contact.
       * @param {number} sign - Direction of travel into the wall (−1 or +1).
       * @param {number} penetration - How far past the surface the body went.
       */
      const hit = (side, axis, surface, sign, penetration) => {
        if (Math.sign(velocity[axis]) !== sign) {
          position[axis] = surface;
          return;
        }

        // The step overshot the wall, and during that overshoot the field
        // (gravity) kept doing work. Undo it, or a "perfectly elastic" ball
        // visibly loses height every bounce:
        //   v_surface² = v² − 2·a·s·d
        // with s the travel direction and d the penetration depth.
        const acceleration = body.state.acceleration[axis];
        const contactSpeedSq = Math.max(
          0,
          velocity[axis] ** 2 - 2 * acceleration * sign * penetration
        );
        const contactSpeed = Math.sqrt(contactSpeedSq);

        velocity[axis] = -sign * contactSpeed * restitution;
        // Mirror the overshoot back out so the trajectory keeps its shape.
        position[axis] = surface - sign * penetration * restitution;

        if (friction > 0) {
          const other = axis === "x" ? "y" : "x";
          velocity[other] *= 1 - friction;
        }
        ctx.world.emit("bounce", { body, side, speed: contactSpeed });
      };

      if (sides.includes("left") && position.x - r < left)
        hit("left", "x", left + r, -1, left - (position.x - r));
      else if (sides.includes("right") && position.x + r > right)
        hit("right", "x", right - r, 1, position.x + r - right);

      if (sides.includes("bottom") && position.y - r < bottom)
        hit("bottom", "y", bottom + r, -1, bottom - (position.y - r));
      else if (sides.includes("top") && position.y + r > top)
        hit("top", "y", top - r, 1, position.y + r - top);
    }
  },
});

/**
 * A floor with restitution and sliding friction. Bounds restricted to the
 * bottom wall, with a visible ground line.
 *
 * @param {object} [options]
 * @param {number|Function} [options.y=0] - Floor height in metres.
 * @param {number|Function} [options.friction=0] - Tangential loss per contact, 0..1.
 * @param {boolean} [options.render=true]
 */
export const Ground = (options = {}) => {
  const bounds = Bounds({
    ...options,
    sides: ["bottom"],
    bottom: options.y ?? 0,
  });
  return {
    ...bounds,
    zIndex: options.zIndex ?? -2,
    render:
      options.render === false
        ? undefined
        : (ctx) => drawGround(ctx.p, resolveNumber(options.y, 0, ctx), options),
  };
};

/**
 * Detect whether a body rests on a surface — the precondition for surface
 * friction and normal-force readouts.
 * @param {Body} body
 * @param {number} [surfaceY=0]
 * @param {number} [tolerance=0.02]
 */
export function isOnSurface(body, surfaceY = 0, tolerance = 0.02) {
  return body.state.position.y - body.radius <= surfaceY + tolerance;
}

/**
 * Kinetic friction from a horizontal surface: F = −μ·N·v̂, applied only while
 * the body is in contact. Registered as a force but grouped here because it is
 * meaningless without the surface it belongs to.
 *
 * @param {object} options
 * @param {number|Function} options.mu - Coefficient of kinetic friction.
 * @param {number|Function} [options.surfaceY=0]
 * @param {number|Function} [options.g=9.81]
 */
export const SurfaceFriction = (options = {}) => ({
  type: "force",
  label: options.label ?? "friction",
  color: FORCE_COLORS.friction,
  options,

  vector(body, ctx) {
    const mu = resolveNumber(options.mu, 0, ctx);
    if (mu <= 0 || body.params.fixed) return null;

    const surfaceY = resolveNumber(options.surfaceY, 0, ctx);
    if (!isOnSurface(body, surfaceY)) return null;

    const vx = body.state.velocity.x;
    if (Math.abs(vx) < 1e-3) return null;

    const normal = body.params.mass * resolveNumber(options.g, 9.81, ctx);
    return { x: -Math.sign(vx) * mu * normal, y: 0 };
  },

  applyForces(ctx) {
    for (const body of ctx.world.bodies) {
      const force = this.vector(body, ctx);
      if (force) body.applyForce(force, this.label);
    }
  },
});

// -----------------------------------------------------------------------------
// Kinematic drivers
// -----------------------------------------------------------------------------

/** Hold a body at a fixed point (or follow a moving one). */
export const Pin = (body, point, options = {}) => ({
  type: "constraint",
  options,
  solve(ctx) {
    const target = resolve(point, ctx);
    if (!target) return;
    body.state.position.set(target.x, target.y);
    body.state.velocity.set(0, 0);
  },
});

/**
 * Drive a body around a circle at a prescribed angular velocity — uniform
 * circular motion, where the trajectory is imposed rather than emergent.
 *
 * @param {Body} body
 * @param {Body|{x: number, y: number}|Function} center
 * @param {number|Function} radius - Metres.
 * @param {object} options
 * @param {number|Function} options.omega - Angular velocity, rad/s.
 * @param {number} [options.angle=0] - Starting angle, radians.
 */
export const CircularPath = (body, center, radius, options = {}) => ({
  type: "constraint",
  zIndex: options.zIndex ?? -1,
  angle: options.angle ?? 0,
  _center: endpoint(center),
  options,

  beforeStep(ctx) {
    if (body.isDragged) return;
    this.angle += resolveNumber(options.omega, 0, ctx) * ctx.dt;
  },

  solve(ctx) {
    const c = this._center.position();
    const r = resolveNumber(radius, 1, ctx);
    const omega = resolveNumber(options.omega, 0, ctx);

    body.state.position.set(
      c.x + r * Math.cos(this.angle),
      c.y + r * Math.sin(this.angle)
    );
    // Tangential velocity, so kinetic-energy readouts stay meaningful.
    body.state.velocity.set(
      -r * omega * Math.sin(this.angle),
      r * omega * Math.cos(this.angle)
    );
  },

  /**
   * Publish the centripetal force the path is exerting: F = mω²r toward the
   * centre. The motion is prescribed, but the force that would be required to
   * produce it is real, so it belongs in the force diagram.
   */
  afterStep(ctx) {
    const r = resolveNumber(radius, 1, ctx);
    const omega = resolveNumber(options.omega, 0, ctx);
    const magnitude = body.params.mass * omega * omega * r;

    // The body sits at centre + r·(cos θ, sin θ), so the inward unit vector
    // is simply −(cos θ, sin θ).
    body.appliedForces.set("centripetal", {
      x: -Math.cos(this.angle) * magnitude,
      y: -Math.sin(this.angle) * magnitude,
    });
  },

  render(ctx) {
    if (options.render === false) return;
    const c = this._center.position();
    const r = resolveNumber(radius, 1, ctx);
    const points = Array.from({ length: 64 }, (_, i) => {
      const t = (i / 63) * Math.PI * 2;
      return { x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) };
    });
    drawPath(ctx.p, points, { color: SCENE_COLORS.guide, dashed: true });
  },
});

/**
 * Confine bodies to one axis — a track, an air rail, a 1-D collision demo.
 * @param {Body|Body[]} bodies
 * @param {object} options
 * @param {number|Function} [options.y] - Lock the vertical coordinate to this value.
 * @param {number|Function} [options.x] - Lock the horizontal coordinate instead.
 */
export const LockAxis = (bodies, options = {}) => ({
  type: "constraint",
  options,
  solve(ctx) {
    for (const body of [].concat(bodies)) {
      if (options.y !== undefined) {
        body.state.position.y = resolveNumber(options.y, 0, ctx);
        body.state.velocity.y = 0;
      }
      if (options.x !== undefined) {
        body.state.position.x = resolveNumber(options.x, 0, ctx);
        body.state.velocity.x = 0;
      }
    }
  },
});

/**
 * Cap a body's speed. Not a force — a kinematic ceiling, the way a vehicle's
 * top speed is set by effects the simulation does not model.
 * @param {Body|Body[]} bodies
 * @param {number|Function} max - Metres per second.
 */
export const SpeedLimit = (bodies, max) => ({
  type: "constraint",
  afterStep(ctx) {
    const limit = resolveNumber(max, Infinity, ctx);
    for (const body of [].concat(bodies)) {
      const speed = body.speed;
      if (speed > limit && speed > 0) {
        body.state.velocity.mult(limit / speed);
      }
    }
  },
});

// -----------------------------------------------------------------------------
// Inclined plane
// -----------------------------------------------------------------------------

/**
 * A frictional ramp: bodies are held on the surface, the normal force emerges
 * from whatever is pressing them into it, and friction follows from that normal
 * force rather than being hardcoded to mg·cos θ.
 *
 * **Add this after the forces it should react to.** Elements run in insertion
 * order, so gravity, wind and any applied force must already be on the body
 * when the ramp computes N = −ΣF·n̂. That ordering is the causal chain: a load
 * presses, the surface pushes back, friction opposes what is left.
 *
 * @param {Body|Body[]} bodies
 * @param {object} options
 * @param {{x: number, y: number}|Function} options.origin - Foot of the ramp, in metres.
 * @param {number|Function} options.angle - Inclination in radians, measured from horizontal.
 * @param {number|Function} options.length - Ramp length in metres.
 * @param {number|Function} [options.muStatic=0]
 * @param {number|Function} [options.muKinetic=0]
 * @param {string|Function} [options.color]
 */
export const Incline = (bodies, options = {}) => ({
  type: "constraint",
  zIndex: options.zIndex ?? -2,
  options,

  /** Unit vectors up the slope and away from the surface. */
  basis(ctx) {
    const angle = resolveNumber(options.angle, 0, ctx);
    return {
      angle,
      tangent: { x: Math.cos(angle), y: Math.sin(angle) },
      normal: { x: -Math.sin(angle), y: Math.cos(angle) },
    };
  },

  /** Distance of a body along the ramp, measured from the foot. */
  distanceAlong(body, ctx) {
    const origin = resolve(options.origin, ctx);
    const { tangent } = this.basis(ctx);
    return (
      (body.state.position.x - origin.x) * tangent.x +
      (body.state.position.y - origin.y) * tangent.y
    );
  },

  /** Signed speed up the slope. */
  speedAlong(body, ctx) {
    const { tangent } = this.basis(ctx);
    return (
      body.state.velocity.x * tangent.x + body.state.velocity.y * tangent.y
    );
  },

  applyForces(ctx) {
    const { tangent, normal } = this.basis(ctx);
    const muStatic = resolveNumber(options.muStatic, 0, ctx);
    const muKinetic = resolveNumber(options.muKinetic, 0, ctx);

    for (const body of [].concat(bodies)) {
      if (body.params.fixed || body.isDragged) continue;

      // Everything applied so far, resolved in the surface frame.
      let alongNormal = 0;
      let alongTangent = 0;
      for (const force of body.appliedForces.values()) {
        alongNormal += force.x * normal.x + force.y * normal.y;
        alongTangent += force.x * tangent.x + force.y * tangent.y;
      }

      // The surface can only push, never pull: N ≥ 0. A body pressed away from
      // the ramp simply leaves it.
      const N = Math.max(0, -alongNormal);
      if (N > 0) {
        body.applyForce({ x: normal.x * N, y: normal.y * N }, "normal");
      }

      const speed = this.speedAlong(body, ctx);
      let friction;
      if (Math.abs(speed) < 1e-3) {
        // At rest: static friction holds if it can, otherwise the body breaks away.
        friction =
          Math.abs(alongTangent) <= muStatic * N
            ? -alongTangent
            : -Math.sign(alongTangent) * muKinetic * N;
      } else {
        friction = -Math.sign(speed) * muKinetic * N;
      }

      if (friction !== 0) {
        body.applyForce(
          { x: tangent.x * friction, y: tangent.y * friction },
          "friction"
        );
      }
    }
  },

  solve(ctx) {
    const origin = resolve(options.origin, ctx);
    const length = resolveNumber(options.length, 1, ctx);
    const { tangent, normal } = this.basis(ctx);

    for (const body of [].concat(bodies)) {
      if (body.params.fixed) continue;

      const along = Math.min(
        Math.max(this.distanceAlong(body, ctx), 0),
        length
      );
      // Sit the body on top of the surface rather than centred on it.
      const lift = body.radius;
      body.state.position.set(
        origin.x + tangent.x * along + normal.x * lift,
        origin.y + tangent.y * along + normal.y * lift
      );
      body.state.rotation = -this.basis(ctx).angle;
    }
  },

  /** Remove the velocity component that would leave the surface. */
  afterStep(ctx) {
    const { tangent } = this.basis(ctx);
    const length = resolveNumber(options.length, 1, ctx);

    for (const body of [].concat(bodies)) {
      if (body.params.fixed) continue;
      const speed = this.speedAlong(body, ctx);
      body.state.velocity.set(tangent.x * speed, tangent.y * speed);

      // Stop dead at the foot and at the top of the ramp.
      const along = this.distanceAlong(body, ctx);
      if ((along <= 0 && speed < 0) || (along >= length && speed > 0)) {
        body.state.velocity.set(0, 0);
      }
    }
  },

  render(ctx) {
    if (options.render === false) return;
    const origin = resolve(options.origin, ctx);
    const length = resolveNumber(options.length, 1, ctx);
    const { tangent } = this.basis(ctx);

    drawGround(ctx.p, origin.y, { color: SCENE_COLORS.ground });
    drawSegment(
      ctx.p,
      origin,
      {
        x: origin.x + tangent.x * length,
        y: origin.y + tangent.y * length,
      },
      { color: resolve(options.color, ctx) ?? SCENE_COLORS.rope, weight: 5 }
    );
  },
});

export default {
  Distance,
  Rope,
  Strut,
  Spring,
  Bounds,
  Ground,
  SurfaceFriction,
  Pin,
  CircularPath,
  LockAxis,
  SpeedLimit,
  Incline,
  isOnSurface,
};
