import { toMeters, toPixels } from "../constants/Utils.js";
import { integrate } from "../constants/Utils.js";

// Scale factor mapping drag displacement (meters) -> launch speed (m/s).
const LAUNCH_VELOCITY_SCALE = 10;

// Magnetic particle under uniform B field (out-of-plane). Units: meters, seconds, tesla, coulomb
export default class MagneticParticle {
  constructor(p, originX = 0, originY = 0, mass = 1) {
    this.p = p;
    this.mass = mass;
    this.charge = 1; // coulomb

    this.radius = 0.1; // meters
    this.color = "#ff7f50";

    this.origin = p.createVector(originX, originY);

    this.state = {
      pos: p.createVector(originX + this.radius, originY),
      vel: p.createVector(0, 0),
      acc: p.createVector(0, 0),
    };

    this.isDragging = false;
    this.dragOffset = p.createVector(0, 0);
  }

  launch(velocity, angleDeg) {
    const theta = (angleDeg * Math.PI) / 180;
    this.state.vel.set(velocity * Math.cos(theta), -velocity * Math.sin(theta));
    this.isDragging = false;
  }

  stop() {
    this.state.vel.set(0, 0);
    this.state.acc.set(0, 0);
  }

  // Apply Lorentz acceleration given Bz (tesla): a = (q/m) * (v x B)
  applyMagneticField(Bz) {
    const v = this.state.vel;
    // v x B where B = (0,0,Bz) -> (vy*Bz, -vx*Bz)
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

  // Convert current origin->pos vector to a launch vector (magnitude ~ pixels->m mapping)
  getLaunchVector(originX, originY) {
    const vx = this.state.pos.x - originX;
    const vy = originY - this.state.pos.y; // upward positive
    return this.p.createVector(vx, vy).mult(LAUNCH_VELOCITY_SCALE);
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
