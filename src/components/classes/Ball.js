export default class Ball {
  /**
   * @param {p5} p - Istanza p5
   * @param {Object} cfg - Configurazione iniziale
   * @param {number} w - Larghezza canvas
   * @param {number} h - Altezza canvas
   * @param {string} mode - "gravity" o "acceleration"
   */
  constructor(p, cfg, w, h, mode = "gravity") {
    this.p = p;
    this.mode = mode; // tipo di simulazione
    this.setConfig(cfg);
    this.w = w;
    this.h = h;

    this.pos = p.createVector(w / 2, cfg.size / 2);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
  }

  applyForce(f) {
    const force = f.copy().div(this.mass || 1);
    this.acc.add(force);
  }

  update(target = null) {
    const p = this.p;
    const { size, color } = this.cfg;

    if (this.mode === "gravity") {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // collisioni
      if (this.pos.x < 0 || this.pos.x > this.w) {
        this.vel.x *= -1;
        this.pos.x = p.constrain(this.pos.x, 0, this.w);
      }
      if (this.pos.y > this.h) {
        this.vel.y *= -1;
        this.pos.y = this.h;
      }
    }

    if (this.mode === "acceleration" && target) {
      const { maxspeed, acceleration } = this.cfg;
      let dir = p.createVector(target.x, target.y).sub(this.pos);
      dir.setMag(acceleration);
      this.acc = dir;
      this.vel.add(this.acc);
      this.vel.limit(maxspeed);
      this.pos.add(this.vel);
    }

    // disegno palla
    p.stroke(0);
    p.strokeWeight(2);
    p.fill(p.color(color));
    p.ellipse(this.pos.x, this.pos.y, size);
  }

  contactEdge() {
    return this.pos.y + this.cfg.size / 2 >= this.h;
  }

  reset(newW, newH) {
    this.w = newW;
    this.h = newH;
    const { size } = this.cfg;
    this.pos = this.p.createVector(this.w / 2, size / 2);
    this.vel.mult(0);
    this.acc.mult(0);
  }

  resetPosition() {
    this.pos = this.p.createVector(this.w / 2, this.h / 2);
    this.vel.mult(0);
    this.acc.mult(0);
  }

  setConfig(cfg) {
    this.cfg = { ...cfg };
    if (cfg.mass) this.mass = cfg.mass;
  }
}
