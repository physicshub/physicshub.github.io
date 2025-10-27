// src/data/configs/SimplePendulum.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

// Valori iniziali della simulazione (SI)
export const INITIAL_INPUTS = {
  length: 1.75,          // (m)
  size: 0.24,            // (m)
  gravity: EARTH_G_SI,   // (m/s²)
  damping: 1,        // adimensionale
  color: "#7f7f7f",
  trailEnabled: true
};

// Campi per DynamicInputs
export const INPUT_FIELDS = [
  { name: "length", label: "Pendulum Length (m):", type: "number", min: 0.5, max: 5, step: 0.1 },
  { name: "size", label: "Bob Size (m):", type: "number", min: 0.05, max: 1, step: 0.05 },
  { name: "gravity", label: "Gravity (m/s²):", type: "select", options: gravityTypes },
  { name: "damping", label: "Damping:", type: "number", min: 0, max: 5, step: 0.001 },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "color", label: "Bob Color:", type: "color" }
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
    angle: `${angle.toFixed(3)} rad (${angleDeg.toFixed(2)} °)`,
    angularVelocity: `${angleVelocity.toFixed(3)} rad/s (${angVelDeg.toFixed(2)} °/s)`,
    period: `${period.toFixed(2)} s`,
    potentialEnergy: `${potentialEnergy.toFixed(3)} J`,
    kineticEnergy: `${kineticEnergy.toFixed(3)} J`,
    totalEnergy: `${totalEnergy.toFixed(3)} J`
  };
};
