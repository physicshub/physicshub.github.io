 // configs/bouncingBall.js
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  size: 0.48,
  trailEnabled: true,
  ballColor: "#7f7f7f",
  restitution: 0.9,
  gravity: EARTH_G_SI,
};

export const INPUT_FIELDS = [
  { name: "size", label: "Ball Size (m):", type: "number", placeholder: "Insert ball size..." },
  { name: "gravity", label: "Gravity (m/s²):", type: "select", options: gravityTypes },
  { name: "restitution", label: "Restitution (0-1):", type: "number" },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "ballColor", label: "Ball Color:", type: "color" },
];
