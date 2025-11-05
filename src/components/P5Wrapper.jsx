// src/components/P5Wrapper.jsx
import { useEffect, useRef } from "react";
import p5 from "p5";
import { resetTime, cleanupInstance } from "../constants/Time.js";

/**
 * A reusable wrapper component to handle the p5.js instance and sketch lifecycle.
 * It abstracts away the boilerplate of creating and removing the canvas.
 */
export default function P5Wrapper({ sketch, simInfos }) {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    // Ensure any previous instance is removed before creating a new one
    if (p5InstanceRef.current) {
      cleanupInstance(p5InstanceRef.current);
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    // Create a new p5 instance and attach it to the container
    const p5Instance = new p5((p) => {
      // Assign a unique ID to this p5 instance for time management
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        p._instanceId = crypto.randomUUID();
      } else {
        // Fallback for environments without crypto.randomUUID
        p._instanceId =
          Math.random().toString(36).substring(2) + Date.now().toString(36);
      }

      // Reset time for this instance
      resetTime();

      // Start the provided sketch
      sketch(p);
    }, containerRef.current);

    // Save reference for cleanup
    p5InstanceRef.current = p5Instance;

    // Cleanup function to remove the p5 instance when the component unmounts or sketch changes
    return () => {
      if (p5InstanceRef.current) {
        cleanupInstance(p5InstanceRef.current);
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketch]); // Rerun the effect if the sketch function changes.

  return (
    <div className="p5-wrapper">
      <div ref={containerRef} className="screen" id="Screen" >
      {simInfos ? simInfos : ""}
    </div>
    </div>
  );
}