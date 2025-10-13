// hooks/useSimulationState.ts
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook to manage simulation state with localStorage persistence.
 * Generic <T> allows strong typing of the inputs object.
 */
export default function useSimulationState<T extends object>(
  initialInputs: T,
  storageKey: string
) {
  const [inputs, setInputs] = useState<T>(initialInputs);
  const inputsRef = useRef<T>(inputs);

  // Keep ref in sync with latest state
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  // Load from localStorage
  const loadInputs = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      const parsed: T = JSON.parse(saved);
      setInputs(parsed);
      inputsRef.current = parsed;
      return parsed;
    } catch (error) {
      console.warn("[useSimulationState] Failed to parse saved state:", error);
      return null;
    }
  }, [storageKey]);

  // Save to localStorage
  const saveInputs = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(inputsRef.current));
    } catch (error) {
      console.warn("[useSimulationState] Failed to save state:", error);
    }
  }, [storageKey]);

  // Reset to saved state if available, otherwise fallback to initial
  const resetInputs = useCallback(
    (preferSaved = true) => {
      if (preferSaved && loadInputs()) return;
      setInputs(initialInputs);
      inputsRef.current = initialInputs;
    },
    [initialInputs, loadInputs]
  );

  // Load once on mount or when storageKey changes
  useEffect(() => {
    loadInputs();
  }, [loadInputs]);

  return {
    inputs,
    setInputs,
    inputsRef,
    loadInputs,
    saveInputs,
    resetInputs,
  };
}
