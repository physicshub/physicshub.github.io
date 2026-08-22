"use client";

import {
  createSimulation,
  rk4,
  drawSegment,
  drawAnchor,
  drawPath,
  toScreen,
} from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/DoublePendulum.js";

/**
 * Double pendulum.
 *
 * The one simulation that is not built from bodies and constraints. Two rigid
 * rods leave only two degrees of freedom, θ₁ and θ₂, and the exact Lagrangian
 * equations for them are far more accurate than a constraint solver acting on
 * free point masses — which matters here, because the system is chaotic and any
 * numerical slop is amplified exponentially. The state is integrated with RK4;
 * the world is used only to draw.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, p, inputs, refs }) {
    const pivotY = toMeters(p.height * 0.45);
    const pivot = { x: toMeters(p.width / 2), y: pivotY };

    // Shrink both arms together so the pendulum always fits under the pivot.
    const total = inputs.length1 + inputs.length2;
    const available = toMeters(p.height * 0.45) * 0.8;
    const scale = total > available ? available / total : 1;

    refs.pivot = pivot;
    refs.L1 = inputs.length1 * scale;
    refs.L2 = inputs.length2 * scale;
    refs.state = [
      (inputs.initialAngle1 * Math.PI) / 180,
      (inputs.initialAngle2 * Math.PI) / 180,
      0,
      0,
    ];
    refs.trail = [];

    world.add(pendulumRenderer(refs, inputs));
    return {};
  },

  update({ refs, inputs, dt, steps }) {
    if (!inputs.trailEnabled) refs.trail = [];
    if (!steps) return;

    // RK4 at the frame's fixed timestep, sub-divided: the equations are stiff
    // when either arm swings through the vertical.
    const SUBSTEPS = 8;
    const h = dt / SUBSTEPS;

    for (let frame = 0; frame < steps; frame++) {
      for (let i = 0; i < SUBSTEPS; i++) {
        refs.state = rk4(
          refs.state,
          (y) =>
            derivatives(y, {
              m1: inputs.mass1,
              m2: inputs.mass2,
              L1: refs.L1,
              L2: refs.L2,
              g: inputs.gravity,
              damping: inputs.damping,
            }),
          h
        );
      }
    }

    if (inputs.trailEnabled) {
      refs.trail.push(tipPosition(refs));
      if (refs.trail.length > 600) refs.trail.shift();
    }
  },

  info({ refs, inputs }) {
    const [angle1, angle2, angularVel1, angularVel2] = refs.state;
    const { L1, L2 } = refs;
    const { mass1: m1, mass2: m2, gravity: g } = inputs;

    // v₁² = (L₁ω₁)², v₂² adds the second arm plus the cross term.
    const v1sq = (L1 * angularVel1) ** 2;
    const v2sq =
      v1sq +
      (L2 * angularVel2) ** 2 +
      2 * L1 * L2 * angularVel1 * angularVel2 * Math.cos(angle1 - angle2);

    // Heights below the pivot, so PE is negative and lowest at the bottom.
    const y1 = -L1 * Math.cos(angle1);
    const y2 = y1 - L2 * Math.cos(angle2);

    return {
      state: {
        angle1,
        angle2,
        angularVel1,
        angularVel2,
        kineticEnergy: 0.5 * m1 * v1sq + 0.5 * m2 * v2sq,
        potentialEnergy: m1 * g * y1 + m2 * g * y2,
      },
      context: {},
    };
  },
});

/**
 * Equations of motion for the double pendulum, from the Lagrangian.
 * State is [θ₁, θ₂, ω₁, ω₂]; angles are measured from the downward vertical.
 */
function derivatives([angle1, angle2, angVel1, angVel2], p) {
  const { m1, m2, L1, L2, g, damping } = p;
  const delta = angle1 - angle2;

  const denominator = 2 * m1 + m2 - m2 * Math.cos(2 * delta);

  const acc1 =
    (-g * (2 * m1 + m2) * Math.sin(angle1) -
      m2 * g * Math.sin(angle1 - 2 * angle2) -
      2 *
        Math.sin(delta) *
        m2 *
        (angVel2 ** 2 * L2 + angVel1 ** 2 * L1 * Math.cos(delta)) -
      damping * angVel1) /
    (L1 * denominator);

  const acc2 =
    (2 *
      Math.sin(delta) *
      (angVel1 ** 2 * L1 * (m1 + m2) +
        g * (m1 + m2) * Math.cos(angle1) +
        angVel2 ** 2 * L2 * m2 * Math.cos(delta)) -
      damping * angVel2) /
    (L2 * denominator);

  return [angVel1, angVel2, acc1, acc2];
}

/** Position of the first joint and the free tip, from the angular state. */
function jointPosition(refs) {
  const [angle1] = refs.state;
  return {
    x: refs.pivot.x + refs.L1 * Math.sin(angle1),
    y: refs.pivot.y - refs.L1 * Math.cos(angle1),
  };
}

function tipPosition(refs) {
  const [, angle2] = refs.state;
  const joint = jointPosition(refs);
  return {
    x: joint.x + refs.L2 * Math.sin(angle2),
    y: joint.y - refs.L2 * Math.cos(angle2),
  };
}

/** Rods, bobs, pivot and the tip's trace. */
function pendulumRenderer(refs, inputs) {
  return {
    zIndex: 0,
    render(ctx) {
      const { p } = ctx;
      const joint = jointPosition(refs);
      const tip = tipPosition(refs);

      if (inputs.trailEnabled && refs.trail.length > 1) {
        drawPath(p, refs.trail, { color: inputs.bob2Color, weight: 1.5 });
      }

      drawSegment(p, refs.pivot, joint, { color: inputs.ropeColor });
      drawSegment(p, joint, tip, { color: inputs.ropeColor });
      drawAnchor(p, refs.pivot, { bracket: false });

      p.push();
      p.noStroke();
      for (const [point, color, mass] of [
        [joint, inputs.bob1Color, inputs.mass1],
        [tip, inputs.bob2Color, inputs.mass2],
      ]) {
        const screen = toScreen(point);
        p.fill(color);
        p.circle(screen.x, screen.y, (10 + mass * 4) * 2);
      }
      p.pop();
    },
  };
}
