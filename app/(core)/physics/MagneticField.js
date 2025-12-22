import { toMeters, toPixels } from "../constants/Utils.js";
import { integrate } from "../constants/Utils.js";
import { SCALE } from "../constants/Config.js";

// Magnetic rod (dipole) + optional test particle helper.
// The module exposes `MagneticRod` (field lines rendering) and `MagneticParticle` (optional charged particle).

const MU0_OVER_4PI = 1e-7; // μ0/(4π) in SI

export class MagneticRod {
  constructor(p, x = 0, y = 0, length = 1, angleDeg = 0, moment = 1) {
    this.p = p;
    this.pos = p.createVector(x, y); // world meters
    this.length = length; // meters
    this.angle = (angleDeg * Math.PI) / 180; // radians
    this.moment = moment; // dipole moment magnitude (A·m^2)
    this.color = "#ffcc00";
    this.isDragging = false;
    this.dragOffset = p.createVector(0, 0);
  }

  setAngleDeg(angleDeg) {
    this.angle = (angleDeg * Math.PI) / 180;
  }

  // Dipole moment vector (world units)
  mVector() {
    return this.p.createVector(Math.cos(this.angle), -Math.sin(this.angle)).mult(this.moment);
  }

  // Magnetic field B at world point r (p5.Vector, meters) for a dipole at this.pos.
  // Uses B(r) = μ0/4π * [ (3 r̂ (m·r̂) - m) / r^3 ]
  B_at(rWorld) {
    const r = rWorld.copy().sub(this.pos);
    const rMag = Math.max(r.mag(), 1e-6);
    const rHat = r.copy().div(rMag);
    const m = this.mVector();

    const mDotR = m.x * rHat.x + m.y * rHat.y; // scalar

    // 3 r̂ (m·r̂)
    const term1 = rHat.copy().mult(3 * mDotR);
    const vec = term1.sub(m);
    const scale = MU0_OVER_4PI / Math.pow(rMag, 3);
    return vec.mult(scale);
  }

  // Draw rod and optionally draw a small marker for north/south
  draw(renderer) {
    const r = renderer || this.p;
    const px = toPixels(this.pos.x);
    const py = toPixels(this.pos.y);
    const halfPx = toPixels(this.length / 2);

    r.push();
    r.stroke(200);
    r.strokeWeight(4);
    r.translate(px, py);
    r.rotate(-this.angle);
    r.line(-halfPx, 0, halfPx, 0);
    // arrowheads for moment direction
    r.noStroke();
    r.fill("#ff4444");
    r.triangle(halfPx, 0, halfPx - 8, -6, halfPx - 8, 6);
    r.fill("#4444ff");
    r.circle(-halfPx + 6, 0, 8);
    r.pop();
  }

  // Streamline tracing: returns array of pixel positions tracing the field starting at seed (world meters)
  traceField(seedWorld, step = 0.02, maxSteps = 1000) {
    const pts = [];
    let pos = seedWorld.copy();
    for (let i = 0; i < maxSteps; i++) {
      const B = this.B_at(pos);
      const bMag = Math.sqrt(B.x * B.x + B.y * B.y) + 1e-12;
      // direction of B (field lines follow B)
      const dir = B.copy().div(bMag);
      // advance along field
      pos = pos.copy().add(dir.mult(step));
      pts.push(pos.copy());
      // stop if too far
      if (pos.copy().sub(this.pos).mag() > 10 * Math.max(this.length, 1)) break;
    }
    return pts;
  }
}

// Optional charged particle for demonstration of Lorentz force
export class MagneticParticle {
  constructor(p, x = 0, y = 0, mass = 1, charge = 1) {
    this.p = p;
    this.charge = charge;
    this.mass = mass;
    this.radius = 0.08;
    this.state = {
      pos: p.createVector(x, y),
      vel: p.createVector(0, 0),
      acc: p.createVector(0, 0),
    };
    this.isDragging = false;
    this.dragOffset = p.createVector(0, 0);
    this.color = "#ff7f50";
  }

  applyLorentz(Bvec) {
    // In 2D, v x B (with B in-plane vector) -> use 3D cross via scalar Bz if necessary.
    // Here Bvec is a vector in-plane; assume B has only in-plane components from dipole.
    // Force = q (v × B) -> compute as 2D cross: F = q*(v_x * B_y - v_y * B_x) out-of-plane
    // To keep particle in plane, approximate using perpendicular acceleration a = (q/m) * (v ⨯ B)_z rotated back.
    const v = this.state.vel;
    // Compute pseudo-acc: a = (q/m) * (v × B) rotated 90° -> aVec = (q/m) * (v.y*Bz, -v.x*Bz) but Bz unknown.
    // Simpler: approximate with a = (q/m) * (v ⨯ B_scalar) where B_scalar = (B.x * nx + B.y * ny)
    // For visualization we use (q/m) * (v ⨯ B_perp) where B_perp = scalar perpendicular magnitude
    const Bz = 0; // dipole field is in-plane; full Lorentz would need 3D. Use small placeholder to allow curved motion.
    const ax = (this.charge / this.mass) * (v.y * Bz);
    const ay = (this.charge / this.mass) * (-v.x * Bz);
    this.state.acc.add(this.p.createVector(ax, ay));
  }

  update(dt) {
    if (!dt) return;
    const res = integrate(this.state.pos, this.state.vel, this.state.acc, dt);
    this.state.pos = res.pos;
    this.state.vel = res.vel;
    this.state.acc.mult(0);
  }

  clicked(mx, my) {
    const mxM = toMeters(mx);
    const myM = toMeters(my);
    const d = this.p.dist(mxM, myM, this.state.pos.x, this.state.pos.y);
    if (d <= this.radius) {
      this.isDragging = true;
      this.dragOffset.set(this.state.pos.x - mxM, this.state.pos.y - myM);
      return true;
    }
    return false;
  }

  drag(mx, my) {
    if (!this.isDragging) return;
    const mxM = toMeters(mx);
    const myM = toMeters(my);
    this.state.pos.set(mxM + this.dragOffset.x, myM + this.dragOffset.y);
    this.state.vel.set(0, 0);
  }

  stopDragging() {
    this.isDragging = false;
  }

  show(renderer) {
    const r = renderer || this.p;
    const px = toPixels(this.state.pos.x);
    const py = toPixels(this.state.pos.y);
    const pr = toPixels(this.radius);
    r.push();
    r.noStroke();
    r.fill(this.color || "#ff7f50");
    r.circle(px, py, pr * 2);
    r.pop();
  }
}

export default MagneticRod;
