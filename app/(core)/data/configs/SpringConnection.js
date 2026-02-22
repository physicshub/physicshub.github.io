import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

// Initial values (SI units, Y-up physics coordinates)
export const INITIAL_INPUTS = {
  bobMass: 0.2, // kg
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
    label: "m - Bob mass (kg):",
    type: "number",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "bobSize",
    label: "r - Bob radius (m):",
    type: "number",
    min: 0.05,
    max: 1,
    step: 0.05,
  },
  {
    name: "bobDamping",
    label: "c - Damping coefficient (N·s/m):",
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "springK",
    label: "k - Spring constant (N/m):",
    type: "number",
    min: 1,
    max: 500,
    step: 1,
  },
  {
    name: "springRestLength",
    label: "L₀ - Rest length (m):",
    type: "number",
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    name: "minLength",
    label: "Lₘᵢₙ - Minimum length (m):",
    type: "number",
    min: 0.05,
    max: 1,
    step: 0.01,
  },
  {
    name: "maxLength",
    label: "Lₘₐₓ - Maximum length (m):",
    type: "number",
    min: 1,
    max: 5,
    step: 0.1,
  },
  { name: "bobColor", label: "Bob color:", type: "color" },
  { name: "anchorColor", label: "Anchor color:", type: "color" },
  { name: "springColor", label: "Spring color:", type: "color" },
];

// Mapper for SimInfoPanel
// ALL CALCULATIONS IN Y-UP PHYSICS COORDINATES
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
  } = state;

  if (!pos || !vel) return {};

  // Position in physics coordinates (Y-up)
  const posXM = pos.x;
  const posYM = pos.y;
  const speedMs = vel.mag();

  // Kinetic energy
  const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2);

  // Gravitational potential energy
  // In Y-up coords: higher Y = more PE
  // Use anchor as reference point (PE = 0 at anchor height)
  const potentialEnergyGrav = mass * context.gravity * posYM;

  const equilibriumDisplacement = (mass * context.gravity) / k;
  const equilibriumLength = restLength + equilibriumDisplacement;

  // Total mechanical energy
  const totalEnergy =
    potentialEnergyElastic + kineticEnergy + potentialEnergyGrav;

  // Displacement from rest length
  const displacement = currentLengthM - restLength;

  return {
    "Position (x, y)": `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
    "Height (from ground)": `${posYM.toFixed(2)} m`,
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
