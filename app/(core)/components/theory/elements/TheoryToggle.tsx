// app/(core)/components/theory/ExampleToggle.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { EditableProps, Children } from '../types.ts';
import { parseBoldText } from '../utils.tsx';

// TheoryExample
interface TheoryExampleProps extends EditableProps, Children {
    title?: string;
}

export const TheoryExample: React.FC<TheoryExampleProps> = ({
    title,
    children,
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex
}) => {
    const isEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
    const suppressWarning = isEditable;
    const content = typeof children === 'string' ? children : '';

    const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (isEditable && e.target.innerText !== title) {
            onContentUpdate(sectionIndex, blockIndex, 'title', e.target.innerText);
        }
    };

    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (isEditable) {
            onContentUpdate(sectionIndex, blockIndex, 'content', e.target.innerText);
        }
    };

    return (
        <div className={["theory-example", isEditable ? 'editable-block' : ''].join(' ')}>
            {title && (
                <div
                    className="example-title"
                    contentEditable={isEditable}
                    suppressContentEditableWarning={suppressWarning}
                    onBlur={handleTitleBlur}
                >
                    {title}
                </div>
            )}
            <div
                className="example-body"
                contentEditable={isEditable}
                suppressContentEditableWarning={suppressWarning}
                onBlur={handleContentBlur}
            >
                {isEditable ? content : parseBoldText(content)}
            </div>
        </div>
    );
};

// TheoryToggle
interface TheoryToggleProps extends EditableProps, Children {
    title?: string;
}

export const TheoryToggle: React.FC<TheoryToggleProps> = ({
    title = 'Details',
    children,
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex
}) => {
    const [open, setOpen] = useState(false);
    const isEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
    const suppressWarning = isEditable;
    const content = typeof children === 'string' ? children : '';

    const handleTitleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
        if (isEditable && e.target.innerText !== title) {
            onContentUpdate(sectionIndex, blockIndex, 'title', e.target.innerText);
        }
    };

    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (isEditable) {
            onContentUpdate(sectionIndex, blockIndex, 'content', e.target.innerText);
        }
    };

    return (
        <div className={["theory-toggle", open ? 'open' : '', isEditable ? 'editable-block' : ''].join(' ')}>
            <button
                className="toggle-btn"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                type="button"
            >
                <span
                    className="toggle-title"
                    contentEditable={isEditable}
                    suppressContentEditableWarning={suppressWarning}
                    onBlur={handleTitleBlur}
                    onClick={(e) => isEditable && e.stopPropagation()}
                >
                    {title}
                </span>
                <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
            </button>
            <div
                className="toggle-panel"
                style={{ maxHeight: open ? '1000px' : 0 }}
                aria-hidden={!open}
                contentEditable={isEditable}
                suppressContentEditableWarning={suppressWarning}
                onBlur={handleContentBlur}
            >
                {isEditable ? content : parseBoldText(content)}
            </div>
        </div>
    );
};