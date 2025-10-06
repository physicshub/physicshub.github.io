// hooks/useSimulationState.js
import { useState, useRef, useEffect } from "react";

export default function useSimulationState(initialInputs, storageKey) {
  const [inputs, setInputs] = useState(initialInputs);
  const inputsRef = useRef(inputs);

  // Carica da localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInputs(parsed);
        inputsRef.current = parsed;
      } catch (e) {
        console.warn("Errore parsing settings:", e);
      }
    }
  }, [storageKey]);

  // Mantieni ref sincronizzato
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  return { inputs, setInputs, inputsRef };
}
