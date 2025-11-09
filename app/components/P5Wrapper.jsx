// app/components/P5Wrapper.jsx
"use client";
import { useEffect, useRef } from "react";
import { resetTime, cleanupInstance } from "../constants/Time.js";

export default function P5Wrapper({ sketch, simInfos }) {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    let p5;
    (async () => {
      const module = await import("p5");   // ✅ import dinamico
      p5 = module.default;

      if (p5InstanceRef.current) {
        cleanupInstance(p5InstanceRef.current);
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      const p5Instance = new p5((p) => {
        p._instanceId = crypto?.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);

        resetTime();
        sketch(p);
      }, containerRef.current);

      p5InstanceRef.current = p5Instance;
    })();

    return () => {
      if (p5InstanceRef.current) {
        cleanupInstance(p5InstanceRef.current);
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
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
