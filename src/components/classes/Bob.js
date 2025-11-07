// src/components/classes/Bob.js
// Bob object, just like our regular Mover (location, velocity, acceleration, mass)
// Edited by: @mattqdev
import { adjustColor } from "../../utils/adjustColor";

export default class Bob {
  constructor(p, x, y) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector();
    this.acceleration = p.createVector();

    // Parametri fisici con default
    this.mass = 1;       // kg
    this.damping = 0.99; // fattore di smorzamento
    this.size = 20;      // px
    this.color = "#7f7f7f";

    this.dragOffset = p.createVector();
    this.dragging = false;
    this.dampingMode = "factor"; // "factor" (0..1) oppure "rate"
  }

  update() {
    const p = this.p;
    const dt = p.deltaTime / 1000;

    // v += a * dt
    this.vel.add(this.acceleration.copy().mult(dt));

    // damping
    if (this.dampingMode === "factor") {
      const fpsBase = 60;
      const factorPerSecond = Math.pow(this.damping, fpsBase);
      const factorThisStep = Math.pow(factorPerSecond, dt);
      this.vel.mult(factorThisStep);
    }/*  else if (this.dampingMode === "rate") {
      const factorThisStep = Math.exp(-this.damping * dt);
      this.vel.mult(factorThisStep);
    } */

    // x += v * dt
    this.pos.add(this.vel.copy().mult(dt));

    // reset a
    this.acceleration.mult(0);
  }

  applyForce(force) {
    const a = force.copy().div(this.mass);
    this.acceleration.add(a);
  }

  show() {
    const p = this.p;
    p.stroke(0);
    p.strokeWeight(2);
    p.fill(this.dragging ? p.color(adjustColor(this.color, 0.7)) : p.color(this.color));
    p.circle(this.pos.x, this.pos.y, this.size);
  }

  handleClick(mx, my) {
    const p = this.p;
    const d = p.dist(mx, my, this.pos.x, this.pos.y);
    if (d < this.size / 2) {
      this.dragging = true;
      this.dragOffset.set(this.pos.x - mx, this.pos.y - my);
    }
  }

  stopDragging() {
    this.dragging = false;
  }

  handleDrag(mx, my) {
    if (this.dragging) {
      this.pos.set(mx + this.dragOffset.x, my + this.dragOffset.y);
      this.vel.mult(0); // stabilità
    }
  }
}

