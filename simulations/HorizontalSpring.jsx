"use client";

import {
  createSimulation,
  Spring,
  Strut,
  LockAxis,
  Dragging,
  CustomForce,
  ForceVectors,
  toScreen,
  drawCoil,
  drawAnchor,
} from "../app/(core)/engine/index.js";
import { toPixels, toMeters } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/HorizontalSpring.js";

/** Height of the floor the block slides on, in metres. */
const GROUND_Y = 0.5;
/** Horizontal position of the wall the spring is bolted to, in metres. */
const WALL_X = 0.2;

/**
 * A block launched by a compressed spring.
 *
 * The spring is bolted to the wall but not to the block, so it can only push:
 * once the block passes the rest length they separate and it coasts under
 * friction alone. That is the whole point of the demo — elastic potential energy
 * converts to kinetic energy, and only then does friction start removing it.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs }) {
    const anchor = world.addAnchor(WALL_X, GROUND_Y);

    const block = world.addBody({
      label: "block",
      mass: () => inputs.bobMass,
      size: () => inputs.bobSize,
      color: () => inputs.bobColor,
      at: [WALL_X + inputs.springRestLength, GROUND_Y],
    });

    const spring = world.add(
      Spring(block, anchor, () => inputs.springRestLength, {
        k: () => inputs.springK,
        color: () => inputs.springColor,
        oneWay: "push",
        // Drawn by springVisual below, which retracts it once the block leaves.
        render: "none",
      })
    );

    world.add(
      // Sliding friction of fixed magnitude, opposing motion and never
      // reversing it: a body at rest stays at rest instead of jittering.
      CustomForce(
        (body, ctx) => {
          const damping = ctx.inputs.bobDamping;
          const vx = body.state.velocity.x;
          if (damping <= 0 || Math.abs(vx) < 1e-4) return null;

          const stoppingForce = (Math.abs(vx) * body.params.mass) / ctx.dt;
          return { x: -Math.sign(vx) * Math.min(damping, stoppingForce), y: 0 };
        },
        { label: "friction" }
      ),

      LockAxis(block, { y: GROUND_Y }),

      // The coil cannot be compressed past its solid length.
      Strut(
        block,
        anchor,
        () => Math.min(inputs.minCompressionLength, inputs.springRestLength),
        {
          render: "none",
        }
      ),

      Dragging({
        project: (body, ctx) => ({
          x: Math.max(WALL_X + ctx.inputs.minCompressionLength, ctx.target.x),
          y: GROUND_Y,
        }),
      }),

      ForceVectors({ bodies: block, only: ["spring"], scale: 5 }),

      scenery(),
      springVisual(block, anchor, inputs)
    );

    return { block, anchor, spring };
  },

  info({ handles, inputs, p }) {
    const { block, spring } = handles;
    const currentLength = block.state.position.x - WALL_X;
    const displacement = currentLength - inputs.springRestLength;
    const compressed = displacement < 0;

    return {
      state: {
        pos: block.state.position,
        vel: block.state.velocity,
        mass: block.params.mass,
        k: inputs.springK,
        restLength: inputs.springRestLength,
        // Both are zero once the block has separated from the spring.
        potentialEnergyElastic: compressed ? spring.potentialEnergy() : 0,
        springForceMag: compressed ? spring.force() : 0,
        currentLengthM: currentLength,
        anchorX: WALL_X,
      },
      context: {
        canvasHeight: p.height,
        canvasHeightMeters: toMeters(p.height),
      },
    };
  },
});

/** Hatched wall and floor. */
function scenery() {
  return {
    zIndex: -3,
    render(ctx) {
      const { p } = ctx;
      const groundY = toScreen({ x: 0, y: GROUND_Y }).y;
      const wallX = toPixels(WALL_X);

      p.push();

      p.stroke(180, 180, 190, 230);
      p.strokeWeight(2);
      p.line(0, groundY, p.width, groundY);

      p.stroke(140, 140, 150, 90);
      p.strokeWeight(1);
      for (let x = 0; x < p.width + 18; x += 18) {
        p.line(x, groundY, x - 14, groundY + 14);
      }

      p.noStroke();
      p.fill(100, 100, 110, 180);
      p.rect(0, 0, wallX, p.height);

      p.stroke(140, 140, 150, 120);
      p.strokeWeight(1);
      for (let y = -p.height; y < p.height * 2; y += 18) {
        p.line(0, y, wallX, y + wallX);
      }

      p.stroke(200, 200, 210, 220);
      p.strokeWeight(2);
      p.line(wallX, 0, wallX, p.height);

      p.pop();
    },
  };
}

/**
 * The coil follows the block while in contact and snaps back to its rest length
 * once the block has separated — otherwise it would appear to stretch along with
 * a launch it is no longer part of.
 */
function springVisual(block, anchor, inputs) {
  return {
    zIndex: -1,
    render(ctx) {
      const rest = inputs.springRestLength;
      const inContact = block.state.position.x - WALL_X <= rest;
      const tip = inContact
        ? block.state.position
        : { x: WALL_X + rest, y: GROUND_Y };

      drawCoil(ctx.p, anchor.state.position, tip, {
        color: inputs.springColor,
      });
      drawAnchor(ctx.p, anchor.state.position, { color: inputs.anchorColor });
    },
  };
}
