// app/(core)/components/theory/Typo.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCopy, faCheck, faInfoCircle, faExclamationTriangle, faLightbulb, 
    faChevronDown, faChevronUp, faEdit, faCode, faEye 
} from '@fortawesome/free-solid-svg-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowDark, stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { BlockMath, InlineMath } from "react-katex";

type Children = { children?: React.ReactNode };

// --- Tipi per l'Editing ---
interface EditableProps {
    isEditing?: boolean;
    // Funzione per aggiornare il JSON: (sectionIndex, blockIndex, field, newValue)
    onContentUpdate?: (sectionIndex: number, blockIndex: number, field: string, newValue: string) => void;
    sectionIndex?: number;
    blockIndex?: number;
    fieldToUpdate?: string; 
}

// FUNZIONE PER PARSARE IL GRASSETTO **testo**
const parseBoldText = (text: string): React.ReactNode[] => {
    if (!text || typeof text !== 'string') return [text];

    const parts: React.ReactNode[] = [];
    // Regex che cattura **testo** ma evita sequenze di asterischi interne a **...**
    const regex = /(\*\*([^\*]+)\*\*)/g; 
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[1]; 
        const content = match[2];  
        const matchIndex = match.index;

        // Aggiungi testo precedente
        if (matchIndex > lastIndex) {
            parts.push(text.substring(lastIndex, matchIndex));
        }

        // Aggiungi contenuto in grassetto
        parts.push(<strong key={matchIndex}>{content}</strong>);
        
        lastIndex = matchIndex + fullMatch.length;
    }

    // Aggiungi testo rimanente
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
};


// --- Hook per la logica comune di editing ---
const useEditableBlock = (props: EditableProps, initialContent: string) => {
    const { isEditing, onContentUpdate, sectionIndex, blockIndex, fieldToUpdate } = props;

    const handleEditEnd = useCallback((e: React.FocusEvent<HTMLElement>) => {
        if (!isEditing || !onContentUpdate || sectionIndex === undefined || blockIndex === undefined || !fieldToUpdate) return;
        
        const newValue = e.target.innerText || e.target.textContent || '';
        
        // Confrontiamo con la prop iniziale (dal JSON)
        if (newValue !== initialContent) { 
            onContentUpdate(sectionIndex, blockIndex, fieldToUpdate, newValue);
        }
    }, [isEditing, onContentUpdate, sectionIndex, blockIndex, fieldToUpdate, initialContent]);

    return { isEditable: isEditing, handleEditEnd };
};

// --- Componente Wrapper Corretto per l'editing e il parsing ---
const EditableWrapper: React.FC<EditableProps & Children & { as: keyof JSX.IntrinsicElements, className: string }> = ({ 
    children, 
    as: Tag, 
    className, 
    fieldToUpdate = 'text',
    ...props 
}) => {
    // Otteniamo il contenuto di riferimento (dal JSON)
    const initialContent = typeof children === 'string' ? children : '';
    const { isEditable, handleEditEnd } = useEditableBlock({ ...props, fieldToUpdate }, initialContent);

    // In modalità editing
    if (isEditable) {
        return (
            <Tag
                className={`${className} editable-block`}
                contentEditable="true" 
                suppressContentEditableWarning={true}
                onBlur={handleEditEnd}
            >
                {initialContent}
            </Tag>
        );
    }
    
    // In modalità visualizzazione: Applichiamo il parsing del grassetto
    return (
        <Tag className={className}>
            {parseBoldText(initialContent)} 
        </Tag>
    );
};
// --- Fine Wrapper Corretto ---


// TheorySection (Gestione editing titolo sezione)
export const TheorySection: React.FC<{ title?: string; className?: string } & Children & EditableProps> = ({ title, children, className, isEditing, onContentUpdate, sectionIndex }) => {
  
  const isTitleEditable = isEditing && onContentUpdate && sectionIndex !== undefined;

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
      if (isTitleEditable && title !== e.target.innerText) {
          // blockIndex: -1 indica che stiamo modificando il titolo della sezione
          onContentUpdate(sectionIndex, -1, 'title', e.target.innerText);
      }
  };
  
  return (
    <section className={["theory-section", className].filter(Boolean).join(" ")}>
      {title && (
          <h2 
              className={`theory-title ${isTitleEditable ? 'editable-block' : ''}`}
              contentEditable={isTitleEditable ? "true" : "false"}
              suppressContentEditableWarning={isTitleEditable}
              onBlur={handleTitleBlur}
          >
              {title}
          </h2>
      )}
      <div className="theory-blocks">{children}</div>
    </section>
  );
};


