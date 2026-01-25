// hooks/useSimulationState.ts
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook per gestire lo stato di una simulazione con priorità:
 * URL params > localStorage > initialInputs
 */
export default function useSimulationState<T extends Record<string, unknown>>(
  initialInputs: T,
  storageKey: string
) {
  const [inputs, setInputs] = useState<T>(initialInputs);
  const inputsRef = useRef<T>(initialInputs);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mantieni ref sincronizzato
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  // 🔎 Leggi parametri dall'URL
  const loadFromUrl = useCallback((): Partial<T> | null => {
    if (typeof window === "undefined") return null;

    try {
      const queryString = window.location.search; // es: "?velocityX=4&..."
      if (!queryString) return null;

      const params = new URLSearchParams(queryString);
      if ([...params.keys()].length === 0) return null;

      const parsed: Record<string, unknown> = {};
      params.forEach((value, key) => {
        if (value === "true") {
          parsed[key] = true;
        } else if (value === "false") {
          parsed[key] = false;
        } else {
          const num = Number(value);
          parsed[key] = isNaN(num) ? value : num;
        }
      });

      return parsed as Partial<T>;
    } catch (error) {
      console.warn("[useSimulationState] Errore parsing URL params:", error);
      return null;
    }
  }, []);

  // 🔎 Leggi da localStorage
  const loadFromStorage = useCallback((): T | null => {
    if (typeof window === "undefined" || !("localStorage" in window))
      return null;

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return null;
      return JSON.parse(saved) as T;
    } catch (error) {
      console.warn("[useSimulationState] Errore parsing localStorage:", error);
      return null;
    }
  }, [storageKey]);

  // 🔎 Carica stato con priorità: URL > localStorage > initial
  const loadInputs = useCallback((): T => {
    const urlInputs = loadFromUrl();
    if (urlInputs) {
      return { ...initialInputs, ...urlInputs } as T;
    }

    const storageInputs = loadFromStorage();
    if (storageInputs) {
      return storageInputs;
    }

    return initialInputs;
  }, [initialInputs, loadFromUrl, loadFromStorage]);

  // 🔒 Salva su localStorage
  const saveInputs = useCallback(() => {
    if (typeof window === "undefined" || !("localStorage" in window)) return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(inputsRef.current)
      );
    } catch (error) {
      console.warn(
        "[useSimulationState] Errore salvataggio localStorage:",
        error
      );
    }
  }, [storageKey]);

  // 🔄 Reset
  const resetInputs = useCallback(
    (preferSaved = true) => {
      if (preferSaved) {
        const loaded = loadInputs();
        setInputs(loaded);
      } else {
        setInputs(initialInputs);
      }
    },
    [initialInputs, loadInputs]
  );

  // Carica una volta al mount
  if (typeof window !== "undefined" && !isInitialized) {
    const loaded = loadInputs();
    setInputs(loaded);
    setIsInitialized(true);
  }

  return {
    inputs,
    setInputs,
    inputsRef,
    loadInputs,
    saveInputs,
    resetInputs,
  };
}
