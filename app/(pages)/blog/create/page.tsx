// app/(pages)/blog/create/page.tsx
"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode, faEdit, faSave, faArrowLeft,
    faParagraph, faHeading, faSquareRootAlt, faListOl,
    faInfoCircle, faQuoteRight, faTable, faImage, faChevronCircleDown
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer";
import dynamic from 'next/dynamic';
import { initialContentData } from "../../../(core)/data/initialContent";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

const DynamicJsonEditor = dynamic(
    () => import("../../../(core)/components/JsonEditor"),
    { ssr: false }
);

const initialContent = JSON.stringify(initialContentData, null, 2);

// Block Templates
const NEW_BLOCK_TEMPLATES = {
    paragraph: { type: "paragraph", text: "New paragraph content. Use **double asterisks** for bold." },
    subheading: { type: "subheading", text: "New Subheading Title" },
    subtitle: { type: "subtitle", text: "New Subtitle Level 1", level: 1 },
    code: { type: "code", code: "console.log('Hello World!');", language: "javascript" },
    formula: { type: "formula", latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}", inline: false },
    note: { type: "note", text: "New Note or important information." },
    list: { type: "list", items: ["New Item 1", "New Item 2", "New Item 3"], ordered: false },
    callout: { type: "callout", calloutType: "info", title: "Information", text: "This is a new callout block." },
    example: { type: "example", title: "Example Title", content: "Example content here." },
    table: {
        type: "table",
        columns: ["Header 1", "Header 2"],
        data: [
            { "Header 1": "Row 1 Col 1", "Header 2": "Row 1 Col 2" },
            { "Header 1": "Row 2 Col 1", "Header 2": "Row 2 Col 2" }
        ]
    },
    image: { type: "image", src: "https://via.placeholder.com/200", alt: "Placeholder Image", caption: "New Image Caption" },
    toggle: { type: "toggle", title: "Toggle Details", content: "Hidden content visible on click." }
};

// Custom Preview Renderer
const CustomPreviewRenderer: React.FC<{
    jsonContent: string;
    setJsonContent: (content: string) => void;
}> = ({ jsonContent, setJsonContent }) => {

    const handleContentUpdate = useCallback((sectionIndex: number, blockIndex: number, field: string, newValue: string) => {
        try {
            const newData = JSON.parse(jsonContent);

            if (sectionIndex === -1 && field === 'title') {
                newData.title = newValue;
            } else if (blockIndex === -1 && field === 'title') {
                if (newData.sections[sectionIndex]) {
                    newData.sections[sectionIndex].title = newValue;
                }
            } else if (newData.sections[sectionIndex]?.blocks[blockIndex]) {
                const block = newData.sections[sectionIndex].blocks[blockIndex];

                if (field === 'tableData') {
                    const tableData = JSON.parse(newValue);
                    block.columns = tableData.columns;
                    block.data = tableData.data;
                } else {
                    block[field] = newValue;
                }
            }

            setJsonContent(JSON.stringify(newData, null, 2));
        } catch (e) {
            console.error("Error updating JSON:", e);
        }
    }, [jsonContent, setJsonContent]);

    const handleDeleteBlock = useCallback((sectionIndex: number, blockIndex: number) => {
        if (!window.confirm("Are you sure you want to delete this block?")) return;

        try {
            const newData = JSON.parse(jsonContent);

            if (newData.sections[sectionIndex]?.blocks[blockIndex]) {
                newData.sections[sectionIndex].blocks.splice(blockIndex, 1);
                setJsonContent(JSON.stringify(newData, null, 2));
            }
        } catch (e) {
            console.error("Error deleting block:", e);
        }
    }, [jsonContent, setJsonContent]);

    const handleDuplicateBlock = useCallback((sectionIndex: number, blockIndex: number) => {
        try {
            const newData = JSON.parse(jsonContent);

            if (newData.sections[sectionIndex]?.blocks[blockIndex]) {
                const blockToDuplicate = newData.sections[sectionIndex].blocks[blockIndex];
                const duplicatedBlock = JSON.parse(JSON.stringify(blockToDuplicate));
                newData.sections[sectionIndex].blocks.splice(blockIndex + 1, 0, duplicatedBlock);
                setJsonContent(JSON.stringify(newData, null, 2));
            }
        } catch (e) {
            console.error("Error duplicating block:", e);
        }
    }, [jsonContent, setJsonContent]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        try {
            const newData = JSON.parse(jsonContent);

            const activeMatch = String(active.id).match(/^s(\d+)-b(\d+)$/);
            const overMatch = String(over.id).match(/^s(\d+)-b(\d+)$/);

            if (!activeMatch || !overMatch) return;

            const activeSec = parseInt(activeMatch[1]);
            const activeBlock = parseInt(activeMatch[2]);
            const overSec = parseInt(overMatch[1]);
            const overBlock = parseInt(overMatch[2]);

            if (activeSec === overSec) {
                const blocks = newData.sections[activeSec].blocks;
                const reorderedBlocks = arrayMove(blocks, activeBlock, overBlock);
                newData.sections[activeSec].blocks = reorderedBlocks;
                setJsonContent(JSON.stringify(newData, null, 2));
            }
        } catch (e) {
            console.error("Error in drag operation:", e);
        }
    }, [jsonContent, setJsonContent]);

    try {
        const data = JSON.parse(jsonContent);

        if (!data?.sections || !Array.isArray(data.sections)) {
            return <div className="preview-error">Error: JSON structure must contain 'sections'.</div>;
        }

        const dndItems = data.sections.flatMap((sec: any, i: number) =>
            sec.blocks.map((_: any, j: number) => `s${i}-b${j}`)
        );

        return (
            <div className="preview-output edit-mode">
                <div className="blog-main-title-editor">
                    <h1
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentUpdate(-1, -1, 'title', e.currentTarget.innerText)}
                        className="main-blog-title editable-block"
                    >
                        {data.title || "Untitled Blog"}
                    </h1>
                </div>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={dndItems}
                        strategy={verticalListSortingStrategy}
                    >
                        <TheoryRenderer
                            theory={data}
                            isEditing={true}
                            onContentUpdate={handleContentUpdate}
                            onDeleteBlock={handleDeleteBlock}
                            onDuplicateBlock={handleDuplicateBlock}
                            dndItems={dndItems}
                        />
                    </SortableContext>
                </DndContext>
            </div>
        );
    } catch (e) {
        return <div className="preview-error">Error parsing JSON: {(e as Error).message}</div>;
    }
};