// TheoryParagraph (Usa EditableWrapper)
export const TheoryParagraph: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <EditableWrapper as="p" className="theory-paragraph" {...props}>
    {children}
  </EditableWrapper>
);

// TheorySubheading (Usa EditableWrapper)
export const TheorySubheading: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <EditableWrapper as="h3" className="theory-subheading" {...props}>
    {children}
  </EditableWrapper>
);

// TheorySubtitle (Usa EditableWrapper)
export const TheorySubtitle: React.FC<{ level?: number } & Children & EditableProps> = ({ level = 1, children, ...props }) => {
  const sizes = [
    "text-lg font-semibold mt-2 mb-1",
    "text-base font-semibold mt-2 mb-1",
    "text-sm font-normal mt-1 mb-1",
  ];
  const style = sizes[level - 1] || sizes[2];
  return (
    <EditableWrapper as="h4" className={`theory-subtitle ${style}`} {...props}>
      {children}
    </EditableWrapper>
  );
};

// TheoryList
export const TheoryList: React.FC<{ items: React.ReactNode[]; ordered?: boolean } & EditableProps>= ({ items, ordered = false }) =>
  ordered ? (
    <ol className="theory-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ol>
  ) : (
    <ul className="theory-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
  );


// TheoryFormula 
export const TheoryFormula: React.FC<{ latex: string; inline?: boolean } & EditableProps> = ({ latex, inline, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  
  const [localViewMode, setLocalViewMode] = useState<'edit' | 'preview'>('edit'); 
  
  const [currentLatex, setCurrentLatex] = useState(latex);
  useEffect(() => { setCurrentLatex(latex); }, [latex]);
  
  const isBlockEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;

  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLatex(e.target.value);
  };

  const handleLatexBlur = () => {
      if (isBlockEditable && currentLatex !== latex) {
          onContentUpdate(sectionIndex, blockIndex, 'latex', currentLatex);
      }
  };


  const handleCopy = async () => {
    const textToCopy = isBlockEditable ? currentLatex : latex;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (liveRef.current) liveRef.current.textContent = "Copied";
      setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = "";
      }, 1500);
    } catch (e) {}
  };

  if (isEditing) {
      const mode = isBlockEditable ? localViewMode : 'preview';
      
      return (
          <div className={`theory-formula ${isBlockEditable ? 'editable-block' : ''}`}>
              {isBlockEditable && (
                  <div className="edit-switch-bar">
                      <button 
                          type="button" 
                          onClick={() => setLocalViewMode('edit')} 
                          className={`switch-btn ${mode === 'edit' ? 'active' : ''}`}
                      >
                          <FontAwesomeIcon icon={faCode} /> Edit
                      </button>
                      <button 
                          type="button" 
                          onClick={() => setLocalViewMode('preview')} 
                          className={`switch-btn ${mode === 'preview' ? 'active' : ''}`}
                      >
                          <FontAwesomeIcon icon={faEye} /> Preview
                      </button>
                  </div>
              )}
              
              {mode === 'edit' ? (
                  <div className="latex-editor-area">
                      <textarea
                          value={currentLatex}
                          onChange={handleLatexChange}
                          onBlur={handleLatexBlur}
                          className="latex-editor-input"
                          rows={inline ? 1 : 5}
                          placeholder="Inserisci qui il codice LaTeX..."
                      />
                  </div>
              ) : (
                  <div className="preview-area">
                      {currentLatex ? (inline ? <InlineMath math={currentLatex} /> : <BlockMath math={currentLatex} />) : <div className="latex-placeholder">Empty Formula</div>}
                  </div>
              )}
              <span aria-live="polite" className="visually-hidden" ref={liveRef}></span>
          </div>
      );
  }

  return (
    <div className="theory-formula">
      <button
        className="copy-btn"
        onClick={handleCopy}
        aria-pressed={copied}
        aria-label={copied ? "Copied" : "Copy formula"}
        title={copied ? "Copied!" : "Copy formula"}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} color="white" />
      </button>
      {latex ? (inline ? <InlineMath math={latex} /> : <BlockMath math={latex} />) : null}
      <span aria-live="polite" className="visually-hidden" ref={liveRef}></span>
    </div>
  );
};


