"use client";

// The school-level strip under the breadcrumb. The server renders it with the
// international level (what search engines index); once the reader's
// curriculum is known it re-labels itself — "A-Level (KS5) · Year 12" instead
// of "High School". It is a single line at every width so swapping the text
// can never move the page (see "No layout shift on simulation pages").
import type { CSSProperties } from "react";
import useCurriculum, { type Stage } from "@/app/(core)/hooks/useCurriculum";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import { COLORS } from "@/app/(core)/data/tags";
import { getPlacement, describePlacement } from "@/app/(core)/data/curricula";

type Props = {
  chapter: { link: string; level?: string; alsoFor?: string[] };
  difficulty?: string;
};

export default function LevelBanner({ chapter, difficulty }: Props) {
  const { t } = useTranslation();
  const { curriculumId, curriculum } = useCurriculum();
  const placement = getPlacement(chapter, curriculumId);
  if (!placement) return null;

  const { grades } = placement;
  const stage = placement.stage as Stage;
  const alsoStages = placement.alsoStages as Stage[];
  const isIntl = curriculumId === "intl";

  const name = isIntl
    ? `${t(stage.name)} · ${t(stage.age)}`
    : `${t(stage.name)}${grades ? ` · ${grades}` : ""}`;
  const detail = isIntl
    ? (stage.equivalents ?? []).join(" · ")
    : [
        t(curriculum.name),
        t(stage.age),
        alsoStages.length
          ? `${t("Also suitable for")}: ${alsoStages
              .map((s) => t(s.name))
              .join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

  const accent =
    COLORS[stage.color as keyof typeof COLORS]?.primary || "#00e6e6";

  return (
    <div
      className="simulation-level-banner"
      style={{ "--level-accent": accent } as CSSProperties}
      title={describePlacement(placement, t)}
    >
      <span className="simulation-level-banner-name">{name}</span>
      <span className="simulation-level-banner-equiv">{detail}</span>
      {difficulty && (
        <span className="simulation-level-banner-difficulty">
          {t(difficulty)}
        </span>
      )}
    </div>
  );
}
