// app/components/classes/Spring.js
// Nature of Code
// Daniel Shiffman
// Chapter 3: Oscillation
// Object to describe an anchor point that can connect to "Bob" objects via a spring
// Thank you: http://www.myphysicslab.com/spring2d.html
// Edited by: @mattqdev

export default class Spring {
  constructor(p, x, y, length) {
    this.p = p;
    this.anchor = p.createVector(x, y);
    this.restLength = length;
    this.k = 100; // N/m default
    this.color = "#000000";
    this.anchorColor = "#7f7f7f";
  }

  connect(bob) {
    const p = this.p;
    let force = p.constructor.Vector.sub(bob.pos, this.anchor);
    const currentLength = force.mag();
    const stretch = currentLength - this.restLength;
    force.setMag(-this.k * stretch);
    bob.applyForce(force);
  }

  constrainLength(bob, minlen, maxlen) {
    const p = this.p;
    let direction = p.constructor.Vector.sub(bob.pos, this.anchor);
    const length = direction.mag();

    if (length < minlen) {
      direction.setMag(minlen);
      bob.pos = p.constructor.Vector.add(this.anchor, direction);
      bob.vel.mult(0);
    } else if (length > maxlen) {
      direction.setMag(maxlen);
      bob.pos = p.constructor.Vector.add(this.anchor, direction);
      bob.vel.mult(0);
    }
  }

  show() {
    const p = this.p;
    p.fill(p.color(this.anchorColor));
    p.circle(this.anchor.x, this.anchor.y, 10);
  }

  showLine(bob) {
    const p = this.p;
    p.stroke(p.color(this.color));
    p.line(bob.pos.x, bob.pos.y, this.anchor.x, this.anchor.y);
  }
}
