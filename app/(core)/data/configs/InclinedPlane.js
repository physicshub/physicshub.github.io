// app/(core)/data/configs/InclinedPlane.js
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  mass: 2.0,
  size: 0.4,
  angle: 30,
  gravity: EARTH_G_SI,
  frictionStatic: 0.5,
  frictionKinetic: 0.3,
  appliedForce: 0,
  appliedAngle: 0,
  blockColor: "#3b82f6",
  planeColor: "#64748b",
  trailEnabled: true,
  showForces: true,
  showComponents: true,
};

export const INPUT_FIELDS = [
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    min: 0.5,
    max: 10,
    step: 0.1,
  },
  {
    name: "size",
    label: "d - Block size (m):",
    type: "number",
    min: 0.2,
    max: 1.0,
    step: 0.05,
  },
  {
    name: "angle",
    label: "θ - Plane angle (°):",
    type: "number",
    min: 0,
    max: 60,
    step: 1,
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "frictionStatic",
    label: "μₛ - Static friction:",
    type: "number",
    min: 0,
    max: 1.5,
    step: 0.05,
  },
  {
    name: "frictionKinetic",
    label: "μₖ - Kinetic friction:",
    type: "number",
    min: 0,
    max: 1.5,
    step: 0.05,
  },
  {
    name: "appliedForce",
    label: "F - Applied force (N):",
    type: "number",
    min: 0,
    max: 50,
    step: 0.5,
  },
  {
    name: "appliedAngle",
    label: "α - Applied angle (°):",
    type: "number",
    min: -90,
    max: 90,
    step: 5,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "showForces", label: "Show forces", type: "checkbox" },
  { name: "showComponents", label: "Show components", type: "checkbox" },
  { name: "blockColor", label: "Block color:", type: "color" },
  { name: "planeColor", label: "Plane color:", type: "color" },
];

export const FORCES = [
  {
    key: "weight",
    color: "#ef4444",
    computeFn: ({ mass }, inputs) => {
      return { x: 0, y: mass * inputs.gravity };
    },
  },
  {
    key: "normal",
    color: "#10b981",
    computeFn: ({ mass }, inputs) => {
      const angleRad = (inputs.angle * Math.PI) / 180;
      const appliedAngleRad = (inputs.appliedAngle * Math.PI) / 180;
      const totalAppliedAngle = angleRad - appliedAngleRad;

      const weightPerpendicular = mass * inputs.gravity * Math.cos(angleRad);
      const appliedPerpendicular =
        inputs.appliedForce * Math.sin(totalAppliedAngle);
      const normalMag = Math.max(0, weightPerpendicular - appliedPerpendicular);

      const normalAngle = angleRad + Math.PI / 2;
      return {
        x: normalMag * Math.cos(normalAngle),
        y: -normalMag * Math.sin(normalAngle),
      };
    },
  },
  {
    key: "friction",
    color: "#f59e0b",
    computeFn: ({ mass, vel }, inputs) => {
      const angleRad = (inputs.angle * Math.PI) / 180;
      const appliedAngleRad = (inputs.appliedAngle * Math.PI) / 180;
      const totalAppliedAngle = angleRad - appliedAngleRad;

      const weightPerpendicular = mass * inputs.gravity * Math.cos(angleRad);
      const appliedPerpendicular =
        inputs.appliedForce * Math.sin(totalAppliedAngle);
      const normalMag = Math.max(0, weightPerpendicular - appliedPerpendicular);

      const weightParallel = mass * inputs.gravity * Math.sin(angleRad);
      const appliedParallel = inputs.appliedForce * Math.cos(totalAppliedAngle);
      const netForceWithoutFriction = appliedParallel - weightParallel;

      let frictionMag = 0;
      const isMoving = Math.abs(vel) > 0.001;

      if (!isMoving) {
        const maxStaticFriction = inputs.frictionStatic * normalMag;
        if (Math.abs(netForceWithoutFriction) <= maxStaticFriction) {
          frictionMag = Math.abs(netForceWithoutFriction);
        } else {
          frictionMag = inputs.frictionKinetic * normalMag;
        }
      } else {
        frictionMag = inputs.frictionKinetic * normalMag;
      }

      if (frictionMag < 0.01) return null;

      const frictionDir = isMoving
        ? -Math.sign(vel)
        : -Math.sign(netForceWithoutFriction);
      return {
        x: frictionDir * frictionMag * Math.cos(angleRad),
        y: -frictionDir * frictionMag * Math.sin(angleRad),
      };
    },
  },
  {
    key: "applied",
    color: "#a855f7",
    computeFn: (_state, inputs) => {
      if (inputs.appliedForce === 0) return null;

      const angleRad = (inputs.angle * Math.PI) / 180;
      const appliedAngleRad = (inputs.appliedAngle * Math.PI) / 180;
      const totalAngle = angleRad - appliedAngleRad;

      return {
        x: inputs.appliedForce * Math.cos(totalAngle),
        y: -inputs.appliedForce * Math.sin(totalAngle),
      };
    },
  },
];

export const SimInfoMapper = (state, context) => {
  const { posAlongPlane, vel, acc, mass } = state;
  const { gravity, angle, forces } = context;

  const angleRad = (angle * Math.PI) / 180;

  // Kinetic energy
  const kineticEnergy = 0.5 * mass * vel * vel;

  // Potential energy (height gained along the plane)
  const heightGained = posAlongPlane * Math.sin(angleRad);
  const potentialEnergy = mass * gravity * heightGained;

  // Total mechanical energy
  const totalEnergy = kineticEnergy + potentialEnergy;

  // Determine motion state
  const isMoving = Math.abs(vel) > 0.001;
  const motionState = isMoving ? "Moving" : "Static";

  // Net force
  const netForce = forces?.netParallel ?? 0;

  // Friction type
  let frictionType = "None";
  if (Math.abs(forces?.friction ?? 0) > 0.01) {
    frictionType = isMoving ? "Kinetic" : "Static";
  }

  return {
    "s (position)": `${posAlongPlane.toFixed(2)} m`,
    "v (velocity)": `${vel.toFixed(2)} m/s`,
    "a (acceleration)": `${acc.toFixed(2)} m/s²`,
    "h (height)": `${heightGained.toFixed(2)} m`,
    State: motionState,
    "Friction type": frictionType,
    "Fₙₑₜ (net force)": `${netForce.toFixed(2)} N`,
    "W (weight)": `${(mass * gravity).toFixed(2)} N`,
    "N (normal)": `${(forces?.normal ?? 0).toFixed(2)} N`,
    "f (friction)": `${Math.abs(forces?.friction ?? 0).toFixed(2)} N`,
    "Eₖ (kinetic)": `${kineticEnergy.toFixed(2)} J`,
    "Eₚ (potential)": `${potentialEnergy.toFixed(2)} J`,
    "Eₜₒₜ (total)": `${totalEnergy.toFixed(2)} J`,
  };
};
