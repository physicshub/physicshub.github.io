// app/data/configs/bouncingBall.js
import { toPixels, toMeters, invertYAxis } from "../../constants/Utils.js";
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  mass: 1,
  size: 0.5,
  trailEnabled: true,
  ballColor: "#7f7f7f",
  restitution: 1,
  gravity: EARTH_G_SI,
};

export const INPUT_FIELDS = [
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    placeholder: "Insert mass...",
    min: 0,
  },
  {
    name: "size",
    label: "d - Ball diameter (m):",
    type: "number",
    placeholder: "Insert ball size...",
    min: 0,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "restitution",
    label: "ζ - Damping:",
    type: "number",
    min: 0,
    max: 2,
    step: 0.1,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "ballColor", label: "Ball Color:", type: "color" },
];

export const FORCES = [
  {
    key: "gravity",
    color: "blue",
    computeFn: ({ mass }, inputs) => {
      return { x: 0, y: mass * inputs.gravity };
    },
  },
  {
    key: "normal",
    color: "green",
    computeFn: ({ mass, pos, radius }, inputs, { canvasHeightMeters }) => {
      const bottomY = canvasHeightMeters;
      const contact = pos.y + radius >= bottomY - 1e-9;
      if (contact) {
        return { x: 0, y: -mass * inputs.gravity };
      }
      return null;
    },
  },
  {
    key: "velocity",
    color: "red",
    computeFn: ({ vel }) => {
      if (!vel) return null;
      return { x: vel.x, y: vel.y };
    },
  },
];

/**
 * SimInfoMapper for the bouncing ball simulation.
 *
 * IMPORTANT coordinate notes:
 * - `pos` is already in meters (physics Y-up coords) — do NOT call toPixels/toMeters on it.
 * - Height above floor = pos.y - radius, because the floor constraint places
 *   the ball center at y = radius when resting.
 * - For display, we invert Y so height increases upward visually.
 */
export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel, mass } = state;
  const { gravity, canvasHeight } = context;
  const { maxHeightRef } = refs;

  // FIX: pos is already in meters — no unit conversion needed.
  // X is straightforward. For displayed Y, convert from physics Y-up to
  // a "height from floor" value the user expects (0 = resting on floor).
  const radius = state.size ? state.size / 2 : 0;
  const posXM = pos.x;
  // Height of ball center above its resting floor position
  const heightAboveFloor = pos.y - radius;

  const speedMs = vel.mag();

  // Update maxHeight for this bounce
  if (heightAboveFloor > maxHeightRef.current) {
    maxHeightRef.current = heightAboveFloor;
  }

  // Ideal free-fall time from max height
  let fallTime = 0;
  if (gravity > 0) {
    fallTime = Math.sqrt((2 * maxHeightRef.current) / gravity);
  }

  // Work done by gravity from max height down to current height
  // W = m * g * Δh  (positive when falling)
  const work = mass * gravity * (maxHeightRef.current - heightAboveFloor);

  return {
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "a (acceleration)": `${Number(gravity).toFixed(2)} m/s²`,
    "s(x, y) (position)": `(${posXM.toFixed(2)}, ${heightAboveFloor.toFixed(2)}) m`,
    "t (fall time)": `${fallTime.toFixed(2)} s`,
    "hₘₐₓ (height max)": `${maxHeightRef.current.toFixed(2)} m`,
    "W (work)": `${work.toFixed(2)} J`,
  };
};
