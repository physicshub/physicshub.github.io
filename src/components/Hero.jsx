import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import chaptersData from "../data/chapters.js";
import { motion, useReducedMotion } from "framer-motion";

// Container variant for staggered child animations
const containerVariants = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0.1 : 0.6,
      staggerChildren: rm ? 0.08 : 0.25
    }
  }
});

// Fade-up variant for subtitles and CTAs
const fadeUp = (rm) => ({
  hidden: { opacity: 0, y: rm ? 10 : 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: rm ? 0.5 : 1.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
});

// Button interactions
const buttonVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 16 } },
  hover: { scale: 1.04, boxShadow: "0 10px 30px rgba(0,0,0,0.18)", transition: { duration: 0.25 } },
  tap: { scale: 0.98 }
};

// Text container for per-word staggering
const textContainer = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: rm ? 0.1 : 0.3,
      staggerChildren: rm ? 0.04 : 0.12
    }
  }
});

// Basic per-word fade-and-rise
const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Glowing text-shadow animation for highlighted word in #00e6e6
const glowVariant = {
  hidden: { textShadow: "0px 0px 0px rgba(0,230,230,0)" },
  show: {
    textShadow: [
      "0px 0px 0px rgba(0,230,230,0)",
      "0px 0px 12px rgba(0,230,230,1)",
      "0px 0px 0px rgba(0,230,230,0)"
    ],
    transition: { duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
  }
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  // Compute chapters count
  const chaptersCount = Array.isArray(chaptersData)
    ? chaptersData.length
    : chaptersData && typeof chaptersData === "object"
    ? Object.keys(chaptersData).length
    : 0;

  // Split heading into words
  const titleWords = "PhysicsHub – Best website to learn physics easily.".split(" ");

  return (
    <motion.div
      className="ph-hero__container"
      variants={containerVariants(reduceMotion)}
      initial="hidden"
      animate="show"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Animated H1 with per-word glow on PhysicsHub */}
      <motion.h1 className="ph-hero__title" variants={textContainer(reduceMotion)}>
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
        Experience physics in real time, uncover the concepts behind the formulas, and instantly see how they apply to the real world.
      </motion.p>

      {/* CTA buttons */}
      <motion.div className="ph-hero__ctas" variants={fadeUp(reduceMotion)}>
        <motion.div variants={buttonVariant} whileHover="hover" whileTap="tap">
          <Link className="ph-btn ph-btn--primary main-btn" to="/simulations">
            Go to Simulations
            <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
          </Link>
        </motion.div>
        <motion.div variants={buttonVariant} whileHover="hover" whileTap="tap">
          <Link className="ph-btn ph-btn--ghost main-btn" to="/contribute">
            Contribute
            <FontAwesomeIcon icon={faGithub} style={{ marginLeft: 8 }} />
          </Link>
        </motion.div>
      </motion.div>

      {/* Info text */}
      <motion.p className="ph-hero__info" variants={fadeUp(reduceMotion)}>
        Currently {chaptersCount} chapters available.
      </motion.p>
    </motion.div>
  );
}
