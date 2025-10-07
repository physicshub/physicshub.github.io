// hooks/useSimulationState.js
import { useState, useRef, useEffect, useCallback } from "react";

export default function useSimulationState(initialInputs, storageKey) {
  const [inputs, setInputs] = useState(initialInputs);
  const inputsRef = useRef(inputs);

  // Carica da localStorage all'avvio
  useEffect(() => {
    loadInputs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Mantieni ref sincronizzato
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  // 🔄 Carica da localStorage
  const loadInputs = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInputs(parsed);
        inputsRef.current = parsed;
        return parsed;
      } catch (e) {
        console.warn("Errore parsing impostazioni salvate:", e);
      }
    }
    return null;
  }, [storageKey]);

  // 💾 Salva in localStorage
  const saveInputs = useCallback(() => {
    localStorage.setItem(storageKey, JSON.stringify(inputsRef.current));
  }, [storageKey]);

  // 🔁 Reset: se preferSaved=true prova a usare i salvati, altrimenti fallback ai default
  const resetInputs = useCallback(
    (preferSaved = true) => {
      if (preferSaved) {
        const loaded = loadInputs();
        if (loaded) {
          setInputs(loaded);
          return;
        }
      }
      setInputs(initialInputs);
      inputsRef.current = initialInputs;
    },
    [initialInputs, loadInputs]
  );

  return {
    inputs,
    setInputs,
    inputsRef,
    loadInputs,
    saveInputs,
    resetInputs,
  };
}
