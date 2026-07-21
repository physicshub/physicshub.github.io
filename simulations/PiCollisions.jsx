"use client";

import {
  createSimulation,
  collide1D,
  Vectors,
  toScreen,
} from "../app/(core)/engine/index.js";
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/PiCollisions.js";

const EPSILON = 1e-12;
const CONTACT_EPSILON = 1e-10;
const MAX_EVENTS_PER_FRAME = 10000;

/** Older saved inputs used shorter names; map them onto the current schema. */
const ALIASES = {
  smallBlockMass: ["smallMass"],
  largeBlockMass: ["largeMass"],
  smallBlockVelocityInitial: [
    "smallVelocityInitial",
    "smallBlockInitialVelocity",
  ],
  largeBlockVelocityInitial: [
    "largeVelocityInitial",
    "largeBlockInitialVelocity",
  ],
  largeBlockColor: ["largeMBlockColor"],
};

function normalize(values = {}) {
  const normalized = { ...INITIAL_INPUTS, ...values };
  for (const [key, legacy] of Object.entries(ALIASES)) {
    if (values[key] !== undefined) continue;
    const found = legacy.find((name) => values[name] !== undefined);
    if (found) normalized[key] = values[found];
  }
  return normalized;
}

const number = (value, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = (value, fallback) =>
  Math.max(EPSILON, number(value, fallback));

/**
 * The π collision counter.
 *
 * With a perfectly elastic wall and a mass ratio of 100ⁿ, the number of
 * collisions is the first n+1 digits of π. That result is exact, so the
 * simulation has to be exact too: an impulse solver stepping through time would
 * miss collisions and quietly change the count. Instead this advances the blocks
 * *event by event* — solve for the next contact time, jump straight to it,
 * resolve it analytically, repeat — so no collision can ever be missed and no
 * energy is lost to integration error.
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  simInfoRefs: () => ({
    statsRef: { current: { collisions: 0, limited: false } },
  }),

  build({ world, p, inputs, refs, infoRefs }) {
    const normalized = normalize(inputs);

    const smallSize = positive(normalized.smallBlockSize, 0.5);
    const largeSize = positive(normalized.largeBlockSize, 1);
    const gap = Math.max(0, number(normalized.wallGap, INITIAL_INPUTS.wallGap));

    const smallStartX = smallSize / 2 + gap;
    const largeStartX = Math.max(
      smallStartX + smallSize / 2 + largeSize / 2 + 0.5,
      toMeters(p.width * 0.72)
    );

    // Blocks rest on the floor, so their centres sit half a side above it.
    const small = world.addBody({
      label: "Small Block",
      shape: "square",
      kinematic: true,
      mass: () => positive(inputs.smallBlockMass, 1),
      size: smallSize,
      color: () => inputs.smallBlockColor,
      draggable: false,
      at: [smallStartX, smallSize / 2],
      velocity: [number(normalized.smallBlockVelocityInitial, 0), 0],
    });

    const large = world.addBody({
      label: "Large Block",
      shape: "square",
      kinematic: true,
      mass: () => positive(inputs.largeBlockMass, 100),
      size: largeSize,
      color: () => inputs.largeBlockColor,
      draggable: false,
      at: [largeStartX, largeSize / 2],
      velocity: [
        -Math.abs(number(normalized.largeBlockVelocityInitial, -1)),
        0,
      ],
    });

    infoRefs.statsRef.current = { collisions: 0, limited: false };
    refs.stats = infoRefs.statsRef.current;

    world.add(
      eventDrivenCollisions(small, large, refs),

      Vectors({
        bodies: [small, large],
        show: ["velocity"],
        scale: 45,
        labels: false,
        enabled: () => inputs.showVectors,
      }),

      wallAndFloor(),
      blockLabels([small, large])
    );

    return { small, large };
  },

  info({ handles, infoRefs }) {
    return {
      state: {
        smallBlock: handles.small,
        largeBlock: handles.large,
        totalCollisions: infoRefs.statsRef.current.collisions,
        eventsLimited: infoRefs.statsRef.current.limited,
      },
      context: {},
    };
  },
});

/**
 * Exact event-driven integration of the two blocks.
 *
 * Replaces the whole force/integrate pipeline for these bodies: between
 * collisions they move at constant velocity, so the trajectory is known in
 * closed form and only the contact times need solving.
 */
function eventDrivenCollisions(small, large, refs) {
  const leftEdge = (body) => body.state.position.x - body.radius;
  const rightEdge = (body) => body.state.position.x + body.radius;

  /** Time until the small block reaches the wall at x = 0, or Infinity. */
  const timeToWall = () => {
    const v = small.state.velocity.x;
    if (v >= 0) return Infinity;
    const edge = leftEdge(small);
    return edge <= 0 ? 0 : -edge / v;
  };

  /** Time until the two blocks touch, or Infinity if they are not closing. */
  const timeToContact = () => {
    const closingSpeed = small.state.velocity.x - large.state.velocity.x;
    if (closingSpeed <= EPSILON) return Infinity;
    const separation = leftEdge(large) - rightEdge(small);
    return separation <= CONTACT_EPSILON ? 0 : separation / closingSpeed;
  };

  const advance = (dt) => {
    small.state.position.x += small.state.velocity.x * dt;
    large.state.position.x += large.state.velocity.x * dt;
  };

  return {
    type: "integrator",

    beforeStep(ctx) {
      let remaining = ctx.dt;
      let events = 0;
      refs.stats.limited = false;

      while (remaining > EPSILON && events < MAX_EVENTS_PER_FRAME) {
        const wall = timeToWall();
        const contact = timeToContact();
        const next = Math.min(wall, contact);

        if (!Number.isFinite(next) || next > remaining) {
          advance(remaining);
          return;
        }

        advance(Math.max(0, next));
        remaining -= Math.max(0, next);

        if (wall <= contact) {
          // Perfectly elastic reflection off an immovable wall.
          small.state.position.x = small.radius;
          if (small.state.velocity.x < 0) {
            small.state.velocity.x *= -1;
            refs.stats.collisions += 1;
          }
        } else {
          const { v1, v2 } = collide1D(
            small.params.mass,
            small.state.velocity.x,
            large.params.mass,
            large.state.velocity.x,
            1
          );
          small.state.velocity.x = v1;
          large.state.velocity.x = v2;
          // Place them exactly in contact, never overlapping.
          large.state.position.x =
            small.state.position.x + small.radius + large.radius;
          refs.stats.collisions += 1;
        }

        events += 1;
      }

      if (events >= MAX_EVENTS_PER_FRAME) refs.stats.limited = true;
    },

    /** Keep both blocks sitting on the floor as their sizes change. */
    afterStep() {
      small.state.position.y = small.radius;
      large.state.position.y = large.radius;
      small.state.velocity.y = 0;
      large.state.velocity.y = 0;
    },
  };
}

function wallAndFloor() {
  return {
    zIndex: -2,
    render(ctx) {
      const { p } = ctx;
      const floorY = toScreen({ x: 0, y: 0 }).y;

      p.push();
      p.stroke(150);
      p.strokeWeight(4);
      p.line(0, floorY, p.width, floorY);
      p.strokeWeight(5);
      p.line(0, floorY - 220, 0, floorY);
      p.pop();
    },
  };
}

function blockLabels(bodies) {
  return {
    zIndex: 11,
    render(ctx) {
      const { p } = ctx;
      p.push();
      p.fill(255);
      p.noStroke();
      p.textAlign(p.CENTER);
      p.textSize(p.width < 600 ? 12 : 16);
      p.textFont("Poppins");
      for (const body of bodies) {
        const screen = toScreen(body.state.position);
        p.text(body.label, screen.x, screen.y - (toPixels(body.radius) + 14));
      }
      p.pop();
    },
  };
}
