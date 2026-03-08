// app/(core)/components/P5Wrapper.jsx
"use client";
import { useEffect, useRef } from "react";
import { resetTime, cleanupInstance } from "../constants/Time.js";
import { setCanvasHeight } from "../constants/Utils.js";

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
    } catch (err) {}
  };

  // --- LOGICA DI RESIZE CENTRALIZZATA ---
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !p5InstanceRef.current) return;

      // 1. Ottieni le nuove dimensioni dal contenitore DOM
      const { clientWidth, clientHeight } = containerRef.current;

      // 2. Aggiorna il valore globale della fisica
      setCanvasHeight(clientHeight);

      // 3. Comunica a p5.js di ridimensionare il canvas
      p5InstanceRef.current.resizeCanvas(clientWidth, clientHeight);

      // Opzionale: se hai bisogno di resettare qualcosa nello sketch al resize
      if (p5InstanceRef.current.onResize) {
        p5InstanceRef.current.onResize(clientWidth, clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Eseguiamo una chiamata iniziale per sincronizzare le dimensioni al montaggio
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [sketch]);

  useEffect(() => {
    let active = true;
    let tempP5Instance = null;

    (async () => {
      try {
        const { default: p5 } = await import("p5");
        if (!active || !containerRef.current || !sketch) return;

        safeRemove(p5InstanceRef.current);

        tempP5Instance = new p5((p) => {
          p._instanceId =
            crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

          resetTime();
          sketch(p);

          p.setup = ((originalSetup) => () => {
            if (originalSetup) originalSetup();
            const h = containerRef.current.clientHeight;
            const w = containerRef.current.clientWidth;
            p.resizeCanvas(w, h);
            setCanvasHeight(h);
          })(p.setup);
        }, containerRef.current);

        if (!active) {
          safeRemove(tempP5Instance);
          return;
        }

        p5InstanceRef.current = tempP5Instance;
      } catch (err) {
        console.error("Failed to load P5:", err);
      }
    })();

    return () => {
      active = false;
      safeRemove(p5InstanceRef.current);
      p5InstanceRef.current = null;
    };
  }, [sketch]);

  return (
    <div className="p5-wrapper" style={{ width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        className="screen"
        id="Screen"
        style={{ width: "100%", height: "100%" }}
      >
        {simInfos ?? ""}
      </div>
    </div>
  );
}
