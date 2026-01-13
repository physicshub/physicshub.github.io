import { EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  rodLength: 1.0,
  moment: 1.0,
  angle: 0,
  rodX: 0,
  rodY: 0,
  showFieldLines: true,
  // field-line density is fixed now; simplify inputs
  // (numSeeds and seedRadius removed for simplicity)
  trailEnabled: true,
};

export const INPUT_FIELDS = [
  { name: "rodLength", label: "Rod length (m)", type: "number" },
  { name: "moment", label: "Dipole moment (A·m²)", type: "number" },
  { name: "angle", label: "Angle (°)", type: "number" },
  { name: "rodX", label: "Rod X (m)", type: "number" },
  { name: "rodY", label: "Rod Y (m)", type: "number" },
  { name: "showFieldLines", label: "Show field lines", type: "checkbox" },
];

export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel } = state || {};
  const m = context?.moment ?? 0;
  const angle = context?.angle ?? 0;
  return {
    "m (dipole)": `${Number.isFinite(m) ? m.toFixed(3) : "0.000"} A·m²`,
    "θ (rod angle)": `${Number.isFinite(angle) ? angle.toFixed(2) : "0.00"} °`,
    "s(x,y)": `(${pos?.x?.toFixed?.(2) ?? "0.00"}, ${pos?.y?.toFixed?.(2) ?? "0.00"}) m`,
  };
};
