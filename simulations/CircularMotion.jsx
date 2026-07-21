"use client";

import {
  createSimulation,
  CircularPath,
  ForceVectors,
  Vectors,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/CircularMotion.js";

/**
 * Uniform circular motion.
 *
 * The trajectory is prescribed by a CircularPath rather than emerging from an
 * integrated centripetal force: with ω = v/r fixed by the inputs, the motion is
 * exactly uniform and cannot drift, which is what "uniform" is supposed to mean.
 * The constraint still publishes the force it implies (F = mω²r, inward), so the
 * force diagram shows the real centripetal force.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, bounds }) {
    const centre = world.addAnchor(bounds.width / 2, bounds.height / 2);

    const ball = world.addBody({
      label: "ball",
      mass: () => inputs.mass,
      size: () => inputs.size,
      color: () => inputs.color,
      draggable: false,
      at: [bounds.width / 2 + inputs.radius, bounds.height / 2],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    world.add(
      CircularPath(ball, centre, () => inputs.radius, {
        // ω = v / r keeps the tangential speed equal to the requested value.
        omega: () => (inputs.radius > 0 ? inputs.speed / inputs.radius : 0),
      }),

      ForceVectors({ bodies: ball, scale: 10 }),
      Vectors({ bodies: ball, show: ["velocity"], scale: 10 })
    );

    return { ball, centre };
  },

  info({ handles, inputs }) {
    return {
      state: {
        position: handles.ball.state.position,
        velocity: handles.ball.state.velocity,
        radius: inputs.radius,
        speed: inputs.speed,
      },
      context: {},
    };
  },
});
