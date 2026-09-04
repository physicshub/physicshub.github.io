// app/data/configs/BallAcceleration.js

export const INITIAL_INPUTS = {
  size: 0.5, // diametro palla in metri
  maxspeed: 5, // velocità massima (m/s)
  acceleration: 2, // accelerazione costante verso il target (m/s²)
  color: "#7f7f7f", // colore palla
  trailEnabled: true,
};

export const INPUT_FIELDS = [
  {
    type: "number",
    name: "size",
    label: "Ball diameter",
    symbol: "d",
    unit: "m",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    type: "number",
    name: "maxspeed",
    label: "Max speed",
    symbol: "vₘₐₓ",
    unit: "m/s",
    min: 0,
    max: 20,
    step: 0.1,
  },
  {
    type: "number",
    name: "acceleration",
    label: "Acceleration",
    symbol: "a",
    unit: "m/s²",
    min: 0,
    max: 20,
    step: 0.01,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  {
    type: "color",
    name: "color",
    label: "Ball color",
  },
];

export const SimInfoMapper = (state) => {
  const { position, velocity, acceleration, maxspeed } = state;

  return {
    "s(x, y) (position)": position
      ? `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}) m`
      : "-",
    "v(x, y) (velocity xy)": velocity
      ? `(${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)}) m/s`
      : "-",
    "v (velocity)": velocity ? velocity.mag().toFixed(2) + " m/s" : "-",
    "a (acceleration)": acceleration.toFixed(3) + " m/s²",
    "vₘₐₓ (max speed)": maxspeed.toFixed(2) + " m/s",
  };
};
