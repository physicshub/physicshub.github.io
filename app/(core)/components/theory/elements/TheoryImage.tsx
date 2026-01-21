import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopyright } from "@fortawesome/free-solid-svg-icons";
import { EditableProps } from "../types";

type ImageSize = "small" | "medium" | "large" | "full";

interface TheoryImageProps extends EditableProps {
  src: string;
  alt?: string;
  caption?: string;
  size?: ImageSize;
  href?: string;
}

export const TheoryImage: React.FC<TheoryImageProps> = ({
  src,
  alt = "",
  caption,
  size = "medium",
  href,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onContentUpdate?.(sectionIndex!, blockIndex!, "size", e.target.value);
  };

  const handleImageClick = () => {
    if (!isEditing && href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <figure className={`theory-image-container size-${size}`}>
      {isEditing && (
        <div className="image-editor-toolbar">
          <input
            type="url"
            value={currentSrc}
            onChange={(e) => setCurrentSrc(e.target.value)}
            onBlur={() =>
              onContentUpdate?.(sectionIndex!, blockIndex!, "src", currentSrc)
            }
            placeholder="Image URL"
            className="url-input"
          />
          <select
            value={size}
            onChange={handleSizeChange}
            className="size-select"
          >
            <option value="small">Piccola</option>
            <option value="medium">Media</option>
            <option value="large">Grande</option>
            <option value="full">Intera</option>
          </select>
          <label className="upload-button">
            <FontAwesomeIcon icon={faPlus} />
            <input type="file" accept="image/*" style={{ display: "none" }} />
          </label>
        </div>
      )}

      <div
        className={`image-wrapper ${!isEditing && href ? "is-link" : ""}`}
        onClick={handleImageClick}
      >
        <img
          src={
            currentSrc || "https://via.placeholder.com/800x400?text=No+Image"
          }
          alt={alt}
          className={isEditing ? "editing-border" : ""}
        />

        {href && (
          <div className="copyright-badge">
            <FontAwesomeIcon icon={faCopyright} className="badge-icon" />
            <span className="badge-text">{new URL(href).hostname}</span>
          </div>
        )}
      </div>

      {(caption || isEditing) && (
        <figcaption
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          onBlur={(e) =>
            onContentUpdate?.(
              sectionIndex!,
              blockIndex!,
              "caption",
              e.currentTarget.innerText
            )
          }
          className="image-caption"
        >
          {caption || (isEditing ? "Scrivi una didascalia..." : "")}
        </figcaption>
      )}
    </figure>
  );
};
