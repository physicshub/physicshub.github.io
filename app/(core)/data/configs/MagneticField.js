import { EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  mass: 1.0,
  charge: 1.0,
  size: 0.2,
  initialVelocity: 20,
  angle: 0,
  B: 0.5, // tesla, out-of-plane
  trailEnabled: true,
  particleColor: "#ff7f50",
};

export const INPUT_FIELDS = [
  { name: "mass", label: "m - Mass (kg)", type: "number" },
  { name: "charge", label: "q - Charge (C)", type: "number" },
  { name: "size", label: "d - Diameter (m)", type: "number" },
  { name: "initialVelocity", label: "v₀ - Initial Velocity (m/s)", type: "number" },
  { name: "angle", label: "θ - Angle (°)", type: "number" },
  { name: "B", label: "B - Magnetic Field (T)", type: "number" },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "particleColor", label: "Particle Color", type: "color" },
];

export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel } = state || {};
  const vmag = vel && typeof vel.mag === "function" ? vel.mag() : 0;
  const m = context?.mass ?? 1;
  const q = context?.charge ?? 1;
  const B = context?.B ?? 0;

  // Cyclotron radius r = m*v/(|q|*|B|)
  let rCyclotron = 0;
  if (Math.abs(q * B) > 1e-12) rCyclotron = Math.abs((m * vmag) / (q * B));

  // Cyclotron frequency f = |q|*|B|/(2*pi*m)
  let freq = 0;
  if (Math.abs(m) > 1e-12) freq = Math.abs((q * B) / (2 * Math.PI * m));

  return {
    "v (speed)": `${Number.isFinite(vmag) ? vmag.toFixed(2) : "0.00"} m/s`,
    "r₍cyclo₎": `${Number.isFinite(rCyclotron) ? rCyclotron.toFixed(3) : "0.000"} m`,
    "f (frequency)": `${Number.isFinite(freq) ? freq.toFixed(3) : "0.000"} Hz`,
    "s(x,y)": `(${pos?.x?.toFixed?.(2) ?? "0.00"}, ${pos?.y?.toFixed?.(2) ?? "0.00"}) m`,
  };
};
