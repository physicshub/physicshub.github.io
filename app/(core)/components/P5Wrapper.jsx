// app/(core)/components/P5Wrapper.jsx
"use client";
import { useEffect, useRef } from "react";
import { resetTime, cleanupInstance } from "../constants/Time.js";

export default function P5Wrapper({ sketch, simInfos }) {
  // containerRef: the <div> where p5 will attach the canvas
  const containerRef = useRef(null);
  // p5InstanceRef: keeps track of the current p5 instance (so it can be removed on unmount)
  const p5InstanceRef = useRef(null);

  // Cleanup helper function to safely remove a p5 instance
  const safeRemove = (instance) => {
    if (!instance) return;
    try {
      cleanupInstance(instance);
      instance.remove();
    } catch {
      // Errors are intentionally silenced
      // as p5 removal can be flaky in some edge cases
      // (e.g., Fast Refresh, unmount during loading, etc.)
      // this prevents noise in the console.
    }
  };

  useEffect(() => {
    // Set active to true. If component unmounts, turn it to false.
    // Active is LOCAL to this useEffect scope, so multiple mounts/unmounts
    // won't interfere with each other.
    let active = true;
    let tempP5Instance = null;

    // IIAFE (Immediately Invoked Async Function Expression)
    (async () => {
      try {
        // P5 dynamic import (browser-only)
        // Directly destructuring default import to avoid extra .default usage
        const { default: p5 } = await import("p5");

        // Exit if component inactive (unmounted) or sketch missing
        if (!active || !containerRef.current || !sketch) return;

        // Remove previous instance if exists (Fast Refresh / sketch change)
        safeRemove(p5InstanceRef.current);
        p5InstanceRef.current = null;

        // Create a new P5 instance in a temporary variable.
        // We only assign it to p5InstanceRef after confirming the component is still mounted
        // to avoid keeping a P5 instance alive for an unmounted component.
        tempP5Instance = new p5((p) => {
          p._instanceId =
            crypto?.randomUUID?.() ??
            Math.random().toString(36).slice(2) + Date.now().toString(36);

          resetTime();
          sketch(p);
        }, containerRef.current);

        // If component is already unmounted when the temp instance finishes loading, cleanup
        // Very rare edge case, but good to handle
        if (!active) {
          safeRemove(tempP5Instance);
          return;
        }

        // Confirmed mount success - track the new instance
        p5InstanceRef.current = tempP5Instance;
      } catch (err) {
        console.error("Failed to load P5:", err);
      }
    })();

    return () => {
      active = false;

      // Cleanup any existing instance
      safeRemove(p5InstanceRef.current);
      p5InstanceRef.current = null;
    };
  }, [sketch]);

  return (
    <div className="p5-wrapper">
      <div ref={containerRef} className="screen" id="Screen">
        {simInfos ?? ""}
      </div>
    </div>
  );
}
