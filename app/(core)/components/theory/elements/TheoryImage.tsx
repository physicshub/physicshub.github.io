import React, { useState, useEffect } from "react";
import useTranslation from "../../../../../app/(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faUpload } from "@fortawesome/free-solid-svg-icons";
import { EditableProps } from "../types";

type ImageSize = "xsmall" | "small" | "medium" | "large" | "full";

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
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
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

  const fallbackSrc = "https://via.placeholder.com/800x400?text=Image";
  const imageSrc = currentSrc || fallbackSrc;

  const sourceHostname = (() => {
    if (!href) return "";
    try {
      return new URL(href).hostname;
    } catch {
      return href;
    }
  })();

  return (
    <figure
      className={`theory-image-container size-${size} ${isCompleted ? "notranslate" : ""}`}
    >
      {isEditing && (
        <div className="image-editor-toolbar">
          <input
            type="url"
            value={currentSrc}
            onChange={(e) => setCurrentSrc(e.target.value)}
            onBlur={() =>
              onContentUpdate?.(sectionIndex!, blockIndex!, "src", currentSrc)
            }
            placeholder={t("Image URL")}
            className="url-input"
          />
          <select
            value={size}
            onChange={handleSizeChange}
            className="size-select"
          >
            <option value="xsmall">{t("Extra Small")}</option>
            <option value="small">{t("Small")}</option>
            <option value="medium">{t("Medium")}</option>
            <option value="large">{t("Large")}</option>
            <option value="full">{t("Full")}</option>
          </select>
          <button className="upload-btn add-block-btn">
            <FontAwesomeIcon icon={faUpload} />
            <input type="file" accept="image/*" style={{ display: "none" }} />
          </button>
        </div>
      )}

      <div
        className={`image-wrapper ${!isEditing && href ? "is-link" : ""}`}
        onClick={handleImageClick}
      >
        {/* Blog articles use arbitrary external/redirecting sources, so render
            them directly instead of routing through next/image validation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={t(alt ?? "")}
          className={isEditing ? "editing-border" : ""}
          loading="lazy"
          decoding="async"
          onError={() => setCurrentSrc(fallbackSrc)}
        />

        {href && (
          <div className="copyright-badge">
            <FontAwesomeIcon icon={faCopyright} className="badge-icon" />
            <span className="badge-text">{sourceHostname}</span>
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
          {isEditing ? caption || t("Write a caption...") : t(caption ?? "")}
        </figcaption>
      )}
    </figure>
  );
};
