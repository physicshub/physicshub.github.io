// hooks/useSticky.ts
"use client";
import { useState, useEffect } from "react";

/**
 * Hook to detect if the page has been scrolled beyond a threshold.
 */
export function useSticky(threshold: number = 50): boolean {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const shouldBeSticky = window.scrollY > threshold;
      setIsSticky((prev) => (prev !== shouldBeSticky ? shouldBeSticky : prev));
    };

    // Coalesce bursts of scroll events into one state check per frame — a
    // sticky header that shifts layout can otherwise re-enter this handler
    // synchronously and trip React's "maximum update depth".
    const handleScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update(); // set initial state on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return isSticky;
}
