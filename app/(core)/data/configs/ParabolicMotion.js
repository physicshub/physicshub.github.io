// app/(core)/data/configs/ParabolicMotion.js
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  v0: 10,
  angle: 45,
  h0: 0,
  mass: 1,
  size: 0.25,
  gravity: EARTH_G_SI,
  dragCoeff: 0,
  wind: 0,
  trailEnabled: true,
  showGuides: true,
  showVectors: true,
  ballColor: "#7f7f7f",
};

export const INPUT_FIELDS = [
  {
    name: "v0",
    label: "v₀ - Launch speed (m/s):",
    type: "number",
    placeholder: "Insert speed...",
  },
  {
    name: "angle",
    label: "θ - Launch angle (°):",
    type: "number",
    placeholder: "Insert angle...",
  },
  {
    name: "h0",
    label: "h₀ - Start height (m):",
    type: "number",
    placeholder: "Insert height...",
  },
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    placeholder: "Insert mass...",
  },
  {
    name: "size",
    label: "d - Ball diameter (m):",
    type: "number",
    placeholder: "Insert diameter...",
  },
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "dragCoeff",
    label: "c_d - Linear drag (1/s):",
    type: "number",
    placeholder: "Insert drag coeff...",
  },
  {
    name: "wind",
    label: "a_w - Wind accel (m/s²):",
    type: "number",
    placeholder: "Insert wind accel...",
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "showGuides", label: "Show guide", type: "checkbox" },
  {
    name: "showVectors",
    label: "Show vectors",
    type: "checkbox",
  },
  { name: "ballColor", label: "Ball color:", type: "color" },
];

export const FORCES = [
  {
    key: "gravity",
    color: "#60a5fa",
    computeFn: (_state, inputs) => ({
      x: 0,
      y: inputs.mass * inputs.gravity,
    }),
  },
  {
    key: "drag",
    color: "#fb923c",
    computeFn: ({ vel }, inputs) => {
      const coeff = Math.max(0, inputs.dragCoeff || 0);
      if (!coeff || !vel) return null;
      const dragVec = vel.copy
        ? vel.copy().mult(-inputs.mass * coeff)
        : { x: 0, y: 0 };
      return dragVec;
    },
  },
  {
    key: "wind",
    color: "#34d399",
    computeFn: (_state, inputs) => {
      if (!inputs.wind) return null;
      return { x: inputs.mass * inputs.wind, y: 0 };
    },
  },
  {
    key: "velocity",
    color: "#facc15",
    computeFn: ({ vel }) => {
      if (!vel) return null;
      return vel.copy ? vel.copy() : { ...vel };
    },
  },
];

export const computeProjectileAnalytics = ({ v0, angleDeg, h0, gravity }) => {
  const speed = Math.max(0, v0);
  const g = Math.abs(gravity ?? EARTH_G_SI);
  const rad = ((angleDeg ?? 0) * Math.PI) / 180;
  const vx0 = speed * Math.cos(rad);
  const vy0 = speed * Math.sin(rad); // upward-positive reference frame
  const safeH0 = Math.max(0, h0);

  if (g === 0) {
    return {
      vx0,
      vy0,
      angleRad: rad,
      flightTime: Infinity,
      range: Infinity,
      apexTime: vy0 === 0 ? 0 : Infinity,
      apexHeight: vy0 === 0 ? safeH0 : Infinity,
    };
  }

  const discriminant = vy0 * vy0 + 2 * g * safeH0;
  const timeOfFlight = (vy0 + Math.sqrt(Math.max(discriminant, 0))) / g;
  const apexTime = vy0 <= 0 ? 0 : vy0 / g;
  const apexHeight = safeH0 + (vy0 * vy0) / (2 * g);
  const range = timeOfFlight === Infinity ? Infinity : vx0 * timeOfFlight;

  return {
    vx0,
    vy0,
    angleRad: rad,
    flightTime: timeOfFlight,
    range,
    apexTime,
    apexHeight,
  };
};

export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel } = state;
  const { canvasHeightMeters, elapsedTime, radius } = context;
  const launchMeta = refs?.launchMetadataRef?.current;
  const analytics = launchMeta?.stats;

  const groundY = canvasHeightMeters;
  const heightFromGround = Math.max(0, groundY - pos.y - radius);
  const currentSpeed = vel?.mag?.() ?? Math.hypot(vel?.x ?? 0, vel?.y ?? 0);
  const vx = vel?.x ?? 0;
  const vy = vel?.y ?? 0;

  const info = {
    "v (speed)": `${currentSpeed.toFixed(2)} m/s`,
    vₓ: `${vx.toFixed(2)} m/s`,
    vᵧ: `${(-vy).toFixed(2)} m/s`,
    "h (height)": `${heightFromGround.toFixed(2)} m`,
  };

  if (launchMeta?.startPos) {
    const range = Math.max(0, pos.x - launchMeta.startPos.x);
    info["x (range)"] = `${range.toFixed(2)} m`;
  }

  if (analytics) {
    if (isFinite(analytics.flightTime)) {
      info["t (elapsed)"] = `${elapsedTime.toFixed(2)} s`;
      info["tₜₒf (time of flight)"] = `${analytics.flightTime.toFixed(2)} s`;
      const progress =
        analytics.flightTime > 0
          ? Math.min(elapsedTime / analytics.flightTime, 1)
          : 0;
      info["flight %"] = `${(progress * 100).toFixed(0)} %`;
      info["R (predicted range)"] = `${analytics.range.toFixed(2)} m`;
      info["hₐₚₑₓ"] = `${analytics.apexHeight.toFixed(2)} m`;
      info["tₐₚₑₓ"] = `${analytics.apexTime.toFixed(2)} s`;
    } else {
      info["tₜₒf (time of flight)"] = "∞";
      info["R (predicted range)"] = "∞";
    }
  }

  return info;
};
