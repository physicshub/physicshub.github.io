"use client";

import {
  createSimulation,
  Gravity,
  Wind,
  Drag,
  Ground,
  Dragging,
  ForceVectors,
  drawPath,
  drawSegment,
  toScreen,
  SCENE_COLORS,
  formulas,
} from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
  computeProjectileAnalytics,
} from "../app/(core)/data/configs/ParabolicMotion.js";

/**
 * Projectile motion.
 *
 * The ball is launched analytically (the predicted parabola comes from the
 * closed-form solution) but flies numerically, so switching on quadratic drag
 * or wind makes the real path visibly depart from the ideal guide.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  simInfoRefs: () => ({
    launchMetadataRef: { current: { startPos: null, startMs: 0, stats: null } },
  }),

  build({ world, p, inputs, bounds, refs, infoRefs }) {
    const ball = world.addBody({
      label: "ball",
      mass: () => Math.max(inputs.mass, 0.1),
      size: () => inputs.size,
      color: () => inputs.ballColor,
      restitution: 0,
      // Positioned by launch() at the end of build, which owns the whole
      // launch state so there is only one definition of where the ball starts.
      at: [0, 0],
      trail: () => inputs.trailEnabled,
      trailLength: 200,
    });

    const dragging = Dragging({
      // Dropping the ball somewhere else restarts the measurement from there.
      onRelease: (body) => {
        infoRefs.launchMetadataRef.current.startPos = {
          x: body.state.position.x,
          y: body.state.position.y,
        };
        infoRefs.launchMetadataRef.current.startMs = p.millis();
        refs.predictedPath = [];
      },
    });

    world.add(
      Gravity({ g: () => inputs.gravity }),
      Drag({ c: () => inputs.dragCoeff }),
      // The input is an acceleration (m/s²), so it has to scale with mass to
      // become a force — otherwise a heavier ball would drift just as far.
      Wind({ strength: () => inputs.wind, perMass: true }),

      // Only a floor: the projectile is meant to be able to fly off screen.
      Ground({ y: 0, friction: 0.05 }),

      dragging,
      ForceVectors({
        bodies: ball,
        scale: 10,
        enabled: () => inputs.showVectors,
      }),

      trajectoryGuide(refs, inputs),

      // Double-clicking anywhere fires the projectile again.
      { onDoubleClick: () => (refs.needsRelaunch = true) }
    );

    refs.launch = () => launch({ ball, p, inputs, bounds, refs, infoRefs });
    refs.launch();

    return { ball };
  },

  update({ refs }) {
    if (refs.needsRelaunch || refs.inputsChanged) {
      refs.inputsChanged = false;
      refs.needsRelaunch = false;
      refs.launch();
    }
  },

  info({ handles, p, infoRefs }) {
    const startMs = infoRefs.launchMetadataRef.current?.startMs ?? 0;
    return {
      state: {
        pos: handles.ball.state.position,
        vel: handles.ball.state.velocity,
      },
      context: {
        radius: handles.ball.radius,
        elapsedTime: Math.max(0, (p.millis() - startMs) / 1000),
      },
    };
  },
});

/** Reset the ball to the launch state implied by the current inputs. */
function launch({ ball, p, inputs, bounds, refs, infoRefs }) {
  const radius = inputs.size / 2;
  const startX = Math.max(toMeters(80), bounds.width * 0.12);

  // h₀ is the height of the ball above the ground, so its centre sits one
  // radius higher. This keeps the input, the height readout and the drop
  // height used below all measuring the same thing.
  const dropHeight = Math.max(0, inputs.h0);
  const startY = dropHeight + radius;

  const analytics = computeProjectileAnalytics({
    v0: inputs.v0,
    angleDeg: inputs.angle,
    // The ball lands when it *touches* the floor, i.e. when its centre is back
    // at y = radius — the fall is measured between those two centres, not down
    // to y = 0. Using startY here overstated both flight time and range.
    h0: dropHeight,
    gravity: inputs.gravity,
  });

  ball.setPosition(startX, startY);
  ball.setVelocity(analytics.vx0, analytics.vy0);
  ball.clearTrail();

  infoRefs.launchMetadataRef.current = {
    startPos: { x: startX, y: startY },
    startMs: p.millis(),
    stats: analytics,
    radius,
  };

  refs.predictedPath = formulas.projectilePath(
    { x: startX, y: startY },
    analytics,
    inputs.gravity
  );
}

/** The ideal, drag-free parabola plus a landing marker. */
function trajectoryGuide(refs, inputs) {
  return {
    zIndex: -1,
    render(ctx) {
      const path = refs.predictedPath;
      if (!inputs.showGuides || !path || path.length < 2) return;

      drawPath(ctx.p, path, { color: SCENE_COLORS.guide });

      const landing = path[path.length - 1];
      const screen = toScreen(landing);

      drawSegment(
        ctx.p,
        landing,
        { x: landing.x, y: 0 },
        { color: SCENE_COLORS.marker, weight: 1, dashed: true }
      );

      ctx.p.push();
      ctx.p.stroke(SCENE_COLORS.marker);
      ctx.p.strokeWeight(2);
      ctx.p.line(screen.x - 8, screen.y, screen.x + 8, screen.y);
      ctx.p.pop();
    },
  };
}
