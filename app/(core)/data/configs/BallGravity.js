// app/data/configs/BallGravity.js

import { toPixels, toMeters, invertYAxis } from "../../constants/Utils.js";
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

// Valori iniziali
export const INITIAL_INPUTS = {
  mass: 5, // kg
  size: 0.5, // m (diametro)
  gravity: EARTH_G_SI, // m/s²
  wind: 4, // m/s²
  frictionMu: 0, // coefficiente di attrito
  restitution: 1, // coefficiente di rimbalzo (0-1)
  color: "#7f7f7f",
  trailEnabled: true,
};

// Campi per DynamicInputs
export const INPUT_FIELDS = [
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "size",
    label: "d - Ball diameter (m):",
    type: "number",
    min: 0.1,
    max: 2,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "wind",
    label: "F - Wind (m/s²):",
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    name: "frictionMu",
    label: "μ - Friction coefficient:",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "restitution",
    label: "ζ - Damping:",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "color", label: "Ball Color:", type: "color" },
];

// Forze attive (ritornano { vec, color } per compatibilità con drawForceVector)
export const FORCES = [
  {
    key: "gravity",
    color: "blue",
    computeFn: ({ mass }, inputs) => {
      return { x: 0, y: mass * inputs.gravity };
    },
  },
  {
    key: "wind",
    color: "orange",
    computeFn: ({ mass, isBlowing }, inputs) => {
      if (inputs.wind > 0 && isBlowing) {
        return { x: mass * inputs.wind, y: 0 };
      }
      return null;
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
    key: "friction",
    color: "red",
    computeFn: ({ vel, pos, radius }, inputs, { canvasHeightMeters }) => {
      const bottomY = canvasHeightMeters;
      const contact = pos.y + radius >= bottomY - 1e-9;

      if (contact && vel.mag() > 0 && inputs.frictionMu > 0) {
        // Forza di attrito proporzionale solo alla velocità
        const frictionForceMag = inputs.frictionMu * vel.mag();
        const fric = vel.copy().mult(-1).setMag(frictionForceMag);
        return { x: fric.x, y: fric.y };
      }
      return null;
    },
  },
];

// Mapper per SimInfoPanel
export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel, mass } = state;
  const { gravity, canvasHeight } = context;
  const { maxHeightRef } = refs;

  const pixelX = toPixels(pos.x);
  const pixelY = toPixels(pos.y);

  const speedMs = toMeters(vel.mag());
  const posXM = toMeters(pixelX);
  const posYM = invertYAxis(canvasHeight, toMeters(pixelY));

  // Altezza corrente dal suolo
  const currentHeightM = toMeters(canvasHeight - pixelY);

  // Aggiorna maxHeight
  if (currentHeightM > maxHeightRef.current) {
    maxHeightRef.current = currentHeightM;
  }

  // Tempo di caduta teorico
  let fallTime = 0;
  if (gravity > 0) {
    fallTime = Math.sqrt((2 * maxHeightRef.current) / gravity);
  }

  // Energia cinetica
  const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2);

  return {
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "a (acceleration)": `${gravity.toFixed(2)} m/s²`,
    "s(x, y) (position)": `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
    "Eₖ (kinetic energy)": `${kineticEnergy.toFixed(2)} J`,
    "t (fall time)": `${fallTime.toFixed(2)} s`,
    "hₘₐₓ (height max)": `${maxHeightRef.current.toFixed(2)} m`,
  };
};
