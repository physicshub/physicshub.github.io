// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAtom,
  faGraduationCap,
  faGaugeHigh,
  faBookOpen,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";
import useTranslation from "../hooks/useTranslation.ts";
import useCurriculum from "../hooks/useCurriculum.ts";
import { COLORS, DIFFICULTIES } from "../data/tags.js";
import {
  describePlacement,
  getPlacement,
  localizeTags,
} from "../data/curricula.js";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const { curriculumId } = useCurriculum();
  const isCompleted = meta?.completed || false;
  const isBlog = props.isABlog;
  // The card describes the item in the reader's own school system: its level
  // (from `level`/`alsoFor` on a simulation, `level` on a related article, the
  // level tag on an article) and the level tag shown among an article's tags.
  const placement = getPlacement(props, curriculumId);
  const tags = isBlog
    ? localizeTags(props.tags, props, curriculumId)
    : props.tags;
  const primaryTag = tags?.[0];
  const secondaryTag = tags?.[1];
  const primaryColor = COLORS[primaryTag?.color]?.primary || "#00e6e6";
  const secondaryColor = COLORS[secondaryTag?.color]?.secondary || "#7dd3fc";
  const level = placement?.stage;
  const levelColor = COLORS[level?.color]?.primary;
  const difficulty = DIFFICULTIES[props.difficulty] || DIFFICULTIES.core;

  const levelInfo = describePlacement(placement, t);

  return (
    <section
      id={props.id}
      className={`chapter-card ${isBlog ? "chapter-card--blog" : ""} ${
        props.detailed ? "chapter-card--detailed" : ""
      } ${isCompleted ? "notranslate" : ""}`}
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
        <span className="chapter-card-eyebrow">
          {t(primaryTag?.name || "Physics")}
        </span>

        <h2>{t(props.name)}</h2>

        <p>{t(props.desc)}</p>

        {(!isBlog || props.detailed) && (
          <div className="chapter-card-meta">
            {level && (
              <div
                className="chapter-card-metric chapter-card-metric--level"
                style={
                  levelColor
                    ? { "--chapter-level-accent": levelColor }
                    : undefined
                }
                title={levelInfo}
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                <span className="chapter-card-metric-label">
                  {t("School level")}
                </span>
                <span className="chapter-card-metric-value">
                  {t(level.name)}
                </span>
              </div>
            )}
            {(!isBlog || props.difficulty) && difficulty && (
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
            {props.readingTime > 0 && (
              <div className="chapter-card-metric">
                <FontAwesomeIcon icon={faClock} />
                <span className="chapter-card-metric-label">
                  {t("Read time")}
                </span>
                <span className="chapter-card-metric-value">
                  {props.readingTime} {t("min")}
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

        {isBlog &&
          (() => {
            // Blog entries carry a long tag array (topics + level + difficulty).
            // Showing all of them turns the card into confetti — cap the card to
            // the first few and roll the rest into a count.
            const MAX_TAGS = 4;
            const bodyTags = tags.slice(1);
            const shown = bodyTags.slice(0, MAX_TAGS);
            const overflow = bodyTags.length - shown.length;
            return (
              <div className="chapter-card-tags">
                {shown.map((tag, idx) => (
                  <Tag tag={tag} key={tag.id || idx} />
                ))}
                {overflow > 0 && (
                  <span className="chapter-card-tags-more">+{overflow}</span>
                )}
              </div>
            );
          })()}

        <Link href={isBlog ? `/blog/${props.slug}` : props.link}>
          {isBlog ? t("Go to blog") : t("Go to simulation")}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "10px" }} />
        </Link>
      </div>
    </section>
  );
}

export default Chapter;
