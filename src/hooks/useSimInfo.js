// src/hooks/useSimInfo.js
import { useRef, useState } from "react";

/**
 * Generic hook to centralize simulation info updates.
 * - Handles throttling of updates
 * - Accepts a mapper function to compute the info object
 * - Allows injection of custom refs (simulation-specific)
 */
export default function useSimInfo({updateIntervalMs = 0, customRefs = {}}) {
  const [simData, setSimData] = useState({});
  const lastInfoUpdateMs = useRef(0);

  /**
   * Centralized update function
   * @param {p5} p - p5 instance
   * @param {Object} state - simulation state (pos, vel, etc.)
   * @param {Object} context - extra context (gravity, canvasHeight, etc.)
   * @param {Function} mapper - function that maps state+context+refs -> simData object
   */
  const updateSimInfo = (p, state, context, mapper) => {
    const now = p.millis();
    if (now - lastInfoUpdateMs.current < updateIntervalMs) return;

    const data = mapper(state, context, customRefs);
    if (data) setSimData(data);

    lastInfoUpdateMs.current = now;
  };

  return {
    simData,
    updateSimInfo,
    refs: customRefs,
  };
}
