"use client";

import {
  createSimulation,
  Constant,
  Bounds,
} from "../app/(core)/engine/index.js";
import { adjustColor } from "../app/(core)/utils/adjustColor.ts";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
} from "../app/(core)/data/configs/VectorsOperations.js";

/** Radius of the optional test body, in metres. */
const PROBE_RADIUS = 0.2;

/**
 * Vector operations.
 *
 * Mostly a geometry lesson drawn in pixel space — addition by the triangle and
 * parallelogram rules, subtraction, scaling, normalisation, dot and cross
 * products. The optional physics probe turns the two vectors into actual forces
 * so the abstract arithmetic has a visible consequence.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper: mapSimInfo },

  build({ world, p, inputs, bounds }) {
    const probe = world.addBody({
      label: "probe",
      // Density chosen so the disc has the requested mass.
      mass: () => inputs.massKg,
      size: PROBE_RADIUS * 2,
      color: () => adjustColor(inputs.strokeColor),
      visible: () => inputs.physicsEnabled,
      draggable: false,
      restitution: 0.2,
      at: [bounds.width / 2, bounds.height / 2],
    });

    world.add(
      // A and B, expressed as forces. `pxPerNewton` is the conversion the user
      // controls: it says how many screen pixels of arrow are worth one newton.
      Constant({
        enabled: () => inputs.physicsEnabled,
        x: () => vectorForces(p, inputs).total.x,
        y: () => vectorForces(p, inputs).total.y,
        bodies: probe,
      }),
      Bounds({ restitution: 0.2, enabled: () => inputs.physicsEnabled })
    );

    return { probe };
  },

  draw({ p, inputs }) {
    drawOperation(p, inputs);
    drawAxisProjections(p);
  },

  info: ({ p, inputs }) => ({ state: { p, inputs }, context: {} }),
});

// -----------------------------------------------------------------------------
// Vectors
// -----------------------------------------------------------------------------

/** Screen-space centre of the canvas, the shared origin of both vectors. */
const centreOf = (p) => ({ x: p.width / 2, y: p.height / 2 });

