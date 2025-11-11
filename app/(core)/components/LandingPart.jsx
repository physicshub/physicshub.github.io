import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

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

const buttonVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 16 } },
  hover: { scale: 1.04, boxShadow: "0 10px 30px rgba(0,0,0,0.18)", transition: { duration: 0.25 } },
  tap: { scale: 0.98 }
};

// Config CTA
const defaultCTAs = [
  /* Example for CTAs: */
/*{
    label: "Go to Simulations",
    to: "/simulations",
    type: "primary",
    icon: faArrowRight
  },
  {
    label: "Contribute",
    to: "/contribute",
    type: "ghost",
    icon: faGithub
  }*/
];

const defaultStats = [
/* Example for Stats: */
/*{
    label: "Chapters:",
    value: "2",
    icon: faListNumeric
  }, */
];

export function LandingPart({
  eyebrow = "",
  title = "",
  subtitle = "",
  ctas = defaultCTAs,
  ctaVariant = buttonVariant,
  ctaGap = "1rem",
  stats = defaultStats,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="ph-hero__container"
      variants={containerVariants(reduceMotion)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {eyebrow && (
        <motion.p className="ph-hero__eyebrow" variants={fadeUp(reduceMotion)}>
          {eyebrow}
        </motion.p>
      )}

      <motion.h2 className="ph-hero__title" variants={fadeUp(reduceMotion)}>
        {title}
      </motion.h2>

      <motion.p className="ph-hero__subtitle" variants={fadeUp(reduceMotion)}>
        {subtitle}
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="ph-hero__ctas"
        style={{ display: "flex", gap: ctaGap }}
        variants={fadeUp(reduceMotion)}
      >
        {ctas.map(({ label, to, type, icon, target }, i) => {
          const isExternal = /^https?:\/\//i.test(to) || to.startsWith("//");

          return (
            <motion.div
              key={i}
              variants={ctaVariant}
              whileHover="hover"
              whileTap="tap"
            >
              {isExternal ? (
                <a
                  href={to}
                  className={`ph-btn ph-btn--${type}`}
                  target={target || "_blank"}
                  rel="noopener noreferrer"
                >
                  {label}
                  {icon && <FontAwesomeIcon icon={icon} style={{ marginLeft: 8 }} />}
                </a>
              ) : (
                <Link
                  className={`ph-btn ph-btn--${type}`}
                  href={to}
                  target={target}
                >
                  {label}
                  {icon && <FontAwesomeIcon icon={icon} style={{ marginLeft: 8 }} />}
                </Link>
              )}
            </motion.div>
          );
        })}

      </motion.div>

      {/* Stats */}
      <motion.div
        className="ph-hero__stats"
        role="list"
        aria-label="Stats"
        variants={fadeUp(reduceMotion)}
      >
        {stats.map((stat, i) => (
          <div className="ph-stat" role="listitem" key={i}>
            <FontAwesomeIcon icon={stat.icon} />
            <span className="ph-stat__label">{stat.label}</span>
            <span className="ph-stat__value">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

