"use client";
import { useEffect, useRef } from "react";
import useAuth from "./useAuth";
import { getCloudConfig } from "../lib/community";
import {
  onApplyInputs,
  onGetCurrentInputs,
} from "../utils/simulationEvents.js";
import {
  buildSimulationUrl,
  parseInputsFromSearch,
  sanitizeInputs,
} from "../utils/simulationUrl.js";

type Inputs = Record<string, unknown>;

/**
 * The running simulation's link to the page sections around it. It answers
 * "what are the current inputs?" (for publishing a preset) and loads inputs
 * that reach it from outside its own controls:
 *
 * - a community preset's "Try" button (a window event, see simulationEvents.js),
 *   which also rewrites the URL so the address bar is a shareable link to it;
 * - the configuration the signed-in user saved on another device, loaded once
 *   when the session is known — unless the page was opened from a link that
 *   carries inputs, which always wins. (All saved configs arrive in a single
 *   request per session; see getCloudConfig.)
 *
 * `onLoad` (createSimulation's handleLoad) sanitises everything it is given.
 */
export default function useExternalInputs(
  simId: string,
  initialInputs: Inputs,
  fields: object[],
  inputsRef: { current: Inputs },
  onLoad: (inputs: Inputs) => void
) {
  const { user } = useAuth();
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const cloudLoadedFor = useRef<string | null>(null);

  // Lets the presets section read what is on screen to publish it.
  useEffect(
    () => onGetCurrentInputs(() => ({ ...inputsRef.current })),
    [inputsRef]
  );

  useEffect(
    () =>
      onApplyInputs((inputs: Inputs) => {
        const merged = {
          ...initialInputs,
          ...sanitizeInputs(inputs, initialInputs, fields),
        };
        onLoadRef.current(merged);
        const url = buildSimulationUrl(
          window.location.pathname,
          merged,
          initialInputs
        );
        window.history.replaceState(window.history.state, "", url);
      }),
    [initialInputs, fields]
  );

  useEffect(() => {
    if (!user || !simId || cloudLoadedFor.current === user.id) return;
    if (parseInputsFromSearch(window.location.search, initialInputs, fields)) {
      cloudLoadedFor.current = user.id;
      return;
    }

    let cancelled = false;
    getCloudConfig(user.id, simId).then(({ data }) => {
      if (cancelled) return;
      cloudLoadedFor.current = user.id;
      if (data) onLoadRef.current(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user, simId, initialInputs, fields]);
}
