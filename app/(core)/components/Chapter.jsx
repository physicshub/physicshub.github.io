// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faAtom } from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";
import useTranslation from "../hooks/useTranslation.ts";
import { COLORS } from "../data/tags.js";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const primaryTag = props.tags?.[0];
  const secondaryTag = props.tags?.[1];
  const primaryColor = COLORS[primaryTag?.color]?.primary || "#00e6e6";
  const secondaryColor = COLORS[secondaryTag?.color]?.secondary || "#7dd3fc";

  return (
    <section
      id={props.id}
      className={`chapter-card ${isCompleted ? "notranslate" : ""}`}
    >
      {/* Hero thumbnail */}
      <div
        className="chapter-card-hero"
        style={{
          "--chapter-accent": primaryColor,
          "--chapter-accent-2": secondaryColor,
        }}
      >
        <div className="chapter-card-hero-fallback">
          <div className="chapter-card-generated-orbit chapter-card-generated-orbit--outer" />
          <div className="chapter-card-generated-orbit chapter-card-generated-orbit--inner" />
          <FontAwesomeIcon
            icon={faAtom}
            className="chapter-card-generated-icon"
          />
          <div className="chapter-card-generated-topic">
            {t(primaryTag?.name || "Physics")}
          </div>
        </div>
        <div className="chapter-card-hero-glow" />

        {props.thumbnail ? (
          // Cards can use local or arbitrary external article images.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbnail}
            alt={`${t(props.name)} thumbnail`}
            className="chapter-card-hero-img"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div className="chapter-card-overlay">
        {/* Tags */}
        <div className="chapter-card-tags-container">
          {props.tags.map((tag, idx) => (
            <Tag tag={tag} key={tag.id || idx} />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl flex items-center gap-2">
          {props.isABlog
            ? `${t(props.name)}`
            : `${t("Chapter")} ${props.id}: ${t(props.name)}`}
        </h2>

        {/* Description */}
        <p>{t(props.desc)}</p>

        {/* Link */}
        <Link href={props.isABlog ? `/blog/${props.slug}` : props.link}>
          {props.isABlog ? t("Go to blog") : t("Go to simulation")}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "10px" }} />
        </Link>
      </div>
    </section>
  );
}

export default Chapter;
