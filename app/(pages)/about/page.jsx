"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../../(core)/components/Button";
import useTranslation from "../../(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSliders,
  faSquareRootVariable,
  faMoon,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import chaptersData from "../../(core)/data/chapters.js";

// Define the shape of our stats state (JSDoc for editor hints)
/**
 * @typedef {{ stars: number|string, contributors: number|string }} GitHubStats
 */

export default function About() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  // Updated principles to be more technical/specific
  const buildPrinciples = [
    { icon: faSliders, text: t("Live controls & theory side-by-side") },
    { icon: faSquareRootVariable, text: t("Math-accurate physics engines") },
    { icon: faMoon, text: t("Light/Dark mode native support") },
    { icon: faCodeBranch, text: t("Clean code structure for forking") },
  ];
  // Get the status from GitHub API
  // I set default values to ensure the page looks good before data loads
  const [ghStats, setGhStats] = useState({
    stars: "-", // Fallback value
    contributors: "-", // Fallback value
  });

  // Compute chapters count
  const chaptersCount = Array.isArray(chaptersData)
    ? chaptersData.length
    : chaptersData && typeof chaptersData === "object"
      ? Object.keys(chaptersData).length
      : 0;

  // Fetch data from GitHub API on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const repoRes = await fetch(
          "https://api.github.com/repos/physicshub/physicshub.github.io"
        );
        const repoData = await repoRes.json();

        const contribRes = await fetch(
          "https://api.github.com/repos/physicshub/physicshub.github.io/contributors?per_page=100"
        );
        const contribData = await contribRes.json();

        if (repoData.stargazers_count) {
          setGhStats({
            stars: repoData.stargazers_count,
            contributors: Array.isArray(contribData)
              ? contribData.length
              : "20+",
          });
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      }
    };

    fetchStats();
  }, [setGhStats]);

  const stats = [
    {
      label: t("Interactive Simulations"),
      value: chaptersCount,
      helper: t("Hands-on experiments across physics topics."),
    },
    {
      label: t("GitHub Stars"),
      value: ghStats.stars,
      helper: t("Loved by the open-source community."),
    },
    {
      label: t("Contributors"),
      value: ghStats.contributors,
      helper: t("Students, devs and physics lovers worldwide."),
    },
  ];

  return (
    <div className={`about-page ${isCompleted ? "notranslate" : ""}`}>
      <section className="about-hero">
        <div className="about-hero__text">
          <p className="about-eyebrow">
            {t("PhysicsHub - Open-source physics playground")}
          </p>
          <h1 className="title text-2xl">
            {t("Stop memorizing formulas.")} <br />{" "}
            {t("Start visualizing them.")}
          </h1>
          <p>
            <strong>{t("PhysicsHub")}</strong>{" "}
            {t(
              "turns abstract equations into reactive simulations. We are an open-source sandbox where students pull levers, change variables, and immediately see how the math behaves."
            )}
          </p>
          <p>
            {t("Beyond the labs, this is a")}{" "}
            <strong>{t("collaborative space")}</strong>.
            {t(
              "Because we are open-source, you can inspect the code to see how gravity works, fork a repo to build your own experiment, or fix a bug in our optics engine."
            )}
          </p>
          <div className="about-cta">
            <Button link="/simulations" content={t("Explore simulations")} />
            <Link className="about-secondary-link" href="/contribute">
              {t("See how to contribute")}
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="about-stats-grid">
          {stats.map((stat) => (
            <div className="about-stat" key={stat.label}>
              <span className="about-stat__value">{stat.value}</span>
              <span className="about-stat__label">{stat.label}</span>
              <p>{stat.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-panels">
        <article className="about-panel">
          <h2 className="text-2xl">{t("Why we built this")}</h2>
          <p>
            {t(
              "Most high-quality physics software is locked behind paywalls or stuck in old interfaces. PhysicsHub exists to deliver a modern, performant, and"
            )}{" "}
            <strong>{t("completely free")}</strong>{" "}
            {t("library that belongs to the community, not a corporation.")}
          </p>
          <ul className="about-list">
            <li>
              <strong>{t("Visuals over Formulas:")}</strong>{" "}
              {t("We prioritize interactive canvases.")}
            </li>
            <li>
              <strong>{t("Zero Paywalls:")}</strong>{" "}
              {t("No subscriptions, no ads, just code.")}
            </li>
            <li>
              <strong>{t("Community Driven:")}</strong>{" "}
              {t("Built by the people who use it.")}
            </li>
          </ul>
        </article>

        <article className="about-panel">
          <h2 className="text-2xl">{t("Built for accuracy")}</h2>
          <p>
            {t(
              "We don't just draw animations; we simulate the math. Every lab runs on a real-time physics engine to ensure that what you see on screen matches the reality of the equation."
            )}
          </p>
          <div className="about-chip-grid">
            {buildPrinciples.map((principle) => (
              <span className="about-chip" key={principle.text}>
                <FontAwesomeIcon icon={principle.icon} /> {principle.text}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="about-authors">
        <p>
          {t("Project created and maintained by")}{" "}
          <a
            href="https://github.com/mattqdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@mattqdev</strong>
          </a>{" "}
          {t("and the")}{" "}
          <a
            href="https://discord.gg/hT68DTcwfD"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>{t("PhysicsHub community")}</strong>
          </a>
          .
        </p>
        <p>
          {t("Discover more about us")}{" "}
          <a
            href="https://github.com/physicshub/physicshub.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("on GitHub")}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
