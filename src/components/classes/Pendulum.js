// src/components/classes/Pendulum.js
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// Edited by: @mattqdev

import { EARTH_G_SI, SCALE } from "../../constants/Config";

// Pendulum

// A Simple Pendulum Class

// This constructor could be improved to allow a greater variety of pendulums
export default class Pendulum {
   /**
   * @param {p5} p - Istanza di p5
   * @param {number} x - Posizione iniziale X
   * @param {number} y - Posizione iniziale Y
   * @param {number} r - Pendulum Radius
   */
  constructor(p, x, y, r) {
    this.p = p
    // Fill all variables
    this.pivot = p.createVector(x, y);
    this.bob = p.createVector();
    this.r = r;
    this.angle = p.PI / 4;

    this.angleVelocity = 0.0;
    this.angleAcceleration = 0.0;
    this.gravity = EARTH_G_SI; // Arbitrary constant
    this.damping = 1; // Arbitrary damping
    this.size = 24; // Arbitrary ball radius
    this.color = "#7f7f7f";
  }

  // Function to update position
  update() {
    const p = this.p;
    // As long as we aren't dragging the pendulum, let it swing!
    if (!this.dragging) {
      this.angleAcceleration = (-1 * this.gravity / this.r) * p.sin(this.angle);

      this.angleVelocity += this.angleAcceleration; // Increment velocity
      this.angle += this.angleVelocity; // Increment angle

      this.angleVelocity *= this.damping; // Apply some damping
    }
  }

  show() {
    const p = this.p;

    this.bob.set(this.r * p.sin(this.angle), this.r * p.cos(this.angle), 0); // Polar to cartesian conversion
    this.bob.add(this.pivot); // Make sure the position is relative to the pendulum's origin

    p.stroke(0);
    p.strokeWeight(2);
    // Draw the arm
    p.line(this.pivot.x, this.pivot.y, this.bob.x, this.bob.y);
    p.fill(this.color);
    // Draw the ball
    p.circle(this.bob.x, this.bob.y, this.size * 2);
  }

  // The methods below are for mouse interaction

  // This checks to see if we clicked on the pendulum ball
  clicked(mx, my) {
    const p = this.p;

    // ignora click fuori dal canvas
    if (mx < 0 || mx > p.width || my < 0 || my > p.height) {
      return;
    }

    const d = p.dist(mx, my, this.bob.x, this.bob.y);
    if (d < this.size) {
      this.dragging = true;
    }
  }


  // This tells us we are not longer clicking on the ball
  stopDragging() {
    this.angleVelocity = 0; // No velocity once you let go
    this.dragging = false;
  }

  drag() {
    const p = this.p;
    // If we are draging the ball, we calculate the angle between the
    // pendulum origin and mouse position
    // we assign that angle to the pendulum
    if (this.dragging) {
        let diff = this.p.createVector(
            this.pivot.x - p.mouseX,
            this.pivot.y - p.mouseY
        ); // Difference between 2 points 
      this.angle = p.atan2(-1 * diff.y, diff.x) - p.radians(90); // Angle relative to vertical axis
    }
  }
}
