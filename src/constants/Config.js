// constants/Config.js

// Conversione metri ↔ pixel
export const SCALE = 100; // 1 m = 100 px

// Costanti fisiche comuni
export const CONSTANTS = {
  g: 9.81,          // m/s² gravità terrestre
  airDensity: 1.225, // kg/m³ aria a livello del mare
};

// Parametri di default per simulazioni
export const DEFAULTS = {
  restitution: 0.9,   // coefficiente di rimbalzo
  friction: 0.01,     // attrito dinamico
  dragCoeff: 0.47,    // coefficiente drag sfera
  ballRadius: 0.25,   // m
};
