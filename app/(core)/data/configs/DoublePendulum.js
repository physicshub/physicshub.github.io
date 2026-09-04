// app/(core)/data/configs/DoublePendulum.js

export const INITIAL_INPUTS = {
  length1: 2,
  length2: 2,
  mass1: 1,
  mass2: 1,
  gravity: 9.81,
  damping: 0,
  initialAngle1: 90,
  initialAngle2: 90,
  trailEnabled: true,
  bob1Color: "#3b82f6",
  bob2Color: "#ef4444",
  ropeColor: "#9ca3af",
};

export const INPUT_FIELDS = [
  {
    name: "length1",
    label: "Length 1",
    symbol: "L₁",
    unit: "m",
    type: "number",
    min: 0.5,
    max: 4,
    step: 0.1,
  },
  {
    name: "length2",
    label: "Length 2",
    symbol: "L₂",
    unit: "m",
    type: "number",
    min: 0.5,
    max: 4,
    step: 0.1,
  },
  {
    name: "mass1",
    label: "Mass 1",
    symbol: "m₁",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "mass2",
    label: "Mass 2",
    symbol: "m₂",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "Gravity",
    symbol: "g",
    unit: "m/s²",
    type: "number",
    min: 1,
    max: 20,
    step: 0.1,
  },
  {
    name: "damping",
    label: "Damping",
    symbol: "b",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "initialAngle1",
    label: "Initial angle 1",
    symbol: "θ₁",
    unit: "°",
    type: "number",
    min: -180,
    max: 180,
    step: 1,
  },
  {
    name: "initialAngle2",
    label: "Initial angle 2",
    symbol: "θ₂",
    unit: "°",
    type: "number",
    min: -180,
    max: 180,
    step: 1,
  },
  {
    name: "trailEnabled",
    label: "Show trail",
    type: "checkbox",
  },
  {
    name: "bob1Color",
    label: "Bob 1 color",
    type: "color",
  },
  {
    name: "bob2Color",
    label: "Bob 2 color",
    type: "color",
  },
  {
    name: "ropeColor",
    label: "Rope color",
    type: "color",
  },
];

export const SimInfoMapper = (bodyState) => {
  const angle1 = (bodyState.angle1 * 180) / Math.PI;
  const angle2 = (bodyState.angle2 * 180) / Math.PI;

  return {
    "Angle 1": `${angle1.toFixed(1)}°`,
    "Angle 2": `${angle2.toFixed(1)}°`,
    "Angular Vel 1": `${bodyState.angularVel1.toFixed(2)} rad/s`,
    "Angular Vel 2": `${bodyState.angularVel2.toFixed(2)} rad/s`,
    KE: `${bodyState.kineticEnergy.toFixed(2)} J`,
    PE: `${bodyState.potentialEnergy.toFixed(2)} J`,
    "Total E": `${(bodyState.kineticEnergy + bodyState.potentialEnergy).toFixed(2)} J`,
  };
};
