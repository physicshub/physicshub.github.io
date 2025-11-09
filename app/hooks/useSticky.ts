// hooks/useSticky.ts
"use client";
import { useState, useEffect } from "react";

/**
 * Hook to detect if the page has been scrolled beyond a threshold.
 */
export function useSticky(threshold: number = 50): boolean {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Avoid unnecessary state updates
      const shouldBeSticky = window.scrollY > threshold;
      setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
    };

    // Run once on mount to set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isSticky;
}
