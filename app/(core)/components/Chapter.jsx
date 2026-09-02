// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAtom,
  faGraduationCap,
  faGaugeHigh,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";
import useTranslation from "../hooks/useTranslation.ts";
import { COLORS, LEVELS, DIFFICULTIES } from "../data/tags.js";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const isBlog = props.isABlog;
  const primaryTag = props.tags?.[0];
  const secondaryTag = props.tags?.[1];
  const primaryColor = COLORS[primaryTag?.color]?.primary || "#00e6e6";
  const secondaryColor = COLORS[secondaryTag?.color]?.secondary || "#7dd3fc";
  const level = LEVELS[props.level];
  const difficulty = DIFFICULTIES[props.difficulty] || DIFFICULTIES.core;

  const serial = !isBlog
    ? `${t("Chapter")} ${String(props.id).padStart(2, "0")}`
    : null;

  const levelInfo = level
    ? [
        t(level.age),
        ...(level.equivalents?.length ? level.equivalents : []),
        ...(props.alsoFor?.length
          ? [
              `${t("Also suitable for")}: ${props.alsoFor.map((id) => t(LEVELS[id].name)).join(", ")}`,
            ]
          : []),
      ].join(" · ")
    : "";

  return (
    <section
      id={props.id}
      className={`chapter-card ${isBlog ? "chapter-card--blog" : ""} ${
        isCompleted ? "notranslate" : ""
      }`}
    >
      {/* Stage */}
      <div
        className="chapter-card-stage"
        style={{
          "--chapter-accent": primaryColor,
          "--chapter-accent-2": secondaryColor,
        }}
      >
        {props.thumbnail ? (
          // Cards can use local or arbitrary external article images.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbnail}
            alt={`${t(props.name)} thumbnail`}
            className="chapter-card-stage-img"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="chapter-card-stage-fallback">
            <div className="chapter-card-generated-orbit chapter-card-generated-orbit--outer" />
            <div className="chapter-card-generated-orbit chapter-card-generated-orbit--inner" />
            <FontAwesomeIcon
              icon={faAtom}
              className="chapter-card-generated-icon"
            />
          </div>
        )}
        <div className="chapter-card-stage-grid" />
        <div className="chapter-card-stage-scan" />
        <div className="chapter-card-stage-glow" />
      </div>

      {/* Body */}
      <div className="chapter-card-body">
        {serial && (
          <span className="chapter-card-serial" aria-hidden="true">
            {serial}
          </span>
        )}

        <span className="chapter-card-eyebrow">
          {t(primaryTag?.name || "Physics")}
        </span>

        <h2>{t(props.name)}</h2>

        <p>{t(props.desc)}</p>

        {isBlog ? (
          <div className="chapter-card-tags">
            {props.tags.slice(1).map((tag, idx) => (
              <Tag tag={tag} key={tag.id || idx} />
            ))}
          </div>
        ) : (
          <div className="chapter-card-meta">
            {level && (
              <div className="chapter-card-metric" title={levelInfo}>
                <FontAwesomeIcon icon={faGraduationCap} />
                <span className="chapter-card-metric-label">
                  {t("School level")}
                </span>
                <span className="chapter-card-metric-value">
                  {t(level.name)}
                </span>
              </div>
            )}
            {difficulty && (
              <div className="chapter-card-metric">
                <FontAwesomeIcon icon={faGaugeHigh} />
                <span className="chapter-card-metric-label">
                  {t("Difficulty")}
                </span>
                <span className="chapter-card-metric-value">
                  {t(difficulty.name)}
                </span>
              </div>
            )}
            {props.relatedBlogSlug && (
              <div className="chapter-card-metric">
                <FontAwesomeIcon icon={faBookOpen} />
                <span className="chapter-card-metric-label">{t("Theory")}</span>
                <span className="chapter-card-metric-value">
                  {t("Available")}
                </span>
              </div>
            )}
          </div>
        )}

        <Link href={isBlog ? `/blog/${props.slug}` : props.link}>
          {isBlog ? t("Go to blog") : t("Go to simulation")}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "10px" }} />
        </Link>
      </div>
    </section>
  );
}

export default Chapter;
