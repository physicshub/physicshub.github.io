// app/(pages)/blog/create/page.jsx
"use client";
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEye, faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx"; 

const initialContent = JSON.stringify({
    "sections": [
        {
            "title": "Introduzione",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Questo è un paragrafo di introduzione. Usiamo la proprietà 'text' per il testo."
                },
                {
                    "type": "formula",
                    "latex": "\\frac{d}{dx} \\left( \\int_{0}^{x} f(t) dt \\right) = f(x)",
                    "inline": false
                },
                {
                    "type": "paragraph",
                    "text": "Le formule sono renderizzate dal componente TheoryFormula che usa KaTeX, gestendo il LaTeX."
                },
                {
                    "type": "code",
                    "code": "console.log('Ciao, Mondo!');",
                    "language": "javascript"
                }
            ]
        },
        {
            "title": "Sezione 2: Esempi",
            "blocks": [
                {
                    "type": "callout",
                    "calloutType": "tip",
                    "title": "Suggerimento",
                    "text": "Questa è una nota importante."
                }
            ]
        }
    ]
}, null, 2);

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
    const handleContentChange = (e) => setJsonContent(e.target.value);


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
                                <textarea 
                                    id="content" 
                                    rows="20"
                                    placeholder="Insert JSON/Latex content here..." 
                                    value={jsonContent}
                                    onChange={handleContentChange}
                                    className="json-editor"
                                    required
                                ></textarea>
                            </div>
                        ) : (
                            // 🌟 Usa il CustomPreviewRenderer aggiornato
                            <CustomPreviewRenderer jsonContent={jsonContent} />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}