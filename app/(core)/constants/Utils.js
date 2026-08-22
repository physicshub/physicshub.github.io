import { SCALE } from "./Config.js";

// Store canvas height for coordinate conversion
let CANVAS_HEIGHT; // Default, will be updated

export function setCanvasHeight(height) {
  CANVAS_HEIGHT = height;
}

export function getCanvasHeight() {
  return CANVAS_HEIGHT;
}

/**
 * Convert physics Y (bottom=0, up=positive) to screen Y (top=0, down=positive)
 */
export const physicsYToScreenY = (physicsY) => {
  //const physicsHeightMeters = CANVAS_HEIGHT / SCALE;
  return CANVAS_HEIGHT - physicsY * SCALE;
};

/**
 * Convert screen Y (top=0, down=positive) to physics Y (bottom=0, up=positive)
 */
export const screenYToPhysicsY = (screenY) => {
  //const physicsHeightMeters = CANVAS_HEIGHT / SCALE;
  return (CANVAS_HEIGHT - screenY) / SCALE;
};

/**
 * Convert meters to pixels (no Y-axis change, just scale)
 */
export const toPixels = (meters) => meters * SCALE;

/**
 * Convert pixels to meters (no Y-axis change, just scale)
 */
export const toMeters = (pixels) => pixels / SCALE;

/**
 * Convert physics position (Y-up) to screen position (Y-down)
 */
export const physicsToScreen = (physicsPos, p) => {
  return p.createVector(
    toPixels(physicsPos.x),
    physicsYToScreenY(physicsPos.y)
  );
};

/**
 * Convert screen position (Y-down) to physics position (Y-up)
 */
export const screenToPhysics = (screenPos, p) => {
  return p.createVector(toMeters(screenPos.x), screenYToPhysicsY(screenPos.y));
};

// Accelerazione: m/s² → px/frame²
export const accelSI_to_pxSec = (a_SI) => a_SI * SCALE;
export const accelPxSec_to_SI = (a_px) => a_px / SCALE;

// Costante elastica: N/m → N/pixel
export const springK_SI_to_px = (k_SI) => k_SI / SCALE;
export const springK_px_to_SI = (k_px) => k_px * SCALE;
