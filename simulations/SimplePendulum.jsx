"use client";

import {
  createSimulation,
  Gravity,
  Damping,
  Distance,
  Dragging,
  ForceVectors,
  ForceRenderer,
  toScreen,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/SimplePendulum.js";

/**
 * Simple pendulum.
 *
 * There is no pendulum-specific physics here: the bob is an ordinary body under
 * gravity, and the rod is a Distance constraint to a fixed pivot. Swap that
 * pivot for a free body and the same file becomes a pendulum on a moving cart.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, bounds }) {
    const pivot = world.addAnchor(bounds.width / 2, bounds.height * 0.9);

    const angle = (inputs.initialAngle * Math.PI) / 180;
    const length = inputs.length;

    const bob = world.addBody({
      label: "bob",
      mass: () => inputs.mass,
      size: 0.3,
      color: () => inputs.bobColor,
      at: [
        pivot.state.position.x + length * Math.sin(angle),
        pivot.state.position.y - length * Math.cos(angle),
      ],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    const rod = world.add(
      Distance(bob, pivot, () => inputs.length, {
        color: () => inputs.ropeColor,
      })
    );

    world.add(
      Gravity({ g: () => inputs.gravity }),
      // perMass makes this α = −c·ω on the rod, the textbook damped pendulum.
      Damping({ c: () => inputs.damping, perMass: true }),

      // Dragging is projected back onto the arc, so the bob cannot leave the rod.
      Dragging({
        project: (body, ctx) => {
          const pivotPos = pivot.state.position;
          const dx = ctx.target.x - pivotPos.x;
          const dy = ctx.target.y - pivotPos.y;
          const distance = Math.hypot(dx, dy) || 1;
          const radius = ctx.inputs.length;
          return {
            x: pivotPos.x + (dx / distance) * radius,
            y: pivotPos.y + (dy / distance) * radius,
          };
        },
      }),

      ForceVectors({
        bodies: bob,
        scale: 10,
        enabled: () => inputs.showForces,
        // Damping acts on the bob too, but the classic figure shows only
        // weight and tension.
        only: ["weight", "tension"],
      }),

      weightComponents(bob, pivot, inputs)
    );

    return { bob, pivot, rod };
  },

  info({ handles, inputs }) {
    const { bob, rod, pivot } = handles;
    const lowestY = pivot.state.position.y - rod.currentLength;

    return {
      state: {
        angleRad: rod.angle,
        angularVel: rod.angularVelocity,
        height: bob.state.position.y - lowestY,
        velocity: bob.state.velocity,
        kineticEnergy: bob.getKineticEnergy(),
        potentialEnergy: bob.getPotentialEnergy(inputs.gravity, lowestY),
      },
      context: { gravity: inputs.gravity, tension: rod.tension },
    };
  },
});

/**
 * Decompose the bob's weight into the components along and across the rod —
 * the classic mg∥ / mg⊥ pair. A plain render element, which is all a bespoke
 * overlay needs to be.
 */
function weightComponents(bob, pivot, inputs) {
  const renderer = new ForceRenderer({ scale: 10, showMagnitude: false });

  return {
    zIndex: 11,
    render(ctx) {
      if (!inputs.showComponents || !inputs.showForces) return;

      const weight = bob.appliedForces.get("weight");
      if (!weight) return;

      const screen = toScreen(bob.state.position);
      // Axis pointing from the bob toward the pivot.
      const axis = Math.atan2(
        pivot.state.position.y - bob.state.position.y,
        pivot.state.position.x - bob.state.position.x
      );

      renderer.decompose(ctx.p, screen.x, screen.y, weight, axis, {
        parallelLabel: "mg∥",
        perpendicularLabel: "mg⊥",
      });
    },
  };
}
