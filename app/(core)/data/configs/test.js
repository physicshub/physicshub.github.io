// app/data/configs/test.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  size: 0.5, // diametro medio in metri
  mass: 1.0, // kg
  gravity: EARTH_G_SI, // m/s²
  restitution: 1, // coefficiente di rimbalzo
  frictionMu: 0, // coefficiente di attrito dinamico
  numBodies: 20, // numero di corpi per benchmarking
  trailEnabled: true,
  color: "#ff0000",
};

export const INPUT_FIELDS = [
  {
    name: "numBodies",
    label: "Number of bodies",
    symbol: "N",
    type: "number",
    min: 1,
    max: 1000,
    step: 1,
  },
  {
    name: "gravity",
    label: "Gravity",
    symbol: "g",
    unit: "m/s²",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "size",
    label: /* i18n */ "Base diameter",
    symbol: "d",
    unit: "m",
    type: "number",
    min: 0.1,
    max: 2,
    step: 0.1,
  },
  {
    name: "mass",
    label: /* i18n */ "Base mass",
    symbol: "m",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  {
    name: "restitution",
    label: "Restitution",
    symbol: "e",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    name: "frictionMu",
    label: "Friction coefficient",
    symbol: "μ",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
];

// Rolling window of up to 120 rendered frames, including drawing and scheduling.
// These are wall-clock frame intervals, not isolated physics execution times.
export const SimInfoMapper = ({ frameTimes, bodyCount }) => {
  const sorted = [...frameTimes].sort((a, b) => a - b);
  const count = sorted.length;
  const mean = count ? sorted.reduce((sum, ms) => sum + ms, 0) / count : 0;
  const slow = sorted.filter((ms) => ms > 1000 / 30).length;
  const milliseconds = (ms) => (count ? `${ms.toFixed(2)} ms` : "—");

  return {
    fps: count ? `${(1000 / mean).toFixed(1)} fps` : "—",
    /* i18n */ "Mean frame time": milliseconds(mean),
    /* i18n */ "P95 frame time": milliseconds(
      sorted[Math.ceil(count * 0.95) - 1]
    ),
    /* i18n */ "Slow frames (>33.3 ms)": count
      ? `${((slow / count) * 100).toFixed(1)}%`
      : "—",
    /* i18n */ "Sampled frames": `${count} / 120`,
    /* i18n */ Bodies: bodyCount,
    // Candidate pairs for the O(n²) pass, not the number of actual contacts.
    /* i18n */ "Candidate pairs per step": (bodyCount * (bodyCount - 1)) / 2,
  };
};
