"use client";

import {
  createSimulation,
  Gravity,
  Bounds,
  Dragging,
  ForceVectors,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/BouncingBall.js";

/**
 * A ball bouncing in a box.
 *
 * `Bounds` compensates for the work gravity does while the ball is overlapping
 * the floor within a step, so restitution = 1 really is lossless and the ball
 * returns to its release height indefinitely.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  simInfoRefs: () => ({
    maxHeightRef: { current: 0 },
    fallStartTimeRef: { current: 0 },
  }),

  build({ world, p, inputs, bounds, infoRefs }) {
    const ball = world.addBody({
      label: "ball",
      mass: () => inputs.mass,
      size: () => inputs.size,
      color: () => inputs.ballColor,
      restitution: () => inputs.restitution,
      // Released just under the ceiling.
      at: [bounds.width / 2, bounds.height - (inputs.size / 2 + 0.3)],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    world.add(
      Gravity({ g: () => inputs.gravity }),
      Bounds(),

      Dragging({
        // Grabbing the ball starts a new drop, so the peak-height readout
        // measures this fall and not a previous one.
        onGrab: () => {
          infoRefs.maxHeightRef.current = 0;
        },
        onRelease: () => {
          infoRefs.fallStartTimeRef.current = p.millis();
        },
      }),

      ForceVectors({ bodies: ball, scale: 10 })
    );

    infoRefs.fallStartTimeRef.current = p.millis();

    return { ball };
  },

  info({ handles, inputs, p }) {
    const { ball } = handles;
    return {
      state: {
        pos: ball.state.position,
        vel: ball.state.velocity,
        mass: ball.params.mass,
        size: ball.params.size,
      },
      context: { gravity: inputs.gravity, canvasHeight: p.height },
    };
  },
});
