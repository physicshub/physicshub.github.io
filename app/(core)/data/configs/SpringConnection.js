import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

// Initial values (SI units, Y-up physics coordinates)
export const INITIAL_INPUTS = {
  bobMass: 1, // kg
  bobDamping: 0.5, // damping coefficient (N·s/m)
  gravity: EARTH_G_SI, // m/s² (magnitude, always positive)
  springK: 200, // N/m
  springRestLength: 0.5, // m
  minLength: 0.2, // m
  maxLength: 3.5, // m
  bobColor: "#7f7f7f",
  anchorColor: "#7f7f7f",
  springColor: "#00e6e6",
  bobSize: 0.5, // m (diameter)
};

// Fields for DynamicInputs
export const INPUT_FIELDS = [
  {
    name: "bobMass",
    label: "Bob mass",
    symbol: "m",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "bobSize",
    label: "Bob radius",
    symbol: "r",
    unit: "m",
    type: "number",
    min: 0.05,
    max: 1,
    step: 0.05,
  },
  {
    name: "bobDamping",
    label: "Damping coefficient",
    symbol: "c",
    unit: "N·s/m",
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "Gravity",
    symbol: "g",
    unit: "m/s²",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "springK",
    label: "Spring constant",
    symbol: "k",
    unit: "N/m",
    type: "number",
    min: 1,
    max: 500,
    step: 1,
  },
  {
    name: "springRestLength",
    label: "Rest length",
    symbol: "L₀",
    unit: "m",
    type: "number",
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    name: "minLength",
    label: "Minimum length",
    symbol: "Lₘᵢₙ",
    unit: "m",
    type: "number",
    min: 0.05,
    max: 1,
    step: 0.01,
  },
  {
    name: "maxLength",
    label: "Maximum length",
    symbol: "Lₘₐₓ",
    unit: "m",
    type: "number",
    min: 1,
    max: 5,
    step: 0.1,
  },
  { name: "bobColor", label: "Bob color", type: "color" },
  { name: "anchorColor", label: "Anchor color", type: "color" },
  { name: "springColor", label: "Spring color", type: "color" },
];

export const SimInfoMapper = (state, context) => {
  const {
    pos,
    vel,
    mass,
    k,
    restLength,
    potentialEnergyElastic,
    springForceMag,
    currentLengthM,
    anchorHeight,
  } = state;

  if (!pos || !vel) return {};

  const posXM = pos.x;
  const posYM = pos.y;
  const speedMs = vel.mag();

  const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2);

  const heightFromAnchor = posYM - anchorHeight;
  const potentialEnergyGrav = mass * context.gravity * heightFromAnchor;

  const equilibriumDisplacement = (mass * context.gravity) / k;
  const equilibriumLength = restLength + equilibriumDisplacement;

  const totalEnergy =
    potentialEnergyElastic + kineticEnergy + potentialEnergyGrav;

  const displacement = currentLengthM - restLength;

  return {
    "Position (x, y)": `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
    "Height (from anchor)": `${heightFromAnchor.toFixed(2)} m`,
    "L (current length)": `${currentLengthM.toFixed(2)} m`,
    "L₀ (rest length)": `${restLength.toFixed(2)} m`,
    "Lₑ (equilibrium)": `${equilibriumLength.toFixed(2)} m`,
    "Δx (displacement)": `${displacement.toFixed(2)} m`,
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "k (spring constant)": `${k.toFixed(0)} N/m`,
    "Fₛ (spring force)": `${Math.abs(springForceMag).toFixed(2)} N`,
    "Eₑ (elastic PE)": `${potentialEnergyElastic.toFixed(2)} J`,
    "Eₚ (gravitational PE)": `${potentialEnergyGrav.toFixed(2)} J`,
    "Eₖ (kinetic energy)": `${kineticEnergy.toFixed(2)} J`,
    "Eₜₒₜ (total energy)": `${totalEnergy.toFixed(2)} J`,
  };
};
