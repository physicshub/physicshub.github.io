export const INITIAL_INPUTS = {
  radius: 1,
  speed: 2,
  mass: 1,
  size: 0.2,
  trailEnabled: true,
  color: "#3b82f6",
};

export const INPUT_FIELDS = [
  {
    type: "number",
    name: "radius",
    label: "r - Radius (m)",
    min: 0.1,
    step: 0.1,
  },
  {
    type: "number",
    name: "speed",
    label: "v - Tangential Speed (m/s)",
    min: 0,
    step: 0.1,
  },
  {
    type: "number",
    name: "mass",
    label: "m - Mass (kg)",
    min: 0.1,
    step: 0.1,
  },
  {
    type: "number",
    name: "size",
    label: "d - Ball diameter (m)",
    min: 0,
    step: 0.1,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  {
    type: "color",
    name: "color",
    label: "Ball Color",
  },
];

export const SimInfoMapper = (state) => {
  const { position, velocity, radius, speed } = state;

  const acc = radius > 0 ? (speed * speed) / radius : 0;
  const omega = radius > 0 ? speed / radius : 0;
  const period = omega > 0 ? (2 * Math.PI) / omega : 0;

  return {
    "s(x, y) (position)": position
      ? `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}) m`
      : "-",

    "v (speed)": velocity ? velocity.mag().toFixed(2) + " m/s" : "-",

    "aₙ (centripetal acc)": acc.toFixed(3) + " m/s²",

    "ω (angular velocity)": omega.toFixed(3) + " rad/s",

    "T (period)": period.toFixed(3) + " s",
  };
};
