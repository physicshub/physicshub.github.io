import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAtom,
  faBolt,
  faPlay,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import chaptersData from "../data/chapters.js";
import { motion, useReducedMotion } from "framer-motion";
import useTranslation from "../hooks/useTranslation.ts";

// Container variant for staggered child animations
const containerVariants = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0.1 : 0.6,
      staggerChildren: rm ? 0.08 : 0.25,
    },
  },
});

// Fade-up variant for subtitles and CTAs
const fadeUp = (rm) => ({
  hidden: { opacity: 0, y: rm ? 10 : 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: rm ? 0.5 : 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

// Button interactions
const buttonVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 16 },
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
      delayChildren: rm ? 0.1 : 0.3,
      staggerChildren: rm ? 0.04 : 0.12,
    },
  },
});

// Basic per-word fade-and-rise
const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Glowing text-shadow animation for highlighted word in #00e6e6
const glowVariant = {
  hidden: { textShadow: "0px 0px 0px rgba(0,230,230,0)" },
  show: {
    textShadow: [
      "0px 0px 0px rgba(0,230,230,0)",
      "0px 0px 12px rgba(0,230,230,1)",
      "0px 0px 0px rgba(0,230,230,0)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatDelay: 3,
      ease: "easeInOut",
    },
  },
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();

  const isCompleted = meta?.completed || false;

  // Compute chapters count
  const chaptersCount = Array.isArray(chaptersData)
    ? chaptersData.length
    : chaptersData && typeof chaptersData === "object"
      ? Object.keys(chaptersData).length
      : 0;

  // Split heading into words
  const titleWords = t(
    "PhysicsHub – Best website to learn physics easily."
  ).split(" ");

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
        <motion.p className="ph-hero__eyebrow" variants={fadeUp(reduceMotion)}>
          <FontAwesomeIcon icon={faAtom} />
          {t("Interactive physics learning")}
        </motion.p>

        {/* Animated H1 with per-word glow on PhysicsHub */}
        <motion.h1
          className="ph-hero__title"
          variants={textContainer(reduceMotion)}
        >
          {titleWords.map((word, idx) => {
            const isHighlight = word.includes("PhysicsHub");
            return (
              <motion.span
                key={idx}
                variants={isHighlight ? glowVariant : wordVariant}
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
            <Link className="ph-btn ph-btn--ghost main-btn" href="/contribute">
              {t("Contribute")}
              <FontAwesomeIcon icon={faGithub} style={{ marginLeft: 8 }} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Info text */}
        <motion.p className="ph-hero__info" variants={fadeUp(reduceMotion)}>
          {t("Currently")} {chaptersCount} {t("chapters available.")}
        </motion.p>
      </div>

      <motion.aside
        className="ph-hero-preview"
        aria-label={t("Physics simulation preview")}
        variants={fadeUp(reduceMotion)}
      >
        <div className="ph-hero-preview__toolbar">
          <span />
          <span />
          <span />
          <strong>{t("Live Simulation")}</strong>
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
          <Link href="/simulations/CircularMotion">
            <FontAwesomeIcon icon={faWaveSquare} />v = 8.2 m/s
          </Link>
          <Link href="/simulations/SpringConnection">
            <FontAwesomeIcon icon={faBolt} />E = 42 J
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
