// app/components/ContributorsSectionSkeleton.tsx
"use client";
import React from "react";
import clsx from "clsx";
import useTranslation from "../hooks/useTranslation";
import useRepoStats from "../hooks/useRepoStats";

// Used when the header badge hasn't reported a contributor count yet
// (direct visit, first ever load).
export const FALLBACK_CONTRIBUTOR_COUNT = 12;

type ContributorsSectionSkeletonProps = {
  title?: string;
  count?: number;
  className?: string;
};

// Same markup and classes as a real contributor card, with the text swapped for
// bars that keep the line boxes — so a skeleton is exactly as tall as the card
// that replaces it and nothing moves when the data arrives.
export function ContributorCardSkeleton({ index }: { index: number }) {
  const nameWidths = ["6ch", "8ch", "5ch", "7ch"];

  return (
    <div
      className="contributor-card contributor-card--skeleton"
      style={{ animationDelay: `${(index % 8) * 0.12}s` }}
      role="status"
      aria-label="Loading contributor"
    >
      <div className="contributor-avatar contributor-skeleton__avatar" />
      <div className="contributor-info">
        <p className="contributor-name">
          <span
            className="contributor-skeleton__bar"
            style={{ width: nameWidths[index % nameWidths.length] }}
          >
            &nbsp;
          </span>
        </p>
        <p className="contributor-data">
          <span className="contributor-skeleton__bar" style={{ width: "9ch" }}>
            &nbsp;
          </span>
        </p>
      </div>
    </div>
  );
}

export function ContributorsGridSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <ContributorCardSkeleton key={i} index={i} />
      ))}
    </>
  );
}

export default function ContributorsSectionSkeleton({
  title,
  count,
  className,
}: ContributorsSectionSkeletonProps) {
  const { t, meta } = useTranslation();
  const { contributors } = useRepoStats();
  const isCompleted = meta?.completed || false;
  const total = count ?? contributors ?? FALLBACK_CONTRIBUTOR_COUNT;

  return (
    <section
      id="contributors"
      className={clsx(
        "contributors-section",
        isCompleted && "notranslate",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Same classes as the real heading so it is the same size. */}
      <h2 className="title text-2xl">
        {title ?? t("Project Contributors")} {`(${contributors ?? "-"})`}
      </h2>
      <div className="contributors-grid">
        <ContributorsGridSkeleton count={total} />
      </div>
    </section>
  );
}
