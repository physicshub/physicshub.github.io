/**
 * PhysicsHub engine — one import for everything a simulation needs.
 *
 *   import {
 *     createSimulation, Gravity, Drag, Distance, Bounds, Dragging, ForceVectors,
 *   } from "@/app/(core)/engine";
 *
 * The model in one paragraph: a World owns Bodies (pure state) and Elements
 * (behaviour). Forces accumulate newtons, the integrator turns them into motion,
 * constraints project positions, colliders resolve contacts, renderers draw.
 * Because every behaviour is an element rather than a body subclass, behaviours
 * combine by addition — a projectile with a pendulum hanging off it is a body
 * with Gravity plus a Distance constraint to a second body, nothing more.
 */

export { default as World } from "./World.js";
export { default as Body } from "./Body.js";
export { semiImplicitEuler, verlet, rk4, INTEGRATORS } from "./integrators.js";

export {
  Gravity,
  Constant,
  Wind,
  Drag,
  Buoyancy,
  MutualGravity,
  PointAttraction,
  Damping,
  Custom as CustomForce,
} from "./forces/index.js";

export {
  Distance,
  Rope,
  Strut,
  Spring,
  Bounds,
  Ground,
  SurfaceFriction,
  Pin,
  CircularPath,
  LockAxis,
  SpeedLimit,
  Incline,
  isOnSurface,
} from "./constraints/index.js";

export { Collisions, collide1D, contactImpulse } from "./collision/index.js";

export { Dragging } from "./interaction/Dragging.js";

export {
  default as ForceRenderer,
  ForceVectors,
  Vectors,
} from "./render/ForceRenderer.js";
export { Backdrop, themeColor } from "./render/Backdrop.js";
export { FORCE_COLORS, SCENE_COLORS } from "./render/colors.js";
export {
  toScreen,
  drawBody,
  drawTrail,
  drawSegment,
  drawAnchor,
  drawCoil,
  drawPath,
  drawGround,
} from "./render/Shapes.js";

export { default as createSimulation } from "./runtime/createSimulation.jsx";

export { resolve, resolveAll, resolveNumber } from "./utils/params.js";
export * as formulas from "./formulas.js";
