import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion, useReducedMotion } from "framer-motion";
import HeroPreview from "./HeroPreview";
import useTranslation from "../hooks/useTranslation.ts";

// Kept short: the primary CTA must settle almost immediately. Every variant
// keeps opacity at 1 so the server-rendered hero (heading, CTAs, preview) is
// readable before hydration, in a background tab, or if JS never runs; only
// position eases in.
const containerVariants = (rm) => ({
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0 : 0.1,
      staggerChildren: rm ? 0 : 0.07,
    },
  },
});

const riseIn = (rm) => ({
  hidden: { opacity: 1, y: rm ? 0 : 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
});

const titleLine = (rm) => ({
  hidden: { opacity: 1, y: rm ? 0 : 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
});

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  // Two sentences, one line each on desktop; the second carries the accent.
  // A translation without "start" in it simply renders as one line group.
  const heading = t("Stop memorizing formulas. Start visualizing them.");
  const words = heading.split(" ");
  const accentFrom = words.findIndex((w) => /start/i.test(w));
  const lines =
    accentFrom > 0
      ? [
          words.slice(0, accentFrom).join(" "),
          words.slice(accentFrom).join(" "),
        ]
      : [heading];

  return (
    <motion.div
      className={`ph-hero__container ph-hero__container--landing ${
        isCompleted ? "notranslate" : ""
      }`}
      variants={containerVariants(reduceMotion)}
      initial="hidden"
      animate="show"
    >
      <div className="ph-hero__copy">
        <h1 className="ph-hero__title">
          {lines.map((line, i) => (
            <motion.span
              key={i}
              className={`ph-hero__title-line${
                i === 1 ? " ph-hero__title-accent" : ""
              }`}
              variants={titleLine(reduceMotion)}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p className="ph-hero__subtitle" variants={riseIn(reduceMotion)}>
          {t(
            "Experience physics in real time, uncover the concepts behind the formulas, and instantly see how they apply to the real world."
          )}
        </motion.p>

        <motion.div className="ph-hero__ctas" variants={riseIn(reduceMotion)}>
          <Link className="ph-btn ph-btn--primary main-btn" href="/simulations">
            {t("Go to Simulations")}
            <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
          </Link>
          <Link className="ph-btn ph-btn--ghost main-btn" href="#how-it-works">
            {t("See how it works")}
          </Link>
        </motion.div>
      </div>

      <motion.div className="ph-hero__visual" variants={riseIn(reduceMotion)}>
        <HeroPreview />
      </motion.div>
    </motion.div>
  );
}
