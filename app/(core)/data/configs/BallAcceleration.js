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
    step: 1,
  },
  {
    type: "number",
    name: "maxspeed",
    label: "vₘₐₓ - Max Speed (m/s)",
    min: 1,
    max: 20,
    step: 0.1,
  },
  {
    type: "number",
    name: "acceleration",
    label: "a - Acceleration (m/s²)",
    min: 0.001,
    max: 1,
    step: 0.001,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  {
    type: "color",
    name: "color",
    label: "Ball Color",
  },
];

export const SimInfoMapper = (state, context) => {
  const { pos, vel, acceleration, maxspeed } = state;
  const { canvasHeight } = context;

  pos.y = invertYAxis(canvasHeight, pos.y);
  return {
    "s(x, y) (position)": pos
      ? `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}) m`
      : "-",
    "v(x, y) (velocity xy)": vel
      ? `(${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}) m/s`
      : "-",
    "v (velocity)": vel ? vel.mag().toFixed(2) + " m/s" : "-",
    "a (acceleration)": acceleration.toFixed(3) + " m/s²",
    "vₘₐₓ (max speed)": maxspeed.toFixed(2) + " m/s",
  };
};
