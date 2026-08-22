"use client";

import {
  createSimulation,
  Collisions,
  Bounds,
  LockAxis,
  Dragging,
  Vectors,
  toScreen,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/CollisionSimulation.js";

/**
 * Head-on collision between two balls on a track.
 *
 * With the motion locked to one axis, the engine's impulse solver reduces
 * exactly to the textbook 1-D result
 *   v₁ = ((m₁ − e·m₂)u₁ + (1 + e)m₂u₂) / (m₁ + m₂)
 * so momentum is conserved for any restitution, and kinetic energy too at e = 1.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  simInfoRefs: () => ({ initialStateRef: { current: { u1: 0, u2: 0 } } }),

  build({ world, p, inputs, bounds, infoRefs }) {
    // Balls shrink on narrow screens so the track stays readable.
    const screenScale = p.width < 600 ? 0.7 : 1;

    const trackY = bounds.height / 2;
    const left = bounds.width * 0.2;
    const right = bounds.width * 0.8;
    const span = right - left;

    const ball1 = world.addBody({
      label: "m 1",
      mass: () => inputs.mass1,
      size: () => inputs.size1 * screenScale,
      color: () => inputs.ballColor1,
      restitution: () => inputs.restitution,
      at: [left + span * 0.25, trackY],
      velocity: [Math.abs(inputs.velocity1), 0],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    const ball2 = world.addBody({
      label: "m 2",
      mass: () => inputs.mass2,
      size: () => inputs.size2 * screenScale,
      color: () => inputs.ballColor2,
      restitution: () => inputs.restitution,
      at: [left + span * 0.75, trackY],
      velocity: [-Math.abs(inputs.velocity2), 0],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    infoRefs.initialStateRef.current = {
      u1: Math.abs(inputs.velocity1),
      u2: Math.abs(inputs.velocity2),
    };

    world.add(
      LockAxis([ball1, ball2], { y: trackY }),
      Collisions(),
      Bounds({ left, right, sides: ["left", "right"] }),
      Dragging(),

      Vectors({
        bodies: [ball1, ball2],
        show: ["velocity"],
        scale: 20,
        labels: false,
        enabled: () => inputs.showVectors,
      }),

      trackWalls(left, right),
      labels([ball1, ball2], p)
    );

    return { ball1, ball2 };
  },

  info({ handles, infoRefs }) {
    return {
      state: {
        body1: handles.ball1,
        body2: handles.ball2,
        initialState: infoRefs.initialStateRef.current,
      },
      context: {},
    };
  },
});

/** The two vertical bumpers the balls rebound from. */
function trackWalls(left, right) {
  return {
    zIndex: -2,
    render(ctx) {
      const { p } = ctx;
      p.push();
      p.stroke(150);
      p.strokeWeight(5);
      for (const x of [left, right]) {
        const screen = toScreen({ x, y: 0 });
        p.line(screen.x, 0, screen.x, p.height);
      }
      p.pop();
    },
  };
}

/** Draws each ball's name above it. */
function labels(bodies, p) {
  return {
    zIndex: 11,
    render() {
      p.push();
      p.fill(255);
      p.noStroke();
      p.textAlign(p.CENTER);
      p.textSize(p.width < 600 ? 14 : 22);
      p.textFont("Poppins");
      for (const body of bodies) {
        const screen = toScreen(body.state.position);
        p.text(body.label, screen.x, screen.y - 36);
      }
      p.pop();
    },
  };
}
