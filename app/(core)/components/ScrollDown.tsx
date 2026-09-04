"use client";

import { useEffect, useRef, useState } from "react";
import useTranslation from "../hooks/useTranslation.ts";

export default function ScrollIndicator() {
  const [opacity, setOpacity] = useState(1);
  const dotRef = useRef<HTMLSpanElement>(null);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  useEffect(() => {
    let rafId = 0;
    let dotY = 0;

    const tick = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      // Fade the indicator out across the first viewport of scrolling.
      const next =
        scrollY < heroHeight * 0.15
          ? 1
          : Math.max(0, 1 - (scrollY - heroHeight * 0.15) / (heroHeight * 0.5));
      setOpacity((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));

      // Ease the dot toward a small clamped offset.
      const target = Math.min(scrollY / 10, 18);
      dotY += (target - dotY) * 0.08;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(-50%, ${dotY}px)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className={`ph-scrolldown ${isCompleted ? "notranslate" : ""}`}
      style={{
        opacity,
        transition: "opacity 0.4s ease",
        pointerEvents: opacity < 0.05 ? "none" : "auto",
      }}
    >
      <button
        type="button"
        aria-label={t("Scroll to explore")}
        onClick={() =>
          window.scrollBy({
            top: Math.round(window.innerHeight * 0.9),
            behavior: "smooth",
          })
        }
        className="ph-scrolldown__btn"
      >
        <span className="ph-scrolldown__mouse">
          <span ref={dotRef} className="ph-scrolldown__dot" />
        </span>
        <span className="ph-scrolldown__label">{t("SCROLL TO EXPLORE")}</span>
      </button>
    </div>
  );
}
