"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const REPO_URL = "https://github.com/physicshub/physicshub.github.io";
const REPO_API = "https://api.github.com/repos/physicshub/physicshub.github.io";
const CONTRIBUTORS_API = `${REPO_API}/contributors?per_page=100`;

export default function GitHubHeaderBadge({ mode }) {
  const [stats, setStats] = useState({ stars: null, contributors: null });
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [repoRes, contributorsRes] = await Promise.all([
          fetch(REPO_API),
          fetch(CONTRIBUTORS_API),
        ]);

        const repoData = await repoRes.json();
        const contributorsData = await contributorsRes.json();

        if (cancelled) return;

        setStats({
          stars:
            typeof repoData?.stargazers_count === "number"
              ? repoData.stargazers_count
              : null,
          contributors: Array.isArray(contributorsData)
            ? contributorsData.length
            : null,
        });
      } catch {
        if (!cancelled) {
          setStats({ stars: null, contributors: null });
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const messages = useMemo(
    () => [
      stats.stars != null ? `${stats.stars} stars` : "Open source",
      stats.contributors != null
        ? `${stats.contributors} contributors`
        : "Built in public",
      "Star the repo",
    ],
    [stats]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [messages.length]);

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
        >
          {messages.map((message) => (
            <span className="github-header-badge__label" key={message}>
              {message}
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}
