"use client";

import {
  createSimulation,
  Gravity,
  Constant,
  Incline,
  Dragging,
  ForceVectors,
  ForceRenderer,
  toScreen,
  formulas,
} from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/InclinedPlane.js";

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * A block on a frictional ramp.
 *
 * Nothing here hardcodes N = mg·cos θ. The Incline element sums whatever forces
 * are already on the block — weight, plus any applied push — resolves them in
 * the surface frame, and supplies the normal force needed to cancel the inward
 * component. Friction then follows from that N. Increase the applied force at a
 * downward angle and the normal force, and therefore friction, rises with it,
 * exactly as it should.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, p, inputs }) {
    const origin = {
      x: toMeters(p.width * 0.25),
      y: toMeters(p.height * 0.25),
    };
    const length = toMeters(Math.min(p.width, p.height) * 0.6);
    const angle = () => toRadians(inputs.angle);

    const block = world.addBody({
      label: "block",
      mass: () => inputs.mass,
      size: () => inputs.size,
      color: () => inputs.blockColor,
      shape: "square",
      restitution: 0.3,
      at: [origin.x, origin.y],
      trail: () => inputs.trailEnabled,
      trailLength: 150,
    });

    // Order matters: the ramp reacts to the forces added before it.
    world.add(
      Gravity({ g: () => inputs.gravity }),

      // The push is given relative to the slope, so 0° means "along the ramp".
      Constant({
        x: () =>
          inputs.appliedForce *
          Math.cos(toRadians(inputs.angle - inputs.appliedAngle)),
        y: () =>
          inputs.appliedForce *
          Math.sin(toRadians(inputs.angle - inputs.appliedAngle)),
      })
    );

    const ramp = world.add(
      Incline(block, {
        origin,
        angle,
        length,
        muStatic: () => inputs.frictionStatic,
        muKinetic: () => inputs.frictionKinetic,
        color: () => inputs.planeColor,
      })
    );

    world.add(
      Dragging({
        // Constrain the grab to the ramp itself.
        project: (body, ctx) => {
          const a = toRadians(ctx.inputs.angle);
          const along = Math.min(
            Math.max(
              (ctx.target.x - origin.x) * Math.cos(a) +
                (ctx.target.y - origin.y) * Math.sin(a),
              0
            ),
            length
          );
          return {
            x: origin.x + Math.cos(a) * along,
            y: origin.y + Math.sin(a) * along,
          };
        },
      }),

      ForceVectors({
        bodies: block,
        scale: 5,
        arrowSize: 12,
        enabled: () => inputs.showForces,
      }),

      weightComponents(block, inputs),
      angleGauge(origin, inputs)
    );

    // The block starts a little way up the slope.
    const start = inputs.size / 2 + 1;
    block.setPosition(
      origin.x + Math.cos(toRadians(inputs.angle)) * start,
      origin.y + Math.sin(toRadians(inputs.angle)) * start
    );

    return { block, ramp, origin, length };
  },

  info({ handles, inputs, world }) {
    const { block, ramp } = handles;
    const ctx = world.context(0);
    const angleRad = toRadians(inputs.angle);

    const normal = block.appliedForces.get("normal");
    const friction = block.appliedForces.get("friction");
    const weight = formulas.weight(block.params.mass, inputs.gravity);
    const components = formulas.inclineComponents(weight, angleRad);

    const along = ramp.distanceAlong(block, ctx);
    const speed = ramp.speedAlong(block, ctx);

    // Net force resolved along the slope — weight component, applied push,
    // friction — which is what actually accelerates the block.
    const { tangent } = ramp.basis(ctx);
    let netParallel = 0;
    for (const force of block.appliedForces.values()) {
      netParallel += force.x * tangent.x + force.y * tangent.y;
    }

    return {
      state: {
        posAlongPlane: along,
        vel: speed,
        acc: netParallel / block.params.mass,
        mass: block.params.mass,
        kineticEnergy: block.getKineticEnergy(),
        potentialEnergy: block.getPotentialEnergy(inputs.gravity),
      },
      context: {
        gravity: inputs.gravity,
        angle: inputs.angle,
        forces: {
          weight: {
            magnitude: weight,
            parallel: components.parallel,
            perpendicular: components.perpendicular,
          },
          normal: normal ? Math.hypot(normal.x, normal.y) : 0,
          friction: friction ? Math.hypot(friction.x, friction.y) : 0,
          applied: { magnitude: inputs.appliedForce },
          netParallel,
          angle: angleRad,
          gravity: inputs.gravity,
        },
      },
    };
  },
});

/** The mg∥ / mg⊥ decomposition along the slope. */
function weightComponents(block, inputs) {
  const renderer = new ForceRenderer({ scale: 5, showMagnitude: false });

  return {
    zIndex: 11,
    render(ctx) {
      if (!inputs.showComponents || !inputs.showForces) return;
      const weight = block.appliedForces.get("weight");
      if (!weight) return;

      const screen = toScreen(block.state.position);
      renderer.decompose(
        ctx.p,
        screen.x,
        screen.y,
        weight,
        toRadians(inputs.angle),
        { parallelLabel: "mg∥", perpendicularLabel: "mg⊥" }
      );
    },
  };
}

/** Arc and readout for the ramp angle. */
function angleGauge(origin, inputs) {
  return {
    zIndex: -1,
    render(ctx) {
      const { p } = ctx;
      const screen = toScreen(origin);
      const radius = 50;
      const angleRad = toRadians(inputs.angle);

      p.push();
      p.noFill();
      p.stroke(255, 200);
      p.strokeWeight(2);
      p.arc(screen.x, screen.y, radius * 2, radius * 2, -angleRad, 0);

      const label = `${Number(inputs.angle).toFixed(1)}°`;
      p.textSize(14);
      p.noStroke();
      p.fill(0, 0, 0, 150);
      p.rect(
        screen.x + radius + 15,
        screen.y - 25,
        p.textWidth(label) + 10,
        20,
        3
      );
      p.fill(255, 220, 100);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(
        label,
        screen.x + radius + 20 + p.textWidth(label) / 2,
        screen.y - 15
      );
      p.pop();
    },
  };
}
