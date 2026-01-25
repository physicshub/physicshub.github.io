import React, { useRef, useEffect } from "react";
import p5 from "p5";
import { FPS_FOR_SIMULATIONS } from "../constants/Config";

function Screen({ sketch }) {
  const containerRef = useRef(null);
  const p5Instance = useRef(null);

  useEffect(() => {
    // EN: Defensive cleanup in case dev StrictMode mounts twice
    // IT: Pulizia difensiva nel caso StrictMode monti due volte in dev
    if (p5Instance.current) {
      p5Instance.current.remove();
      p5Instance.current = null;
    }
    const container = containerRef.current;
    if (container) {
      // Remove any leftover canvases
      while (container.firstChild) container.removeChild(container.firstChild);
    }

    // Create fresh p5 instance
    p5Instance.current = new p5(sketch, containerRef.current);
    p5Instance.current.frameRate(FPS_FOR_SIMULATIONS);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
      if (container) {
        while (container.firstChild)
          container.removeChild(container.firstChild);
      }
    };
  }, [sketch]);

  return <div ref={containerRef} className="screen" id="Screen"></div>;
}

export default Screen;
