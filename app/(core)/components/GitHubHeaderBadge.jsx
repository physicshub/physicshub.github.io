"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { getGithubStatsFallback, loadGithubStats } from "../lib/githubStats.js";

const REPO_URL = "https://github.com/physicshub/physicshub.github.io";

const PLACEHOLDER_MESSAGES = [
  "Open source",
  "Built in public",
  "Star the repo",
];

export default function GitHubHeaderBadge({ mode }) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ stars: null, contributors: null });
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setMounted(true);

    const fallback = getGithubStatsFallback();
    setStats({
      stars: fallback.stars,
      contributors: fallback.contributors,
    });

    loadGithubStats().then((nextStats) => {
      if (cancelled) return;
      setStats({
        stars: nextStats.stars,
        contributors: nextStats.contributors,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const messages = useMemo(() => {
    if (!mounted) return PLACEHOLDER_MESSAGES;

    return [
      stats.stars != null ? `${stats.stars} stars` : "Open source",
      stats.contributors != null
        ? `${stats.contributors} contributors`
        : "Built in public",
      "Star the repo",
    ];
  }, [mounted, stats]);

  useEffect(() => {
    if (!mounted) return;

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [mounted, messages.length]);

  useEffect(() => {
    setMessageIndex(0);
  }, [messages]);

  return (
    <a
      className={`github-header-badge ${mode === "light" ? "github-header-badge--light" : "github-header-badge--dark"}`}
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open PhysicsHub on GitHub"
      title="Open PhysicsHub on GitHub"
    >
      <FontAwesomeIcon icon={faGithub} className="github-header-badge__icon" />
      <span className="github-header-badge__viewport" aria-hidden="true">
        <span
          className="github-header-badge__track"
          style={{ transform: `translateY(-${messageIndex * 1.15}rem)` }}
          suppressHydrationWarning
        >
          {messages.map((message, index) => (
            <span className="github-header-badge__label" key={index}>
              {message}
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}
