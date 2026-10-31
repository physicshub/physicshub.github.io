"use client";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion, useReducedMotion } from "framer-motion";
import chapters from "../data/chapters.js";
import { getPlacement } from "../data/curricula.js";
import useTranslation from "../hooks/useTranslation.ts";
import useCurriculum from "../hooks/useCurriculum.ts";

const container = (rm) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: rm ? 0 : 0.06 } },
});

const card = (rm) => ({
  hidden: { opacity: 0, y: rm ? 0 : 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: rm ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] },
  },
});

// The first entry is the large lead tile; the rest are a deliberate spread
// across school levels. The double pendulum is left out because it already
// runs live in the hero.
const FEATURED_LINKS = [
  "/simulations/ThreeBody",
  "/simulations/BouncingBall",
  "/simulations/SimplePendulum",
  "/simulations/ParabolicMotion",
  "/simulations/BallGravity",
  "/simulations/CircularMotion",
];

export default function FeaturedSimulations() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();
  const { curriculumId } = useCurriculum();
  const isCompleted = meta?.completed || false;

  const list = Array.isArray(chapters) ? chapters : [];
  const featured = FEATURED_LINKS.map((link) =>
    list.find((c) => c.link === link)
  ).filter(Boolean);
  // The grid is shaped for exactly six tiles; fall back to the first six with
  // a thumbnail if the links ever drift.
  const items =
    featured.length === 6
      ? featured
      : list.filter((c) => c.thumbnail).slice(0, 6);

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
          {t("See all")} {list.length}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
        </Link>
      </div>

      <ul className="lp-featured__grid">
        {items.map((sim, i) => {
          const level = getPlacement(sim, curriculumId)?.stage;
          const lead = i === 0;
          return (
            <motion.li
              key={sim.id}
              className={`lp-featured__item${lead ? " lp-featured__item--lead" : ""}`}
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
                  {lead ? (
                    <span className="lp-featured__open">
                      {t("Open simulation")}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        style={{ marginLeft: 6 }}
                      />
                    </span>
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
