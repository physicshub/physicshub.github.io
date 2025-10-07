// constants/Config.js

// Conversione metri ↔ pixel
export const SCALE = 100; // 1 m = 100 px

// Accelerazione di gravità terrestre in m/s²
export const EARTH_G_SI = 9.81;

// ==============================
// Gravity Types
// ==============================
export const gravityTypes = ((earthG = EARTH_G_SI) => [
  { value: 0.000 * earthG, label: "Zero Gravity" },
  { value: 0.028 * earthG, label: "Ceres (0.27 m/s²)" },
  { value: 0.063 * earthG, label: "Pluto (0.62 m/s²)" },
  { value: 0.165 * earthG, label: "Moon (1.62 m/s²)" },
  { value: 0.378 * earthG, label: "Mercury (3.70 m/s²)" },
  { value: 0.379 * earthG, label: "Mars (3.71 m/s²)" },
  { value: 0.886 * earthG, label: "Uranus (8.69 m/s²)" },
  { value: 0.904 * earthG, label: "Venus (8.87 m/s²)" },
  { value: 1.000 * earthG, label: "Earth (9.81 m/s²)" },
  { value: 1.065 * earthG, label: "Saturn (10.44 m/s²)" },
  { value: 1.140 * earthG, label: "Neptune (11.15 m/s²)" },
  { value: 2.528 * earthG, label: "Jupiter (24.79 m/s²)" }
])();

// Costanti fisiche comuni
export const CONSTANTS = {
  airDensity: 1.225, // kg/m³ aria a livello del mare
};


// Parametri di default per simulazioni
export const DEFAULTS = {
  restitution: 0.9,   // coefficiente di rimbalzo
  friction: 0.01,     // attrito dinamico
  dragCoeff: 0.47,    // coefficiente drag sfera
  ballRadius: 0.25,   // m
};
