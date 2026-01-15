// app/components/ContributorsSectionSkeleton.tsx
import React from "react";
import clsx from "clsx";

type ContributorsSectionSkeletonProps = {
  title?: string;
  count?: number;
  className?: string;
};

function ContributorCardSkeleton({ index }: { index: number }) {
  const lineWidths = ["w-3/4", "w-2/3", "w-1/2", "w-5/6"];
  const width1 = lineWidths[index % lineWidths.length];
  const width2 = lineWidths[(index + 1) % lineWidths.length];

  return (
    <div
      className={clsx(
        "contributor-card-skeleton relative overflow-hidden rounded-lg p-4",
        "animate-fadeInUp"
      )}
      style={{ animationDelay: `${index * 0.15}s` }} // stagger effect
      role="status"
      aria-label="Loading contributor"
    >
      <div className="skeleton-avatar shimmer mb-3 animate-pulse-strong" />
      <div
        className={`skeleton-line shimmer mb-2 ${width1} animate-pulse-strong`}
      />
      <div className={`skeleton-line shimmer ${width2} animate-pulse-strong`} />
    </div>
  );
}

export default function ContributorsSectionSkeleton({
  title = "Project Contributors",
  count = 6,
  className,
}: ContributorsSectionSkeletonProps) {
  const placeholders = Array.from({ length: count }, (_, i) => i);

  return (
    <section
      id="contributors"
      className={clsx("contributors-section", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <h2 className="title">{title}</h2>
      <div className="contributors-grid animate-pulse">
        {placeholders.map((i) => (
          <ContributorCardSkeleton key={i} index={i} />
        ))}
      </div>
    </section>
  );
}