// TheoryCodeBlock 
export const TheoryCodeBlock: React.FC<{ code: string; language?: string } & EditableProps> = ({ code, language = "", isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const [localViewMode, setLocalViewMode] = useState<'edit' | 'preview'>('edit');
  
  const [currentCode, setCurrentCode] = useState(code);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  
  useEffect(() => { setCurrentCode(code); }, [code]);
  useEffect(() => { setCurrentLanguage(language); }, [language]);
  
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
    } catch (e) {}
  };
  
  if (isEditing) {
    const mode = isBlockEditable ? localViewMode : 'preview';
      
    return (
        <div className={`theory-codeblock ${isBlockEditable ? 'editable-block' : ''}`}>
            <div className="code-actions">
                {/* Input per cambiare il linguaggio */}
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
                <button className="copy-btn" onClick={handleCopy} aria-pressed={copied} title={copied ? "Copied" : "Copy code"}>
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
                <SyntaxHighlighter language={currentLanguage}
                    style={theme === 'light' ? stackoverflowLight : stackoverflowDark}
                    customStyle={{ padding: "1rem", fontSize: "15px", borderRadius: "8px"}}
                    wrapLongLines={false}>
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
            <button className="copy-btn" onClick={handleCopy} aria-pressed={copied} title={copied ? "Copied" : "Copy code"}>
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            </button>
        </div>
        <SyntaxHighlighter language={language}
          style={theme === 'light' ? stackoverflowLight : stackoverflowDark}
          customStyle={{ padding: "1rem", fontSize: "15px", borderRadius: "8px"}}
          wrapLongLines={false}>
          {code}
        </SyntaxHighlighter>
      </div>
  );
};

// TheoryNote (Usa EditableWrapper)
export const TheoryNote: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <div className="theory-note">
     <EditableWrapper as="div" className="note-content" fieldToUpdate="text" {...props}>
        {children}
     </EditableWrapper>
  </div>
);

// TheoryCallout (Aggiornato con selettore tipo e grassetto corretto)
export const TheoryCallout: React.FC<{ type?: 'info'|'warning'|'tip'|'success'; title?: string } & Children & EditableProps> = ({ type = 'info', title, children, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const CALLOUT_TYPES = ['info', 'warning', 'tip', 'success'];
  
  const map = {
    info: { icon: faInfoCircle, cls: 'callout-info', label: 'Info' },
    warning: { icon: faExclamationTriangle, cls: 'callout-warning', label: 'Warning' },
    tip: { icon: faLightbulb, cls: 'callout-tip', label: 'Tip' },
    success: { icon: faCheck, cls: 'callout-success', label: 'Success' }
  } as any;
  const cfg = map[type] || map.info;
  
  const isEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
  
  // Gestione cambio tipo Callout
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (isEditable) {
          onContentUpdate(sectionIndex, blockIndex, 'calloutType', e.target.value);
      }
  };
  
  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (isEditable && e.target.innerText !== title) {
          onContentUpdate(sectionIndex, blockIndex, 'title', e.target.innerText);
      }
  };
  
  const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      // Usiamo 'text' come fieldToUpdate per il contenuto del callout
      if (isEditable) { 
          onContentUpdate(sectionIndex, blockIndex, 'text', e.target.innerText);
      }
  };
  
  // Contenuto Callout (il testo grezzo dalla prop children)
  const content = typeof children === 'string' ? children : '';
  

  return (
    <div className={["theory-callout", cfg.cls, isEditable ? 'editable-block' : ''].join(" ")} role="note">
      <div className="callout-icon"><FontAwesomeIcon icon={cfg.icon} /></div>
      <div className="callout-body">
        <div className="callout-header-editor">
            {isEditable && (
                <select value={type} onChange={handleTypeChange} className="callout-type-selector">
                    {CALLOUT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
            )}
            {title && (
                <div 
                    className="callout-title"
                    contentEditable={isEditable ? "true" : "false"}
                    suppressContentEditableWarning={isEditable}
                    onBlur={handleTitleBlur}
                >
                    {title}
                </div>
            )}
        </div>
        <div 
            className="callout-content"
            contentEditable={isEditable ? "true" : "false"}
            suppressContentEditableWarning={isEditable}
            onBlur={handleContentBlur}
        >
            {isEditable ? content : parseBoldText(content)}
        </div>
      </div>
    </div>
  );
};

