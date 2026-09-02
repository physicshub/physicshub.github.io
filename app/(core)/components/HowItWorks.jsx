"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import useTranslation from "../hooks/useTranslation.ts";

const container = (rm) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: rm ? 0.05 : 0.1 },
  },
});

const item = (rm) => ({
  hidden: { opacity: 0, y: rm ? 8 : 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: rm ? 0.4 : 0.5, ease: [0.22, 1, 0.36, 1] },
  },
});

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const steps = [
    {
      title: t("Pick a simulation"),
      body: t(
        "Choose from simulations spanning every school level, each tagged so you can match it to your curriculum."
      ),
    },
    {
      title: t("Change a variable"),
      body: t(
        "Drag a slider — mass, gravity, spring constant — and our own physics engine recomputes every force on every frame."
      ),
    },
    {
      title: t("See the math move"),
      body: t(
        "Velocity vectors, energy bars and trajectories respond instantly, so the equation finally means something."
      ),
    },
  ];

  return (
    <motion.section
      id="how-it-works"
      className={`lp-section lp-how ${isCompleted ? "notranslate" : ""}`}
      aria-labelledby="lp-how-title"
      variants={container(reduceMotion)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h2
        id="lp-how-title"
        className="lp-section__title"
        variants={item(reduceMotion)}
      >
        {t("Change something. Watch the physics answer.")}
      </motion.h2>

      <ol className="lp-how__steps">
        {steps.map((step, i) => (
          <motion.li
            key={i}
            className="lp-how__step"
            variants={item(reduceMotion)}
          >
            <span className="lp-how__num" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="lp-how__step-title">{step.title}</h3>
            <p className="lp-how__step-body">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </motion.section>
  );
}
