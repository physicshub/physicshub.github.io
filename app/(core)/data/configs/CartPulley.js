import { EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  cartMass: 0.4,
  hangingMass: 0.1,
  gravity: EARTH_G_SI,
};

// A single minimum is a hard limit, including typed and shared values.
export const INPUT_FIELDS = [
  {
    name: "cartMass",
    label: "Cart mass",
    symbol: "M",
    unit: "kg",
    type: "number",
    min: 0.01,
    step: 0.1,
  },
  {
    name: "hangingMass",
    label: "Hanging mass",
    symbol: "m",
    unit: "kg",
    type: "number",
    min: 0.01,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "Gravity",
    symbol: "g",
    unit: "m/s²",
    type: "number",
    min: 0,
    step: 0.1,
  },
];

export const SimInfoMapper = (state) => ({
  Status: state.stopped ? "Cart at stop — reset" : "Travel available",
  "a (before stop)": `${state.acceleration.toFixed(3)} m/s²`,
  "T (before stop)": `${state.tension.toFixed(4)} N`,
  "Hanging weight": `${state.weight.toFixed(4)} N`,
  Speed: `${state.speed.toFixed(3)} m/s`,
});
