// app/(core)/components/P5Wrapper.jsx
"use client";
import { useEffect, useRef } from "react";
import { resetTime, cleanupInstance } from "../constants/Time.js";
import { setCanvasHeight } from "../constants/Utils.js";

// --------------------------------------------------------------------------
// Turbopack intercepts ALL fetch() calls that originate from within its
// module graph during construction — including the passthrough to realFetch.
// The only reliable fix is to swallow every fetch that fires during
// `new P5Constructor(...)` and let p5 handle the empty responses gracefully.
// The real fetch is restored immediately after the constructor returns.
// --------------------------------------------------------------------------
function withP5FetchGuard(fn) {
  const realFetch = window.fetch;

  // Swallow ALL fetches during p5 instantiation
  window.fetch = function guardedFetch() {
    return Promise.resolve(
      new Response(new ArrayBuffer(0), {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      })
    );
  };

  try {
    return fn();
  } finally {
    window.fetch = realFetch;
  }
}

// --------------------------------------------------------------------------
// p5 loader — tries npm import first, falls back to CDN script injection.
// --------------------------------------------------------------------------
const loadP5Library = (() => {
  let cached = null;

  return () =>
    new Promise(async (resolve, reject) => {
      if (cached) return resolve(cached);

      try {
        const mod = await import("p5");
        const P5 = mod?.default ?? mod;
        if (typeof P5 === "function") {
          cached = P5;
          return resolve(cached);
        }
      } catch (_) {}

      if (typeof window.p5 === "function") {
        cached = window.p5;
        return resolve(cached);
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.min.js";
      script.async = true;
      script.onload = () => {
        if (typeof window.p5 === "function") {
          cached = window.p5;
          resolve(cached);
        } else {
          reject(new Error("p5 CDN loaded but window.p5 is not a function"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load p5 from CDN"));
      document.head.appendChild(script);
    });
})();

// --------------------------------------------------------------------------
// Instantiate p5 inside a macrotask so we are outside Turbopack's module
// execution frame, with the fetch guard active for the entire constructor.
// --------------------------------------------------------------------------
function createP5Instance(P5Constructor, sketchFn, container) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const instance = withP5FetchGuard(
          () => new P5Constructor(sketchFn, container)
        );
        resolve(instance);
      } catch (err) {
        reject(err);
      }
    }, 0);
  });
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------
export default function P5Wrapper({ sketch, simInfos }) {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);

  const safeRemove = (instance) => {
    if (!instance) return;
    try {
      cleanupInstance(instance);
      instance.remove();
    } catch (_) {}
  };

  // Centralised resize logic
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !p5InstanceRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setCanvasHeight(clientHeight);
      p5InstanceRef.current.resizeCanvas(clientWidth, clientHeight);
      if (p5InstanceRef.current.onResize) {
        p5InstanceRef.current.onResize(clientWidth, clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [sketch]);

  // p5 instance lifecycle
  useEffect(() => {
    let active = true;

    const loadP5 = async () => {
      try {
        if (typeof window === "undefined") return;
        if (!containerRef.current || !sketch) return;

        const P5Constructor = await loadP5Library();
        if (!active) return;

        safeRemove(p5InstanceRef.current);
        p5InstanceRef.current = null;

        const instance = await createP5Instance(
          P5Constructor,
          (p) => {
            p._instanceId =
              crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

            resetTime();
            sketch(p);

            p.setup = ((originalSetup) => () => {
              // Fix #194: Set CANVAS_HEIGHT to the real container size BEFORE
              // running the simulation's own setup(), so that coordinate
              // conversions (physicsYToScreenY, toMeters, etc.) and initial
              // body spawn positions use the correct canvas dimensions even
              // when p._userNode.clientHeight is still 0 at this point.
              const h = containerRef.current?.clientHeight ?? 0;
              const w = containerRef.current?.clientWidth ?? 0;
              if (h > 0) setCanvasHeight(h);

              // Run the sketch's own setup (calls p.createCanvas internally).
              if (originalSetup) originalSetup();

              // After the canvas element exists, resize it to the real
              // container dimensions and sync CANVAS_HEIGHT again.
              const finalH = containerRef.current?.clientHeight ?? 0;
              const finalW = containerRef.current?.clientWidth ?? 0;
              if (finalW > 0 && finalH > 0) {
                p.resizeCanvas(finalW, finalH);
                setCanvasHeight(finalH);
                // Let the simulation re-clamp or re-position bodies now that
                // the canvas has its definitive size.
                if (typeof p.windowResized === "function") p.windowResized();
              }
            })(p.setup);
          },
          containerRef.current
        );

        if (!active) {
          safeRemove(instance);
          return;
        }

        p5InstanceRef.current = instance;
      } catch (err) {
        console.error("Failed to initialize P5 safely:", err);
      }
    };

    loadP5();

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
