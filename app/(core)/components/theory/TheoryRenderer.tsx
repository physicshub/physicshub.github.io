// app/(core)/components/theory/TheoryRenderer.tsx
"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faClone,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { slugify } from "../../../(core)/utils/blogHandling.ts";

import {
  TheoryRendererProps,
  BlockData,
  BlockControlsProps,
  OnContentUpdate,
} from "./types";
import { TheorySection, TheorySectionTitle } from "./BasicComponents";
import {
  TheoryParagraph,
  TheorySubheading,
  TheorySubtitle,
  TheoryNote,
} from "./BasicComponents";
import { TheoryList } from "./elements/TheoryList";
import { TheoryFormula } from "./elements/TheoryFormula";
import { TheoryCodeBlock } from "./elements/TheoryCodeBlock";
import { TheoryCallout } from "./elements/TheoryCallout";
import { TheoryExample, TheoryToggle } from "./elements/TheoryToggle";
import { TheoryTable } from "./elements/TheoryTable";
import { TheoryImage } from "./elements/TheoryImage";

// Block Editor Controls with Drag & Drop
const BlockEditorControls: React.FC<BlockControlsProps> = ({
  id,
  sectionIndex,
  blockIndex,
  onDeleteBlock,
  onDuplicateBlock,
  children,
  isEditing,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isEditing) {
    return <>{children}</>;
  }

  return (
    <div ref={setNodeRef} style={style} className="theory-block-wrapper">
      <div className="theory-block-controls">
        <div
          className="drag-handle"
          title="Drag to move"
          {...attributes}
          {...listeners}
        >
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        {onDuplicateBlock && (
          <button
            onClick={() => onDuplicateBlock(sectionIndex, blockIndex)}
            title="Duplicate Block"
            type="button"
          >
            <FontAwesomeIcon icon={faClone} />
          </button>
        )}
        {onDeleteBlock && (
          <button
            onClick={() => onDeleteBlock(sectionIndex, blockIndex)}
            title="Delete Block"
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      <div className="theory-block-content">{children}</div>
    </div>
  );
};

// Render Block Logic with proper null/undefined handling
const renderBlock = (
  block: BlockData,
  sectionIndex: number,
  blockIndex: number,
  isEditing: boolean,
  onContentUpdate: OnContentUpdate
) => {
  // Prepariamo l'id se il blocco è un titolo
  const blockId =
    block.type === "sectionTitle" ? slugify(block.text || "") : undefined;

  const commonProps = {
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex,
    id: blockId, // Passiamo l'id ai componenti base
  };

  switch (block.type) {
    case "sectionTitle":
      return (
        <TheorySectionTitle {...commonProps}>
          {block.text || ""}
        </TheorySectionTitle>
      );

    case "paragraph":
      return (
        <TheoryParagraph {...commonProps}>{block.text || ""}</TheoryParagraph>
      );

    case "subheading":
      return (
        <TheorySubheading {...commonProps}>{block.text || ""}</TheorySubheading>
      );

    case "subtitle":
      return (
        <TheorySubtitle {...commonProps} level={block.level || 1}>
          {block.text || ""}
        </TheorySubtitle>
      );

    case "note":
      return <TheoryNote {...commonProps}>{block.text || ""}</TheoryNote>;

    case "list":
      return (
        <TheoryList
          {...commonProps}
          items={block.items || []}
          ordered={block.ordered || false}
        />
      );

    case "formula":
      return (
        <TheoryFormula
          {...commonProps}
          latex={block.latex || ""}
          inline={block.inline || false}
        />
      );

    case "code":
      return (
        <TheoryCodeBlock
          {...commonProps}
          code={block.code || ""}
          language={block.language || ""}
        />
      );

    case "callout":
      return (
        <TheoryCallout
          {...commonProps}
          type={block.calloutType || "info"}
          title={block.title}
        >
          {block.text || ""}
        </TheoryCallout>
      );

    case "example":
      return (
        <TheoryExample {...commonProps} title={block.title}>
          {block.content || ""}
        </TheoryExample>
      );

    case "toggle":
      return (
        <TheoryToggle {...commonProps} title={block.title || "Details"}>
          {block.content || ""}
        </TheoryToggle>
      );

    case "table":
      return (
        <TheoryTable
          {...commonProps}
          columns={block.columns || []}
          data={block.data || []}
        />
      );

    case "image":
      return (
        <TheoryImage
          {...commonProps}
          src={block.src || ""}
          alt={block.alt}
          caption={block.caption}
          size={block.size}
          href={block.href}
        />
      );

    default:
      return (
        <TheoryParagraph {...commonProps}>
          Unknown block type: {block.type}
        </TheoryParagraph>
      );
  }
};

// Main Renderer
export const TheoryRenderer: React.FC<TheoryRendererProps> = ({
  theory,
  isEditing,
  onContentUpdate,
  onDeleteBlock,
  onDuplicateBlock,
  dndItems = [],
}) => {
  if (!theory || !theory.sections || !Array.isArray(theory.sections)) {
    return (
      <div className="error-message">Error: Invalid content structure.</div>
    );
  }

  return (
    <div className="theory-renderer">
      {theory.sections.map((section, i) => (
        <TheorySection
          key={i}
          id={section.title ? slugify(section.title) : undefined}
        >
          {section.blocks.map((block, j) => {
            const blockId = `s${i}-b${j}`;

            return (
              <BlockEditorControls
                key={blockId}
                id={blockId}
                sectionIndex={i}
                blockIndex={j}
                onDeleteBlock={onDeleteBlock}
                onDuplicateBlock={onDuplicateBlock}
                isEditing={isEditing}
              >
                {renderBlock(block, i, j, isEditing, onContentUpdate)}
              </BlockEditorControls>
            );
          })}
        </TheorySection>
      ))}
    </div>
  );
};

export default TheoryRenderer;