// Utility function
const isJsonInvalid = (str: string): boolean => {
    try {
        JSON.parse(str);
        return false;
    } catch (e) {
        return true;
    }
};

// Main Component
export default function CreateBlogPage() {
    const router = useRouter();
    const [title, setTitle] = useState("New Blog Title");
    const [jsonContent, setJsonContent] = useState(initialContent);
    const [viewMode, setViewMode] = useState<"JSON" | "Preview">("Preview");

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

    const handleAddBlock = useCallback((blockType: keyof typeof NEW_BLOCK_TEMPLATES) => {
        try {
            const newData = JSON.parse(jsonContent);
            const newBlock = NEW_BLOCK_TEMPLATES[blockType];

            if (newData.sections.length > 0) {
                newData.sections[0].blocks.unshift(newBlock);
                setJsonContent(JSON.stringify(newData, null, 2));
            } else {
                alert("Please ensure at least one section exists to add a block.");
            }
        } catch (e) {
            console.error("Error adding block:", e);
        }
    }, [jsonContent]);

    const handleSave = useCallback(() => {
        console.log("Saving content:", jsonContent);
        alert("Creating Blog soon! (Check console for data)");
    }, [jsonContent]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                            className={`tab-button ${viewMode === 'Preview' ? 'active' : ''}`}
                            onClick={() => setViewMode('Preview')}
                            disabled={viewMode === 'Preview' && isJsonInvalid(jsonContent)}
                        >
                            <FontAwesomeIcon icon={faEdit} /> Visual Editor
                        </button>
                        <button
                            type="button"
                            className={`tab-button ${viewMode === 'JSON' ? 'active' : ''}`}
                            onClick={() => setViewMode('JSON')}
                        >
                            <FontAwesomeIcon icon={faCode} /> JSON Editor
                        </button>

                        {viewMode === 'Preview' && (
                            <div className="add-block-controls">
                                <button type="button" onClick={() => handleAddBlock('paragraph')} className="add-block-btn" title="Add Paragraph">
                                    <FontAwesomeIcon icon={faParagraph} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('subheading')} className="add-block-btn" title="Add H3 Subheading">
                                    <FontAwesomeIcon icon={faHeading} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('subtitle')} className="add-block-btn" title="Add H4/H5 Subtitle">
                                    <FontAwesomeIcon icon={faHeading} style={{ fontSize: '0.8em' }} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('code')} className="add-block-btn" title="Add Code Block">
                                    <FontAwesomeIcon icon={faCode} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('formula')} className="add-block-btn" title="Add Formula (LaTeX)">
                                    <FontAwesomeIcon icon={faSquareRootAlt} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('list')} className="add-block-btn" title="Add List">
                                    <FontAwesomeIcon icon={faListOl} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('callout')} className="add-block-btn" title="Add Callout/Note">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('example')} className="add-block-btn" title="Add Example/Quote">
                                    <FontAwesomeIcon icon={faQuoteRight} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('table')} className="add-block-btn" title="Add Table">
                                    <FontAwesomeIcon icon={faTable} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('image')} className="add-block-btn" title="Add Image">
                                    <FontAwesomeIcon icon={faImage} />
                                </button>
                                <button type="button" onClick={() => handleAddBlock('toggle')} className="add-block-btn" title="Add Toggle/Spoiler">
                                    <FontAwesomeIcon icon={faChevronCircleDown} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="content-area">
                        {viewMode === 'JSON' ? (
                            <div className="form-group full-height">
                                <DynamicJsonEditor
                                    value={jsonContent}
                                    onChange={setJsonContent}
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