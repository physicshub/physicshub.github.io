// Nature of Code
// Daniel Shiffman
// Chapter 3: Oscillation
// Object to describe an anchor point that can connect to "Bob" objects via a spring
// Thank you: http://www.myphysicslab.com/spring2d.html
// Edited by: @mattqdev

export default class Spring {
  /**
   * @param {p5} p - Istanza di p5
   * @param {number} x - Posizione iniziale X dell'ancora
   * @param {number} y - Posizione iniziale Y dell'ancora
   * @param {number} length - Lunghezza a riposo della molla
   */
  constructor(p, x, y, length) {
    this.p = p;
    this.anchor = p.createVector(x, y);
    this.restLength = length;
    this.k = 0.2; // costante elastica
    this.color
    this.anchorColor
  }

  // Calcola e applica la forza della molla
  connect(bob) {
    const p = this.p;
    let force = p.constructor.Vector.sub(bob.position, this.anchor);
    const currentLength = force.mag();
    const stretch = currentLength - this.restLength;
    force.setMag(-1 * this.k * stretch);
    bob.applyForce(force);
  }

  constrainLength(bob, minlen, maxlen) {
    const p = this.p;
    let direction = p.constructor.Vector.sub(bob.position, this.anchor);
    const length = direction.mag();

    if (length < minlen) {
      direction.setMag(minlen);
      bob.position = p.constructor.Vector.add(this.anchor, direction);
      bob.velocity.mult(0);
    } else if (length > maxlen) {
      direction.setMag(maxlen);
      bob.position = p.constructor.Vector.add(this.anchor, direction);
      bob.velocity.mult(0);
    }
  }


  // Disegna il punto di ancoraggio
  show() {
    const p = this.p;
    p.fill(p.color(this.anchorColor));
    p.circle(this.anchor.x, this.anchor.y, 10);
  }

  // Disegna la linea della molla tra bob e ancora
  showLine(bob) {
    const p = this.p;
    p.stroke(p.color(this.color));
    p.line(bob.position.x, bob.position.y, this.anchor.x, this.anchor.y);
  }
}
