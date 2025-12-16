// app/(core)/components/theory/BasicComponents.tsx
import React from 'react';
import { EditableProps, Children } from './types';
import { EditableWrapper } from './EditableWrapper';

// TheorySection - Now just a container without editable title
export const TheorySection: React.FC<{ 
    title?: string; 
    className?: string;
} & Children & EditableProps> = ({
    title,
    children,
    className,
}) => {
    return (
        <section className={["theory-section", className].filter(Boolean).join(" ")}>
            <div className="theory-blocks">{children}</div>
        </section>
    );
};

// NEW: TheorySectionTitle - Treated as a regular block
export const TheorySectionTitle: React.FC<Children & EditableProps> = ({ children, ...props }) => (
    <EditableWrapper as="h2" className="theory-section-title" {...props}>
        {children}
    </EditableWrapper>
);

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