export const INITIAL_INPUTS = {
  mass: 10,
  G: 1,
  size: 0.5,
  trailEnabled: true,
  chaos: 0,
  configuration: "figure8",
};

export const INPUT_FIELDS = [
  {
    name: "configuration",
    label: "Configuration",
    type: "select",
    options: [
      { value: "figure8", label: "Stable – Figure-8" },
      { value: "lagrange", label: "Stable – Lagrange Triangle" },
      { value: "chaotic", label: "Unstable / Chaotic" },
    ],
  },
  { name: "mass", label: "Mass", type: "number", min: 0.1, step: 0.1 },
  {
    name: "G",
    label: "Gravitational Constant",
    type: "number",
    min: 0.01,
    step: 0.01,
  },
  { name: "size", label: "Body Size", type: "number", min: 0.01, step: 0.01 },
  {
    name: "chaos",
    label: "Randomness",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  { name: "trailEnabled", label: "Enable Trails", type: "checkbox" },
];

export const FORCES = [];

export const SimInfoMapper = () => ({ Bodies: 3 });
