// app/(core)/components/theory/TheoryRenderer.tsx
import React from "react";
import {
  TheorySection,
  TheoryParagraph,
  TheorySubheading,
  TheorySubtitle,
  TheoryNote,
  TheoryList,
  TheoryCodeBlock,
  TheoryCallout,
  TheoryFormula,
  TheoryExample,
  TheoryTable,
  TheoryImage,
  TheoryToggle
} from "./Typo";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faTrashAlt } from "@fortawesome/free-solid-svg-icons";


// Definizione del Blocco Sortable (Include Drag Handle e Delete Button)
const SortableBlock = ({ id, sectionIndex, blockIndex, onDeleteBlock, children }) => {
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
        zIndex: isDragging ? 1000 : 'auto',
    };
    
    // Funzione di eliminazione
    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDeleteBlock) {
            onDeleteBlock(sectionIndex, blockIndex);
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="sortable-block-wrapper">
            {/* Controlli DND e Delete */}
            <div className="dnd-controls">
                <div {...attributes} {...listeners} className="dnd-handle">
                    <FontAwesomeIcon icon={faGripVertical} title="Drag to reorder" />
                </div>
                {/* Bottone per eliminare */}
                <button 
                    onClick={handleDelete} 
                    className="delete-block-btn"
                    title="Delete Block"
                    type="button"
                >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
            </div>
            
            <div className="block-content-area">
                {children}
            </div>
        </div>
    );
};


interface TheoryRendererProps {
    theory: any;
    isEditing?: boolean;
    onContentUpdate?: (sectionIndex: number, blockIndex: number, field: string, newValue: string) => void;
    onDeleteBlock?: (sectionIndex: number, blockIndex: number) => void; 
    dndItems?: string[]; 
}

export default function TheoryRenderer({ theory, isEditing = false, onContentUpdate, onDeleteBlock, dndItems = [] }: TheoryRendererProps) {
  if (!theory?.sections?.length) return null;

  return (
    <div className="theory-container">
      {theory.sections.map((sec: any, i: number) => (
        
        <TheorySection 
            key={i} 
            title={sec.title}
            sectionIndex={i}
            isEditing={isEditing}
            onContentUpdate={onContentUpdate}
        >
          {/* SortableContext per il Drag & Drop dei blocchi all'interno della sezione */}
          <SortableContext 
              items={sec.blocks.map((_, j) => `s${i}-b${j}`)} 
              strategy={verticalListSortingStrategy}
          >
            {sec.blocks?.map((b: any, j: number) => {
              
              const dndId = `s${i}-b${j}`;
              
              // Oggetto contenente tutti i prop necessari per l'editing/DND
              const editorProps = {
                isEditing,
                onContentUpdate,
                sectionIndex: i, 
                blockIndex: j, 
              };

              let blockComponent;

              switch (b.type) {
                case "paragraph":
                    blockComponent = (
                        <TheoryParagraph key={j} {...editorProps} fieldToUpdate="text">{b.text}</TheoryParagraph>
                    );
                    break;
                case "subheading":
                    blockComponent = (
                        <TheorySubheading key={j} {...editorProps} fieldToUpdate="text">{b.text}</TheorySubheading>
                    );
                    break;
                case "subtitle":
                    blockComponent = (
                        <TheorySubtitle key={j} level={b.level} {...editorProps} fieldToUpdate="text">{b.text}</TheorySubtitle>
                    );
                    break;
                case "note":
                    blockComponent = (
                        <TheoryNote key={j} {...editorProps} fieldToUpdate="text">{b.text}</TheoryNote>
                    );
                    break;
                case "list":
                    blockComponent = (
                        <TheoryList key={j} items={b.items || []} ordered={!!b.ordered} {...editorProps} />
                    );
                    break;
                case "formula":
                    blockComponent = (
                        <TheoryFormula key={j} latex={b.latex} inline={b.inline} {...editorProps} fieldToUpdate="latex" />
                    );
                    break;
                case "code":
                    blockComponent = (
                        <TheoryCodeBlock key={j} code={b.code || ""} language={b.language || ""} {...editorProps} fieldToUpdate="code" />
                    );
                    break;
                case "callout":
                    blockComponent = (
                        <TheoryCallout key={j} type={b.calloutType || "info"} title={b.title} {...editorProps}>
                            {b.text || b.children}
                        </TheoryCallout>
                    );
                    break;
                case "example":
                    blockComponent = (
                        <TheoryExample key={j} title={b.title} {...editorProps}>
                            {b.content || b.children}
                        </TheoryExample>
                    );
                    break;
                case "table":
                    blockComponent = (
                        <TheoryTable key={j} columns={b.columns || []} data={b.data || []} {...editorProps} />
                    );
                    break;
                case "image":
                    blockComponent = (
                        <TheoryImage key={j} src={b.src} alt={b.alt || ""} caption={b.caption} {...editorProps} />
                    );
                    break;
                case "toggle":
                    blockComponent = (
                        <TheoryToggle key={j} title={b.title || "Details"} {...editorProps}>
                            {b.content || b.children}
                        </TheoryToggle>
                    );
                    break;
                default:
                    blockComponent = null;
              }
              
              if (blockComponent && isEditing) {
                  return (
                      <SortableBlock 
                          key={dndId} 
                          id={dndId}
                          sectionIndex={i} 
                          blockIndex={j}   
                          onDeleteBlock={onDeleteBlock} 
                      >
                          {blockComponent}
                      </SortableBlock>
                  );
              }

              return blockComponent;
            })}
          </SortableContext>
        </TheorySection>
      ))}
    </div>
  );
}