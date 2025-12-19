// app/(core)/data/configs/ProjectileMotion.js
import { toPixels, toMeters, invertYAxis } from "../../constants/Utils.js";
import { gravityTypes, EARTH_G_SI } from "../../constants/Config.js";

// EXPORT 1
export const INITIAL_INPUTS = {
  mass: 1,
  size: 0.5,
  initialVelocity: 50,
  angle: 45,
  trailEnabled: true,
  ballColor: "#7f7f7f",
  gravity: EARTH_G_SI,
};

// EXPORT 2
export const INPUT_FIELDS = [
  { name: "mass", label: "m - Mass (kg):", type: "number", placeholder: "Insert mass..." },
  { name: "size", label: "d - Ball diameter (m):", type: "number", placeholder: "Insert ball size..." },
  { name: "initialVelocity", label: "v₀ - Initial Velocity (m/s):", type: "number" },
  { name: "angle", label: "θ - Angle (°):", type: "number" },
  { name: "gravity", label: "g - Gravity (m/s²):", type: "select", options: gravityTypes },
  { name: "trailEnabled", label: "Enable trail", type: "checkbox" },
  { name: "ballColor", label: "Ball Color:", type: "color" },
];



// EXPORT 4
export const SimInfoMapper = (state, context, refs) => {
  const { pos, vel, mass } = state || {};
  const { gravity = 0, canvasHeight } = context || {};
  const { maxHeightRef, timeRef, rangeRef } = refs || {};

  // Safety defaults and helpers
  const px = pos || { x: 0, y: 0 };
  const v = vel || { x: 0, y: 0, mag: () => 0, heading: () => 0 };
  const a = state?.acc || { x: 0, y: 0, mag: () => 0 };

  // Velocity magnitude (m/s)
  const speedMs = typeof v.mag === "function" ? v.mag() : 0;

  // Positions in meters (world coords)
  const posXM = px.x;

  // Compute height relative to ground if groundY provided, otherwise fallback to canvas-based method
  let currentHeightM = 0;
  if (typeof context?.groundY === "number") {
    currentHeightM = context.groundY - px.y; // groundY and pos.y are in meters
  } else if (typeof canvasHeight !== "undefined") {
    const canvasHeightMeters = toMeters(canvasHeight);
    currentHeightM = canvasHeightMeters - px.y;
  } else {
    currentHeightM = -px.y;
  }

  if (typeof currentHeightM === "number" && currentHeightM > (maxHeightRef?.current ?? -Infinity)) {
    maxHeightRef.current = currentHeightM;
  }

  if (typeof currentHeightM === "number" && currentHeightM > -1e-9) {
    rangeRef.current = posXM;
  }

  const work = (mass ?? 0) * (gravity ?? 0) * (currentHeightM ?? 0);

  // DEBUG: log when values appear zero or unusually small to help diagnose stale data
  try {
    const debugSpeed = typeof v.mag === "function" ? v.mag() : 0;
    const debugAcc = typeof a?.mag === "function" ? a.mag() : 0;
    if (debugSpeed === 0 || debugAcc === 0 || (timeRef?.current ?? 0) < 0.05) {
      // Use console.debug so it's visible in browser console and server logs
      console.debug("SimInfoMapper Debug:", {
        pos: px,
        vel: typeof v.mag === "function" ? v.mag() : v,
        acc: typeof a?.mag === "function" ? a.mag() : a,
        time: timeRef?.current,
        isDragging: !!context?.isDragging,
        gravity,
      });
    }
  } catch (e) {
    // swallow
  }

  // If dragging, compute theoretical (no-air) predictions from provided initialVelocity and angle
  if (context?.isDragging && typeof context.initialVelocity === "number") {
    const v0 = context.initialVelocity;
    const thetaDeg = typeof context.angle === "number" ? context.angle : 0;
    const theta = (thetaDeg * Math.PI) / 180;
    const g = gravity || 0;

    // Components
    const v0x = v0 * Math.cos(theta);
    const v0y = v0 * Math.sin(theta);

    // Time of flight (assuming launch from y=px.y above ground at current height and landing at groundY)
    const h0 = currentHeightM; // height above ground
    // Solve y(t) = h0 + v0y * t - 0.5 * g * t^2 = 0  => 0.5*g*t^2 - v0y*t - h0 = 0
    let flightTime = 0;
    if (g > 0) {
      const aQ = 0.5 * g;
      const bQ = -v0y;
      const cQ = -h0;
      const disc = bQ * bQ - 4 * aQ * cQ;
      if (disc >= 0) {
        const t1 = (-bQ + Math.sqrt(disc)) / (2 * aQ);
        const t2 = (-bQ - Math.sqrt(disc)) / (2 * aQ);
        flightTime = Math.max(t1, t2, 0);
      }
    }

    const maxH = h0 + (v0y * v0y) / (2 * (g || 1));
    const range = v0x * flightTime || 0;
    const workPred = (mass ?? 0) * g * maxH;

    return {
      "v (velocity)": `${Number.isFinite(v0) ? v0.toFixed(2) : "0.00"} m/s`,
      "a (acceleration)": `${(g ? -g : 0).toFixed(2)} m/s²`,
      "θ (angle)": `${thetaDeg.toFixed(2)} °`,
      "s(x, y) (position)": `(${posXM.toFixed(2)}, ${currentHeightM != null ? currentHeightM.toFixed(2) : "0.00"}) m`,
      "t (flight time)": `${flightTime.toFixed(2)} s`,
      "hₘₐₓ (height max)": `${maxH.toFixed(2)} m`,
      "R (range)": `${range.toFixed(2)} m`,
      "W (work)": `${Number.isFinite(workPred) ? workPred.toFixed(2) : "0.00"} J`,
    };
  }

  // Compute angle w.r.t horizontal (ground). Prefer origin->pos when dragging, otherwise use velocity.
  let angleDeg = 0;
  const originX = typeof context?.originX === "number" ? context.originX : 0;
  const originY = typeof context?.originY === "number" ? context.originY : 0;
  if (context?.isDragging && typeof originX === "number" && typeof originY === "number") {
    const dx = px.x - originX;
    const dy = originY - px.y; // upward positive
    angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (!Number.isFinite(angleDeg)) angleDeg = 0;
  } else if (v && typeof v.x === "number" && typeof v.y === "number") {
    angleDeg = (Math.atan2(-v.y, v.x) * 180) / Math.PI;
    if (!Number.isFinite(angleDeg)) angleDeg = 0;
  }

  // Signed vertical acceleration: prefer state's acc.y (positive downwards), display negative for downward accel
  let accelSigned = 0;
  if (a && typeof a.y === "number") {
    accelSigned = -a.y; // flip sign so downward is negative
  } else {
    accelSigned = gravity ? -gravity : 0;
  }

  // Range: horizontal distance from origin
  let rangeVal = posXM;
  if (typeof originX === "number") rangeVal = Math.max(0, posXM - originX);
  if (rangeVal > (rangeRef?.current ?? 0)) rangeRef.current = rangeVal;

  return {
    "v (velocity)": `${Number.isFinite(speedMs) ? speedMs.toFixed(2) : "0.00"} m/s`,
    "a (acceleration)": `${accelSigned.toFixed(2)} m/s²`,
    "θ (angle)": `${angleDeg.toFixed(2)} °`,
    "s(x, y) (position)": `(${posXM.toFixed(2)}, ${currentHeightM != null ? currentHeightM.toFixed(2) : "0.00"}) m`,
    "t (flight time)": `${(timeRef?.current ?? 0).toFixed(2)} s`,
    "hₘₐₓ (height max)": `${(maxHeightRef?.current ?? 0).toFixed(2)} m`,
    "R (range)": `${(rangeRef?.current ?? 0).toFixed(2)} m`,
    "W (work)": `${Number.isFinite(work) ? work.toFixed(2) : "0.00"} J`,
  };
};
