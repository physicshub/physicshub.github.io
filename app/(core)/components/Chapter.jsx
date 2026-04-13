// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";
import Image from "next/image";
import useTranslation from "../hooks/useTranslation.ts";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  return (
    <section
      id={props.id}
      className={`chapter-card ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="chapter-card-overlay">
        {/* Tags */}
        <div className="chapter-card-tags-container">
          {props.tags.map((tag, idx) => (
            <Tag tag={tag} key={tag.id || idx} />
          ))}
        </div>

        {/* Title with optional icon */}
        <h2 className="text-2xl flex items-center gap-2">
          {props.isABlog
            ? `${t(props.name)}`
            : `${t("Chapter")} ${props.id}: ${t(props.name)}`}
          {props.icon && (
            <Image
              src={props.icon}
              alt={`${t(props.name)} ${t("icon")}`}
              width={24}
              height={24}
              className="chapter-icon"
            />
          )}
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
