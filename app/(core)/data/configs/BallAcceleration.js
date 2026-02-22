// app/data/configs/BallAcceleration.js
import { invertYAxis } from "../../constants/Utils.js";

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
    label: "d - Ball diameter (m)",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    type: "number",
    name: "maxspeed",
    label: "vₘₐₓ - Max Speed (m/s)",
    min: 0,
    step: 0.1,
  },
  {
    type: "number",
    name: "acceleration",
    label: "a - Acceleration (m/s²)",
    min: 0,
    step: 0.01,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  {
    type: "color",
    name: "color",
    label: "Ball Color",
  },
];

export const FORCES = [
  {
    key: "acceleration",
    color: "blue",
    computeFn: ({ dir }) => {
      if (!dir) return null;
      // scala per renderlo visibile
      return { x: dir.x, y: dir.y };
    },
  },
  {
    key: "velocity",
    color: "red",
    computeFn: ({ vel }) => {
      if (!vel) return null;
      return { x: vel.x, y: vel.y };
    },
  },
];

export const SimInfoMapper = (state, context) => {
  const { position, velocity, acceleration, maxspeed } = state;
  const { canvasHeight } = context;

  position.y = invertYAxis(canvasHeight, position.y);
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
