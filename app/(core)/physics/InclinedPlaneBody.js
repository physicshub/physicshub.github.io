/**
 * InclinedPlaneBody - Specialized physics body for inclined plane simulations
 * Extends PhysicsBody with constraint-based motion along an inclined surface
 */

import PhysicsBody from "./PhysicsBody.js";
import { toPixels, toMeters } from "../constants/Utils.js";

export class InclinedPlaneBody extends PhysicsBody {
  constructor(p, params, initialPosAlongPlane = 0) {
    super(p, params);

    // Inclined plane specific state
    this.planeState = {
      posAlongPlane: initialPosAlongPlane, // meters along the incline
      velAlongPlane: 0, // velocity along the incline (m/s)
      accAlongPlane: 0, // acceleration along the incline (m/s²)
    };

    // Override base state to use plane coordinates
    this.useConstrainedMotion = true;
  }

  /**
   * Physics step constrained to plane
   */
  stepAlongPlane(dt, netForceParallel) {
    if (dt <= 0) return;

    // Calculate acceleration from net force
    this.planeState.accAlongPlane = netForceParallel / this.params.mass;

    // Update velocity
    this.planeState.velAlongPlane += this.planeState.accAlongPlane * dt;

    // Update position along plane
    this.planeState.posAlongPlane += this.planeState.velAlongPlane * dt;

    // Sync with base state for compatibility
    this.state.acceleration.set(this.planeState.accAlongPlane, 0);
    this.state.velocity.set(this.planeState.velAlongPlane, 0);

    // Update moving state
    this.isMoving = Math.abs(this.planeState.velAlongPlane) > 0.001;
  }

  /**
   * Get screen position from plane coordinates
   */
  getScreenPosition(planeStart, angleRad) {
    const distPx = toPixels(this.planeState.posAlongPlane);
    return {
      x: planeStart.x + distPx * Math.cos(angleRad),
      y: planeStart.y - distPx * Math.sin(angleRad),
    };
  }

  /**
   * Set position from screen coordinates (for dragging)
   */
  setPositionFromScreen(planeStart, angleRad, mouseX, mouseY) {
    const dx = mouseX - planeStart.x;
    const dy = mouseY - planeStart.y;

    // Project onto plane direction
    const projectedDist = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);

    this.planeState.posAlongPlane = toMeters(projectedDist);
    this.planeState.velAlongPlane = 0;
    this.planeState.accAlongPlane = 0;
  }

  /**
   * Constrain position to plane bounds
   */
  constrainToPlane(planeLength) {
    const size = this.params.size;
    const minPos = size / 2;
    const maxPos = planeLength - size / 2;

    let constrained = false;

    if (this.planeState.posAlongPlane < minPos) {
      this.planeState.posAlongPlane = minPos;
      this.planeState.velAlongPlane *= -this.params.restitution;
      constrained = true;
    } else if (this.planeState.posAlongPlane > maxPos) {
      this.planeState.posAlongPlane = maxPos;
      this.planeState.velAlongPlane *= -this.params.restitution;
      constrained = true;
    }

    return constrained;
  }

  /**
   * Check hover using screen position
   */
  checkHoverOnPlane(p, planeStart, angleRad) {
    const screenPos = this.getScreenPosition(planeStart, angleRad);
    const sizePx = toPixels(this.params.size);

    this.isHovered =
      p.dist(screenPos.x, screenPos.y, p.mouseX, p.mouseY) <= sizePx / 2;
    return this.isHovered;
  }

  /**
   * Draw body on inclined plane
   */
  drawOnPlane(p, planeStart, angleRad, options = {}) {
    const screenPos = this.getScreenPosition(planeStart, angleRad);
    const sizePx = toPixels(this.params.size);

    p.push();
    p.translate(screenPos.x, screenPos.y);

    // Rotate to align with plane (optional)
    if (options.alignToPlane !== false) {
      p.rotate(-angleRad);
    }

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

    // Draw trail on plane
    if (this.trail.enabled && this.trail.points.length > 1) {
      this.drawTrailOnPlane(p, planeStart, angleRad);
    }

    return screenPos;
  }

  /**
   * Draw trail along plane
   */
  drawTrailOnPlane(p, planeStart, angleRad) {
    p.push();
    p.noFill();

    for (let i = 1; i < this.trail.points.length; i++) {
      //const alpha = (i / this.trail.points.length) * this.trail.alpha;

      // Convert plane positions to screen coordinates
      const prevPx = toPixels(this.trail.points[i - 1].x);
      const currPx = toPixels(this.trail.points[i].x);

      const prevScreen = {
        x: planeStart.x + prevPx * Math.cos(angleRad),
        y: planeStart.y - prevPx * Math.sin(angleRad),
      };

      const currScreen = {
        x: planeStart.x + currPx * Math.cos(angleRad),
        y: planeStart.y - currPx * Math.sin(angleRad),
      };

      p.stroke(this.trail.color);
      p.strokeWeight(2);
      p.line(prevScreen.x, prevScreen.y, currScreen.x, currScreen.y);
    }

    p.pop();
  }

  /**
   * Update trail with plane position
   */
  updateTrailOnPlane() {
    this.trail.points.push({
      x: this.planeState.posAlongPlane,
      y: 0,
    });

    if (this.trail.points.length > this.trail.maxLength) {
      this.trail.points.shift();
    }
  }

  /**
   * Get kinetic energy
   */
  getKineticEnergy() {
    return (
      0.5 *
      this.params.mass *
      this.planeState.velAlongPlane *
      this.planeState.velAlongPlane
    );
  }

  /**
   * Get potential energy relative to horizontal base
   */
  getPotentialEnergy(gravity, angleRad) {
    const height = this.planeState.posAlongPlane * Math.sin(angleRad);
    return this.params.mass * gravity * height;
  }

  /**
   * Reset to initial state
   */
  reset(initialPosAlongPlane = 0) {
    this.planeState = {
      posAlongPlane: initialPosAlongPlane,
      velAlongPlane: 0,
      accAlongPlane: 0,
    };
    this.isMoving = false;
    this.clearTrail();
  }
}

export default InclinedPlaneBody;
