export default class Ball {
  /**
   * @param {p5} p - Istanza p5
   * @param {Object} cfg - Configurazione iniziale
   * @param {number} w - Larghezza canvas
   * @param {number} h - Altezza canvas
   */
  constructor(p, cfg, w, h) {
    this.p = p;
    this.setConfig(cfg);
    this.w = w;
    this.h = h;

    // Stato dinamico
    this.pos = p.createVector(w / 2, cfg.size / 2);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);

    // Coefficiente di restituzione per i rimbalzi (0 = inelastico, 1 = elastico)
    this.restitution = 1;
  }

  /**
   * Applica una forza in Newton (N).
   * F = m * a  →  a = F / m
   */
  applyForce(forceVec) {
    const f = forceVec.copy().div(this.mass);
    this.acc.add(f);
  }

  /**
   * Applica un’accelerazione diretta (es. gravità), indipendente dalla massa.
   */
  applyAcceleration(accVec) {
    this.acc.add(accVec);
  }

  update() {
    const p = this.p;
    const { size, color } = this.cfg;

    // Integrazione di Eulero
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Collisioni con i bordi
    if (this.pos.x - size / 2 < 0) {
      this.pos.x = size / 2;
      this.vel.x *= -this.restitution;
    }
    if (this.pos.x + size / 2 > this.w) {
      this.pos.x = this.w - size / 2;
      this.vel.x *= -this.restitution;
    }
    if (this.pos.y + size / 2 > this.h) {
      this.pos.y = this.h - size / 2;
      this.vel.y *= -this.restitution;
    }

    // Disegno
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
    if (cfg.mass) this.mass = cfg.mass; // in kg
  }
}
