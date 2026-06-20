"use client";
import React, { useEffect, useState } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import {
  getGithubContributorsFallback,
  loadGithubContributors,
} from "../lib/githubStats.js";

const avatarFallback = (login) =>
  `https://github.com/identicons/${encodeURIComponent(login)}.png`;

export default function ContributorsSection() {
  const [contributors, setContributors] = useState([]);
  const [brokenAvatars, setBrokenAvatars] = useState({});
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  useEffect(() => {
    let cancelled = false;

    const fallback = getGithubContributorsFallback();
    if (fallback.length > 0) {
      setContributors(fallback);
    }

    loadGithubContributors().then((nextContributors) => {
      if (!cancelled && nextContributors.length > 0) {
        setContributors(nextContributors);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`contributors-section ${isCompleted ? "notranslate" : ""}`}
      id="contributors"
    >
      <h2 className="title text-2xl">
        {t("Project Contributors")}{" "}
        {`(${contributors.length ? contributors.length : "-"})`}
      </h2>
      <div className="contributors-grid">
        {contributors.map((c) => (
          <div key={c.id} className="contributor-card">
            <a href={c.html_url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  brokenAvatars[c.id] ? avatarFallback(c.login) : c.avatar_url
                }
                alt={c.login}
                className="contributor-avatar"
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                onError={() =>
                  setBrokenAvatars((current) =>
                    current[c.id] ? current : { ...current, [c.id]: true }
                  )
                }
              />
            </a>
            <div className="contributor-info">
              <p className="contributor-name" translate="no">
                {c.login}
              </p>
              <p className="contributor-data">
                {c.contributions}{" "}
                {c.contributions === 1 ? t("commit") : t("commits")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
