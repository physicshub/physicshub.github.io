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
const bodyCount = (value) =>
  Number.isFinite(value) ? Math.max(1, Math.min(1000, Math.floor(value))) : 20;

export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, p, inputs, refs, bounds }) {
    refs.count = bodyCount(inputs.numBodies);
    refs.frameTimes = [];
    refs.nextSample = 0;
    refs.skipSample = true;

    const bodies = Array.from({ length: refs.count }, () => {
      const color = p
        .color(p.random(100, 255), p.random(100, 255), p.random(100, 255))
        .toString("#rrggbb");

      const massFactor = p.random(0.5, 2);
      const sizeFactor = p.random(0.5, 1.5);
      return world.addBody({
        // Keep the random distribution stable while controls change live.
        mass: () => inputs.mass * massFactor,
        size: () => inputs.size * sizeFactor,
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
    if (bodyCount(inputs.numBodies) !== refs.count) rebuild();
    const workload = [
      inputs.size,
      inputs.mass,
      inputs.gravity,
      inputs.restitution,
      inputs.frictionMu,
      inputs.trailEnabled,
    ].join(",");
    if (workload !== refs.workload) {
      refs.workload = workload;
      refs.frameTimes = [];
      refs.nextSample = 0;
      refs.skipSample = true;
    }
  },

  // Sample every rendered frame, not just when the info panel refreshes.
  // deltaTime is wall-clock telemetry only; physics keeps its fixed timestep.
  info({ p, refs, handles }) {
    if (document.hidden) {
      refs.frameTimes = [];
      refs.nextSample = 0;
      refs.skipSample = true;
    } else if (refs.skipSample) {
      refs.skipSample = false;
    } else if (Number.isFinite(p.deltaTime) && p.deltaTime > 0) {
      refs.frameTimes[refs.nextSample] = p.deltaTime;
      refs.nextSample = (refs.nextSample + 1) % 120;
    }
    return {
      state: { frameTimes: refs.frameTimes, bodyCount: handles.bodies.length },
      context: {},
    };
  },
});
