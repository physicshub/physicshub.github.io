"use client";

import {
  createSimulation,
  PointAttraction,
  SpeedLimit,
  Bounds,
  Vectors,
} from "../app/(core)/engine/index.js";
import { toMeters, screenYToPhysicsY } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/BallAcceleration.js";

/**
 * Constant acceleration toward a moving target.
 *
 * The pull does not weaken with distance — `falloff: "constant"` — so the ball
 * always overshoots and orbits the cursor, which is the point: it shows that
 * acceleration sets the *change* in velocity, not the velocity itself.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, p, inputs, bounds }) {
    const ball = world.addBody({
      label: "ball",
      mass: 1,
      size: () => inputs.size,
      color: () => inputs.color,
      restitution: 1,
      at: [bounds.width / 2, bounds.height / 2],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    world.add(
      PointAttraction({
        center: () => ({
          x: toMeters(p.mouseX),
          y: screenYToPhysicsY(p.mouseY),
        }),
        strength: () => inputs.acceleration,
        falloff: "constant",
        label: "applied",
      }),

      SpeedLimit(ball, () => inputs.maxspeed),
      Bounds(),

      Vectors({
        bodies: ball,
        show: ["velocity", "acceleration"],
        scale: 10,
      }),

      crosshair(p)
    );

    return { ball };
  },

  info({ handles, inputs }) {
    return {
      state: {
        position: handles.ball.state.position,
        velocity: handles.ball.state.velocity,
        acceleration: inputs.acceleration,
        maxspeed: inputs.maxspeed,
      },
      context: {},
    };
  },
});

/** Marks the target the ball is accelerating toward. */
function crosshair(p) {
  return {
    zIndex: 12,
    render() {
      p.push();
      p.noFill();
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(2);
      p.circle(p.mouseX, p.mouseY, 20);
      p.line(p.mouseX - 10, p.mouseY, p.mouseX + 10, p.mouseY);
      p.line(p.mouseX, p.mouseY - 10, p.mouseX, p.mouseY + 10);
      p.pop();
    },
  };
}
