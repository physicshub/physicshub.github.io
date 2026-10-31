// app/(core)/components/theory/elements/TheoryTakeaways.tsx
//
// A short "what you'll learn / key points" list, meant to sit right after the
// intro paragraph of an article. Front-loads the answer for skimmers and gives
// AI answer engines a clean, quotable summary. Editing mirrors TheoryList.
import React, { useMemo } from "react";
import useTranslation from "../../../../../app/(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faListCheck } from "@fortawesome/free-solid-svg-icons";
import { EditableProps } from "../types.ts";
import { parseBoldText, normalizeItems } from "../utils.tsx";

interface TheoryTakeawaysProps extends EditableProps {
  title?: string;
  items: string[] | string | null;
}

export const TheoryTakeaways: React.FC<TheoryTakeawaysProps> = ({
  title,
  items: rawItems,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const items = useMemo(() => normalizeItems(rawItems), [rawItems]);
  const label = title || "Key takeaways";

  const isBlockEditable =
    isEditing &&
    onContentUpdate &&
    sectionIndex !== undefined &&
    blockIndex !== undefined;

  const commit = (newItems: string[]) => {
    if (!isBlockEditable) return;
    onContentUpdate(
      sectionIndex,
      blockIndex,
      "items",
      JSON.stringify(newItems)
    );
  };

  const handleItemBlur = (
    e: React.FocusEvent<HTMLLIElement>,
    index: number
  ) => {
    if (!isBlockEditable) return;
    const newText = e.target.innerText;
    if (newText !== items[index]) {
      const newItems = [...items];
      newItems[index] = newText;
      commit(newItems);
    }
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (!isBlockEditable) return;
    const next = e.target.innerText;
    if (next !== label) {
      onContentUpdate(sectionIndex, blockIndex, "title", next);
    }
  };

  return (
    <aside
      className={`theory-takeaways ${isCompleted ? "notranslate" : ""}`}
      role="note"
    >
      <p
        className="takeaways-label"
        contentEditable={isBlockEditable}
        suppressContentEditableWarning={isBlockEditable}
        onBlur={handleTitleBlur}
      >
        <FontAwesomeIcon icon={faListCheck} className="takeaways-label-icon" />{" "}
        {isBlockEditable ? label : t(label)}
      </p>
      <ul className="takeaways-list">
        {items.map((it, i) => (
          <li
            key={i}
            className={isBlockEditable ? "editable-block list-item-editor" : ""}
            contentEditable={isBlockEditable}
            suppressContentEditableWarning={isBlockEditable}
            onBlur={(e) => handleItemBlur(e, i)}
          >
            {isBlockEditable ? it : parseBoldText(t(it))}
          </li>
        ))}
      </ul>
      {isBlockEditable && (
        <button
          type="button"
          onClick={() => commit([...items, t("New takeaway")])}
          className="ph-btn ph-btn--small add-item-btn"
        >
          <FontAwesomeIcon icon={faPlus} /> {t("Add takeaway")}
        </button>
      )}
    </aside>
  );
};
