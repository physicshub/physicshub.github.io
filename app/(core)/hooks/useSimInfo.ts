// app/hooks/useSimInfo.ts
import { useRef, useState, useCallback, useEffect } from "react";

// Tipi generici per rendere l'hook riutilizzabile
export interface UseSimInfoOptions<TRefs = Record<string, unknown>> {
  updateIntervalMs?: number;
  customRefs?: TRefs;
}

// Tipi per la funzione mapper
export type SimInfoMapper<TState, TContext, TRefs, TData> = (
  state: TState,
  context: TContext,
  refs: TRefs
) => TData;

// Hook principale
export default function useSimInfo<
  TState = unknown,
  TContext = unknown,
  TRefs extends Record<string, unknown> = Record<string, unknown>,
  TData extends Record<string, unknown> = Record<string, unknown>,
>(options: UseSimInfoOptions<TRefs> = {}) {
  const { updateIntervalMs = 150, customRefs } = options;

  const [simData, setSimData] = useState<TData | Record<string, unknown>>({});
  const lastInfoUpdateMs = useRef(0);

  // 1. Usiamo un Ref per "inscatolare" le dipendenze instabili
  const internalConfigRef = useRef({ updateIntervalMs, customRefs });

  // 2. Teniamo il Ref aggiornato ad ogni render
  useEffect(() => {
    internalConfigRef.current = { updateIntervalMs, customRefs };
  }, [updateIntervalMs, customRefs]);

  // 3. updateSimInfo ora ha dipendenze VUOTE []
  // Non cambierà MAI riferimento, quindi p5.js non si resetterà mai
  const updateSimInfo = useCallback(
    (
      p: { millis: () => number },
      state: TState,
      context: TContext,
      mapper: SimInfoMapper<TState, TContext, TRefs, TData>
    ) => {
      if (!p || !mapper) return;

      const now = p.millis();
      // Usiamo i valori dal Ref per la logica, garantendo dati freschi
      const { updateIntervalMs: interval, customRefs: refs } =
        internalConfigRef.current;

      if (now - lastInfoUpdateMs.current < interval) return;

      try {
        const data = mapper(state, context, (refs || {}) as TRefs);
        if (data) setSimData(data);
      } catch (error) {
        console.warn("Error in sim info mapper:", error);
      }

      lastInfoUpdateMs.current = now;
    },
    [] // <--- Fondamentale: dipendenze vuote
  );

  return {
    simData,
    updateSimInfo,
    refs: customRefs,
  };
}
