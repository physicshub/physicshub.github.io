// app/(core)/physics/Spring.ts
// Nature of Code
// Daniel Shiffman
// Chapter 3: Oscillation
// Object to describe an anchor point that can connect to "Bob" objects via a spring
// Thank you: http://www.myphysicslab.com/spring2d.html
// Edited by: @mattqdev

import p5 from "p5";
import Bob from "./Bob";
import Body from "./Body";
import { SCALE } from "../constants/Config.js";

export default class Spring {
  private p: p5;
  anchor: p5.Vector;
  restLength: number;
  k: number;           // costante elastica N/m
  color: string;
  anchorColor: string;

  constructor(p: p5, x: number, y: number, length: number) {
    this.p = p;
    this.anchor = p.createVector(x, y);
    this.restLength = length;
    this.k = 100; // default
    this.color = "#000000";
    this.anchorColor = "#7f7f7f";
  }

  /** Collega un Bob (pixel) */
  connect(bob: Bob): void;
  /** Collega un Body (metri) */
  connect(body: Body): void;
  connect(obj: Bob | Body): void {
    if (obj instanceof Bob) {
      // Bob lavora in pixel
      let force = p5.Vector.sub(obj.pos, this.anchor);
      const currentLength = force.mag();
      const stretch = currentLength - this.restLength;
      force.setMag(-this.k * stretch);
      obj.applyForce(force);
    } else {
      // Body lavora in metri, convertiamo anchor in metri
      const anchorMeters = this.anchor.copy().div(SCALE);
      let force = p5.Vector.sub(obj.state.pos, anchorMeters);
      const currentLength = force.mag();
      const stretch = currentLength - this.restLength;
      force.setMag(-this.k * stretch);
      obj.applyForce(force);
    }
  }

  /** Limita la lunghezza della molla */
  constrainLength(bob: Bob, minlen: number, maxlen: number): void;
  constrainLength(body: Body, minlen: number, maxlen: number): void;
  constrainLength(obj: Bob | Body, minlen: number, maxlen: number): void {
    if (obj instanceof Bob) {
      let direction = p5.Vector.sub(obj.pos, this.anchor);
      const length = direction.mag();

      if (length < minlen) {
        direction.setMag(minlen);
        obj.pos = p5.Vector.add(this.anchor, direction);
        obj.vel.mult(0);
      } else if (length > maxlen) {
        direction.setMag(maxlen);
        obj.pos = p5.Vector.add(this.anchor, direction);
        obj.vel.mult(0);
      }
    } else {
      const anchorMeters = this.anchor.copy().div(SCALE);
      let direction = p5.Vector.sub(obj.state.pos, anchorMeters);
      const length = direction.mag();

      if (length < minlen) {
        direction.setMag(minlen);
        obj.state.pos = p5.Vector.add(anchorMeters, direction);
        obj.state.vel.mult(0);
      } else if (length > maxlen) {
        direction.setMag(maxlen);
        obj.state.pos = p5.Vector.add(anchorMeters, direction);
        obj.state.vel.mult(0);
      }
    }
  }

  /** Disegna il punto di ancoraggio */
  show(): void {
    this.p.fill(this.p.color(this.anchorColor));
    this.p.circle(this.anchor.x, this.anchor.y, 10);
  }

  /** Disegna la linea tra il corpo e l’ancora */
  showLine(bob: Bob): void;
  showLine(body: Body): void;
  showLine(obj: Bob | Body): void {
    if (obj instanceof Bob) {
      this.p.stroke(this.p.color(this.color));
      this.p.line(obj.pos.x, obj.pos.y, this.anchor.x, this.anchor.y);
    } else {
      const anchorMeters = this.anchor.copy().div(SCALE);
      this.p.stroke(this.p.color(this.color));
      this.p.line(
        obj.state.pos.x * SCALE,
        obj.state.pos.y * SCALE,
        this.anchor.x,
        this.anchor.y
      );
    }
  }
}
