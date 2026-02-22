/**
 * PhysicsBody - Base class for all physics simulation bodies
 * Uses Y-UP coordinate system for all physics calculations
 * Converts to screen coordinates (Y-down) only during rendering
 */

import { physicsToScreen, toPixels } from "../constants/Utils.js";

export class PhysicsBody {
  constructor(p, params = {}) {
    this.p = p;

    // Physical properties
    this.params = {
      mass: params.mass || 1,
      size: params.size || 1,
      color: params.color || "#3b82f6",
      shape: params.shape || "circle", // circle, square, polygon
      restitution: params.restitution || 1, // bounciness (0-1)
      ...params,
    };

    // State vectors - ALL IN PHYSICS COORDINATES (Y-UP)
    this.state = {
      position: params.position || this.p.createVector(0, 0), // meters, Y-up
      velocity: params.velocity || this.p.createVector(0, 0), // m/s, Y-up
      acceleration: params.acceleration || this.p.createVector(0, 0), // m/s², Y-up
      rotation: params.rotation || 0, // radians
      angularVelocity: params.angularVelocity || 0, // rad/s
      angularAcceleration: params.angularAcceleration || 0, // rad/s²
    };

    // Derived state
    this.isMoving = false;
    this.isHovered = false;

    // Trail system
    this.trail = {
      enabled: false,
      points: [],
      maxLength: 100,
      color: params.color || "#3b82f6",
      alpha: 100,
    };

    // Collision detection
    this.bounds = this.computeBounds();
  }

  /**
   * Apply a force to the body (F = ma)
   */
  applyForce(force) {
    // F = ma => a = F/m
    const acceleration = force.copy().div(this.params.mass);
    this.state.acceleration.add(acceleration);
  }

  /**
   * Apply an impulse (instant velocity change)
   */
  applyImpulse(impulse) {
    // J = mΔv => Δv = J/m
    const deltaV = impulse.copy().div(this.params.mass);
    this.state.velocity.add(deltaV);
  }

  /**
   * Update physics - standard Euler integration
   * ALL CALCULATIONS IN PHYSICS COORDS (Y-UP)
   */
  step(dt) {
    if (dt <= 0) return;

    // Linear motion
    this.state.velocity.add(
      this.p.constructor.Vector.mult(this.state.acceleration, dt)
    );
    this.state.position.add(
      this.p.constructor.Vector.mult(this.state.velocity, dt)
    );

    // Rotational motion
    this.state.angularVelocity += this.state.angularAcceleration * dt;
    this.state.rotation += this.state.angularVelocity * dt;

    // Reset acceleration (forces need to be reapplied each frame)
    this.state.acceleration.set(0, 0);
    this.state.angularAcceleration = 0;

    // Update derived state
    this.isMoving = this.state.velocity.mag() > 0.001;
    this.bounds = this.computeBounds();

    // Update trail
    if (this.trail.enabled) {
      this.updateTrail();
    }
  }

  /**
   * Update physics - Verlet integration (more stable for constraints)
   */
  stepVerlet(dt, previousPosition) {
    if (dt <= 0) return;

    const currentPos = this.state.position.copy();
    const prevPos = previousPosition || this.state.position.copy();

    const Vector = this.p.constructor.Vector;

    // Verlet: x(t+dt) = 2*x(t) - x(t-dt) + a(t)*dt²
    const displacement = Vector.sub(currentPos, prevPos);
    const accelerationTerm = Vector.mult(this.state.acceleration, dt * dt);

    this.state.position.add(displacement).add(accelerationTerm);

    // Update velocity (derived from position change)
    this.state.velocity = Vector.sub(this.state.position, currentPos).div(dt);

    // Reset acceleration
    this.state.acceleration.set(0, 0);

    this.isMoving = this.state.velocity.mag() > 0.001;
    this.bounds = this.computeBounds();

    if (this.trail.enabled) {
      this.updateTrail();
    }

    return currentPos; // Return for next iteration
  }

  /**
   * Compute kinetic energy: KE = 0.5 * m * v²
   */
  getKineticEnergy() {
    return 0.5 * this.params.mass * this.state.velocity.magSq();
  }

  /**
   * Compute potential energy: PE = m * g * h
   * @param {number} gravity - Gravity magnitude (positive)
   * @param {number} referenceHeight - Reference height in meters (default 0 = ground)
   */
  getPotentialEnergy(gravity = 9.81, referenceHeight = 0) {
    // In Y-up coords: higher Y = more PE
    return (
      this.params.mass * gravity * (this.state.position.y - referenceHeight)
    );
  }

  /**
   * Compute momentum: p = m * v
   */
  getMomentum() {
    const Vector = this.p.constructor.Vector;
    return Vector.mult(this.state.velocity, this.params.mass);
  }

  /**
   * Compute bounds for collision detection (in physics coords)
   */
  computeBounds() {
    const pos = this.state.position;
    const size = this.params.size;

    if (this.params.shape === "circle") {
      return {
        type: "circle",
        center: pos.copy(),
        radius: size / 2,
      };
    } else {
      // Rectangle/square
      return {
        type: "rect",
        min: this.p.createVector(pos.x - size / 2, pos.y - size / 2),
        max: this.p.createVector(pos.x + size / 2, pos.y + size / 2),
      };
    }
  }

