// app/components/ContributorsSection.jsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import useTranslation from "../hooks/useTranslation.ts";
import useRepoStats from "../hooks/useRepoStats.ts";
import {
  ContributorsGridSkeleton,
  FALLBACK_CONTRIBUTOR_COUNT,
} from "./ContributorsSectionSkeleton.tsx";

export default function ContributorsSection() {
  const [contributors, setContributors] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // The header badge already fetched the head-count, so the title and the
  // placeholder grid can be sized before this list arrives.
  const { contributors: knownCount } = useRepoStats();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  useEffect(() => {
    async function getContributors(page = 1) {
      const res = await fetch(
        `https://api.github.com/repos/physicshub/physicshub.github.io/contributors?per_page=100&page=${page}`
      );
      return res.ok ? res.json() : [];
    }

    async function getAllContributors() {
      let all = [];
      let page = 1;
      let batch = [];

      do {
        batch = await getContributors(page);
        all = all.concat(batch);
        page++;
      } while (batch.length > 0);

      return all;
    }

    getAllContributors()
      .then(setContributors)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const total = contributors.length || knownCount;

  return (
    <div
      className={`contributors-section ${isCompleted ? "notranslate" : ""}`}
      id="contributors"
    >
      <h2 className="title text-2xl">
        {t("Project Contributors")} {`(${total ? total : "-"})`}
      </h2>
      <div className="contributors-grid">
        {!loaded && (
          <ContributorsGridSkeleton
            count={knownCount ?? FALLBACK_CONTRIBUTOR_COUNT}
          />
        )}
        {contributors.map((c) => (
          <div key={c.id} className="contributor-card">
            <a href={c.html_url} target="_blank" rel="noopener noreferrer">
              <Image
                src={c.avatar_url}
                alt={c.login}
                className="contributor-avatar"
                width={50}
                height={50}
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
