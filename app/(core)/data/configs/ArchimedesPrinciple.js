// app/(core)/data/configs/ArchimedesPrinciple.js
//
// Density & Buoyancy — Archimedes' principle in a tank. Three floating objects
// whose material (density) is chosen from presets, one tank of fluid whose
// density is adjustable. Everything is in SI: kg/m³, kg, m, N.

/**
 * Material presets for the three objects. The select value IS the density in
 * kg/m³, so "switching material" and "changing density" are the same action.
 */
export const MATERIAL_OPTIONS = [
  { value: 240, label: "Cork (240)" },
  { value: 700, label: "Oak wood (700)" },
  { value: 917, label: "Ice (917)" },
  { value: 1000, label: "Water (1000) — neutral" },
  { value: 1150, label: "Plastic (1150)" },
  { value: 2500, label: "Stone (2500)" },
  { value: 7850, label: "Iron (7850)" },
];

export const INITIAL_INPUTS = {
  fluidDensity: 1000, // kg/m³, water
  object1Material: 917, // ice
  object2Material: 700, // oak wood
  object3Material: 7850, // iron
  viscosity: 6, // submerged linear damping, N·s/m (0 = ideal, bobs forever)
  showForces: true, // free-body diagram while hovering or dragging
  showCompare: true, // predicted vs measured submerged-fraction bars
};

export const INPUT_FIELDS = [
  {
    name: "fluidDensity",
    label: "ρf - Fluid density (kg/m³):",
    type: "number",
    min: 100,
    max: 1600,
    step: 5,
    placeholder: "water = 1000",
  },
  {
    name: "object1Material",
    label: "1 - Object 1 material:",
    type: "select",
    options: MATERIAL_OPTIONS,
  },
  {
    name: "object2Material",
    label: "2 - Object 2 material:",
    type: "select",
    options: MATERIAL_OPTIONS,
  },
  {
    name: "object3Material",
    label: "3 - Object 3 material:",
    type: "select",
    options: MATERIAL_OPTIONS,
  },
  {
    name: "viscosity",
    label: "η - Fluid viscosity (0 = ideal fluid):",
    type: "number",
    min: 0,
    max: 40,
    step: 0.5,
  },
  {
    name: "showForces",
    label: "Free-body forces (hover or drag an object)",
    type: "checkbox",
  },
  {
    name: "showCompare",
    label: "Compare predicted vs measured submerged fraction",
    type: "checkbox",
  },
];

/**
 * Receives `{ fluid, rows }` from the simulation's `info` hook. Each row is one
 * object: density in kg/m³, the behaviour word, and the measured vs predicted
 * submerged percentage.
 */
export const SimInfoMapper = (state, context) => {
  const out = {
    "ρf - fluid density": `${Math.round(state.fluid)} kg/m³`,
  };
  for (const row of state.rows) {
    out[`${row.index}. ${row.name} — ρo = ${Math.round(row.density)} kg/m³`] =
      `${row.behavior} · submerged ${row.measuredPct}% (predicted ${row.predictedPct}%)`;
  }
  out["Archimedes rule"] = "submerged fraction = ρo / ρf";
  return out;
};
