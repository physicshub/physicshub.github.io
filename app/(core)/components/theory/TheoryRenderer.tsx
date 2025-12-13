// app/(core)/components/theory/TheoryRenderer.tsx
import React, { DragEvent, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClone, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';

// Importa tutti i componenti di Typo.tsx e gli elementi del JSON
import {
    TheorySection,
    TheoryParagraph,
    TheorySubheading,
    TheorySubtitle,
    TheoryNote,
    TheoryList,
    TheoryFormula,
    TheoryCodeBlock,
    TheoryCallout,
    TheoryExample,
    TheoryToggle,
    TheoryTable,
    TheoryImage
} from './Typo';


// ----------------------------------------------------
// 1. Interfacce
// ----------------------------------------------------

interface BlockData {
    type: string;
    // Tipizzazione generica per i campi specifici del blocco
    [key: string]: any; 
}

interface SectionData {
    title?: string;
    blocks: BlockData[];
}

interface JsonContent {
    title?: string;
    sections: SectionData[];
}

// Tipo per gli argomenti della funzione onContentUpdate
type OnContentUpdate = (sectionIndex: number, blockIndex: number, field: string, newValue: string) => void;
type OnDeleteBlock = (sectionIndex: number, blockIndex: number) => void;
type OnDuplicateBlock = (sectionIndex: number, blockIndex: number) => void;
type OnDropBlock = (dragIndex: number, dropIndex: number, dragSection: number, dropSection: number) => void;


// Interfaccia per BlockEditorControls (Correzione 7031)
interface BlockControlsProps {
    id: string;
    sectionIndex: number;
    blockIndex: number;
    onDeleteBlock: OnDeleteBlock;
    onDuplicateBlock: OnDuplicateBlock;
    children: React.ReactNode;
    isEditing: boolean;
}


// ----------------------------------------------------
// 2. Componente BlockEditorControls
// ----------------------------------------------------
const BlockEditorControls: React.FC<BlockControlsProps> = ({ 
    id, 
    sectionIndex, 
    blockIndex, 
    onDeleteBlock, 
    onDuplicateBlock,
    children, 
    isEditing // Usato per mostrare/nascondere i controlli
}) => {
    
    if (!isEditing) {
        return <>{children}</>;
    }

    // Qui andrebbe la logica completa di Drag&Drop
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ sectionIndex, blockIndex }));
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
    };

    return (
        <div 
            id={id}
            data-section-index={sectionIndex}
            data-block-index={blockIndex}
            draggable 
            onDragStart={handleDragStart}
            className="theory-block-wrapper"
        >
            <div className="theory-block-controls">
                <div className="drag-handle" title="Drag to move">
                    <FontAwesomeIcon icon={faArrowsAlt} />
                </div>
                <button 
                    onClick={() => onDuplicateBlock(sectionIndex, blockIndex)}
                    title="Duplicate Block"
                >
                    <FontAwesomeIcon icon={faClone} />
                </button>
                <button 
                    onClick={() => onDeleteBlock(sectionIndex, blockIndex)}
                    title="Delete Block"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="theory-block-content">
                {children}
            </div>
        </div>
    );
};


// ----------------------------------------------------
// 3. TheoryRenderer
// ----------------------------------------------------
interface TheoryRendererProps {
    jsonContent: string;
    isEditing: boolean;
    onContentUpdate: OnContentUpdate;
    onDeleteBlock: OnDeleteBlock;
    onDuplicateBlock: OnDuplicateBlock;
    onDropBlock: OnDropBlock;
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
}

