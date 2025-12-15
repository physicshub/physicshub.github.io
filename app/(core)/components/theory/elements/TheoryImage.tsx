// app/(core)/components/theory/TheoryImage.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { EditableProps } from '../types';

interface TheoryImageProps extends EditableProps {
    src: string;
    alt?: string;
    caption?: string;
}

export const TheoryImage: React.FC<TheoryImageProps> = ({
    src,
    alt = '',
    caption,
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex
}) => {
    const isEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
    const suppressWarning = isEditable;
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => { setCurrentSrc(src); }, [src]);

    const handleSrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSrc(e.target.value);
    };

    const handleSrcBlur = () => {
        if (isEditable && currentSrc !== src) {
            onContentUpdate(sectionIndex, blockIndex, 'src', currentSrc);
        }
    };

    const handleCaptionBlur = (e: React.FocusEvent<HTMLElement>) => {
        if (isEditable && e.target.innerText !== caption) {
            onContentUpdate(sectionIndex, blockIndex, 'caption', e.target.innerText);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            alert(`Simulating upload for file: ${file.name}. Actual implementation requires backend logic.`);
            // Backend integration needed here
        }
    };

    if (isEditing) {
        return (
            <figure className="theory-image image-editor-mode editable-block">
                <div className="image-controls">
                    <input
                        type="url"
                        value={currentSrc}
                        onChange={handleSrcChange}
                        onBlur={handleSrcBlur}
                        placeholder="Image URL (http://...)"
                        className="image-url-input"
                    />

                    <label htmlFor={`upload-${blockIndex}`} className="ph-btn ph-btn--small upload-label">
                        <FontAwesomeIcon icon={faPlus} /> Upload File
                        <input
                            id={`upload-${blockIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <img
                    src={currentSrc || "https://via.placeholder.com/200?text=No+Image"}
                    alt={alt}
                    style={{ maxWidth: '100%', height: 'auto', border: '2px dashed var(--color-border)' }}
                />

                {caption && (
                    <figcaption
                        contentEditable
                        suppressContentEditableWarning={suppressWarning}
                        onBlur={handleCaptionBlur}
                        className="editable-block"
                    >
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    return (
        <figure className="theory-image">
            <img src={src} alt={alt} />
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    );
};