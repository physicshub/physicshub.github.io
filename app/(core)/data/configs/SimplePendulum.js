// app/data/configs/SimplePendulum.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

// Valori iniziali della simulazione (SI)
export const INITIAL_INPUTS = {
  length: 2, // (m)
  size: 0.3, // (m)
  gravity: EARTH_G_SI, // (m/s²)
  damping: 0.99, // adimensionale
  bobColor: "#7f7f7f",
  stringColor: "#00e6e6",
  trailEnabled: true,
};

// Campi per DynamicInputs
export const INPUT_FIELDS = [
  {
    name: "length",
    label: "l - Lenght (m):",
    type: "number",
    min: 0.5,
    max: 5,
    step: 0.1,
  }, // Lunghezza pendolo
  {
    name: "size",
    label: "r - Ball radius (m):",
    type: "number",
    min: 0.05,
    max: 1,
    step: 0.05,
  }, // Raggio bob
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  }, // Accelerazione di gravità
  {
    name: "damping",
    label: "ζ - Damping:",
    type: "number",
    min: 0,
    max: 5,
    step: 0.001,
  }, // Coefficiente di smorzamento
  { name: "trailEnabled", label: "Trail", type: "checkbox" },
  { name: "bobColor", label: "Bob Color:", type: "color" },
  { name: "stringColor", label: "String Color:", type: "color" },
];

// Mapper per SimInfoPanel
// Riceve { angle [rad], angleVelocity [rad/s], length [m] } e { gravity [m/s²] }
export const SimInfoMapper = (state, context) => {
  const { angle, angleVelocity, length } = state;
  const { gravity } = context;

  // Periodo teorico (piccole oscillazioni)
  let period = 0;
  if (gravity > 0 && length > 0) {
    period = 2 * Math.PI * Math.sqrt(length / gravity); // [s]
  }

  // Conversioni
  const angleDeg = (angle * 180) / Math.PI;
  const angVelDeg = (angleVelocity * 180) / Math.PI;

  // Energetica (massa unitaria m = 1 kg)
  const h = length * (1 - Math.cos(angle)); // altezza rispetto alla posizione di equilibrio
  const potentialEnergy = gravity * h; // [J]
  const kineticEnergy = 0.5 * (length * angleVelocity) ** 2; // [J]
  const totalEnergy = potentialEnergy + kineticEnergy;

  return {
    "θ (angle)": `${angle.toFixed(3)} rad (${angleDeg.toFixed(2)} °)`,
    "ω (angular vel.)": `${angleVelocity.toFixed(
      3
    )} rad/s (${angVelDeg.toFixed(2)} °/s)`,
    "T (period)": `${period.toFixed(2)} s`,
    "Eₚ (potential energy)": `${potentialEnergy.toFixed(3)} J`,
    "Eₖ (kinetic energy)": `${kineticEnergy.toFixed(3)} J`,
    "Eₜₒₜ (total energy)": `${totalEnergy.toFixed(3)} J`,
  };
};
