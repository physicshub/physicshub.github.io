// app/(pages)/blog/create/page.jsx (MODIFICHE CHIAVE)
"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react'; // Aggiunto useEffect
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// AGGIORNAMENTO ICONE
import { 
    faCode, faEye, faSave, faArrowLeft, faPlus, faEdit,
    faParagraph, faHeading, faSquareRootAlt, faLightbulb 
} from "@fortawesome/free-solid-svg-icons"; // AGGIUNTE NUOVE ICONE
import { useRouter } from 'next/navigation';
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx"; 
import dynamic from 'next/dynamic';
import { initialContentData } from "../../../(core)/data/initialContent";

// --- Import per il Drag & Drop (MANTENUTO) ---
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
// ---------------------------------

const DynamicJsonEditor = dynamic(
    () => import("../../../(core)/components/JsonEditor.jsx"), 
    { ssr: false } 
);
const initialContent = JSON.stringify(initialContentData, null, 2);


// --- Nuovi Block Type di esempio ---
const NEW_BLOCK_TEMPLATES = {
    paragraph: { type: "paragraph", text: "New paragraph content..." },
    subheading: { type: "subheading", text: "New Subheading Title" },
    code: { type: "code", code: "console.log('Hello World!');", language: "javascript" },
    formula: { type: "formula", latex: "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", inline: false },
    note: { type: "note", text: "New Note or important information." },
};
// -----------------------------------


// --- Componente CustomPreviewRenderer aggiornato ---
const CustomPreviewRenderer = ({ jsonContent, setJsonContent }) => {
    
    // Funzione per aggiornare il JSON
    const handleContentUpdate = useCallback((sectionIndex, blockIndex, field, newValue) => {
        try {
            const newData = JSON.parse(jsonContent);
            
            if (sectionIndex === -1 && field === 'title') {
                newData.title = newValue;
            } 
            else if (blockIndex === -1 && field === 'title') {
                if (newData.sections[sectionIndex]) {
                    newData.sections[sectionIndex].title = newValue;
                }
            } 
            else if (newData.sections[sectionIndex] && newData.sections[sectionIndex].blocks[blockIndex]) {
                const block = newData.sections[sectionIndex].blocks[blockIndex];
                
                // Aggiornamento specifico (es. il linguaggio in un campo separato dal codice)
                if (field === 'language') {
                    block.language = newValue;
                } else {
                    block[field] = newValue; // Aggiorna il campo specifico
                }
            } else {
                console.error("Update failed: Index or field not found.", { sectionIndex, blockIndex, field });
                return;
            }
            
            setJsonContent(JSON.stringify(newData, null, 2));

        } catch (e) {
            console.error("Error updating JSON:", e);
        }
    }, [jsonContent, setJsonContent]);

    // 1. Funzione per eliminare un elemento
    const handleDeleteBlock = useCallback((sectionIndex, blockIndex) => {
        if (!window.confirm("Are you sure you want to delete this block?")) return;

        try {
            const newData = JSON.parse(jsonContent);
            
            if (newData.sections[sectionIndex] && newData.sections[sectionIndex].blocks[blockIndex]) {
                // Rimuovi il blocco dall'array
                newData.sections[sectionIndex].blocks.splice(blockIndex, 1);
                setJsonContent(JSON.stringify(newData, null, 2));
            } else {
                console.error("Deletion failed: Block index not found.", { sectionIndex, blockIndex });
            }
        } catch (e) {
            console.error("Error deleting block:", e);
        }
    }, [jsonContent, setJsonContent]);


    // Funzione per il Drag and Drop (DND) (MANTENUTA)
    const handleDragEnd = useCallback((event) => {
        // ... (Logica DND mantenuta come prima) ...
        const { active, over } = event;

        if (active.id !== over.id) {
            const newData = JSON.parse(jsonContent);
            
            const activeMatch = active.id.match(/^s(\d+)-b(\d+)$/);
            const overMatch = over.id.match(/^s(\d+)-b(\d+)$/);

            if (!activeMatch || !overMatch) return;

            const [ , activeSec, activeBlock] = activeMatch.map(Number);
            const [ , overSec, overBlock] = overMatch.map(Number);

            if (activeSec === overSec) {
                const blocks = newData.sections[activeSec].blocks;
                
                // Requisito: Aggiungere l'utility arrayMove se si usa @dnd-kit/sortable 
                // Qui assumiamo che sia stata aggiunta, o usiamo il metodo nativo splice
                const movedItem = blocks.splice(activeBlock, 1)[0];
                blocks.splice(overBlock, 0, movedItem);

                setJsonContent(JSON.stringify(newData, null, 2));
            } 
        }
    }, [jsonContent, setJsonContent]);


    try {
        const data = JSON.parse(jsonContent);
        
        if (!data || !data.sections || !Array.isArray(data.sections)) {
            return <div className="preview-error">Error: JSON structure must contain 'sections'.</div>;
        }

        return (
            <div className="preview-output edit-mode">
                
                 <div className="blog-main-title-editor">
                    <h1 
                        contentEditable={"true"}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleContentUpdate(-1, -1, 'title', e.target.innerText)}
                        className="main-blog-title editable-block"
                    >
                        {data.title || "Untitled Blog"}
                    </h1>
                 </div>

                <DndContext 
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <TheoryRenderer 
                        theory={data} 
                        isEditing={true} 
                        onContentUpdate={handleContentUpdate}
                        onDeleteBlock={handleDeleteBlock} // PASSAGGIO NUOVA FUNZIONE
                        dndItems={data.sections.flatMap((sec, i) => 
                            sec.blocks.map((block, j) => `s${i}-b${j}`)
                        )}
                    />
                </DndContext>
            </div>
        );

    } catch (e) {
        return <div className="preview-error">Error parsing JSON: {e.message}</div>;
    }
};
// --- Fine CustomPreviewRenderer aggiornato ---


