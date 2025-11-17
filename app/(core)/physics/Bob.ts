// app/(core)/physics/Bob.ts
// Bob object, just like our regular Mover (location, velocity, acceleration, mass)
// Edited by: @mattqdev

import type p5 from "p5";
import { adjustColor } from "../utils/adjustColor";

export type DampingMode = "factor" | "rate";

export default class Bob {
  private p: p5;
  pos: p5.Vector;
  vel: p5.Vector;
  acceleration: p5.Vector;

  mass: number;        // kg
  damping: number;     // fattore di smorzamento
  size: number;        // diametro in px
  color: string;

  dragOffset: p5.Vector;
  dragging: boolean;
  dampingMode: DampingMode;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector();
    this.acceleration = p.createVector();

    // Parametri fisici di default
    this.mass = 1;
    this.damping = 0.99;
    this.size = 20;
    this.color = "#7f7f7f";

    this.dragOffset = p.createVector();
    this.dragging = false;
    this.dampingMode = "factor";
  }

  /** Aggiorna stato fisico con integrazione */
  update(dt: number): void {
    // v += a * dt
    this.vel.add(this.acceleration.copy().mult(dt));

    // damping
    if (this.dampingMode === "factor") {
      const fpsBase = 60;
      const factorPerSecond = Math.pow(this.damping, fpsBase);
      const factorThisStep = Math.pow(factorPerSecond, dt);
      this.vel.mult(factorThisStep);
    } else if (this.dampingMode === "rate") {
      const factorThisStep = Math.exp(-this.damping * dt);
      this.vel.mult(factorThisStep);
    }

    // x += v * dt
    this.pos.add(this.vel.copy().mult(dt));

    // reset accelerazione
    this.acceleration.mult(0);
  }

  /** Applica una forza esterna */
  applyForce(force: p5.Vector): void {
    const a = force.copy().div(this.mass);
    this.acceleration.add(a);
  }

  /** Disegna il corpo */
  show(): void {
    const p = this.p;
    p.stroke(0);
    p.strokeWeight(2);
    const fillColor = this.dragging
      ? p.color(adjustColor(this.color, 0.7))
      : p.color(this.color);
    p.fill(fillColor);
    p.circle(this.pos.x, this.pos.y, this.size);
  }

  /** Gestione click per drag */
  handleClick(mx: number, my: number): void {
    const p = this.p;
    const d = p.dist(mx, my, this.pos.x, this.pos.y);
    if (d < this.size / 2) {
      this.dragging = true;
      this.dragOffset.set(this.pos.x - mx, this.pos.y - my);
    }
  }

  stopDragging(): void {
    this.dragging = false;
  }

  /** Gestione drag */
  handleDrag(mx: number, my: number): void {
    if (this.dragging) {
      this.pos.set(mx + this.dragOffset.x, my + this.dragOffset.y);
      this.vel.mult(0); // stabilità
    }
  }
}
