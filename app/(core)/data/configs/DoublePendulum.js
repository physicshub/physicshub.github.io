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
    label: "Length 1 (m)",
    type: "number",
    min: 0.5,
    max: 4,
    step: 0.1,
  },
  {
    name: "length2",
    label: "Length 2 (m)",
    type: "number",
    min: 0.5,
    max: 4,
    step: 0.1,
  },
  {
    name: "mass1",
    label: "Mass 1 (kg)",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "mass2",
    label: "Mass 2 (kg)",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "Gravity (m/s²)",
    type: "number",
    min: 1,
    max: 20,
    step: 0.1,
  },
  {
    name: "damping",
    label: "Damping",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "initialAngle1",
    label: "Initial Angle 1 (°)",
    type: "number",
    min: -180,
    max: 180,
    step: 1,
  },
  {
    name: "initialAngle2",
    label: "Initial Angle 2 (°)",
    type: "number",
    min: -180,
    max: 180,
    step: 1,
  },
  {
    name: "trailEnabled",
    label: "Show Trail",
    type: "checkbox",
  },
  {
    name: "bob1Color",
    label: "Bob 1 Color",
    type: "color",
  },
  {
    name: "bob2Color",
    label: "Bob 2 Color",
    type: "color",
  },
  {
    name: "ropeColor",
    label: "Rope Color",
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
