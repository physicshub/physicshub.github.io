"use client";
import { useSyncExternalStore } from "react";
import {
  CURRICULUM_ORDER,
  DEFAULT_CURRICULUM,
  getCurriculum,
} from "../data/curricula.js";
import { detectCurriculum } from "../utils/detectCurriculum.js";

// The reader's school curriculum, shared by every component on the page.
//
// It is a tiny external store rather than a React context so it needs no
// provider in the layout, and useSyncExternalStore gives the SSR-safe behaviour
// this static site needs: the server (and the first hydration pass) render the
// international default, then the client swaps in the detected or saved
// curriculum right after. A manual choice is saved and always beats detection.

const STORAGE_KEY = "physicshub-curriculum";

export interface Stage {
  id: string;
  name: string;
  grades: string | null;
  age: string;
  color: string;
  band: string;
  equivalents?: string[];
}

interface CurriculumState {
  id: string;
  source: "auto" | "manual";
  // What detection alone would pick (null = nothing recognisable).
  detected: string | null;
  // False until the client has read storage and the browser locale.
  ready: boolean;
}

const SERVER_STATE: CurriculumState = {
  id: DEFAULT_CURRICULUM,
  source: "auto",
  detected: null,
  ready: false,
};

let state: CurriculumState = SERVER_STATE;
let initialised = false;
const listeners = new Set<() => void>();

const readStored = (): string | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && CURRICULUM_ORDER.includes(value) ? value : null;
  } catch {
    return null;
  }
};

const compute = (): CurriculumState => {
  const stored = readStored();
  const detected = detectCurriculum();
  return stored
    ? { id: stored, source: "manual", detected, ready: true }
    : {
        id: detected ?? DEFAULT_CURRICULUM,
        source: "auto",
        detected,
        ready: true,
      };
};

const refresh = () => {
  state = compute();
  listeners.forEach((listener) => listener());
};

const getSnapshot = (): CurriculumState => {
  if (!initialised && typeof window !== "undefined") {
    initialised = true;
    state = compute();
    // Keep several open tabs in step.
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) refresh();
    });
  }
  return state;
};

const getServerSnapshot = (): CurriculumState => SERVER_STATE;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Pick a curriculum by hand; the choice is remembered. */
export const setCurriculum = (id: string) => {
  if (!CURRICULUM_ORDER.includes(id)) return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  refresh();
};

/** Forget the manual choice and go back to detection. */
export const resetCurriculum = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to forget.
  }
  refresh();
};

export default function useCurriculum() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const curriculum = getCurriculum(current.id);

  return {
    curriculumId: current.id,
    curriculum,
    stages: curriculum.stages as Stage[],
    source: current.source,
    detected: current.detected,
    ready: current.ready,
    setCurriculum,
    resetCurriculum,
  };
}
