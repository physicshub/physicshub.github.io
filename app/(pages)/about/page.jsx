"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../../(core)/components/Button"; // Ensure path is correct for your project

// Define the shape of our stats state (JSDoc for editor hints)
/**
 * @typedef {{ stars: number|string, contributors: number|string }} GitHubStats
 */

// Updated principles to be more technical/specific
const buildPrinciples = [
  "Live controls & theory side-by-side",
  "Math-accurate physics engines",
  "Light/Dark mode native support",
  "Clean code structure for forking",
];

export default function About() {
  // Get the status from GitHub API
  // I set default values to ensure the page looks good before data loads
  const [ghStats, setGhStats] = useState({
    stars: "17+", // Fallback value
    contributors: "20+", // Fallback value
  });
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
      label: "Interactive Labs",
      value: "6+",
      helper: "Classical mechanics, waves, and thermodynamics.",
    },
    {
      label: "GitHub Stars",
      value: ghStats.stars,
      helper: "Trusted by the open-source community.",
    },
    {
      label: "Contributors",
      value: ghStats.contributors,
      helper: "Code committed by students & devs worldwide.",
    },
  ];

  return (
    <div className="page-container about-page">
      <section className="about-hero">
        <div className="about-hero__text">
          <p className="about-eyebrow">Open-source physics playground</p>
          <h1 className="title">
            Stop memorizing formulas. <br /> Start visualizing them.
          </h1>
          <p>
            <strong>PhysicsHub</strong> turns abstract equations into reactive
            simulations. We are an open-source sandbox where students pull
            levers, change variables, and immediately see how the math behaves.
          </p>
          <p>
            Beyond the labs, this is a <strong>collaborative space</strong>.
            Because we are open-source, you can inspect the code to see how
            gravity works, fork a repo to build your own experiment, or fix a
            bug in our optics engine.
          </p>
          <div className="about-cta">
            <Button link="/simulations" content="Explore simulations" />
            <Link className="about-secondary-link" href="/contribute">
              See how to contribute
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
          <h2>Why we built this</h2>
          <p>
            Most high-quality physics software is locked behind paywalls or
            stuck in old interfaces. PhysicsHub exists to deliver a modern,
            performant, and <strong>completely free</strong> library that
            belongs to the community, not a corporation.
          </p>
          <ul className="about-list">
            <li>
              <strong>Visuals over Formulas:</strong> We prioritize interactive
              canvases.
            </li>
            <li>
              <strong>Zero Paywalls:</strong> No subscriptions, no ads, just
              code.
            </li>
            <li>
              <strong>Community Driven:</strong> Built by the people who use it.
            </li>
          </ul>
        </article>

        <article className="about-panel">
          <h2>Built for accuracy</h2>
          <p>
            We don&apos;t just draw animations; we simulate the math. Every lab
            runs on a real-time physics engine to ensure that what you see on
            screen matches the reality of the equation.
          </p>
          <div className="about-chip-grid">
            {buildPrinciples.map((principle) => (
              <span className="about-chip" key={principle}>
                {principle}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="about-authors">
        <p>
          Project created and maintained by{" "}
          <a
            href="https://github.com/mattqdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@mattqdev</strong>
          </a>{" "}
          and the{" "}
          <a
            href="https://discord.gg/hT68DTcwfD"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>PhysicsHub community</strong>
          </a>
          .
        </p>
        <p>
          Discover more about us{" "}
          <a
            href="https://github.com/physicshub/physicshub.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            on GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
