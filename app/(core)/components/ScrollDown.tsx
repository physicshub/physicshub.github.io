"use client";

import { useEffect, useState } from "react";

export default function ScrollIndicator() {
  const [scrollY, setScrollY] = useState(0);
  const [dotY, setDotY] = useState(0);

  useEffect(() => {
    let rafId: number;

    const onScroll = () => {
      setScrollY(window.scrollY);
    };

    const animateDot = () => {
      setDotY((prev) => {
        // Target dot position (slow & clamped)
        const target = Math.min(scrollY / 10, 18);
        // Easing for smooth, slow movement
        return prev + (target - prev) * 0.08;
      });

      rafId = requestAnimationFrame(animateDot);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    animateDot();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollY]);

  const heroHeight =
    typeof window !== "undefined" ? window.innerHeight / 6 : 500;

  // Fade out after hero
  const opacity =
    scrollY < heroHeight ? 1 : Math.max(1 - (scrollY - heroHeight) / 400, 0);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "32px",
        transform: "translateX(-50%)",
        zIndex: 1000,
        opacity,
        transition: "opacity 0.4s ease",
        pointerEvents: opacity === 0 ? "none" : "auto",
      }}
    >
      <button
        aria-label="Scroll to explore"
        onClick={() =>
          window.scrollBy({
            top: heroHeight,
            behavior: "smooth",
          })
        }
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {/* Mouse outline */}
        <div
          style={{
            width: "28px",
            height: "44px",
            borderRadius: "16px",
            border: "2px solid #00e6e6",
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 0 14px rgba(0,230,230,0.6)",
          }}
        >
          {/* Smooth moving dot */}
          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              transform: `translate(-50%, ${dotY}px)`,
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00e6e6",
              boxShadow: "0 0 8px rgba(0,230,230,0.9)",
              transition: "transform 0.3s ease-out",
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            letterSpacing: "0.18em",
            color: "#00e6e6",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          SCROLL TO EXPLORE
        </div>
      </button>
    </div>
  );
}
