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
  { name: "mass", label: "m - Mass (kg):", type: "number", placeholder: "Insert mass..." },
  { name: "size", label: "r - Ball radius (m):", type: "number", placeholder: "Insert ball size..." },
  { name: "gravity", label: "g - Gravity (m/s²):", type: "select", options: gravityTypes },
  { name: "restitution", label: "ζ - Damping:", type: "number" },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "ballColor", label: "Ball Color:", type: "color" },
];

export const FORCES = [
  {
    key: "gravity",
    color: "blue",
    // computeFn riceve state, inputs, context
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
      return null; // se non c’è contatto, nessuna forza
    },
  },
];

// Mapper specific for bouncing ball 
// Computes velocity, acceleration, position, per-bounce maxHeight and fallTime
export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel, mass } = state;
  const { gravity, canvasHeight } = context;
  const { maxHeightRef } = refs;

  const pixelX = toPixels(pos.x);
  const pixelY = toPixels(pos.y);

  const speedMs = toMeters(vel.mag());
  const posXM = toMeters(pixelX);
  const posYM = invertYAxis(canvasHeight, toMeters(pixelY));

  // Current height in meters (from ground)
  const currentHeightM = toMeters(canvasHeight - pixelY);

  // Update maxHeight for this bounce
  if (currentHeightM > maxHeightRef.current) {
    maxHeightRef.current = currentHeightM;
  }

  // Compute fallTime from maxHeight of this bounce (ideal free-fall time)
  let fallTime = 0;
  if (gravity > 0) {
    fallTime = Math.sqrt((2 * maxHeightRef.current) / gravity);
  }

  // Work done by gravity: W = m * g * h
  const work = mass * gravity * currentHeightM;

  return {
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "a (acceleration)": `${gravity.toFixed(2)} m/s²`,
    "s(x, y) (position)": `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
    "t (fall time)": `${fallTime.toFixed(2)} s`,
    "hₘₐₓ (height max)": `${maxHeightRef.current.toFixed(2)} m`,
    "W (work)": `${work.toFixed(2)} J`,
  };
};