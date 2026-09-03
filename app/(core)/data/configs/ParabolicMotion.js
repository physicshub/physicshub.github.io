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
    label: "Launch speed",
    symbol: "v₀",
    unit: "m/s",
    type: "number",
    placeholder: "Insert speed...",
    min: 0,
    max: 60,
    step: 0.1,
  },
  {
    name: "angle",
    label: "Launch angle",
    symbol: "θ",
    unit: "°",
    type: "number",
    placeholder: "Insert angle...",
    min: 0,
    max: 180,
    step: 1,
  },
  {
    name: "h0",
    label: "Start height",
    symbol: "h₀",
    unit: "m",
    type: "number",
    placeholder: "Insert height...",
    min: 0,
    max: 50,
    step: 0.1,
  },
  {
    name: "mass",
    label: "Mass",
    symbol: "m",
    unit: "kg",
    type: "number",
    placeholder: "Insert mass...",
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    name: "size",
    label: "Ball diameter",
    symbol: "d",
    unit: "m",
    type: "number",
    placeholder: "Insert diameter...",
    min: 0.05,
    max: 2,
    step: 0.01,
  },
  {
    name: "gravity",
    label: "Gravity",
    symbol: "g",
    unit: "m/s²",
    type: "select",
    options: gravityTypes,
  },
  {
    name: "dragCoeff",
    label: "Quadratic drag",
    symbol: "c_d",
    unit: "kg/m",
    type: "number",
    placeholder: "Insert drag coeff...",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "wind",
    label: "Wind acceleration",
    symbol: "a_w",
    unit: "m/s²",
    type: "number",
    placeholder: "Insert wind accel...",
    min: 0,
    max: 20,
    step: 0.01,
  },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "showGuides", label: "Show guide", type: "checkbox" },
  {
    name: "showVectors",
    label: "Show vectors",
    type: "checkbox",
  },
  { name: "ballColor", label: "Ball color", type: "color" },
];

/**
 * Drag-free projectile analytics.
 *
 * `h0` is the drop height: how far the projectile falls between launch and
 * landing. The simulation passes the ball's *centre* height above its resting
 * centre height, so the predicted flight time ends when the ball touches the
 * floor rather than when its centre reaches y = 0.
 *
 * Everything returned is measured from the landing level, so `apexHeight` is
 * directly comparable with the live height readout.
 */
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
      // Without gravity nothing ever falls back: a projectile launched upward
      // rises forever, one launched level or downward peaks at the start.
      apexTime: vy0 <= 0 ? 0 : Infinity,
      apexHeight: vy0 <= 0 ? safeH0 : Infinity,
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
  const { elapsedTime, radius } = context;
  const launchMeta = refs?.launchMetadataRef?.current;
  const analytics = launchMeta?.stats;

  // Physics coordinates are Y-up with the floor at y = 0, so the height of the
  // ball above the ground is simply its centre minus its radius.
  const heightFromGround = Math.max(0, pos.y - radius);
  const currentSpeed = vel?.mag?.() ?? Math.hypot(vel?.x ?? 0, vel?.y ?? 0);
  const vx = vel?.x ?? 0;
  const vy = vel?.y ?? 0;

  const info = {
    "v (speed)": `${currentSpeed.toFixed(2)} m/s`,
    vₓ: `${vx.toFixed(2)} m/s`,
    // Positive vᵧ means rising: same convention as the physics.
    vᵧ: `${vy.toFixed(2)} m/s`,
    "h (height)": `${heightFromGround.toFixed(2)} m`,
  };

  if (launchMeta?.startPos) {
    // Signed, so a steep angle or a headwind that carries the ball backwards
    // reads as a negative displacement instead of being clamped to zero.
    const range = pos.x - launchMeta.startPos.x;
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
