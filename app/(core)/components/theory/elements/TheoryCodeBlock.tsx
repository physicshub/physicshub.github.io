// app/(core)/components/theory/TheoryCodeBlock.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faCode, faEye } from '@fortawesome/free-solid-svg-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowDark, stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { EditableProps } from '../types.ts';

interface TheoryCodeBlockProps extends EditableProps {
    code: string;
    language?: string;
}

export const TheoryCodeBlock: React.FC<TheoryCodeBlockProps> = ({
    code,
    language = "",
    isEditing,
    onContentUpdate,
    sectionIndex,
    blockIndex
}) => {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [localViewMode, setLocalViewMode] = useState<'edit' | 'preview'>(isEditing ? 'preview' : 'edit');
    const [currentCode, setCurrentCode] = useState(code);
    const [currentLanguage, setCurrentLanguage] = useState(language);

    useEffect(() => { setCurrentCode(code); }, [code]);
    useEffect(() => { setCurrentLanguage(language); }, [language]);
    useEffect(() => { setLocalViewMode(isEditing ? 'preview' : 'edit'); }, [isEditing]);

    const isBlockEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentCode(e.target.value);
    };

    const handleCodeBlur = () => {
        if (isBlockEditable && currentCode !== code) {
            onContentUpdate(sectionIndex, blockIndex, 'code', currentCode);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLang = e.target.value;
        setCurrentLanguage(newLang);

        if (isBlockEditable && newLang !== language) {
            onContentUpdate(sectionIndex, blockIndex, 'language', newLang);
        }
    };

    useEffect(() => {
        const updateTheme = () => {
            const currentTheme = document.body.dataset.theme as 'light' | 'dark';
            setTheme(currentTheme || 'dark');
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

        return () => observer.disconnect();
    }, []);

    const handleCopy = async () => {
        const textToCopy = isBlockEditable ? currentCode : code;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error("Failed to copy:", e);
        }
    };

    if (isEditing) {
        const mode = isBlockEditable ? localViewMode : 'preview';

        return (
            <div className={`theory-codeblock ${isBlockEditable ? 'editable-block' : ''}`}>
                <div className="code-actions">
                    <input
                        type="text"
                        value={currentLanguage}
                        onChange={handleLanguageChange}
                        placeholder="language"
                        className="code-language-input"
                        disabled={!isBlockEditable}
                    />

                    {isBlockEditable && (
                        <>
                            <button
                                type="button"
                                onClick={() => setLocalViewMode('edit')}
                                className={`switch-btn code-switch ${mode === 'edit' ? 'active' : ''}`}
                                title="Edit Code"
                            >
                                <FontAwesomeIcon icon={faCode} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocalViewMode('preview')}
                                className={`switch-btn code-switch ${mode === 'preview' ? 'active' : ''}`}
                                title="Preview Code"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                        </>
                    )}
                    <button
                        className="copy-btn"
                        onClick={handleCopy}
                        aria-pressed={copied}
                        title={copied ? "Copied" : "Copy code"}
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    </button>
                </div>
                {mode === 'edit' ? (
                    <textarea
                        value={currentCode}
                        onChange={handleCodeChange}
                        onBlur={handleCodeBlur}
                        className="code-editor-input"
                        rows={10}
                    />
                ) : (
                    <SyntaxHighlighter
                        language={currentLanguage}
                        style={theme === 'light' ? stackoverflowLight : stackoverflowDark}
                        customStyle={{ padding: "1rem", fontSize: "15px", borderRadius: "8px" }}
                        wrapLongLines={false}
                    >
                        {currentCode}
                    </SyntaxHighlighter>
                )}
            </div>
        );
    }

    return (
        <div className='theory-codeblock'>
            <div className="code-actions">
                <span className="code-lang">{language}</span>
                <button
                    className="copy-btn"
                    onClick={handleCopy}
                    aria-pressed={copied}
                    title={copied ? "Copied" : "Copy code"}
                >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={theme === 'light' ? stackoverflowLight : stackoverflowDark}
                customStyle={{ padding: "1rem", fontSize: "15px", borderRadius: "8px" }}
                wrapLongLines={false}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};