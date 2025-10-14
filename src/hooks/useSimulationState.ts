// hooks/useSimulationState.ts
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook per gestire lo stato di una simulazione con priorità:
 * URL params > localStorage > initialInputs
 */
export default function useSimulationState<T extends Record<string, any>>(
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
    try {
      // Prendi la parte dopo il "?" nell'hash
      const hash = window.location.hash; // es: "#/BouncingBall?velocityX=4&..."
      const queryIndex = hash.indexOf("?");
      if (queryIndex === -1) return null;

      const queryString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);

      if ([...params.keys()].length === 0) return null;

      const parsed: Partial<T> = {};
      params.forEach((value, key) => {
        if (value === "true") {
          (parsed as any)[key] = true;
        } else if (value === "false") {
          (parsed as any)[key] = false;
        } else {
          const num = Number(value);
          (parsed as any)[key] = isNaN(num) ? value : num;
        }
      });


      console.log("[useSimulationState] URL params trovati:", parsed);
      return parsed;
    } catch (error) {
      console.warn("[useSimulationState] Errore parsing URL params:", error);
      return null;
    }
  }, []);


  // 🔎 Leggi da localStorage
  const loadFromStorage = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as T;
      console.log("[useSimulationState] Stato caricato da localStorage:", parsed);
      return parsed;
    } catch (error) {
      console.warn("[useSimulationState] Errore parsing localStorage:", error);
      return null;
    }
  }, [storageKey]);

  // 🔎 Carica stato con priorità: URL > localStorage > initial
  const loadInputs = useCallback((): T => {
    const urlInputs = loadFromUrl();
    if (urlInputs) {
      const merged = { ...initialInputs, ...urlInputs } as T;
      console.log("[useSimulationState] Stato finale (URL ha priorità):", merged);
      return merged;
    }

    const storageInputs = loadFromStorage();
    if (storageInputs) {
      console.log("[useSimulationState] Stato finale (da localStorage):", storageInputs);
      return storageInputs;
    }

    console.log("[useSimulationState] Stato finale (initialInputs):", initialInputs);
    return initialInputs;
  }, [initialInputs, loadFromUrl, loadFromStorage]);

  // 🔒 Salva su localStorage
  const saveInputs = useCallback(() => {
    try {
      console.log("[useSimulationState] Salvataggio su localStorage:", inputsRef.current);
      localStorage.setItem(storageKey, JSON.stringify(inputsRef.current));
    } catch (error) {
      console.warn("[useSimulationState] Errore salvataggio localStorage:", error);
    }
  }, [storageKey]);

  // 🔄 Reset
  const resetInputs = useCallback(
    (preferSaved = true) => {
      if (preferSaved) {
        const loaded = loadInputs();
        console.log("[useSimulationState] Reset con preferSaved=true:", loaded);
        setInputs(loaded);
        inputsRef.current = loaded;
      } else {
        console.log("[useSimulationState] Reset forzato a initialInputs:", initialInputs);
        setInputs(initialInputs);
        inputsRef.current = initialInputs;
      }
    },
    [initialInputs, loadInputs]
  );

  // Carica una volta al mount
  useEffect(() => {
    if (!isInitialized) {
      const loaded = loadInputs();
      setInputs(loaded);
      inputsRef.current = loaded;
      setIsInitialized(true);
    }
  }, [isInitialized, loadInputs]);

  return {
    inputs,
    setInputs,
    inputsRef,
    loadInputs,
    saveInputs,
    resetInputs,
  };
}
