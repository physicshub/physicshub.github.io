// src/data/configs/SimplePendulum.js
import { gravityTypes } from "../../data/constants.js";

export const INITIAL_INPUTS = {
  damping: 0.995,
  size: 24.0,
  color: "#7f7f7f",
  gravity: 1, // This is the value, not the index
};

export const INPUT_FIELDS = [
  { name: "size", label: "Bob Size", type: "number", min: 5, max: 200, step: 1 },
  { name: "damping", label: "Damping", type: "number", min: 0.9, max: 1, step: 0.001 },
  { name: "gravity", label: "Gravity", type: "select", options: gravityTypes },
  { name: "color", label: "Color", type: "color" },
];