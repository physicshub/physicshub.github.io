// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";

function Chapter(props) {
  return (
    <section id={props.id} className="chapter-card">
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
            ? `#${props.id} ${props.name}`
            : `Chapter ${props.id}: ${props.name}`}
          {props.icon && (
            <img
              src={props.icon}
              alt={`${props.name} icon`}
              width={24}
              height={24}
              className="chapter-icon"
            />
          )}
        </h2>

        {/* Description */}
        <p>{props.desc}</p>

        {/* Link */}
        <Link href={props.isABlog ? `/blog/${props.slug}` : props.link}>
          {props.isABlog ? "Go to blog" : "Go to simulation"}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "10px" }} />
        </Link>
      </div>
    </section>
  );
}

export default Chapter;
