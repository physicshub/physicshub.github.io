// app/(core)/data/configs/KirchhoffCircuit.js
//
// UI schema and readout for the Kirchhoff circuit simulation. The circuit
// topology, the nodal solver and the drawing all live in
// simulations/KirchhoffCircuit.jsx — nothing physical belongs here.

/**
 * The circuits the learner can switch between. The value is the preset id the
 * simulation builds; changing it changes *what exists*, so the simulation
 * rebuilds the world rather than merely re-reading a parameter.
 */
export const CIRCUIT_PRESETS = [
  { value: "single", label: "Single loop — E, r, R₁" },
  { value: "series", label: "Series — R₁ + R₂ + R₃" },
  { value: "parallel", label: "Parallel — R₁ ∥ R₂ ∥ R₃" },
  { value: "twoLoop", label: "Two-loop network — E₁ and E₂" },
];

/**
 * Defaults are chosen so the two-loop network opens on its most instructive
 * state: E₂ ends up with a *negative* branch current, i.e. the second cell is
 * being charged by the first. See the article for the worked numbers.
 */
export const INITIAL_INPUTS = {
  preset: "twoLoop",

  emf1: 12,
  internalR1: 0.5,
  emf2: 6,
  internalR2: 0.5,

  r1: 4,
  r2: 6,
  r3: 3,

  showChargeFlow: true,
  showCurrentArrows: true,
  showGlow: true,
  showProbes: true,

  wireColor: "#94a3b8",
};

export const INPUT_FIELDS = [
  {
    name: "preset",
    label: "Circuit",
    type: "select",
    options: CIRCUIT_PRESETS,
  },

  {
    name: "emf1",
    label: "First cell EMF",
    symbol: "E₁",
    unit: "V",
    type: "number",
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    name: "internalR1",
    label: "First cell internal resistance",
    symbol: "r₁",
    unit: "Ω",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "emf2",
    label: "Second cell EMF",
    symbol: "E₂",
    unit: "V",
    type: "number",
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    name: "internalR2",
    label: "Second cell internal resistance",
    symbol: "r₂",
    unit: "Ω",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },

  {
    name: "r1",
    label: "First resistor",
    symbol: "R₁",
    unit: "Ω",
    type: "number",
    min: 0.5,
    max: 40,
    step: 0.5,
  },
  {
    name: "r2",
    label: "Second resistor",
    symbol: "R₂",
    unit: "Ω",
    type: "number",
    min: 0.5,
    max: 40,
    step: 0.5,
  },
  {
    name: "r3",
    label: "Third resistor",
    symbol: "R₃",
    unit: "Ω",
    type: "number",
    min: 0.5,
    max: 40,
    step: 0.5,
  },

  { name: "showChargeFlow", label: "Animate charge flow", type: "checkbox" },
  { name: "showCurrentArrows", label: "Show current arrows", type: "checkbox" },
  { name: "showGlow", label: "Glow with power dissipated", type: "checkbox" },
  { name: "showProbes", label: "Show meter probes", type: "checkbox" },
  { name: "wireColor", label: "Wire color", type: "color" },
];

const volts = (v) => `${v.toFixed(2)} V`;
const amps = (i) => `${i.toFixed(3)} A`;
const watts = (w) => `${w.toFixed(2)} W`;

/** A signed term formatted for a running sum: "+12.00", "−5.51". */
const term = (v) =>
  `${Math.abs(v) >= 5e-3 && v < 0 ? "−" : "+"}${Math.abs(v).toFixed(2)}`;

/**
 * Residuals are floating-point dust, not physics — treat anything tiny as 0.
 * `snap` also keeps a −1e-16 sum from printing as "−0.00 V", which in a readout
 * whose whole point is "this lands on zero" reads like a failure.
 */
const TOLERANCE = 1e-6;
const snap = (v) => (Math.abs(v) < TOLERANCE ? 0 : v);
const verdict = (residual) => (Math.abs(residual) < TOLERANCE ? "✓" : "✗");

export const SimInfoMapper = (state) => {
  if (!state || !state.ok) {
    return {
      Circuit: state?.presetLabel ?? "—",
      Status: "No solution — check that every resistance is above zero",
    };
  }

  const rows = { Circuit: state.presetLabel };

  for (const node of state.nodes) {
    rows[`V (${node.label})`] = node.isGround
      ? "0.00 V (reference)"
      : volts(node.V);
  }

  for (const branch of state.branches) {
    const direction =
      branch.I < 0 ? ` (flows ${branch.to}→${branch.from})` : "";
    rows[`I (${branch.label})`] = `${amps(branch.I)}${direction}`;
  }

  // Kirchhoff's current law: what goes into a junction comes back out.
  for (const node of state.kcl) {
    rows[`KCL at ${node.label}`] =
      `in ${node.inSum.toFixed(3)} = out ${node.outSum.toFixed(3)} A ${verdict(
        node.residual
      )}`;
  }

  // Kirchhoff's voltage law: walk the loop, add every rise and drop, land on 0.
  for (const loop of state.loops) {
    rows[`KVL loop ${loop.label}`] =
      `${loop.terms.map(term).join(" ")} = ${snap(loop.sum).toFixed(
        2
      )} V ${verdict(loop.sum)}`;
  }

  for (const part of state.dissipation) {
    rows[`P (${part.label})`] = watts(part.P);
  }

  // Kept the same length as the row above so the two totals, which should always
  // agree, line up in the panel instead of one of them wrapping.
  rows["P delivered by cells"] = watts(state.powerDelivered);
  rows["P dissipated as heat"] = watts(state.powerDissipated);

  if (state.voltmeter) {
    rows["Voltmeter"] =
      `${state.voltmeter.from} → ${state.voltmeter.to} = ${volts(
        state.voltmeter.reading
      )}`;
  }
  if (state.ammeter) {
    rows["Ammeter"] = `${state.ammeter.label} = ${amps(state.ammeter.reading)}`;
  }

  return rows;
};
