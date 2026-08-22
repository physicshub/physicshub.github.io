"use client";

import {
  createSimulation,
  Gravity,
  Damping,
  Spring,
  Rope,
  Strut,
  Dragging,
  ForceVectors,
} from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/SpringConnection.js";

/**
 * A mass hanging from a spring.
 *
 * Gravity sets the equilibrium extension (x₀ = mg/k) and the spring provides the
 * restoring force around it, so the bob oscillates about a point below the rest
 * length — the standard vertical mass–spring oscillator.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, bounds }) {
    const anchor = world.addAnchor(bounds.width / 2, bounds.height - 0.2);

    const bob = world.addBody({
      label: "bob",
      mass: () => inputs.bobMass,
      size: () => inputs.bobSize,
      color: () => inputs.bobColor,
      at: [
        anchor.state.position.x,
        anchor.state.position.y - inputs.springRestLength - 1,
      ],
    });

    const spring = world.add(
      Spring(bob, anchor, () => inputs.springRestLength, {
        k: () => inputs.springK,
        color: () => inputs.springColor,
      })
    );

    world.add(
      Gravity({ g: () => inputs.gravity }),
      Damping({ c: () => inputs.bobDamping }),

      // Hard travel limits, so extreme stiffness cannot fling the bob offscreen.
      Rope(bob, anchor, () => inputs.maxLength, { render: "none" }),
      Strut(bob, anchor, () => inputs.minLength, { render: "none" }),

      Dragging(),
      ForceVectors({ bodies: bob, scale: 5 })
    );

    return { bob, anchor, spring };
  },

  info({ handles, inputs, p }) {
    const { bob, anchor, spring } = handles;
    return {
      state: {
        pos: bob.state.position,
        vel: bob.state.velocity,
        mass: bob.params.mass,
        k: inputs.springK,
        restLength: inputs.springRestLength,
        potentialEnergyElastic: spring.potentialEnergy(),
        springForceMag: spring.force(),
        currentLengthM: spring.currentLength,
        anchorHeight: anchor.state.position.y,
      },
      context: {
        gravity: inputs.gravity,
        canvasHeight: p.height,
        canvasHeightMeters: toMeters(p.height),
      },
    };
  },
});
