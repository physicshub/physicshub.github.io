import type p5 from "p5";
import { integrate, collideBoundary, toMeters, toPixels } from "../constants/Utils.js";
import { EARTH_G_SI } from "../constants/Config.js";

export interface BodyParams {
  mass: number;          // kg
  size: number;          // diametro in metri
  color?: string;        // colore di rendering
  gravity?: number;      // accelerazione verticale (m/s^2)
  restitution?: number;  // coefficiente di rimbalzo [0-1]
  frictionMu: number;    // coefficiente di attrito dinamico
}

export interface BodyState {
  pos: p5.Vector;        // posizione in metri
  vel: p5.Vector;        // velocità in m/s
  acc: p5.Vector;        // accelerazione in m/s^2
}

export default class Body {
  params: BodyParams;
  state: BodyState;

  constructor(p: p5, params: BodyParams, initialPos?: p5.Vector) {
    this.params = {
      mass: params.mass,
      size: params.size,
      color: params.color ?? "steelblue",
      gravity: params.gravity ?? EARTH_G_SI,
      restitution: params.restitution ?? 1,
      frictionMu: params.frictionMu ?? 0,
    };

    this.state = {
      pos: initialPos ?? p.createVector(0, 0),
      vel: p.createVector(0, 0),
      acc: p.createVector(0, 0),
    };
  }

  /** Aggiorna la fisica del corpo */
  step(p: p5, dt: number, externalAcc?: p5.Vector) {
    const createVector = (...args: Parameters<p5["createVector"]>) => p.createVector(...args);
    const { pos, vel, acc } = this.state;
    const { gravity, size, restitution, frictionMu } = this.params;
    const radius = size / 2;

    // Controlla che siano numeri e che dt sia positivo
    if (typeof gravity === 'undefined' || typeof restitution === 'undefined' || dt <= 0) {
      console.warn('[Body.step] Invalid parameters:', { gravity, restitution, dt });
      return;
    }

    // Accelerazione base (gravità)
    let totalAcc = acc.copy().add(createVector(0, gravity));

    // Accelerazione esterna (vento, mouse, ecc.)
    if (externalAcc) totalAcc.add(externalAcc);

    // Attrito dinamico se a contatto col suolo
    const bottomM = toMeters(p.height);
    const onGround = pos.y + radius >= bottomM - 1e-9;
    if (onGround && vel.mag() > 0.01 && frictionMu > 0) {
      const fricMag = Math.min(frictionMu * gravity, vel.mag() / dt);
      const fric = vel.copy().normalize().mult(-fricMag);
      totalAcc.add(fric);
    }

    // Integrazione del moto
    const newState = integrate(pos, vel, totalAcc, dt);

    // ⚡ FIX CRITICO: Collisione con i bordi (rimuovo console.log!)
    const collided = collideBoundary(
      newState.pos,
      newState.vel,
      { w: toMeters(p.width), h: toMeters(p.height) },
      radius,
      restitution
    );

    this.state.pos = collided.pos;
    this.state.vel = collided.vel;

    // ⚡ FIX: Smorzamento velocità sotto soglia per stabilizzare
    if (this.state.vel.mag() < 0.001) {
      this.state.vel.mult(0);
    }

    // Reset accelerazione accumulata
    this.state.acc.mult(0);
  }

  /** Applica una forza esterna */
  applyForce(force: p5.Vector) {
    const a = force.copy().div(this.params.mass);
    this.state.acc.add(a);
  }

  /** Disegna il corpo */
  draw(p: p5) {
    const { pos } = this.state;
    const { size, color } = this.params;
    p.fill(color!);
    p.noStroke();
    p.circle(toPixels(pos.x), toPixels(pos.y), toPixels(size));
  }

  /** Reset posizione/velocità */
  reset(p: p5, pos?: p5.Vector) {
    this.state.pos = pos ?? p.createVector(0, 0);
    this.state.vel.set(0, 0);
    this.state.acc.set(0, 0);
  }

  /** Hover detection (mouse sopra il corpo) */
  isHover(p: p5) {
    const { pos } = this.state;
    const { size } = this.params;
    const pixelX = toPixels(pos.x);
    const pixelY = toPixels(pos.y);
    const radiusPx = toPixels(size / 2);
    return p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radiusPx;
  }
}