// app/(core)/components/theory/elements/TheoryFAQ.tsx
//
// A visible question/answer list. Answers are NOT collapsed — the whole point is
// that a person scanning for one fact (and an AI answer engine looking for a
// quotable passage) find it immediately. The same `items` array is also read
// server-side by utils/blogSchema.ts to emit FAQPage JSON-LD, so markup and
// structured data can never drift.
import React, { useMemo } from "react";
import useTranslation from "../../../../../app/(core)/hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { EditableProps } from "../types.ts";
import { parseBoldText } from "../utils.tsx";

export interface FaqItem {
  q: string;
  a: string;
}

interface TheoryFAQProps extends EditableProps {
  title?: string;
  items: FaqItem[] | string | null;
}

/** Accept an array of {q,a}, or a JSON string of one (the editor round-trips
 *  every field as a string). Anything malformed collapses to an empty list. */
export const normalizeFaqItems = (
  raw: FaqItem[] | string | null | undefined
): FaqItem[] => {
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (it): it is Record<string, unknown> => !!it && typeof it === "object"
    )
    .map((it) => ({ q: String(it.q ?? ""), a: String(it.a ?? "") }));
};

export const TheoryFAQ: React.FC<TheoryFAQProps> = ({
  title,
  items: rawItems,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const items = useMemo(() => normalizeFaqItems(rawItems), [rawItems]);
  const heading = title || "Frequently asked questions";

  const isBlockEditable =
    isEditing &&
    onContentUpdate &&
    sectionIndex !== undefined &&
    blockIndex !== undefined;

  const commit = (next: FaqItem[]) => {
    if (!isBlockEditable) return;
    onContentUpdate(sectionIndex, blockIndex, "items", JSON.stringify(next));
  };

  const updateField = (index: number, field: keyof FaqItem, text: string) => {
    if (!isBlockEditable || items[index]?.[field] === text) return;
    const next = items.map((it, i) =>
      i === index ? { ...it, [field]: text } : it
    );
    commit(next);
  };

  return (
    <section
      className={`theory-faq ${isCompleted ? "notranslate" : ""}`}
      aria-label={t(heading)}
    >
      <h2
        className="faq-heading"
        contentEditable={isBlockEditable}
        suppressContentEditableWarning={isBlockEditable}
        onBlur={(e) => {
          if (isBlockEditable && e.currentTarget.innerText !== heading) {
            onContentUpdate(
              sectionIndex,
              blockIndex,
              "title",
              e.currentTarget.innerText
            );
          }
        }}
      >
        {isBlockEditable ? heading : t(heading)}
      </h2>

      {items.map((item, i) => (
        <div className="faq-item" key={i}>
          <h3
            className="faq-question"
            contentEditable={isBlockEditable}
            suppressContentEditableWarning={isBlockEditable}
            onBlur={(e) => updateField(i, "q", e.currentTarget.innerText)}
          >
            {isBlockEditable ? item.q : parseBoldText(t(item.q))}
          </h3>
          <div
            className="faq-answer"
            contentEditable={isBlockEditable}
            suppressContentEditableWarning={isBlockEditable}
            onBlur={(e) => updateField(i, "a", e.currentTarget.innerText)}
          >
            {isBlockEditable ? item.a : parseBoldText(t(item.a))}
          </div>
        </div>
      ))}

      {isBlockEditable && (
        <button
          type="button"
          onClick={() =>
            commit([
              ...items,
              {
                q: t("A new question?"),
                a: t("A short, self-contained answer."),
              },
            ])
          }
          className="ph-btn ph-btn--small add-item-btn"
        >
          <FontAwesomeIcon icon={faPlus} /> {t("Add Q&A")}
        </button>
      )}
    </section>
  );
};
