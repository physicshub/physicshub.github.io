"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faUserSlash,
  faBan,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import { motion, useReducedMotion } from "framer-motion";
import chapters from "../data/chapters.js";
import useTranslation from "../hooks/useTranslation.ts";

export default function TrustStrip() {
  const reduceMotion = useReducedMotion();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const total = Array.isArray(chapters) ? chapters.length : 0;

  const points = [
    { icon: faCircleCheck, label: t("Free forever") },
    { icon: faUserSlash, label: t("No account") },
    { icon: faBan, label: t("No ads") },
    { icon: faCodeBranch, label: t("Open source") },
    { icon: faCircleCheck, label: `${total} ${t("simulations")}` },
  ];

  return (
    <motion.section
      className={`lp-section lp-trust ${isCompleted ? "notranslate" : ""}`}
      aria-label={t("Why PhysicsHub is safe to use in class")}
      initial={{ opacity: 0, y: reduceMotion ? 6 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: reduceMotion ? 0.3 : 0.5 }}
    >
      <ul className="lp-trust__list">
        {points.map((p, i) => (
          <li key={i} className="lp-trust__item">
            <FontAwesomeIcon icon={p.icon} aria-hidden="true" />
            <span>{p.label}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
