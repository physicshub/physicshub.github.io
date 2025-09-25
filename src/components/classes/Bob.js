// Bob object, just like our regular Mover (location, velocity, acceleration, mass)
// Edited by: @mattqdev
import { adjustColor } from "../../utils/adjustColor";

export default class Bob {
  constructor(p, x, y) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector();
    this.acceleration = p.createVector();
    this.mass;      // kg
    this.damping;   // damping per-second (es. 1.5 s^-1) oppure fattore base per 60 FPS
    this.dragOffset = p.createVector();
    this.dragging = false;
    this.size;      // px
    this.color;
    this.dampingMode = "factor"; // "factor" (compatibile con 0..1) oppure "rate"
  }

  // v += a * dt; x += v * dt; damping framerate-independent
  update() {
    const p = this.p;
    const dt = p.deltaTime / 1000; // seconds

    // Velocity update
    const a_dt = this.acceleration.copy().mult(dt);
    this.velocity.add(a_dt);

    // Damping
    if (this.dampingMode === "factor") {
      // Interpreta this.damping come fattore per 60 FPS (es. 0.98)
      const fpsBase = 60;
      const factorPerSecond = Math.pow(this.damping, fpsBase); // factor^60 ≈ per-second
      const factorThisStep = Math.pow(factorPerSecond, dt);    // factor^(dt*1s)
      this.velocity.mult(factorThisStep);
    } else if (this.dampingMode === "rate") {
      // Interpreta this.damping come coefficiente di decadimento per-second (s^-1)
      const factorThisStep = Math.exp(-this.damping * dt);
      this.velocity.mult(factorThisStep);
    }

    // Position update
    const v_dt = this.velocity.copy().mult(dt);
    this.position.add(v_dt);

    // Reset acceleration
    this.acceleration.mult(0);
  }

  // F = m * a -> a = F / m (F in N/pixel, m in kg, accel in px/s²)
  applyForce(force) {
    const f = force.copy().div(this.mass);
    this.acceleration.add(f);
  }

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
    const d = p.dist(mx, my, this.position.x, this.position.y);
    // Usa il raggio grafico, NON la massa
    if (d < this.size / 2) {
      this.dragging = true;
      this.dragOffset.x = this.position.x - mx;
      this.dragOffset.y = my - this.position.y; // mantieni verso y coerente
    }
  }

  stopDragging() { this.dragging = false; }

  handleDrag(mx, my) {
    if (this.dragging) {
      this.position.x = mx + this.dragOffset.x;
      this.position.y = my - this.dragOffset.y;
      // opzionale: azzera velocità durante drag per stabilità
      this.velocity.mult(0);
    }
  }
}
