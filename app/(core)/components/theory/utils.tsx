// app/(core)/components/theory/utils.tsx
import React, { useCallback } from "react";
import { EditableProps } from "./types";

/**
 * Parse text to handle bold formatting with **text**
 */
export const parseBoldText = (text: string): React.ReactNode[] => {
  if (!text || typeof text !== "string") return [text];

  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^\*]+)\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[1];
    const content = match[2];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    parts.push(<strong key={matchIndex}>{content}</strong>);
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

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
