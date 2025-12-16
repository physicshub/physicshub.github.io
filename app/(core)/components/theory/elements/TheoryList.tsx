// app/(core)/components/theory/TheoryList.tsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { EditableProps } from '../types.ts';
import { parseBoldText, normalizeItems } from '../utils.tsx';

interface TheoryListProps extends EditableProps {
    items: string[] | string | null;
    ordered?: boolean;
}

export const TheoryList: React.FC<TheoryListProps> = ({
    items: rawItems,
    ordered = false,
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex
}) => {
    const items = useMemo(() => normalizeItems(rawItems), [rawItems]);
    const isBlockEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
    const suppressWarning = isBlockEditable;

    const handleItemBlur = (e: React.FocusEvent<HTMLLIElement>, index: number) => {
        if (!isBlockEditable) return;

        const newText = e.target.innerText;
        if (newText !== items[index]) {
            const newItems = [...items];
            newItems[index] = newText;
            onContentUpdate(sectionIndex, blockIndex, 'items', JSON.stringify(newItems));
        }
    };

    const handleAddItem = () => {
        if (!isBlockEditable) return;
        const newItems = [...items, "New Item"];
        onContentUpdate(sectionIndex, blockIndex, 'items', JSON.stringify(newItems));
    };

    const ListTag = ordered ? 'ol' : 'ul';

    return (
        <div className="theory-list-container">
            <ListTag className="theory-list">
                {items.map((it, i) => (
                    <li
                        key={i}
                        className={isBlockEditable ? 'editable-block list-item-editor' : ''}
                        contentEditable={isBlockEditable}
                        suppressContentEditableWarning={suppressWarning}
                        onBlur={(e) => handleItemBlur(e, i)}
                    >
                        {isBlockEditable ? it : parseBoldText(it)}
                    </li>
                ))}
            </ListTag>
            {isBlockEditable && (
                <button type="button" onClick={handleAddItem} className="ph-btn ph-btn--small add-item-btn">
                    <FontAwesomeIcon icon={faPlus} /> Add Item
                </button>
            )}
        </div>
    );
};