// TheoryExample (Corretto per il grassetto)
export const TheoryExample: React.FC<{ title?: string } & Children & EditableProps> = ({ title, children, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
    
    const isEditable = isEditing && onContentUpdate;
    const content = typeof children === 'string' ? children : '';

    const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (isEditable && sectionIndex !== undefined && blockIndex !== undefined && e.target.innerText !== title) {
            onContentUpdate(sectionIndex, blockIndex, 'title', e.target.innerText);
        }
    };
    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (isEditable && sectionIndex !== undefined && blockIndex !== undefined) {
            onContentUpdate(sectionIndex, blockIndex, 'content', e.target.innerText);
        }
    };

    return (
        <div className={["theory-example", isEditable ? 'editable-block' : ''].join(' ')}>
            {title && (
                <div 
                    className="example-title"
                    contentEditable={isEditable ? "true" : "false"}
                    suppressContentEditableWarning={isEditable}
                    onBlur={handleTitleBlur}
                >
                    {title}
                </div>
            )}
            <div 
                className="example-body"
                contentEditable={isEditable ? "true" : "false"}
                suppressContentEditableWarning={isEditable}
                onBlur={handleContentBlur}
            >
                {isEditable ? content : parseBoldText(content)}
            </div>
        </div>
    );
};

// TheoryTable
export const TheoryTable: React.FC<{ columns: string[]; data: Array<Record<string, any>> } & EditableProps> = ({ columns, data }) => (
  <div className="theory-table-wrap">
    <table className="theory-table">
      <thead>
        <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, r) => (
          <tr key={r}>{columns.map((c, i) => <td key={i}>{row[c]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

// TheoryImage
export const TheoryImage: React.FC<{ src: string; alt?: string; caption?: string } & EditableProps> = ({ src, alt = '', caption, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
    
    const isEditable = isEditing && onContentUpdate;

    const handleCaptionBlur = (e: React.FocusEvent<HTMLElement>) => {
        if (isEditable && sectionIndex !== undefined && blockIndex !== undefined && e.target.innerText !== caption) {
            onContentUpdate(sectionIndex, blockIndex, 'caption', e.target.innerText);
        }
    };

    return (
        <figure className={["theory-image", isEditable ? 'editable-block' : ''].join(' ')}>
            <img src={src} alt={alt} />
            {caption && (
                <figcaption
                    contentEditable={isEditable ? "true" : "false"}
                    suppressContentEditableWarning={isEditable}
                    onBlur={handleCaptionBlur}
                >
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

// TheoryToggle (Corretto per il grassetto)
export const TheoryToggle: React.FC<{ title?: string } & Children & EditableProps> = ({ title = 'Details', children, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const [open, setOpen] = useState(false);
  const isEditable = isEditing && onContentUpdate;
  const content = typeof children === 'string' ? children : '';

  const handleTitleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
      if (isEditable && sectionIndex !== undefined && blockIndex !== undefined && e.target.innerText !== title) {
          onContentUpdate(sectionIndex, blockIndex, 'title', e.target.innerText);
      }
  };
  
  const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (isEditable && sectionIndex !== undefined && blockIndex !== undefined) {
          onContentUpdate(sectionIndex, blockIndex, 'content', e.target.innerText);
      }
  };
  
  return (
    <div className={["theory-toggle", open ? 'open' : '', isEditable ? 'editable-block' : ''].join(' ')}>
      <button className="toggle-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} type="button">
        <span 
            className="toggle-title"
            contentEditable={isEditable ? "true" : "false"}
            suppressContentEditableWarning={isEditable}
            onBlur={handleTitleBlur}
        >
            {title}
        </span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
      </button>
      <div 
        className="toggle-panel" 
        style={{ maxHeight: open ? '1000px' : 0 }} 
        aria-hidden={!open}
        contentEditable={isEditable ? "true" : "false"}
        suppressContentEditableWarning={isEditable}
        onBlur={handleContentBlur}
      >
        {isEditable ? content : parseBoldText(content)}
      </div>
    </div>
  );
};

export default TheorySection;