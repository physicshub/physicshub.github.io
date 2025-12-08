// app/(pages)/blog/create/page.jsx
"use client";
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEye, faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx"; 
import dynamic from 'next/dynamic';
import { initialContentData } from "../../../(core)/data/initialContent";

const DynamicJsonEditor = dynamic(
    () => import("../../../(core)/components/JsonEditor.jsx"), 
    { ssr: false } 
);
const initialContent = JSON.stringify(initialContentData, null, 2);

const CustomPreviewRenderer = ({ jsonContent }) => {
    try {
        const data = JSON.parse(jsonContent);
        
        if (!data || !data.sections || !Array.isArray(data.sections)) {
            return <div className="preview-error">Error: JSON structure must contain 'sections'.</div>;
        }

        return (
            <div className="preview-output">
                <TheoryRenderer theory={data} />
            </div>
        );

    } catch (e) {
        return <div className="preview-error">Error parsing JSON: {e.message}</div>;
    }
};

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

    const handleSave = useCallback(() => {
        console.log("Saving title:", title);
        console.log("Saving content:", jsonContent);
        alert("Creating Blog soon! (Check console for data)");
    }, [title, jsonContent]);

    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleContentChange = (newValue) => {
        setJsonContent(newValue); 
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
                            <FontAwesomeIcon icon={faEye} /> Preview
                        </button>
                    </div>

                    <div className="content-area">
                        {viewMode === 'JSON' ? (
                            <div className="form-group full-height">
                                {/* 🌟 Usa il componente dinamico */}
                                <DynamicJsonEditor 
                                    value={jsonContent}
                                    onChange={handleContentChange}
                                />
                            </div>
                        ) : (
                            <CustomPreviewRenderer jsonContent={jsonContent} />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}