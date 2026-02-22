// app/data/configs/test.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  size: 0.5, // diametro medio in metri
  mass: 1.0, // kg
  gravity: EARTH_G_SI, // m/s²
  restitution: 1, // coefficiente di rimbalzo
  frictionMu: 0, // coefficiente di attrito dinamico
  numBodies: 20, // numero di corpi per benchmarking
  trailEnabled: true,
  color: "#ff0000",
};

export const INPUT_FIELDS = [
  {
    name: "numBodies",
    label: "N - Number of bodies:",
    type: "number",
    min: 1,
    max: 1000,
    step: 10,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
];

export const FORCES = [];

// Mapper specifico per benchmarking
export const SimInfoMapper = (_state, context) => {
  const { p } = context;
  // FPS medio
  const fps = Math.round(p.frameRate());

  return {
    fps: fps + " fps",
  };
};
