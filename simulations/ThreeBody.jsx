"use client";

import { createSimulation, MutualGravity } from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/ThreeBody.js";

/** Chenciner–Montgomery figure-eight orbit, in its canonical normalised units. */
const FIGURE_EIGHT = {
  positions: [
    [-0.97000436, 0.24308753],
    [0, 0],
    [0.97000436, -0.24308753],
  ],
  velocities: [
    [0.46620368, 0.43236573],
    [-0.93240737, -0.86473146],
    [0.46620368, 0.43236573],
  ],
  halfWidth: 0.97,
};

const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

/**
 * The three-body problem.
 *
 * Chaotic and stiff: close approaches produce enormous accelerations, so the
 * world runs 40 sub-steps per fixed step. Fewer and the figure-eight visibly
 * unravels within seconds — the trajectory is real, the divergence is numerical.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  world: { substeps: 40 },

  build({ world, p, inputs, bounds }) {
    const centre = { x: bounds.width / 2, y: bounds.height / 2 };
    const extent = toMeters(Math.min(p.width, p.height));

    const { positions, velocities } = initialConditions(inputs, centre, extent);

    // Cancel the net drift so the system stays on screen: with no external
    // force the centre of mass moves at a constant velocity forever.
    const count = positions.length;
    const driftX = velocities.reduce((s, v) => s + v[0], 0) / count;
    const driftY = velocities.reduce((s, v) => s + v[1], 0) / count;

    const bodies = positions.map((position, i) =>
      world.addBody({
        label: `body-${i + 1}`,
        mass: inputs.mass,
        size: () => inputs.size,
        color: COLORS[i],
        draggable: false,
        at: position,
        velocity: [velocities[i][0] - driftX, velocities[i][1] - driftY],
        trail: () => inputs.trailEnabled,
        trailLength: 800,
      })
    );

    // Softening only has to defuse the r → 0 singularity; keep it far below the
    // closest approach of the figure-eight or the orbit stops closing.
    world.add(MutualGravity({ G: () => inputs.G, softening: 0.001 }));

    return { bodies };
  },

  info: () => ({ state: {}, context: {} }),
});

/**
 * Positions and velocities for the chosen preset, scaled to the canvas.
 * Each preset is a genuine solution of the three-body problem; `chaos` adds a
 * perturbation to show how quickly they stop being one.
 */
function initialConditions(inputs, centre, extent) {
  const { configuration, G, mass, chaos } = inputs;
  let positions;
  let velocities;

  if (configuration === "figure8") {
    const scale = (extent * 0.35) / FIGURE_EIGHT.halfWidth;
    // The orbit is defined for G = m = 1; rescaling space by s rescales
    // velocity by √(Gm/s) to keep it a solution.
    const vScale = Math.sqrt((G * mass) / scale);

    positions = FIGURE_EIGHT.positions.map(([x, y]) => [
      centre.x + x * scale,
      centre.y + y * scale,
    ]);
    velocities = FIGURE_EIGHT.velocities.map(([vx, vy]) => [
      vx * vScale,
      vy * vScale,
    ]);
  } else {
    const R = extent * 0.3;
    positions = [0, 1, 2].map((i) => {
      const theta = (2 * Math.PI * i) / 3 + Math.PI / 2;
      return [centre.x + R * Math.cos(theta), centre.y + R * Math.sin(theta)];
    });

    if (configuration === "lagrange") {
      // Equilateral (Lagrange) rotation for three equal masses at circumradius
      // R: the two pulls combine to Gm²/(√3R²) toward the centre, and setting
      // that equal to mω²R gives ω² = Gm / (√3·R³).
      const omega = Math.sqrt((G * mass) / (Math.sqrt(3) * R * R * R));
      velocities = positions.map(([x, y]) => [
        -omega * (y - centre.y),
        omega * (x - centre.x),
      ]);
    } else {
      // Free fall from rest, with a small kick to break the exact symmetry.
      const kick = Math.sqrt((G * mass) / R) * 0.08;
      velocities = positions.map(() => [
        (Math.random() - 0.5) * kick,
        (Math.random() - 0.5) * kick,
      ]);
    }
  }

  if (chaos > 0) {
    const positionJitter = chaos * extent * 0.04;
    const velocityJitter = chaos * Math.sqrt(G * mass) * 0.2;
    positions = positions.map(([x, y]) => [
      x + (Math.random() - 0.5) * positionJitter,
      y + (Math.random() - 0.5) * positionJitter,
    ]);
    velocities = velocities.map(([vx, vy]) => [
      vx + (Math.random() - 0.5) * velocityJitter,
      vy + (Math.random() - 0.5) * velocityJitter,
    ]);
  }

  return { positions, velocities };
}