/** Vector A, fixed by the inputs; screen pixels, Y-down. */
function vectorA(inputs) {
  const magnitude = inputs.vectorAMag ?? 150;
  const angle = ((inputs.vectorAAngle ?? 30) * Math.PI) / 180;
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

/** Vector B, from the canvas centre to the pointer. */
function vectorB(p) {
  const centre = centreOf(p);
  return { x: p.mouseX - centre.x, y: p.mouseY - centre.y };
}

/**
 * The two vectors converted into forces on the probe, in newtons.
 * Y is negated because the drawing is Y-down and physics is Y-up.
 */
function vectorForces(p, inputs) {
  const perNewton = Math.max(1, inputs.pxPerNewton);
  const centre = centreOf(p);

  let A = { x: centre.x / perNewton, y: centre.y / perNewton };
  let B = { x: vectorB(p).x / perNewton, y: vectorB(p).y / perNewton };

  if (inputs.operation === "-") {
    B = { x: -B.x, y: -B.y };
  } else if (inputs.operation === "x") {
    B = { x: B.x * inputs.multiVector, y: B.y * inputs.multiVector };
    A = { x: 0, y: 0 };
  }

  return { A, B, total: { x: A.x + B.x, y: -(A.y + B.y) } };
}

// -----------------------------------------------------------------------------
// Drawing — all in screen pixels, since these are geometric constructions
// rather than physical quantities.
// -----------------------------------------------------------------------------

function drawOperation(p, inputs) {
  const { strokeColor, strokeWeight, multiVector, operation, visualizeMode } =
    inputs;
  const centre = centreOf(p);
  const mouse = { x: p.mouseX, y: p.mouseY };
  const A = vectorA(inputs);
  const B = vectorB(p);
  const accent = adjustColor(strokeColor);

  const line = (from, to) => p.line(from.x, from.y, to.x, to.y);
  const dashed = (draw) => {
    p.drawingContext.setLineDash([6, 6]);
    draw();
    p.drawingContext.setLineDash([]);
  };
  const origin = { x: 0, y: 0 };

  p.push();
  p.strokeWeight(strokeWeight);
  p.stroke(strokeColor);

  switch (operation) {
    case "+": {
      if (visualizeMode === "triangle") {
        // Tip-to-tail: A from the origin, B continuing from A's tip.
        line(origin, centre);
        line(centre, mouse);
        p.stroke(accent);
        p.strokeWeight(strokeWeight + 1);
        line(origin, mouse); // the resultant closes the triangle
      } else {
        p.translate(centre.x, centre.y);
        const tip = { x: A.x + B.x, y: A.y + B.y };
        line(origin, A);
        line(origin, B);
        dashed(() => {
          line(A, tip);
          line(B, tip);
        });
        p.stroke(accent);
        p.strokeWeight(strokeWeight + 1);
        line(origin, tip); // the diagonal is the sum
      }
      break;
    }

    case "-": {
      if (visualizeMode === "triangle") {
        line(origin, centre);
        line(origin, mouse);
        p.stroke(accent);
        p.strokeWeight(strokeWeight + 1);
        line(centre, mouse); // R = B − A points from A's tip to B's
      } else {
        p.translate(centre.x, centre.y);
        const negA = { x: -A.x, y: -A.y };
        const R = { x: B.x + negA.x, y: B.y + negA.y };

        p.strokeWeight(Math.max(1, strokeWeight - 0.5));
        line(origin, A);
        p.strokeWeight(strokeWeight);
        line(origin, B);

        // B − A built as B + (−A) on the parallelogram.
        p.stroke(180, 180, 180, 180);
        dashed(() => {
          line(origin, negA);
          line(B, R);
          line(negA, R);
        });

        p.noStroke();
        p.fill(220);
        p.textSize(14);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("-A", negA.x * 0.55, negA.y * 0.55);

        p.stroke(accent);
        p.strokeWeight(strokeWeight + 1);
        line(origin, R);

        p.noStroke();
        p.fill(255, 220, 120);
        p.circle(A.x, A.y, 7);
      }
      break;
    }

    case "x": {
      p.translate(centre.x, centre.y);
      line(origin, B);

      const scaled = { x: B.x * multiVector, y: B.y * multiVector };
      p.strokeWeight(strokeWeight * 0.8);
      p.stroke(accent);
      line(B, scaled);

      // A negative scalar reverses the direction; show where it lands.
      if (multiVector < 0) {
        p.stroke(200, 200, 200);
        p.strokeWeight(1);
        line(origin, { x: -B.x, y: -B.y });
      }
      break;
    }

    case "normalize": {
      p.translate(centre.x, centre.y);
      const length = Math.hypot(B.x, B.y) || 1;
      line(origin, B);
      p.stroke(accent);
      line(origin, { x: (B.x / length) * 100, y: (B.y / length) * 100 });
      break;
    }

    case "dot": {
      p.translate(centre.x, centre.y);
      line(origin, A);
      p.stroke(accent);
      line(origin, B);

      // Angle between the two.
      const angleA = Math.atan2(A.y, A.x);
      const angleB = Math.atan2(B.y, B.x);
      p.noFill();
      p.stroke(255, 255, 255, 150);
      p.strokeWeight(1);
      p.arc(0, 0, 80, 80, Math.min(angleA, angleB), Math.max(angleA, angleB));

      // Projection of B onto A: the dot product is |A| times this length.
      const magASq = A.x * A.x + A.y * A.y;
      const scalar = magASq > 0 ? (A.x * B.x + A.y * B.y) / magASq : 0;
      const foot = { x: A.x * scalar, y: A.y * scalar };

      p.stroke(255, 255, 0, 200);
      p.strokeWeight(1.5);
      p.drawingContext.setLineDash([5, 5]);
      line(B, foot);
      p.drawingContext.setLineDash([]);

      p.noStroke();
      p.fill(255, 255, 0);
      p.circle(foot.x, foot.y, 7);
      break;
    }

    case "cross": {
      p.translate(centre.x, centre.y);
      const z = A.x * B.y - A.y * B.x;
      const tip = { x: A.x + B.x, y: A.y + B.y };

      // |A×B| is the area of the parallelogram; its sign is the orientation.
      p.noStroke();
      if (z > 0) p.fill(0, 200, 100, 80);
      else if (z < 0) p.fill(200, 50, 50, 80);
      else p.fill(150, 150, 150, 80);

      p.beginShape();
      p.vertex(0, 0);
      p.vertex(A.x, A.y);
      p.vertex(tip.x, tip.y);
      p.vertex(B.x, B.y);
      p.endShape(p.CLOSE);

      p.stroke(200, 200, 200, 150);
      p.strokeWeight(1);
      dashed(() => {
        line(A, tip);
        line(B, tip);
      });

      p.strokeWeight(strokeWeight);
      p.stroke(strokeColor);
      line(origin, A);
      p.stroke(accent);
      line(origin, B);
      break;
    }

    default:
      break;
  }

  p.pop();
}

/** Dashed x/y components of B, plus its angle from the x-axis. */
function drawAxisProjections(p) {
  const centre = centreOf(p);
  const B = vectorB(p);

  p.push();
  p.noFill();
  p.stroke(255, 255, 255, 120);
  p.drawingContext.setLineDash([4, 4]);
  p.line(centre.x, centre.y, p.mouseX, centre.y);
  p.line(p.mouseX, centre.y, p.mouseX, p.mouseY);
  p.drawingContext.setLineDash([]);

  p.stroke(255, 255, 255, 150);
  p.arc(centre.x, centre.y, 80, 80, 0, Math.atan2(B.y, B.x));
  p.pop();
}

// -----------------------------------------------------------------------------
// Readout
// -----------------------------------------------------------------------------

/**
 * Everything shown in the info panel is derived from the two vectors, so it is
 * computed here rather than in the config module.
 */
function mapSimInfo({ p, inputs }) {
  if (!p) return {};

  const centre = centreOf(p);
  const A = vectorA(inputs);
  const B = vectorB(p);
  const Bfromorigin = { x: p.mouseX, y: p.mouseY };
  const { operation, visualizeMode, multiVector } = inputs;

  const format = (v) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}) px`;
  const magnitude = (v) => Math.hypot(v.x, v.y);

  const info = {
    "Vector |B|": `${magnitude(B).toFixed(2)} px`,
    "Vector angle θ": `${((Math.atan2(B.y, B.x) * 180) / Math.PI).toFixed(1)} deg`,
    "B components": format(B),
  };

  switch (operation) {
    case "+": {
      const R =
        visualizeMode === "triangle"
          ? Bfromorigin
          : { x: A.x + B.x, y: A.y + B.y };
      info["Addition resultant R"] = format(R);
      info["|R|"] = `${magnitude(R).toFixed(2)} px`;
      info["Formula"] =
        visualizeMode === "triangle"
          ? "Triangle: R = B (origin→mouse)"
          : "Parallelogram: R = A + B";
      break;
    }

    case "-": {
      const base = visualizeMode === "parallelogram" ? A : centre;
      const effective = visualizeMode === "parallelogram" ? B : Bfromorigin;
      const R = { x: effective.x - base.x, y: effective.y - base.y };
      const check = { x: base.x + R.x, y: base.y + R.y };

      info["Subtraction resultant R = B - A"] = format(R);
      info["|R|"] = `${magnitude(R).toFixed(2)} px`;
      info["Auxiliary -A"] = format({ x: -base.x, y: -base.y });
      info["Parallelogram check B = A + R"] = format(check);
      info["Check error |(A + R) - B|"] =
        `${magnitude({ x: check.x - effective.x, y: check.y - effective.y }).toFixed(4)} px`;
      info["Formula"] =
        visualizeMode === "triangle"
          ? "Triangle: R = B - A (center→mouse)"
          : "Parallelogram: use B and -A as adjacent sides, diagonal is R = B + (-A)";
      break;
    }

    case "x": {
      const R = { x: B.x * multiVector, y: B.y * multiVector };
      info["Scalar s"] = multiVector.toFixed(2);
      info["Scaled vector s·v"] = format(R);
      info["|s·v|"] = `${magnitude(R).toFixed(2)} px`;
      info["Angle of s·v"] =
        `${((Math.atan2(R.y, R.x) * 180) / Math.PI).toFixed(1)} deg`;
      info["Formula"] = "s·v = (s·vx, s·vy); if s < 0, orientation flips";
      break;
    }

    case "normalize": {
      const length = magnitude(B);
      const unit = length
        ? { x: B.x / length, y: B.y / length }
        : { x: 0, y: 0 };
      info["|v|"] = length.toFixed(2);
      info["unit v̂"] = `(${unit.x.toFixed(3)}, ${unit.y.toFixed(3)})`;
      info["Formula"] = "v̂ = v / |v|";
      break;
    }

    case "dot": {
      const dot = A.x * B.x + A.y * B.y;
      const denominator = magnitude(A) * magnitude(B);
      const cosTheta = denominator ? dot / denominator : 0;
      const theta =
        (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;
      info["A·B"] = `${dot.toFixed(2)} px²`;
      info["θ between A and B (deg)"] = theta.toFixed(1);
      info["Formula"] = "A·B = |A||B| cosθ = AxBx + AyBy";
      break;
    }

    case "cross": {
      const z = A.x * B.y - A.y * B.x;
      const sign =
        z > 0 ? "+ (counterclockwise)" : z < 0 ? "- (clockwise)" : "0";
      info["A×B (z-component)"] = `${z.toFixed(2)} ${sign} px²`;
      info["Formula"] = "A×B (2D) = AxBy − AyBx (z-axis out of plane)";
      break;
    }

    default:
      break;
  }

  return info;
}