export const TheoryRenderer: React.FC<TheoryRendererProps> = ({
    jsonContent,
    isEditing,
    onContentUpdate,
    onDeleteBlock,
    onDuplicateBlock,
    onDropBlock,
    onDragStart,
    onDragEnd
}) => {
    let data: JsonContent;
    try {
        data = JSON.parse(jsonContent);
    } catch (e) {
        console.error("Failed to parse JSON content:", e);
        return <div className="error-message">Error: Invalid JSON content.</div>;
    }

    // Funzioni Drag&Drop con tipizzazione corretta (Correzione 7006)
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessario per permettere il drop
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const transferData = e.dataTransfer.getData("text/plain");
        
        try {
            const dragInfo = JSON.parse(transferData);
            const dropTarget = e.currentTarget.closest('[data-block-type="drop-zone"]');
            
            if (!dropTarget) return;

            const dragSection = dragInfo.sectionIndex;
            const dragBlock = dragInfo.blockIndex;
            const dropSection = Number(dropTarget.getAttribute('data-section-index'));
            const dropBlock = Number(dropTarget.getAttribute('data-block-index'));

            if (dragSection !== undefined && dragBlock !== undefined && dropSection !== undefined && dropBlock !== undefined) {
                onDropBlock(dragBlock, dropBlock, dragSection, dropSection);
            }
        } catch (error) {
            console.error("Error processing drop event:", error);
        }
    };


    // Renderer Logico
    const renderBlock = (block: BlockData, sectionIndex: number, blockIndex: number, isEditing: boolean) => {
        const commonProps = { isEditing, onContentUpdate, sectionIndex, blockIndex };

        switch (block.type) {
            case 'paragraph':
                return <TheoryParagraph {...commonProps}>{block.text}</TheoryParagraph>;
            case 'subheading':
                return <TheorySubheading {...commonProps}>{block.text}</TheorySubheading>;
            case 'subtitle':
                return <TheorySubtitle {...commonProps} level={block.level}>{block.text}</TheorySubtitle>;
            case 'note':
                return <TheoryNote {...commonProps}>{block.text}</TheoryNote>;
            case 'list':
                // Nota: items è gestito in Typo.tsx per assicurare che sia un array
                return <TheoryList {...commonProps} items={block.items} ordered={block.ordered} />;
            case 'formula':
                return <TheoryFormula {...commonProps} latex={block.latex} inline={block.inline} />;
            case 'code':
                return <TheoryCodeBlock {...commonProps} code={block.code} language={block.language} />;
            case 'callout':
                return <TheoryCallout {...commonProps} type={block.calloutType} title={block.title}>{block.text}</TheoryCallout>;
            case 'example':
                return <TheoryExample {...commonProps} title={block.title}>{block.content}</TheoryExample>;
            case 'toggle':
                return <TheoryToggle {...commonProps} title={block.title}>{block.content}</TheoryToggle>;
            case 'table':
                return <TheoryTable {...commonProps} columns={block.columns} data={block.data} />;
            case 'image':
                return <TheoryImage {...commonProps} src={block.src} alt={block.alt} caption={block.caption} />;
            default:
                return <TheoryParagraph>Unknown block type: {block.type}</TheoryParagraph>;
        }
    };

    return (
        <div className="theory-renderer">
            {isEditing && (
                <div 
                    className="global-drop-zone"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {/* Zona di drop iniziale / globale */}
                </div>
            )}
            
            {/* Titolo Principale (non iterato nelle sezioni, gestito in page.jsx) */}
            {data.title && (
                <h1 className="theory-main-title">
                    {data.title}
                </h1>
            )}

            {data.sections.map((section: SectionData, i: number) => (
                <TheorySection 
                    key={i} 
                    title={section.title} 
                    isEditing={isEditing}
                    onContentUpdate={onContentUpdate}
                    sectionIndex={i}
                >
                    {section.blocks.map((block: BlockData, j: number) => {
                        const blockId = `block-${i}-${j}`;
                        
                        // Drop Zone: Target sopra il blocco j
                        const dropZone = (
                             <div 
                                className="drop-zone"
                                data-block-type="drop-zone"
                                data-section-index={i}
                                data-block-index={j} // Indice di drop (sopra il blocco j)
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                key={`drop-${blockId}`}
                            ></div>
                        );

                        // Contenuto del blocco
                        const blockContent = (
                            <BlockEditorControls
                                key={blockId}
                                id={blockId}
                                sectionIndex={i}
                                blockIndex={j}
                                onDeleteBlock={onDeleteBlock}
                                onDuplicateBlock={onDuplicateBlock}
                                isEditing={isEditing}
                            >
                                {renderBlock(block, i, j, isEditing)}
                            </BlockEditorControls>
                        );

                        return (
                            <React.Fragment key={blockId}>
                                {isEditing && dropZone}
                                {blockContent}
                            </React.Fragment>
                        );
                    })}
                    
                    {/* Drop Zone Finale: dopo l'ultimo elemento della sezione */}
                    {isEditing && data.sections[i].blocks.length > 0 && (
                        <div 
                            className="drop-zone final-drop-zone"
                            data-block-type="drop-zone"
                            data-section-index={i}
                            data-block-index={data.sections[i].blocks.length} // Indice di drop (dopo l'ultimo blocco)
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            key={`drop-final-${i}`}
                        ></div>
                    )}
                </TheorySection>
            ))}
        </div>
    );
};