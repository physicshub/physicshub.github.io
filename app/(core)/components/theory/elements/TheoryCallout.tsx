import React from "react";
import useTranslation from "../../../../../app/(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faExclamationTriangle,
  faLightbulb,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { EditableProps, Children } from "../types";
import { parseBoldText } from "../utils";

interface TheoryCalloutProps extends EditableProps, Children {
  type?: "info" | "warning" | "tip" | "success";
  title?: string;
}

export const TheoryCallout: React.FC<TheoryCalloutProps> = ({
  type = "info",
  title,
  children,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const CALLOUT_CONFIG = {
    info: { icon: faInfoCircle, cls: "callout-info", label: t("Info") },
    warning: {
      icon: faExclamationTriangle,
      cls: "callout-warning",
      label: t("Warning"),
    },
    tip: { icon: faLightbulb, cls: "callout-tip", label: t("Tip") },
    success: { icon: faCheck, cls: "callout-success", label: t("Success") },
  };

  const cfg = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.info;
  const isEditable =
    isEditing &&
    onContentUpdate &&
    sectionIndex !== undefined &&
    blockIndex !== undefined;
  const suppressWarning = isEditable;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isEditable) {
      onContentUpdate(sectionIndex, blockIndex, "calloutType", e.target.value);
    }
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isEditable && e.target.innerText !== title) {
      onContentUpdate(sectionIndex, blockIndex, "title", e.target.innerText);
    }
  };

  const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isEditable) {
      onContentUpdate(sectionIndex, blockIndex, "text", e.target.innerText);
    }
  };

  const content = typeof children === "string" ? children : "";

  return (
    <div
      className={[
        "theory-callout",
        cfg.cls,
        isEditable ? "editable-block" : "",
        isCompleted ? "notranslate" : "",
      ].join(" ")}
      role="note"
    >
      <div className="callout-icon">
        <FontAwesomeIcon icon={cfg.icon} />
      </div>
      <div className="callout-body">
        <div className="callout-header-editor">
          {isEditable && (
            <select
              value={type}
              onChange={handleTypeChange}
              className="callout-type-selector"
            >
              {Object.keys(CALLOUT_CONFIG).map((tKey) => (
                <option key={tKey} value={tKey}>
                  {t(tKey).toUpperCase()}
                </option>
              ))}
            </select>
          )}
          {title && (
            <div
              className="callout-title"
              contentEditable={isEditable}
              suppressContentEditableWarning={suppressWarning}
              onBlur={handleTitleBlur}
            >
              {isEditable ? title : parseBoldText(t(title))}
            </div>
          )}
        </div>
        <div
          className="callout-content"
          contentEditable={isEditable}
          suppressContentEditableWarning={suppressWarning}
          onBlur={handleContentBlur}
        >
          {isEditable ? content : parseBoldText(t(content))}
        </div>
      </div>
    </div>
  );
};
