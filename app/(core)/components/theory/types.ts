// app/(core)/components/theory/types.ts
import * as React from "react";

// Element tag type for HTML elements
export type ElementTag = keyof React.JSX.IntrinsicElements;

export interface EditableProps {
  isEditing?: boolean;
  onContentUpdate?: (
    sectionIndex: number,
    blockIndex: number,
    field: string,
    newValue: string
  ) => void;
  sectionIndex?: number;
  blockIndex?: number;
  fieldToUpdate?: string;
}

export interface Children {
  children?: React.ReactNode;
}

export type ImageSize = "small" | "medium" | "large" | "full";

export interface BlockData {
  type: string;
  text?: string;
  level?: number;
  items?: string[] | string;
  ordered?: boolean;
  latex?: string;
  inline?: boolean;
  code?: string;
  language?: string;
  calloutType?: "info" | "warning" | "tip" | "success";
  title?: string;
  content?: string;
  columns?: string[];
  data?: Array<Record<string, unknown>>;
  src?: string;
  alt?: string;
  caption?: string;
  size?: ImageSize;
  href?: string;
  [key: string]: unknown;
}

export interface SectionData {
  title?: string;
  blocks: BlockData[];
}

export interface BlogContent {
  title: string;
  sections: SectionData[];
}

export type OnContentUpdate = (
  sectionIndex: number,
  blockIndex: number,
  field: string,
  newValue: string
) => void;
export type OnDeleteBlock = (sectionIndex: number, blockIndex: number) => void;
export type OnDuplicateBlock = (
  sectionIndex: number,
  blockIndex: number
) => void;
export type OnDeleteSectionTitle = (sectionIndex: number) => void;
export type OnDropBlock = (
  dragIndex: number,
  dropIndex: number,
  dragSection: number,
  dropSection: number
) => void;

export interface BlockControlsProps {
  id: string;
  sectionIndex: number;
  blockIndex: number;
  onDeleteBlock?: OnDeleteBlock;
  onDuplicateBlock?: OnDuplicateBlock;
  children: React.ReactNode;
  isEditing: boolean;
}

export interface TheoryRendererProps {
  theory: BlogContent;
  isEditing: boolean;
  onContentUpdate: OnContentUpdate;
  onDeleteBlock?: OnDeleteBlock;
  onDuplicateBlock?: OnDuplicateBlock;
  onDeleteSectionTitle?: OnDeleteSectionTitle;
  dndItems?: string[];
}
