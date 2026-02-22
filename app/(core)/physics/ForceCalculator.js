/**
 * ForceCalculator - Centralized force computation utilities
 * ALL FORCES USE Y-UP COORDINATE SYSTEM (standard physics)
 * Gravity is NEGATIVE Y direction (downward)
 */

export class ForceCalculator {
  /**
   * Calculate gravitational force: F = m * g (downward in Y-up coords = negative Y)
   * @param {number} mass - Mass in kg
   * @param {number} g - Gravity magnitude (positive value, e.g., 9.81 m/s²)
   * @param {object} direction - Optional custom direction vector
   * @returns {object} Force vector {x, y} where y is NEGATIVE for downward
   */
  static gravity(mass, g = 9.81, direction = null) {
    const mag = mass * g;

    if (direction) {
      // Custom direction (e.g., for inclined planes)
      return direction.copy().normalize().mult(mag);
    }

    // Default: downward in Y-up coords = NEGATIVE Y
    return { x: 0, y: -mag };
  }

  /**
   * Calculate normal force (perpendicular to surface)
   * @param {number} mass - Mass of object
   * @param {number} g - Gravity constant
   * @param {number} angleRad - Surface angle in radians
   * @param {number} perpComponent - Additional perpendicular component
   */
  static normalForce(mass, g, angleRad, perpComponent = 0) {
    const weightPerp = mass * g * Math.cos(angleRad);
    return Math.max(0, weightPerp - perpComponent);
  }

  /**
   * Calculate static friction force
   * Static friction opposes motion initiation up to μ_s * N
   */
  static staticFriction(normalForce, coefficient, appliedForce) {
    const maxStatic = coefficient * normalForce;

    if (Math.abs(appliedForce) <= maxStatic) {
      // Static friction exactly balances applied force
      return -appliedForce;
    }

    // Applied force exceeds static friction - object starts moving
    return null; // Kinetic friction takes over
  }

  /**
   * Calculate kinetic friction force
   * Kinetic friction opposes motion with constant magnitude μ_k * N
   */
  static kineticFriction(normalForce, coefficient, velocity) {
    if (Math.abs(velocity) < 0.001) return 0;

    const mag = coefficient * normalForce;
    return -Math.sign(velocity) * mag;
  }

  /**
   * Calculate friction force (auto-selects static or kinetic)
   */
  static friction(
    normalForce,
    staticCoeff,
    kineticCoeff,
    velocity,
    appliedForce = 0
  ) {
    const isMoving = Math.abs(velocity) > 0.001;

    if (!isMoving) {
      // Try static friction
      const staticF = this.staticFriction(
        normalForce,
        staticCoeff,
        appliedForce
      );
      if (staticF !== null) return staticF;

      // Falls through to kinetic if static is overcome
      return -Math.sign(appliedForce) * kineticCoeff * normalForce;
    }

    // Object is moving - use kinetic friction
    return this.kineticFriction(normalForce, kineticCoeff, velocity);
  }

  /**
   * Calculate air resistance/drag: F_d = 0.5 * ρ * v² * C_d * A
   * Simplified: F_d = -k * v² (or -k * v for low velocities)
   */
  static airResistance(velocity, dragCoefficient, linearDrag = false) {
    const speed = Math.abs(velocity);
    if (speed < 0.001) return 0;

    const mag = linearDrag
      ? dragCoefficient * speed
      : dragCoefficient * speed * speed;

    return -Math.sign(velocity) * mag;
  }

  /**
   * Calculate spring force: F = -k * x (Hooke's Law)
   */
  static spring(displacement, springConstant) {
    return -springConstant * displacement;
  }

  /**
   * Calculate damping force: F = -c * v
   */
  static damping(velocity, dampingCoefficient) {
    return -dampingCoefficient * velocity;
  }

  /**
   * Calculate tension in a rope/string
   * @param {number} mass - Mass being supported
   * @param {number} g - Gravity magnitude (positive)
   * @param {number} acceleration - Acceleration of the system (positive up)
   */
  static tension(mass, g, acceleration = 0) {
    return mass * (g + acceleration);
  }

  /**
   * Calculate centripetal force: F = m * v² / r
   */
  static centripetal(mass, velocity, radius) {
    return (mass * velocity * velocity) / radius;
  }

