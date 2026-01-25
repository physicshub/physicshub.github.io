// app/hooks/useSimInfo.ts
import { useRef, useState, useCallback, useMemo } from "react";

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
  const {
    updateIntervalMs = 150, // default 150ms
    customRefs,
  } = options;

  // Stabilizza i refs per evitare re-render inutili
  const stableCustomRefs = useMemo(
    () => customRefs || ({} as TRefs),
    [customRefs]
  );

  const [simData, setSimData] = useState<TData | Record<string, unknown>>({});
  const lastInfoUpdateMs = useRef(0);

  /**
   * Funzione centralizzata di update
   * @param p - istanza p5 (deve avere millis())
   * @param state - stato della simulazione (pos, vel, ecc.)
   * @param context - contesto extra (gravity, canvasHeight, ecc.)
   * @param mapper - funzione che mappa state+context+refs -> simData
   */
  const updateSimInfo = useCallback(
    (
      p: { millis: () => number },
      state: TState,
      context: TContext,
      mapper: SimInfoMapper<TState, TContext, TRefs, TData>
    ) => {
      if (!p || !mapper) return;

      const now = p.millis();
      if (now - lastInfoUpdateMs.current < updateIntervalMs) return;

      try {
        const data = mapper(state, context, stableCustomRefs);
        if (data) setSimData(data);
      } catch (error) {
        console.warn("Error in sim info mapper:", error);
      }

      lastInfoUpdateMs.current = now;
    },
    [updateIntervalMs, stableCustomRefs]
  );

  return {
    simData,
    updateSimInfo,
    refs: customRefs,
  };
}
