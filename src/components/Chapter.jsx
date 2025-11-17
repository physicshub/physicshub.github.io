// src/components/Chapter.jsx
import { forwardRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import Tag from "./tag.jsx";

const Chapter = forwardRef(({ id, name, desc, link, tags = [], className = "", style = {} }, ref) => {
  return (
    <section
      id={id}
      className={`chapter-card ${className}`}
      style={style} // allow inline styles for peek preview
      ref={ref}     // forward the ref to the actual DOM element
    >
      <div className="chapter-card-overlay">
        <div className="chapter-card-tags-container">
          {tags.map((tag, idx) => (
            <Tag level={tag} key={tag.id || idx} />
          ))}
        </div>

        <h2>Chapter {id}: {name}</h2>
        <p>{desc}</p>

        <Link to={link}>
          Go to simulation
          <FontAwesomeIcon
            icon={faArrowRight}
            style={{ marginLeft: '10px' }}
          />
        </Link>
      </div>
    </section>
  );
});

export default Chapter;