  /**
   * Calculate buoyancy force: F_b = ρ * V * g (upward = positive Y)
   * @param {number} fluidDensity - Density of fluid (kg/m³)
   * @param {number} volume - Volume of displaced fluid (m³)
   * @param {number} g - Gravity magnitude (positive)
   */
  static buoyancy(fluidDensity, volume, g = 9.81) {
    return fluidDensity * volume * g; // Positive (upward in Y-up)
  }

  /**
   * Resolve force into components given an angle
   * @param {number} forceMagnitude - Magnitude of force
   * @param {number} angleRad - Angle in radians (0 = right, π/2 = up)
   */
  static resolveForce(forceMagnitude, angleRad) {
    return {
      x: forceMagnitude * Math.cos(angleRad),
      y: forceMagnitude * Math.sin(angleRad),
    };
  }

  /**
   * Calculate components parallel and perpendicular to an inclined plane
   * @param {number} weight - Weight magnitude (positive)
   * @param {number} angleRad - Angle of incline (radians)
   * @returns {object} {parallel: down the slope, perpendicular: into surface}
   */
  static inclinedPlaneComponents(weight, angleRad) {
    return {
      parallel: weight * Math.sin(angleRad), // Down the slope
      perpendicular: weight * Math.cos(angleRad), // Into surface
    };
  }

  /**
   * Calculate net force from multiple force vectors
   */
  static netForce(forces) {
    return forces.reduce(
      (sum, force) => ({
        x: sum.x + (force.x || 0),
        y: sum.y + (force.y || 0),
      }),
      { x: 0, y: 0 }
    );
  }

  /**
   * Calculate work done: W = F · d
   */
  static work(force, displacement) {
    return force.x * displacement.x + force.y * displacement.y;
  }

  /**
   * Calculate power: P = F · v
   */
  static power(force, velocity) {
    return force.x * velocity.x + force.y * velocity.y;
  }
}

/**
 * InclinedPlaneForces - Specialized force calculator for inclined plane simulations
 */
export class InclinedPlaneForces {
  constructor(params) {
    this.params = params;
  }

  /**
   * Calculate all forces on an inclined plane
   */
  calculate(body, isMoving) {
    const {
      gravity,
      angle,
      frictionStatic,
      frictionKinetic,
      appliedForce,
      appliedAngle,
    } = this.params;

    const angleRad = (angle * Math.PI) / 180;
    const mass = body.params.mass;

    // Weight and its components
    const weight = mass * gravity;
    const { parallel: weightParallel, perpendicular: weightPerp } =
      ForceCalculator.inclinedPlaneComponents(weight, angleRad);

    // Applied force components
    const appliedAngleRad = (appliedAngle * Math.PI) / 180;
    const totalAppliedAngle = angleRad - appliedAngleRad;
    const appliedComponents = ForceCalculator.resolveForce(
      appliedForce,
      totalAppliedAngle
    );

    // Normal force
    const normal = Math.max(0, weightPerp - appliedComponents.y);

    // Friction force
    let friction = 0;
    const netWithoutFriction = appliedComponents.x - weightParallel;

    if (!isMoving) {
      const staticResult = ForceCalculator.staticFriction(
        normal,
        frictionStatic,
        netWithoutFriction
      );

      if (staticResult !== null) {
        friction = staticResult;
      } else {
        // Transition to kinetic
        friction = -Math.sign(netWithoutFriction) * frictionKinetic * normal;
      }
    } else {
      // Kinetic friction
      const vel = body.state.velocity?.x || body.state.vel || 0;
      friction = ForceCalculator.kineticFriction(normal, frictionKinetic, vel);
    }

    // Net force
    const netParallel = -weightParallel + appliedComponents.x + friction;

    return {
      weight: {
        magnitude: weight,
        parallel: weightParallel,
        perpendicular: weightPerp,
      },
      normal,
      friction,
      applied: {
        magnitude: appliedForce,
        parallel: appliedComponents.x,
        perpendicular: appliedComponents.y,
      },
      netParallel,
      angle: angleRad,
    };
  }

  /**
   * Update parameters
   */
  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
  }
}

export default ForceCalculator;
