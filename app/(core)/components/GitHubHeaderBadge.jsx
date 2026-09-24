"use client";

import useTranslation from "../hooks/useTranslation.ts";
import useRepoStats from "../hooks/useRepoStats.ts";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const REPO_URL = "https://github.com/physicshub/physicshub.github.io";

// Height of one carousel label — must match --gh-badge-line in
// styles/components/github-header-badge.css.
const LINE_HEIGHT_REM = 1.15;
const ROTATE_INTERVAL_MS = 2600;

export default function GitHubHeaderBadge({ mode }) {
  const stats = useRepoStats();
  const [messageIndex, setMessageIndex] = useState(0);
  const { t } = useTranslation();

  const messages = useMemo(
    () => [
      stats.stars != null ? `${stats.stars} ${t("stars")}` : t("Open source"),
      stats.contributors != null
        ? `${stats.contributors} ${t("contributors")}`
        : t("Built in public"),
      t("Star the repo"),
    ],
    [stats, t]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, ROTATE_INTERVAL_MS);

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
          style={{
            transform: `translateY(-${messageIndex * LINE_HEIGHT_REM}rem)`,
          }}
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
