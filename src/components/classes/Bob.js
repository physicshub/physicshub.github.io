// Bob object, just like our regular Mover (location, velocity, acceleration, mass)
// Edited by: @mattqdev

import { adjustColor } from "../../utils/adjustColor";

export default class Bob {
  /**
   * @param {p5} p - Istanza di p5
   * @param {number} x - Posizione iniziale X
   * @param {number} y - Posizione iniziale Y
   */
  constructor(p, x, y) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector();
    this.acceleration = p.createVector();
    this.mass = 24;
    // Arbitrary damping to simulate friction / drag
    this.damping = 0.98;
    // For user interaction
    this.dragOffset = p.createVector();
    this.dragging = false;
    this.size;
    this.color;
  }

  // Standard Euler integration
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.mult(this.damping);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  // Newton's law: F = M * A
  applyForce(force) {
    const f = force.copy().div(this.mass);
    this.acceleration.add(f);
  }

  // Disegna il bob
  show() {
    const p = this.p;

    p.stroke(0);
    p.strokeWeight(2);
    p.fill(p.color(this.color));
    if (this.dragging) {
      p.fill(p.color(adjustColor(this.color, 0.7)));
    }
    p.circle(this.position.x, this.position.y, this.size);
  }

  handleClick(mx, my) {
    const p = this.p;
    
    let d = p.dist(mx, my, this.position.x, this.position.y);
    if (d < this.mass) {
      this.dragging = true;
      this.dragOffset.x = this.position.x - mx;
      this.dragOffset.y = this.position.y - my;
    }
  }

  stopDragging() {
    this.dragging = false;
  }

  handleDrag(mx, my) {
    if (this.dragging) {
      this.position.x = mx + this.dragOffset.x;
      this.position.y = my + this.dragOffset.y;
    }
  }
}
