"use client";

import {
  createSimulation,
  Gravity,
  SurfaceFriction,
  Bounds,
  Collisions,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/test.js";

/**
 * Rendering and collision stress test.
 *
 * Hundreds of bodies under gravity, bouncing off each other and the walls. The
 * pairwise collision pass is O(n²), which is exactly what makes this a useful
 * benchmark of how far the engine scales on a given device.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, p, inputs, refs, bounds }) {
    refs.count = inputs.numBodies;

    const bodies = Array.from({ length: inputs.numBodies }, () => {
      const color = p
        .color(p.random(100, 255), p.random(100, 255), p.random(100, 255))
        .toString("#rrggbb");

      return world.addBody({
        // Randomised mass and size, so collisions are visibly asymmetric.
        mass: inputs.mass * p.random(0.5, 2),
        size: inputs.size * p.random(0.5, 1.5),
        color,
        restitution: () => inputs.restitution,
        at: [
          p.random(bounds.width * 0.05, bounds.width * 0.95),
          p.random(bounds.height * 0.5, bounds.height * 0.95),
        ],
        trail: () => inputs.trailEnabled,
        trailLength: 100,
      });
    });

    world.add(
      Gravity({ g: () => inputs.gravity }),
      SurfaceFriction({
        mu: () => inputs.frictionMu,
        g: () => inputs.gravity,
      }),
      Bounds(),
      Collisions()
    );

    return { bodies };
  },

  /** Changing the body count is a change to what exists, so rebuild the world. */
  update({ refs, inputs, rebuild }) {
    if (inputs.numBodies !== refs.count) rebuild();
  },

  // The readout for this one is the frame rate: that is what is being measured.
  info: ({ p }) => ({ state: {}, context: { p } }),
});
