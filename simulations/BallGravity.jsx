"use client";

import {
  createSimulation,
  Gravity,
  Wind,
  SurfaceFriction,
  Bounds,
  Dragging,
  ForceVectors,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/BallGravity.js";

/**
 * A ball falling under gravity, with wind on mouse-down, ground friction and
 * bouncing walls — four independent elements acting on one body.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  // The mapper tracks the highest point reached; a fresh ref per reset.
  simInfoRefs: () => ({ maxHeightRef: { current: 0 } }),

  build({ world, p, inputs, bounds, setOverlay }) {
    const ball = world.addBody({
      label: "ball",
      mass: () => inputs.mass,
      size: () => inputs.size,
      color: () => inputs.color,
      restitution: () => Math.max(0, Math.min(1, inputs.restitution)),
      // Spawns high up: 7/8 of the canvas height in Y-up coordinates.
      at: [bounds.width / 2, bounds.height * 0.875],
      trail: () => inputs.trailEnabled,
      trailLength: 150,
    });

    const dragging = Dragging({
      onGrab: () => setOverlay(null),
    });

    world.add(
      Gravity({ g: () => inputs.gravity }),

      // Wind only blows while the mouse is held down somewhere other than the ball.
      Wind({
        strength: () =>
          p.mouseIsPressed && !dragging.isDragging ? inputs.wind : 0,
      }),

      SurfaceFriction({
        mu: () => inputs.frictionMu,
        g: () => inputs.gravity,
      }),

      Bounds(),
      dragging,
      ForceVectors({ bodies: ball, net: false })
    );

    // The wind indicator is DOM, so the sketch pushes it out through overlay state.
    world.add({
      onPointerDown: () => {
        if (!dragging.isDragging) setOverlay("blowing");
      },
      onPointerUp: () => setOverlay(null),
    });

    return { ball };
  },

  info({ handles, inputs, p }) {
    const { ball } = handles;
    return {
      state: {
        pos: ball.state.position,
        vel: ball.state.velocity,
        mass: ball.params.mass,
      },
      context: { gravity: inputs.gravity, canvasHeight: p.height },
    };
  },

  overlay: ({ state }) => (
    <div
      className={`wind-overlay ${state === "blowing" ? "blowing" : ""}`}
      aria-hidden="true"
    >
      <svg className="wind-icon" viewBox="0 0 64 32" width="80" height="40">
        <path
          d="M2 10 Q18 5, 30 10 T62 10"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M8 20 Q22 15, 34 20 T62 20"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="58" cy="10" r="2" fill="white" />
        <circle cx="56" cy="20" r="2" fill="white" />
      </svg>
    </div>
  ),
});
