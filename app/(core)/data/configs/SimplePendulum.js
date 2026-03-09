// app/data/configs/SimplePendulum.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

// Valori iniziali della simulazione (SI)
export const INITIAL_INPUTS = {
  length: 3,
  mass: 1,
  gravity: 9.81,
  damping: 0.1,
  initialAngle: 45,
  showForces: true,
  showComponents: false,
  trailEnabled: true,
  bobColor: "#3b82f6",
  ropeColor: "#9ca3af",
};

// Campi per DynamicInputs
export const INPUT_FIELDS = [
  {
    name: "length",
    label: "Length (m)",
    type: "number",
    min: 1,
    max: 5,
    step: 0.1,
  },
  {
    name: "mass",
    label: "Mass (kg)",
    type: "number",
    min: 0.5,
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
    name: "initialAngle",
    label: "Initial Angle (°)",
    type: "number",
    min: -90,
    max: 90,
    step: 1,
  },
  {
    name: "showForces",
    label: "Show Forces",
    type: "checkbox",
  },
  {
    name: "showComponents",
    label: "Show Components",
    type: "checkbox",
  },
  {
    name: "trailEnabled",
    label: "Show Trail",
    type: "checkbox",
  },
  {
    name: "bobColor",
    label: "Bob Color",
    type: "color",
  },
  {
    name: "ropeColor",
    label: "Rope Color",
    type: "color",
  },
];

// Mapper per SimInfoPanel
// Riceve { angle [rad], angleVelocity [rad/s], length [m] } e { gravity [m/s²] }
export const SimInfoMapper = (bodyState) => {
  const angle = (bodyState.angleRad * 180) / Math.PI;

  return {
    Angle: `${angle.toFixed(1)}°`,
    "Angular Velocity": `${bodyState.angularVel.toFixed(2)} rad/s`,
    Height: `${(-bodyState.position.y).toFixed(2)} m`,
    Speed: `${bodyState.velocity.mag().toFixed(2)} m/s`,
    KE: `${bodyState.kineticEnergy.toFixed(2)} J`,
    PE: `${bodyState.potentialEnergy.toFixed(2)} J`,
    "Total E": `${(bodyState.kineticEnergy + bodyState.potentialEnergy).toFixed(2)} J`,
  };
};
