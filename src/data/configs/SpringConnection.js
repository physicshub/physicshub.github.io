import { toMeters } from "../../constants/Utils.js";
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

// Initial values (SI)
export const INITIAL_INPUTS = {
  bobMass: 0.2,             // kg
  bobDamping: 0.99,         // damping factor (dimensionless)
  gravity: EARTH_G_SI,      // m/s²
  springK: 200,             // N/m
  springRestLength: 0,    // m
  minLength: 0.2,           // m
  maxLength: 3.5,           // m
  bobColor: "#7f7f7f",
  anchorColor: "#7f7f7f",
  springColor: "#00e6e6",
  bobSize: 0.5,             // m (diameter)
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
    label: "ζ - Damping factor:",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
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
    min: 0.1,
    max: 5,
    step: 0.01,
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
// Receives { pos, vel, mass, k, restLength } and { gravity }
export const SimInfoMapper = (state, context) => {
  const { pos, vel, mass, k, restLength } = state;
  const { gravity } = context;

  if (!pos || !vel) return {};

  // Conversion to meters
  const posXM = toMeters(pos.x);
  const posYM = toMeters(pos.y);
  const speedMs = toMeters(vel.mag());
  const currentLengthM = toMeters(pos.mag());

  // ΔL in meters
  const deltaL = currentLengthM - restLength;

  // Energies
  const elasticEnergy = 0.5 * k * Math.pow(deltaL, 2);
  const potentialEnergy = mass * gravity * posYM;
  const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2);
  const totalEnergy = elasticEnergy + potentialEnergy + kineticEnergy;

  return {
    "s(x, y) (position)": `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "k (spring constant)": `${k.toFixed(2)} N/m`,
    "L₀ (rest length)": `${restLength.toFixed(2)} m`,
    "Eₑ (elastic energy)": `${elasticEnergy.toFixed(2)} J`,
    "Eₚ (potential energy)": `${potentialEnergy.toFixed(2)} J`,
    "Eₖ (kinetic energy)": `${kineticEnergy.toFixed(2)} J`,
    "Eₜₒₜ (total energy)": `${totalEnergy.toFixed(2)} J`,
  };
};
