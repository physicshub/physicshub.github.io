"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Props {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export const Theme = ({ mode, onToggle }: Props) => {
  const isLight = mode === 'light';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To avoid hydration mismatch, do not depend on client-only values
  // for attributes that were rendered on the server. Defer animations/style
  // changes until after hydration by gating them on `mounted`.
  const transformStyle = mounted ? (isLight ? "rotate(90deg)" : "rotate(40deg)") : undefined;

  return (
    <button
      className={`grid size-11 place-items-center cursor-pointer rounded-xl bg-gradient-to-t shadow-lg ${isLight ? "from-[#f8fafc] to-[#f1f5f9] text-stone-950" : "from-[#020617] to-[#0F172A] text-stone-50"}`}
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <svg
        viewBox="0 0 18 18"
        style={transformStyle ? { transform: transformStyle } : undefined}
        className="size-6 overflow-visible transition-transform duration-500"
      >
        <mask id="moon-mask-main-nav">
          <rect x="0" y="0" width="18" height="18" fill="#FFF" />
          <motion.circle
            animate={mounted ? { cx: isLight ? 25 : 10 } : {}}
            cy="2"
            r="8"
            fill="black"
          />
        </mask>
        <motion.circle
          cx="9"
          cy="9"
          fill="currentColor"
          mask="url(#moon-mask-main-nav)"
          animate={mounted ? { r: isLight ? 5 : 8 } : {}}
        />
        <g>
          <motion.circle
            cx="17"
            cy="9"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
          />
          <motion.circle
            cx="13"
            cy="15.928203230275509"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
            transition={mounted ? { delay: isLight ? 0.05 : 0 } : undefined}
          />
          <motion.circle
            cx="5.000000000000002"
            cy="15.92820323027551"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
            transition={mounted ? { delay: isLight ? 0.1 : 0 } : undefined}
          />
          <motion.circle
            cx="1"
            cy="9.000000000000002"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
            transition={mounted ? { delay: isLight ? 0.15 : 0 } : undefined}
          />
          <motion.circle
            cx="4.9999999999999964"
            cy="2.071796769724492"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
            transition={mounted ? { delay: isLight ? 0.2 : 0 } : undefined}
          />
          <motion.circle
            cx="13"
            cy="2.0717967697244912"
            r="1.5"
            fill="currentColor"
            animate={mounted ? { scale: isLight ? 1 : 0 } : {}}
            transition={mounted ? { delay: isLight ? 0.25 : 0 } : undefined}
          />
        </g>
      </svg>
    </button>
  );
};
