import React, { useState, useRef, useEffect } from "react";
import useTranslation from "../../../../../app/(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCheck,
  faCode,
  faEye,
  faSquareRootAlt,
} from "@fortawesome/free-solid-svg-icons";
import { BlockMath, InlineMath } from "react-katex";
import { EditableProps } from "../types";

interface TheoryFormulaProps extends EditableProps {
  latex: string;
  inline?: boolean;
}

export const TheoryFormula: React.FC<TheoryFormulaProps> = ({
  latex,
  inline,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  const [localViewMode, setLocalViewMode] = useState<"edit" | "preview">(
    isEditing ? "preview" : "edit"
  );
  const [currentLatex, setCurrentLatex] = useState(latex);

  useEffect(() => {
    setCurrentLatex(latex);
  }, [latex]);
  useEffect(() => {
    setLocalViewMode(isEditing ? "preview" : "edit");
  }, [isEditing]);

  const isBlockEditable =
    isEditing &&
    onContentUpdate &&
    sectionIndex !== undefined &&
    blockIndex !== undefined;

  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentLatex(e.target.value);
  };

  const handleLatexBlur = () => {
    if (isBlockEditable && currentLatex !== latex) {
      onContentUpdate(sectionIndex, blockIndex, "latex", currentLatex);
    }
  };

  const handleCopy = async () => {
    const textToCopy = isBlockEditable ? currentLatex : latex;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (liveRef.current) liveRef.current.textContent = t("Copied");
      setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = "";
      }, 1500);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  if (isEditing) {
    const mode = isBlockEditable ? localViewMode : "preview";

    return (
      <div
        className={`theory-formula ${isBlockEditable ? "editable-block" : ""} ${isCompleted ? "notranslate" : ""}`}
      >
        {isBlockEditable && (
          <div className="edit-switch-bar">
            <button
              type="button"
              onClick={() => setLocalViewMode("edit")}
              className={`switch-btn ${mode === "edit" ? "active" : ""}`}
            >
              <FontAwesomeIcon icon={faCode} /> {t("Edit")}
            </button>
            <button
              type="button"
              onClick={() => setLocalViewMode("preview")}
              className={`switch-btn ${mode === "preview" ? "active" : ""}`}
            >
              <FontAwesomeIcon icon={faEye} /> {t("Preview")}
            </button>
          </div>
        )}

        {mode === "edit" ? (
          <div className="latex-editor-area">
            <textarea
              value={currentLatex}
              onChange={handleLatexChange}
              onBlur={handleLatexBlur}
              className="latex-editor-input"
              rows={inline ? 1 : 5}
              placeholder={t("Insert LaTeX code here...")}
            />
          </div>
        ) : (
          <div className="preview-area formula-preview">
            {currentLatex ? (
              inline ? (
                <InlineMath math={currentLatex} />
              ) : (
                <BlockMath math={currentLatex} />
              )
            ) : (
              <div className="latex-placeholder">
                <FontAwesomeIcon icon={faSquareRootAlt} /> {t("Empty Formula")}
              </div>
            )}
          </div>
        )}
        <span
          aria-live="polite"
          className="visually-hidden"
          ref={liveRef}
        ></span>
      </div>
    );
  }

  return (
    <div className={`theory-formula ${isCompleted ? "notranslate" : ""}`}>
      <button
        className="copy-btn"
        onClick={handleCopy}
        aria-pressed={copied}
        aria-label={copied ? t("Copied") : t("Copy formula")}
        title={copied ? t("Copied!") : t("Copy formula")}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} color="white" />
      </button>
      {latex ? (
        inline ? (
          <InlineMath math={latex} />
        ) : (
          <BlockMath math={latex} />
        )
      ) : null}
      <span aria-live="polite" className="visually-hidden" ref={liveRef}></span>
    </div>
  );
};
