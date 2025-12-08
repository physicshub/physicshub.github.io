// app/(pages)/blog/create/page.jsx
"use client";
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEye, faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

const initialContent = JSON.stringify({
    title: "Intro al LaTeX",
    blocks: [
        {
            type: "paragraph",
            content: "Questo è un paragrafo normale di introduzione."
        },
        {
            type: "equation",
            content: "\\frac{d}{dx} \\left( \\int_{0}^{x} f(t) dt \\right) = f(x)" 
        },
        {
            type: "paragraph",
            content: "Il contenuto del blog sarà strutturato in JSON, dove ogni blocco definisce il tipo di elemento (testo, equazione, immagine, ecc.)."
        }
    ]
}, null, 2); 

const PreviewRenderer = ({ jsonContent }) => {
    try {
        const data = JSON.parse(jsonContent);
        return (
            <div className="preview-output">
                <h3>Content Preview</h3>
                {data.blocks.map((block, index) => (
                    <div key={index} className={`block-type-${block.type}`}>
                        {block.type === 'paragraph' && <p>{block.content}</p>}
                        {block.type === 'equation' && (
                            <p style={{fontFamily: 'monospace', color: 'darkred'}}>{`[EQUATION LaTeX: ${block.content}]`}</p>
                        )}
                    </div>
                ))}
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
    const [title, setTitle] = useState("Nuovo Articolo");
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
                            <PreviewRenderer jsonContent={jsonContent} />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}