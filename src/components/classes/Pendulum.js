// src/components/classes/Pendulum.js
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// Edited by: @mattqdev

import { EARTH_G_SI, SCALE } from "../../constants/Config";

// A Simple Pendulum Class
export default class Pendulum {
  /**
   * @param {p5} p - Istanza di p5
   * @param {number} x - Posizione iniziale X (pivot)
   * @param {number} y - Posizione iniziale Y (pivot)
   * @param {number} r - Lunghezza del pendolo in pixel
   */
  constructor(p, x, y, r) {
    this.p = p;
    this.pivot = p.createVector(x, y);
    this.r = r;

    this.angle = p.PI / 4; // angolo iniziale
    this.angleVelocity = 0.0;
    this.angleAcceleration = 0.0;

    this.gravity = EARTH_G_SI;
    this.damping = 1; // coefficiente di smorzamento
    this.size = 24;   // raggio bob in pixel
    this.color = "#7f7f7f";

    this.dragging = false;
  }

  /**
   * Calcola la posizione corrente del bob in pixel
   */
  getBobPosition() {
    const p = this.p;
    const x = this.pivot.x + this.r * p.sin(this.angle);
    const y = this.pivot.y + this.r * p.cos(this.angle);
    return { x, y };
  }

  /**
   * Aggiorna la dinamica del pendolo (solo se non in drag)
   */
  update() {
    const p = this.p;
    if (!this.dragging) {
      this.angleAcceleration = (-1 * this.gravity / this.r) * p.sin(this.angle);
      this.angleVelocity += this.angleAcceleration;
      this.angle += this.angleVelocity;
      this.angleVelocity *= this.damping;
    }
  }

  /**
   * Disegna il pendolo (asta + bob)
   */
  show() {
    const p = this.p;
    const { x, y } = this.getBobPosition();

    p.stroke(0);
    p.strokeWeight(2);
    p.line(this.pivot.x, this.pivot.y, x, y);

    p.fill(this.color);
    p.circle(x, y, this.size * 2);
  }

  /**
   * Controlla se il click è avvenuto vicino al bob
   */
  clicked(mx, my) {
    const p = this.p;
    if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;

    const { x, y } = this.getBobPosition();
    const d = p.dist(mx, my, x, y);
    if (d <= this.size) {
      this.dragging = true;
      this.angleVelocity = 0; // evita jitter durante il drag
    }
  }

  /**
   * Ferma il drag (solo se era attivo)
   */
  stopDragging() {
    if (this.dragging) {
      this.angleVelocity = 0;
      this.dragging = false;
    }
  }

  /**
   * Aggiorna l'angolo in base alla posizione del mouse durante il drag
   */
  drag() {
    if (this.dragging) {
      const p = this.p;
      const diff = p.createVector(this.pivot.x - p.mouseX, this.pivot.y - p.mouseY);
      this.angle = p.atan2(-diff.y, diff.x) - p.radians(90);
    }
  }
}