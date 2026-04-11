// app/data/configs/ThreeBodyProblem.js

import { SCALE } from "../../constants/Config.js";

// Gravitational constant (scaled for visual effect)
export const G = 1000;

// Initial positions (relative to center, in meters)
export const INITIAL_POSITIONS = [
  { x: -1, y: 0 },   // Body 1 (left)
  { x: 1, y: 0 },    // Body 2 (right)
  { x: 0, y: 0.5 },  // Body 3 (top)
];

// Initial velocities for figure-8 orbit (m/s)
export const INITIAL_VELOCITIES = [
  { x: 0, y: 0.5 },    // Body 1
  { x: 0, y: -0.5 },   // Body 2
  { x: 0, y: 0 },      // Body 3
];

// Preset configurations
export const PRESETS = {
  figure8: {
    name: "Figure-8 Orbit",
    masses: [1, 1, 1],
    positions: [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0.866 },
    ],
    velocities: [
      { x: 0.347, y: 0.467 },
      { x: 0.347, y: 0.467 },
      { x: -0.694, y: 0 },
    ],
  },
  lagrange: {
    name: "Lagrange Configuration",
    masses: [10, 10, 1],
    positions: [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1.732 },
    ],
    velocities: [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
    ],
  },
  chaotic: {
    name: "Chaotic Motion",
    masses: [1.5, 1, 0.8],
    positions: [
      { x: -1.2, y: 0.3 },
      { x: 1, y: -0.2 },
      { x: 0, y: 0.8 },
    ],
    velocities: [
      { x: 0.1, y: 0.4 },
      { x: -0.2, y: -0.3 },
      { x: 0.15, y: 0.1 },
    ],
  },
};

// Initial values
export const INITIAL_INPUTS = {
  mass1: 1, // kg
  mass2: 1, // kg
  mass3: 1, // kg
  size: 0.3, // m (diameter)
  G: G, // Gravitational constant
  trailEnabled: true,
  trailLength: 300,
  color1: "#FF6B6B", // Red
  color2: "#4ECDC4", // Teal
  color3: "#FFE66D", // Yellow
  preset: "figure8",
};

// Input fields for DynamicInputs
export const INPUT_FIELDS = [
  {
    name: "preset",
    label: "Preset Configuration:",
    type: "select",
    options: [
      { value: "figure8", label: "Figure-8 Orbit" },
      { value: "lagrange", label: "Lagrange Configuration" },
      { value: "chaotic", label: "Chaotic Motion" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    name: "mass1",
    label: "m₁ - Mass 1 (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "mass2",
    label: "m₂ - Mass 2 (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "mass3",
    label: "m₃ - Mass 3 (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "size",
    label: "d - Body diameter (m):",
    type: "number",
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  {
    name: "G",
    label: "G - Gravitational constant:",
    type: "number",
    min: 100,
    max: 5000,
    step: 100,
  },
  {
    name: "trailEnabled",
    label: "Enable trail",
    type: "checkbox",
  },
  {
    name: "trailLength",
    label: "Trail length:",
    type: "number",
    min: 50,
    max: 1000,
    step: 50,
  },
  { name: "color1", label: "Body 1 Color:", type: "color" },
  { name: "color2", label: "Body 2 Color:", type: "color" },
  { name: "color3", label: "Body 3 Color:", type: "color" },
];

// SimInfo mapper
export const SimInfoMapper = (state, context, refs) => {
  const { body1, body2, body3 } = state;
  const { G } = context;

  const v1 = body1?.state.velocity.mag() || 0;
  const v2 = body2?.state.velocity.mag() || 0;
  const v3 = body3?.state.velocity.mag() || 0;

  const ke1 = body1?.getKineticEnergy() || 0;
  const ke2 = body2?.getKineticEnergy() || 0;
  const ke3 = body3?.getKineticEnergy() || 0;
  const totalKE = ke1 + ke2 + ke3;

  return {
    "v₁ (velocity 1)": `${v1.toFixed(2)} m/s`,
    "v₂ (velocity 2)": `${v2.toFixed(2)} m/s`,
    "v₃ (velocity 3)": `${v3.toFixed(2)} m/s`,
    "Eₖ (kinetic energy)": `${totalKE.toFixed(2)} J`,
  };
};
