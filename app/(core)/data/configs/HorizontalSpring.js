import { EARTH_G_SI } from "../../constants/Config.js";

// Initial values (SI units, Y-up physics coordinates)
export const INITIAL_INPUTS = {
  bobMass: 1, // kg
  bobDamping: 0.5, // damping coefficient (N·s/m)
  springK: 200, // N/m
  springRestLength: 1.5, // m
  minLength: 0.2, // m
  maxLength: 4.0, // m
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
    anchorX,
  } = state;

  if (!pos || !vel) return {};

  const posXM = pos.x;
  const speedMs = Math.abs(vel.x); // horizontal only

  const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2);

  const displacement = currentLengthM - restLength;

  // Natural frequency: ω = sqrt(k / m)
  const angularFrequency = Math.sqrt(k / mass);
  const period = (2 * Math.PI) / angularFrequency;

  const totalEnergy = potentialEnergyElastic + kineticEnergy;

  return {
    "Position (x)": `${posXM.toFixed(2)} m`,
    "Distance from wall": `${(posXM - anchorX).toFixed(2)} m`,
    "L (current length)": `${currentLengthM.toFixed(2)} m`,
    "L₀ (rest length)": `${restLength.toFixed(2)} m`,
    "Δx (displacement)": `${displacement.toFixed(2)} m`,
    "v (velocity)": `${speedMs.toFixed(2)} m/s`,
    "k (spring constant)": `${k.toFixed(0)} N/m`,
    "Fₛ (spring force)": `${Math.abs(springForceMag).toFixed(2)} N`,
    "ω (angular frequency)": `${angularFrequency.toFixed(2)} rad/s`,
    "T (period)": `${period.toFixed(2)} s`,
    "Eₑ (elastic PE)": `${potentialEnergyElastic.toFixed(2)} J`,
    "Eₖ (kinetic energy)": `${kineticEnergy.toFixed(2)} J`,
    "Eₜₒₜ (total energy)": `${totalEnergy.toFixed(2)} J`,
  };
};