function isJsonInvalid(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return true;
    }
    return false;
}

export default function CreateBlogPage() {
    const router = useRouter();
    const [title, setTitle] = useState("New Blog Title");
    const [jsonContent, setJsonContent] = useState(initialContent);
    const [viewMode, setViewMode] = useState("JSON"); 
    
    const jsonTitle = useMemo(() => {
        try {
            return JSON.parse(jsonContent).title || "New Blog Title";
        } catch (e) {
            return "New Blog Title";
        }
    }, [jsonContent]);
    
    useEffect(() => {
        setTitle(jsonTitle);
    }, [jsonTitle]);


    // 3. Funzione per aggiungere un nuovo elemento (blocco) - CORRETTA
    const handleAddBlock = useCallback((blockType) => {
        try {
            const newData = JSON.parse(jsonContent);
            const newBlock = NEW_BLOCK_TEMPLATES[blockType];
            
            // Aggiungiamo sempre al blocco della PRIMA sezione esistente
            if (newData.sections.length > 0) {
                // Aggiungi in cima alla prima sezione per renderlo subito visibile
                newData.sections[0].blocks.unshift(newBlock); 
                setJsonContent(JSON.stringify(newData, null, 2));
            } else {
                alert("Please ensure at least one section exists to add a block.");
            }
        } catch(e) {
            console.error("Error adding block:", e);
        }
    }, [jsonContent]);


    const handleSave = useCallback(() => {
        console.log("Saving content:", jsonContent);
        alert("Creating Blog soon! (Check console for data)");
    }, [jsonContent]);

    const handleContentChange = (newValue) => {
        setJsonContent(newValue); 
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        
        try {
            const newData = JSON.parse(jsonContent);
            newData.title = newTitle;
            setJsonContent(JSON.stringify(newData, null, 2));
        } catch (e) {
            console.error("Failed to update JSON title:", e);
        }
    };


    return (
        <div className="create-blog-container">
            
            {/* ... Controlli top (Back, Title, Save) ... */}
            <div className="top-controls-bar">
                <button 
                    onClick={() => router.back()} 
                    className="btn-glow back-to-home__link"
                    aria-label="Back to Blog List"
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <h1 className="editor-title">New Blog</h1> 
                <button 
                    onClick={handleSave} 
                    className="ph-btn ph-btn--primary cursor-pointer save-button-top"
                    type="button"
                >
                    <FontAwesomeIcon icon={faSave} /> Save
                </button>
            </div>


            <main className="blog-editor-area">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="form-group title-group"> 
                        <label htmlFor="title">Title:</label>
                        <input 
                            id="title" 
                            type="text" 
                            placeholder="Title for your blog..." 
                            value={title}
                            onChange={handleTitleChange}
                            required 
                        />
                    </div>
                    
                    <div className="tab-switcher">
                        <button
                            type="button"
                            className={`tab-button ${viewMode === 'JSON' ? 'active' : ''}`}
                            onClick={() => setViewMode('JSON')}
                        >
                            <FontAwesomeIcon icon={faCode} /> JSON Editor
                        </button>
                        
                        <button
                            type="button"
                            className={`tab-button ${viewMode === 'Preview' ? 'active' : ''}`}
                            onClick={() => setViewMode('Preview')}
                            disabled={viewMode === 'Preview' && isJsonInvalid(jsonContent)}
                        >
                            <FontAwesomeIcon icon={faEdit} /> Visual Editor
                        </button>
                        
                        {/* 3. BOTTONI CON ICONE (CORREZIONE) */}
                        {viewMode === 'Preview' && (
                            <div className="add-block-controls">
                                <button type="button" onClick={() => handleAddBlock('paragraph')} className="add-block-btn" title="Add Paragraph">
                                    <FontAwesomeIcon icon={faParagraph} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('subheading')} className="add-block-btn" title="Add Subheading">
                                    <FontAwesomeIcon icon={faHeading} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('code')} className="add-block-btn" title="Add Code Block">
                                    <FontAwesomeIcon icon={faCode} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('formula')} className="add-block-btn" title="Add Formula">
                                    <FontAwesomeIcon icon={faSquareRootAlt} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('note')} className="add-block-btn" title="Add Note/Callout">
                                    <FontAwesomeIcon icon={faLightbulb} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="content-area">
                        {viewMode === 'JSON' ? (
                            <div className="form-group full-height">
                                <DynamicJsonEditor 
                                    value={jsonContent}
                                    onChange={handleContentChange}
                                />
                            </div>
                        ) : (
                            <CustomPreviewRenderer 
                                jsonContent={jsonContent} 
                                setJsonContent={setJsonContent}
                            />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}