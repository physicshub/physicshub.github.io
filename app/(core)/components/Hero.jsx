import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAtom,
  faPlay,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import chaptersData from "../data/chapters.js";
import { motion, useReducedMotion } from "framer-motion";
import useTranslation from "../hooks/useTranslation.ts";

// Container variant for staggered child animations. Kept short: this is a
// Persuade surface, so the primary CTA must settle almost immediately.
const containerVariants = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0.05 : 0.12,
      staggerChildren: rm ? 0.05 : 0.08,
    },
  },
});

// Fade-up variant for subtitles and CTAs
const fadeUp = (rm) => ({
  hidden: { opacity: 0, y: rm ? 8 : 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: rm ? 0.4 : 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

// Button interactions
const buttonVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 18 },
  },
  hover: {
    scale: 1.04,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    transition: { duration: 0.25 },
  },
  tap: { scale: 0.98 },
};

// Text container for per-word staggering
const textContainer = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0.05 : 0.08,
      staggerChildren: rm ? 0.03 : 0.045,
    },
  },
});

// Basic per-word fade-and-rise
const wordVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();

  const isCompleted = meta?.completed || false;

  // Compute simulations count
  const chaptersCount = Array.isArray(chaptersData)
    ? chaptersData.length
    : chaptersData && typeof chaptersData === "object"
      ? Object.keys(chaptersData).length
      : 0;

  // Split heading into words; the second sentence carries the accent.
  const heading = t("Stop memorizing formulas. Start visualizing them.");
  const titleWords = heading.split(" ");
  const accentFrom = titleWords.findIndex((w) => /start/i.test(w));

  return (
    <motion.div
      className={`ph-hero__container ph-hero__container--landing ${
        isCompleted ? "notranslate" : ""
      }`}
      variants={containerVariants(reduceMotion)}
      initial="hidden"
      animate="show"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div className="ph-hero__copy">
        {/* Animated H1, second sentence tinted with the accent */}
        <motion.h1
          className="ph-hero__title"
          variants={textContainer(reduceMotion)}
        >
          {titleWords.map((word, idx) => {
            const isAccent = accentFrom !== -1 && idx >= accentFrom;
            return (
              <motion.span
                key={idx}
                className={isAccent ? "ph-hero__title-accent" : undefined}
                variants={wordVariant}
                style={{ display: "inline-block", marginRight: "0.25ch" }}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtitle */}
        <motion.p className="ph-hero__subtitle" variants={fadeUp(reduceMotion)}>
          {t(
            "Experience physics in real time, uncover the concepts behind the formulas, and instantly see how they apply to the real world."
          )}
        </motion.p>

        {/* CTA buttons */}
        <motion.div className="ph-hero__ctas" variants={fadeUp(reduceMotion)}>
          <motion.div
            variants={buttonVariant}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              className="ph-btn ph-btn--primary main-btn"
              href="/simulations"
            >
              {t("Go to Simulations")}
              <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
            </Link>
          </motion.div>
          <motion.div
            variants={buttonVariant}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              className="ph-btn ph-btn--ghost main-btn"
              href="#how-it-works"
            >
              {t("See how it works")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Info text */}
        <motion.p className="ph-hero__info" variants={fadeUp(reduceMotion)}>
          {chaptersCount}{" "}
          {t("interactive simulations. Free forever, no account, no ads.")}
        </motion.p>
      </div>

      <motion.aside
        className="ph-hero-preview"
        aria-label={t("Jump into a topic")}
        variants={fadeUp(reduceMotion)}
      >
        <div className="ph-hero-preview__toolbar">
          <span />
          <span />
          <span />
          <strong>{t("Start with a concept")}</strong>
        </div>
        <div className="ph-hero-preview__stage" aria-hidden="true">
          <div className="ph-hero-preview__scan" />
          <div className="ph-hero-preview__pulse ph-hero-preview__pulse--one" />
          <div className="ph-hero-preview__pulse ph-hero-preview__pulse--two" />
          <div className="ph-hero-preview__orbit ph-hero-preview__orbit--outer" />
          <div className="ph-hero-preview__orbit ph-hero-preview__orbit--inner" />
          <div className="ph-hero-preview__orbit ph-hero-preview__orbit--tilt" />
          <div className="ph-hero-preview__mass ph-hero-preview__mass--primary" />
          <div className="ph-hero-preview__mass ph-hero-preview__mass--secondary" />
          <div className="ph-hero-preview__mass ph-hero-preview__mass--tertiary" />
          <div className="ph-hero-preview__vector" />
          <FontAwesomeIcon className="ph-hero-preview__atom" icon={faAtom} />
        </div>
        <div
          className="ph-hero-preview__topics"
          aria-label={t("Related topics")}
        >
          <Link href="/simulations/BallGravity">{t("Gravity")}</Link>
          <Link href="/simulations/VectorsOperations">{t("Vectors")}</Link>
          <Link href="/simulations/SimplePendulum">{t("Oscillations")}</Link>
        </div>
        <div className="ph-hero-preview__metrics">
          <Link href="/simulations/SimplePendulum">
            <FontAwesomeIcon icon={faWaveSquare} />
            {t("Pendulum")}
          </Link>
          <Link href="/simulations/ThreeBody">
            <FontAwesomeIcon icon={faAtom} />
            {t("Orbits")}
          </Link>
          <Link className="ph-hero-preview__try" href="/simulations">
            <FontAwesomeIcon icon={faPlay} />
            {t("Try it live")}
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}