  /**
   * Check if point is within body (point in physics coords)
   */
  contains(point) {
    const Vector = this.p.constructor.Vector;

    if (this.bounds.type === "circle") {
      return Vector.dist(point, this.bounds.center) <= this.bounds.radius;
    } else {
      return (
        point.x >= this.bounds.min.x &&
        point.x <= this.bounds.max.x &&
        point.y >= this.bounds.min.y &&
        point.y <= this.bounds.max.y
      );
    }
  }

  /**
   * Check if mouse is hovering over body
   * Converts mouse position from screen coords to physics coords for comparison
   */
  checkHover(p, screenPos) {
    const mousePx = p.createVector(p.mouseX, p.mouseY);
    const sizePx = toPixels(this.params.size);

    if (this.params.shape === "circle") {
      this.isHovered =
        p.dist(screenPos.x, screenPos.y, mousePx.x, mousePx.y) <= sizePx / 2;
    } else {
      this.isHovered =
        mousePx.x >= screenPos.x - sizePx / 2 &&
        mousePx.x <= screenPos.x + sizePx / 2 &&
        mousePx.y >= screenPos.y - sizePx / 2 &&
        mousePx.y <= screenPos.y + sizePx / 2;
    }

    return this.isHovered;
  }

  /**
   * Constrain to boundaries (in physics coordinates, Y-up)
   */
  constrainToBounds(minX, maxX, minY, maxY) {
    let collided = false;

    // X bounds
    if (this.state.position.x < minX) {
      this.state.position.x = minX;
      this.state.velocity.x *= -this.params.restitution;
      collided = true;
    } else if (this.state.position.x > maxX) {
      this.state.position.x = maxX;
      this.state.velocity.x *= -this.params.restitution;
      collided = true;
    }

    // Y bounds (remember Y-up: minY=floor, maxY=ceiling)
    if (this.state.position.y < minY) {
      this.state.position.y = minY;
      this.state.velocity.y *= -this.params.restitution;
      collided = true;
    } else if (this.state.position.y > maxY) {
      this.state.position.y = maxY;
      this.state.velocity.y *= -this.params.restitution;
      collided = true;
    }

    return collided;
  }

  /**
   * Update trail points
   */
  updateTrail() {
    this.trail.points.push(this.state.position.copy());

    if (this.trail.points.length > this.trail.maxLength) {
      this.trail.points.shift();
    }
  }

  /**
   * Clear trail
   */
  clearTrail() {
    this.trail.points = [];
  }

  /**
   * Convert physics position to screen coordinates
   * This is where Y-up becomes Y-down for rendering
   */
  toScreenPosition() {
    return physicsToScreen(this.state.position, this.p);
  }

  /**
   * Draw the body
   * Converts from physics coords to screen coords for rendering
   */
  draw(p, options = {}) {
    const screenPos = this.toScreenPosition();
    const sizePx = toPixels(this.params.size);

    p.push();
    p.translate(screenPos.x, screenPos.y);
    p.rotate(this.state.rotation);

    // Hover effect
    if (this.isHovered && options.hoverEffect !== false) {
      p.drawingContext.shadowBlur = 20;
      p.drawingContext.shadowColor = this.params.color;
    }

    p.fill(this.params.color);
    p.noStroke();

    // Draw shape
    if (this.params.shape === "circle") {
      p.circle(0, 0, sizePx);
    } else {
      p.rectMode(p.CENTER);
      p.rect(0, 0, sizePx, sizePx);
    }

    p.drawingContext.shadowBlur = 0;
    p.pop();

    // Draw trail
    if (this.trail.enabled && this.trail.points.length > 1) {
      this.drawTrail(p);
    }

    return screenPos;
  }

  /**
   * Draw trail (converts physics coords to screen coords)
   */
  drawTrail(p) {
    p.push();
    p.noFill();

    for (let i = 1; i < this.trail.points.length; i++) {
      //const alpha = (i / this.trail.points.length) * this.trail.alpha;
      const prev = this.trail.points[i - 1];
      const curr = this.trail.points[i];

      const prevScreen = physicsToScreen(prev, this.p);
      const currScreen = physicsToScreen(curr, this.p);

      p.stroke(this.trail.color);
      p.strokeWeight(2);
      p.line(prevScreen.x, prevScreen.y, currScreen.x, currScreen.y);
    }

    p.pop();
  }

  /**
   * Update parameters
   */
  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
    this.bounds = this.computeBounds();
  }

  /**
   * Reset to initial state
   */
  reset(initialState = {}) {
    this.state = {
      position: initialState.position || this.p.createVector(0, 0),
      velocity: initialState.velocity || this.p.createVector(0, 0),
      acceleration: initialState.acceleration || this.p.createVector(0, 0),
      rotation: initialState.rotation || 0,
      angularVelocity: initialState.angularVelocity || 0,
      angularAcceleration: initialState.angularAcceleration || 0,
    };
    this.isMoving = false;
    this.clearTrail();
    this.bounds = this.computeBounds();
  }
}

export default PhysicsBody;
