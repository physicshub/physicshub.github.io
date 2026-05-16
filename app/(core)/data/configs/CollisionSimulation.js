// Default simulation inputs
export const INITIAL_INPUTS = {
  // Mass of both collision bodies
  mass1: 1, // kg
  mass2: 1, // kg

  // Ball diameter in simulation units
  size1: 0.55,
  size2: 0.55,

  // Initial velocities
  velocity1: 2,
  velocity2: 2,

  // Coefficient of restitution
  restitution: 1,

  // Visual effects
  trailEnabled: true,
  showVectors: true,

  // Ball colors
  ballColor1: "#ff4444",
  ballColor2: "#4488ff",
};

// Dynamic input configuration
export const INPUT_FIELDS = [
  // Mass controls
  {
    name: "mass1",
    label: "m₁ - Ball 1 Mass (kg):",
    type: "number",
    min: 0,
    placeholder: "Enter mass of ball 1",
  },

  {
    name: "mass2",
    label: "m₂ - Ball 2 Mass (kg):",
    type: "number",
    placeholder: "Enter mass of ball 2",
    min: 0,
  },

  // Velocity controls
  {
    name: "velocity1",
    label: "u₁ - Ball 1 Velocity (m/s):",
    type: "number",
    placeholder: "Enter velocity of ball 1",
  },

  {
    name: "velocity2",
    label: "u₂ - Ball 2 Velocity (m/s):",
    type: "number",
    placeholder: "Enter velocity of ball 2",
  },

  // Elasticity control
  {
    name: "restitution",
    label: "e - Restitution:",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    placeholder: "0 to 1",
  },

  // Trail rendering toggle
  {
    name: "trailEnabled",
    label: "Enable trail",
    type: "checkbox",
  },

  // Velocity vector toggle
  {
    name: "showVectors",
    label: "Show vectors",
    type: "checkbox",
  },

  // Ball color controls
  {
    name: "ballColor1",
    label: "1st ball",
    type: "color",
  },

  {
    name: "ballColor2",
    label: "2nd ball",
    type: "color",
  },
];

// Maps simulation data
// for SimInfoPanel
export const SimInfoMapper = ({ body1, body2, initialState }) => {
  // Initial velocities
  const u1 = Math.abs(initialState?.u1 ?? 0);

  const u2 = Math.abs(initialState?.u2 ?? 0);

  // Mass values
  const m1 = body1.params.mass;
  const m2 = body2.params.mass;

  // Coefficient of restitution
  const e = body1.params.restitution;

  // Current velocities
  const v1 = body1.state.velocity.x;

  const v2 = body2.state.velocity.x;

  // Linear momentum
  const p1 = body1.params.mass * v1;

  const p2 = body2.params.mass * v2;

  // Kinetic energy
  const ke1 = 0.5 * body1.params.mass * v1 * v1;

  const ke2 = 0.5 * body2.params.mass * v2 * v2;

  return {
    "m₁ (mass)": `${m1.toFixed(2)} kg`,

    "m₂ (mass)": `${m2.toFixed(2)} kg`,

    "e (restitution)": `${e.toFixed(2)}`,

    "u₁ (initial velocity)": `${u1.toFixed(2)} m/s`,

    "u₂ (initial velocity)": `${u2.toFixed(2)} m/s`,

    "v₁ (current velocity)": `${v1.toFixed(2)} m/s`,

    "v₂ (current velocity)": `${v2.toFixed(2)} m/s`,

    "p₁ (momentum)": `${p1.toFixed(2)} kg·m/s`,

    "p₂ (momentum)": `${p2.toFixed(2)} kg·m/s`,

    "KE₁": `${ke1.toFixed(2)} J`,

    "KE₂": `${ke2.toFixed(2)} J`,
  };
};
