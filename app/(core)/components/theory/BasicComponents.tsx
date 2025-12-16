// app/(core)/components/theory/BasicComponents.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { EditableProps, Children } from './types';
import { EditableWrapper } from './EditableWrapper';

// TheorySection with deletable title
export const TheorySection: React.FC<{ 
    title?: string; 
    className?: string;
    onDeleteSectionTitle?: (sectionIndex: number) => void;
} & Children & EditableProps> = ({
    title,
    children,
    className,
    isEditing,
    onContentUpdate,
    onDeleteSectionTitle,
    sectionIndex
}) => {
    const isTitleEditable = isEditing && onContentUpdate && sectionIndex !== undefined;
    const suppressWarning = isTitleEditable;

    const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
        if (isTitleEditable && title !== e.target.innerText) {
            onContentUpdate(sectionIndex, -1, 'title', e.target.innerText);
        }
    };

    const handleDeleteTitle = () => {
        if (onDeleteSectionTitle && sectionIndex !== undefined) {
            onDeleteSectionTitle(sectionIndex);
        }
    };

    return (
        <section className={["theory-section", className].filter(Boolean).join(" ")}>
            {title && (
                <div className="section-title-wrapper">
                    <h2
                        className={`theory-title ${isTitleEditable ? 'editable-block' : ''}`}
                        contentEditable={isTitleEditable}
                        suppressContentEditableWarning={suppressWarning}
                        onBlur={handleTitleBlur}
                    >
                        {title}
                    </h2>
                    {isEditing && onDeleteSectionTitle && (
                        <button
                            type="button"
                            onClick={handleDeleteTitle}
                            className="delete-section-title-btn"
                            title="Delete section title"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
            )}
            <div className="theory-blocks">{children}</div>
        </section>
    );
};

// TheoryParagraph
export const TheoryParagraph: React.FC<Children & EditableProps> = ({ children, ...props }) => (
    <EditableWrapper as="p" className="theory-paragraph" {...props}>
        {children}
    </EditableWrapper>
);

// TheorySubheading
export const TheorySubheading: React.FC<Children & EditableProps> = ({ children, ...props }) => (
    <EditableWrapper as="h3" className="theory-subheading" {...props}>
        {children}
    </EditableWrapper>
);

// TheorySubtitle
export const TheorySubtitle: React.FC<{ level?: number } & Children & EditableProps> = ({
    level = 1,
    children,
    ...props
}) => {
    const sizes = [
        "text-lg font-semibold mt-2 mb-1",
        "text-base font-semibold mt-2 mb-1",
        "text-sm font-normal mt-1 mb-1"
    ];
    const style = sizes[level - 1] || sizes[2];
    return (
        <EditableWrapper as="h4" className={`theory-subtitle ${style}`} {...props}>
            {children}
        </EditableWrapper>
    );
};

// TheoryNote
export const TheoryNote: React.FC<Children & EditableProps> = ({ children, ...props }) => (
    <div className="theory-note">
        <EditableWrapper as="div" className="note-content" fieldToUpdate="text" {...props}>
            {children}
        </EditableWrapper>
    </div>
);