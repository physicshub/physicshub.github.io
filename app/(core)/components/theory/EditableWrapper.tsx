// app/(core)/components/theory/EditableWrapper.tsx
import React from "react";
import { EditableProps, Children, ElementTag } from "./types";
import { parseBoldText, useEditableBlock } from "./utils";

interface EditableWrapperProps extends EditableProps, Children {
  as: ElementTag;
  className: string;
  id?: string;
}

export const EditableWrapper: React.FC<EditableWrapperProps> = ({
  children,
  as,
  className,
  id,
  fieldToUpdate = "text",
  ...props
}) => {
  const Tag = as as React.ElementType;
  const initialContent = typeof children === "string" ? children : "";
  const { isEditable, handleEditEnd } = useEditableBlock(
    { ...props, fieldToUpdate },
    initialContent
  );

  const suppressWarning = !!(
    isEditable &&
    props.onContentUpdate &&
    props.sectionIndex !== undefined &&
    props.blockIndex !== undefined
  );

  if (isEditable) {
    return (
      <Tag
        id={id}
        className={`${className} editable-block`}
        contentEditable="true"
        suppressContentEditableWarning={suppressWarning}
        onBlur={handleEditEnd}
      >
        {initialContent}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className}>
      {parseBoldText(initialContent)}
    </Tag>
  );
};
