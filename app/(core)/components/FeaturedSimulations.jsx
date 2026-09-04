"use client";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion, useReducedMotion } from "framer-motion";
import chapters from "../data/chapters.js";
import { LEVELS } from "../data/tags.js";
import useTranslation from "../hooks/useTranslation.ts";

const container = (rm) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: rm ? 0.04 : 0.07 } },
});

const card = (rm) => ({
  hidden: { opacity: 0, y: rm ? 8 : 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: rm ? 0.4 : 0.5, ease: [0.22, 1, 0.36, 1] },
  },
});

// A deliberate spread across school levels so the grid reads as "something
// here for everyone" rather than six variations of one topic.
const FEATURED_LINKS = [
  "/simulations/BouncingBall",
  "/simulations/BallGravity",
  "/simulations/SimplePendulum",
  "/simulations/CircularMotion",
  "/simulations/DoublePendulum",
  "/simulations/ThreeBody",
];

export default function FeaturedSimulations() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const list = Array.isArray(chapters) ? chapters : [];
  const featured = FEATURED_LINKS.map((link) =>
    list.find((c) => c.link === link)
  ).filter(Boolean);
  // Fall back to the first entries with a thumbnail if links ever drift.
  const items =
    featured.length >= 4
      ? featured
      : list.filter((c) => c.thumbnail).slice(0, 6);

  const total = list.length;

  return (
    <motion.section
      className={`lp-section lp-featured ${isCompleted ? "notranslate" : ""}`}
      aria-labelledby="lp-featured-title"
      variants={container(reduceMotion)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="lp-section__head">
        <h2 id="lp-featured-title" className="lp-section__title">
          {t("Start exploring")}
        </h2>
        <Link className="lp-featured__all" href="/simulations">
          {t("See all")} {total}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
        </Link>
      </div>

      <ul className="lp-featured__grid">
        {items.map((sim) => {
          const level = LEVELS[sim.level];
          return (
            <motion.li
              key={sim.id}
              className="lp-featured__item"
              variants={card(reduceMotion)}
            >
              <Link className="lp-featured__card" href={sim.link}>
                <span className="lp-featured__thumb">
                  {sim.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sim.thumbnail} alt="" loading="lazy" />
                  ) : null}
                </span>
                <span className="lp-featured__body">
                  <span className="lp-featured__name">{t(sim.name)}</span>
                  {level ? (
                    <span className="lp-featured__level">{t(level.name)}</span>
                  ) : null}
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
