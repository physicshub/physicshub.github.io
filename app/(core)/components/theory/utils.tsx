// app/(core)/components/theory/utils.tsx
import React, { useCallback } from "react";
import { InlineMath } from "react-katex";
import { EditableProps } from "./types";

/**
 * Render a run of prose text into React nodes, resolving the lightweight
 * inline syntax the articles are authored in:
 *
 *   $x = vt$          → KaTeX inline math   (the common one — physics prose is
 *                       dense with it, and unrendered `$...$` was the single
 *                       biggest readability problem on the blog)
 *   **text**          → <strong>
 *   `code`            → <code class="theory-inline-code">
 *   [label](https://) → <a class="theory-inline-link">
 *
 * Math is matched first so a `$...$` span is never chewed up by the `**` or
 * backtick rules. `**bold**` is parsed recursively so emphasis can still wrap
 * math or code.
 */
export const parseInlineText = (text: string): React.ReactNode[] => {
  if (!text || typeof text !== "string") return [text];

  // Constructed per call: the `g` flag carries lastIndex state, and this
  // function recurses into bold spans.
  const token =
    /\$([^$]+?)\$|`([^`]+?)`|\[([^\]]+?)\]\(([^)\s]+?)\)|\*\*([^*]+?)\*\*/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = token.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, mathBody, codeBody, linkLabel, linkHref, boldBody] = match;

    if (mathBody !== undefined) {
      nodes.push(<InlineMath key={key++} math={mathBody.trim()} />);
    } else if (codeBody !== undefined) {
      nodes.push(
        <code key={key++} className="theory-inline-code">
          {codeBody}
        </code>
      );
    } else if (linkLabel !== undefined) {
      const external = /^https?:\/\//.test(linkHref);
      nodes.push(
        <a
          key={key++}
          className="theory-inline-link"
          href={linkHref}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {linkLabel}
        </a>
      );
    } else if (boldBody !== undefined) {
      nodes.push(<strong key={key++}>{parseInlineText(boldBody)}</strong>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
};

/**
 * Back-compat alias. The renderer historically only handled `**bold**`, so the
 * name stuck; the implementation now covers the full inline set above.
 */
export const parseBoldText = parseInlineText;

/**
 * Hook for common editable block logic
 */
export const useEditableBlock = (
  props: EditableProps,
  initialContent: string
) => {
  const {
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex,
    fieldToUpdate,
  } = props;

  const handleEditEnd = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (
        !isEditing ||
        !onContentUpdate ||
        sectionIndex === undefined ||
        blockIndex === undefined ||
        !fieldToUpdate
      )
        return;

      const newValue = e.target.innerText || e.target.textContent || "";

      if (newValue !== initialContent) {
        onContentUpdate(sectionIndex, blockIndex, fieldToUpdate, newValue);
      }
    },
    [
      isEditing,
      onContentUpdate,
      sectionIndex,
      blockIndex,
      fieldToUpdate,
      initialContent,
    ]
  );

  return {
    isEditable:
      isEditing &&
      onContentUpdate !== undefined &&
      sectionIndex !== undefined &&
      blockIndex !== undefined,
    handleEditEnd,
  };
};

/**
 * Normalize items to array format
 */
export const normalizeItems = (
  rawItems: string[] | string | null
): string[] => {
  if (Array.isArray(rawItems)) {
    return rawItems;
  }
  if (typeof rawItems === "string") {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed) ? parsed : [rawItems];
    } catch {
      return [rawItems];
    }
  }
  return [];
};
