// app/(core)/components/theory/Typo.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCopy, faCheck, faInfoCircle, faExclamationTriangle, faLightbulb, 
    faChevronDown, faChevronUp, faEdit, faCode, faEye,
    faSquareRootAlt, faPlus, faTrashAlt
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
    const regex = /(\*\*([^\*]+)\*\*)/g; 
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[1]; 
        const content = match[2];  
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
            parts.push(text.substring(lastIndex, matchIndex));
        }

        parts.push(<strong key={matchIndex}>{content}</strong>);
        
        lastIndex = matchIndex + fullMatch.length;
    }

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
        
        if (newValue !== initialContent) { 
            onContentUpdate(sectionIndex, blockIndex, fieldToUpdate, newValue);
        }
    }, [isEditing, onContentUpdate, sectionIndex, blockIndex, fieldToUpdate, initialContent]);

    return { isEditable: isEditing, handleEditEnd };
};

// --- Componente Wrapper per l'editing e il parsing ---
const EditableWrapper: React.FC<EditableProps & Children & { as: keyof JSX.IntrinsicElements, className: string }> = ({ 
    children, 
    as: Tag, 
    className, 
    fieldToUpdate = 'text',
    ...props 
}) => {
    const initialContent = typeof children === 'string' ? children : '';
    const { isEditable, handleEditEnd } = useEditableBlock({ ...props, fieldToUpdate }, initialContent);

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
    
    return (
        <Tag className={className}>
            {parseBoldText(initialContent)} 
        </Tag>
    );
};
// --- Fine Wrapper Corretto ---


// TheorySection
export const TheorySection: React.FC<{ title?: string; className?: string } & Children & EditableProps> = ({ title, children, className, isEditing, onContentUpdate, sectionIndex }) => {
  
  const isTitleEditable = isEditing && onContentUpdate && sectionIndex !== undefined;

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
      if (isTitleEditable && title !== e.target.innerText) {
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


// TheoryParagraph, TheorySubheading, TheorySubtitle, TheoryNote (USANO EditableWrapper)
export const TheoryParagraph: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <EditableWrapper as="p" className="theory-paragraph" {...props}>
    {children}
  </EditableWrapper>
);
export const TheorySubheading: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <EditableWrapper as="h3" className="theory-subheading" {...props}>
    {children}
  </EditableWrapper>
);
export const TheorySubtitle: React.FC<{ level?: number } & Children & EditableProps> = ({ level = 1, children, ...props }) => {
  const sizes = ["text-lg font-semibold mt-2 mb-1", "text-base font-semibold mt-2 mb-1", "text-sm font-normal mt-1 mb-1"];
  const style = sizes[level - 1] || sizes[2];
  return (
    <EditableWrapper as="h4" className={`theory-subtitle ${style}`} {...props}>
      {children}
    </EditableWrapper>
  );
};
export const TheoryNote: React.FC<Children & EditableProps> = ({ children, ...props }) => (
  <div className="theory-note">
     <EditableWrapper as="div" className="note-content" fieldToUpdate="text" {...props}>
        {children}
     </EditableWrapper>
  </div>
);


// TheoryList (AGGIORNATO: Editing in linea + Correzione TypeError)
export const TheoryList: React.FC<{ items: string[] | string | null; ordered?: boolean } & EditableProps>= ({ items: rawItems, ordered = false, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
    
    // CORREZIONE: Normalizza rawItems a un array di stringhe
    const items = useMemo(() => {
        if (Array.isArray(rawItems)) {
            return rawItems;
        }
        if (typeof rawItems === 'string') {
            try {
                const parsed = JSON.parse(rawItems);
                // Se riusciamo a parsare e otteniamo un array, usalo, altrimenti usa la stringa come elemento singolo
                return Array.isArray(parsed) ? parsed : [rawItems];
            } catch (e) {
                // Se fallisce il parsing JSON, usa la stringa come elemento singolo (caso iniziale non JSON)
                return [rawItems]; 
            }
        }
        return []; 
    }, [rawItems]);


    const isBlockEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;

    // Quando si modifica un singolo elemento della lista
    const handleItemBlur = (e: React.FocusEvent<HTMLLIElement>, index: number) => {
        if (!isBlockEditable) return;

        const newText = e.target.innerText;
        if (newText !== items[index]) {
            const newItems = [...items];
            newItems[index] = newText;
            // Aggiorna l'intero array come stringa JSON
            onContentUpdate(sectionIndex, blockIndex, 'items', JSON.stringify(newItems)); 
        }
    };
    
    // Funzione per aggiungere un nuovo elemento
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
                        contentEditable={isBlockEditable ? "true" : "false"}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleItemBlur(e as React.FocusEvent<HTMLLIElement>, i)}
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


// TheoryFormula (AGGIORNATO: Stato default 'preview')
export const TheoryFormula: React.FC<{ latex: string; inline?: boolean } & EditableProps> = ({ latex, inline, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  
  // STATO DEFAULT IMPOSTATO SU 'preview'
  const [localViewMode, setLocalViewMode] = useState<'edit' | 'preview'>(isEditing ? 'preview' : 'edit'); 
  
  const [currentLatex, setCurrentLatex] = useState(latex);
  useEffect(() => { setCurrentLatex(latex); }, [latex]);
  useEffect(() => { setLocalViewMode(isEditing ? 'preview' : 'edit'); }, [isEditing]);
  
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
                      <button type="button" onClick={() => setLocalViewMode('edit')} className={`switch-btn ${mode === 'edit' ? 'active' : ''}`}>
                          <FontAwesomeIcon icon={faCode} /> Edit
                      </button>
                      <button type="button" onClick={() => setLocalViewMode('preview')} className={`switch-btn ${mode === 'preview' ? 'active' : ''}`}>
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
                  <div className="preview-area formula-preview">
                      {currentLatex ? (inline ? <InlineMath math={currentLatex} /> : <BlockMath math={currentLatex} />) : <div className="latex-placeholder"><FontAwesomeIcon icon={faSquareRootAlt} /> Empty Formula</div>}
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


// TheoryCodeBlock (AGGIORNATO: Stato default 'preview')
export const TheoryCodeBlock: React.FC<{ code: string; language?: string } & EditableProps> = ({ code, language = "", isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // STATO DEFAULT IMPOSTATO SU 'preview'
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
    } catch (e) {}
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
                        <button type="button" onClick={() => setLocalViewMode('edit')} className={`switch-btn code-switch ${mode === 'edit' ? 'active' : ''}`} title="Edit Code">
                            <FontAwesomeIcon icon={faCode} />
                        </button>
                        <button type="button" onClick={() => setLocalViewMode('preview')} className={`switch-btn code-switch ${mode === 'preview' ? 'active' : ''}`} title="Preview Code">
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


// TheoryCallout
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
        if (isEditable) { 
            onContentUpdate(sectionIndex, blockIndex, 'text', e.target.innerText);
        }
    };
    
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

// TheoryExample
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

// TheoryToggle
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


// TheoryTable (AGGIORNATO: Editing in linea di celle/header + bottoni Aggiungi)
export const TheoryTable: React.FC<{ columns: string[]; data: Array<Record<string, any>> } & EditableProps> = ({ columns, data, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
    
    const isBlockEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;

    // Funzione generica per aggiornare le colonne e i dati
    const updateTable = useCallback((newColumns: string[], newData: Array<Record<string, any>>) => {
        if (!isBlockEditable) return;
        
        const newTableData = { columns: newColumns, data: newData };
        // Invia l'intero oggetto come stringa JSON
        onContentUpdate(sectionIndex, blockIndex, 'tableData', JSON.stringify(newTableData));
    }, [isBlockEditable, onContentUpdate, sectionIndex, blockIndex]);


    // Aggiorna l'header di una colonna
    const handleHeaderBlur = (e: React.FocusEvent<HTMLElement>, colIndex: number, oldColName: string) => {
        if (!isBlockEditable) return;

        const newColName = e.target.innerText || `Header ${colIndex + 1}`;
        if (newColName === oldColName) return;

        const newColumns = [...columns];
        newColumns[colIndex] = newColName;

        // Rinomina la chiave in tutti gli oggetti data
        const newData = data.map(row => {
            const newRow = { ...row };
            newRow[newColName] = newRow[oldColName];
            delete newRow[oldColName];
            return newRow;
        });

        updateTable(newColumns, newData);
    };

    // Aggiorna il contenuto di una cella
    const handleCellBlur = (e: React.FocusEvent<HTMLElement>, rowIndex: number, colName: string) => {
        if (!isBlockEditable) return;

        const newContent = e.target.innerText;
        const newData = [...data];
        
        newData[rowIndex] = { ...newData[rowIndex], [colName]: newContent };

        updateTable(columns, newData);
    };

    // Aggiungi Riga
    const handleAddRow = () => {
        if (!isBlockEditable) return;

        const newRow: Record<string, any> = {};
        columns.forEach(col => newRow[col] = "New Data");
        
        updateTable(columns, [...data, newRow]);
    };

    // Aggiungi Colonna
    const handleAddColumn = () => {
        if (!isBlockEditable) return;
        
        const newColName = `New Column ${columns.length + 1}`;
        const newColumns = [...columns, newColName];

        const newData = data.map(row => ({
            ...row,
            [newColName]: "New Data"
        }));

        updateTable(newColumns, newData);
    };


    return (
        <div className="theory-table-wrap">
            {isBlockEditable && (
                <div className="table-controls">
                    <button type="button" onClick={handleAddRow} className="ph-btn ph-btn--small table-add-btn">
                        <FontAwesomeIcon icon={faPlus} /> Add Row
                    </button>
                    <button type="button" onClick={handleAddColumn} className="ph-btn ph-btn--small table-add-btn">
                        <FontAwesomeIcon icon={faPlus} /> Add Column
                    </button>
                </div>
            )}
            <table className="theory-table">
                <thead>
                    <tr>
                        {columns.map((c, i) => (
                            <th 
                                key={i}
                                contentEditable={isBlockEditable ? "true" : "false"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleHeaderBlur(e as React.FocusEvent<HTMLElement>, i, c)}
                                className={isBlockEditable ? 'editable-block' : ''}
                            >
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, r) => (
                        <tr key={r}>
                            {columns.map((c, i) => (
                                <td 
                                    key={i}
                                    contentEditable={isBlockEditable ? "true" : "false"}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => handleCellBlur(e as React.FocusEvent<HTMLElement>, r, c)}
                                    className={isBlockEditable ? 'editable-block' : ''}
                                >
                                    {row[c]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// TheoryImage (AGGIORNATO: Input URL e Placeholder Upload)
export const TheoryImage: React.FC<{ src: string; alt?: string; caption?: string } & EditableProps> = ({ src, alt = '', caption, isEditing, onContentUpdate, sectionIndex, blockIndex }) => {
    
    const isEditable = isEditing && onContentUpdate && sectionIndex !== undefined && blockIndex !== undefined;
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => { setCurrentSrc(src); }, [src]);


    const handleSrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSrc(e.target.value);
    };

    const handleSrcBlur = () => {
        if (isEditable && currentSrc !== src) {
            onContentUpdate(sectionIndex, blockIndex, 'src', currentSrc);
        }
    };

    const handleCaptionBlur = (e: React.FocusEvent<HTMLElement>) => {
        if (isEditable && e.target.innerText !== caption) {
            onContentUpdate(sectionIndex, blockIndex, 'caption', e.target.innerText);
        }
    };
    
    // Placeholder per la logica di upload (simulato)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
             const file = e.target.files[0];
             alert(`Simulating upload for file: ${file.name}. Actual implementation requires backend logic.`);
             // In una vera applicazione, qui ci sarebbe la logica di upload e l'onContentUpdate
        }
    };


    if (isEditing) {
        return (
            <figure className="theory-image image-editor-mode editable-block">
                
                <div className="image-controls">
                    {/* Input URL Immagine */}
                    <input
                        type="url"
                        value={currentSrc}
                        onChange={handleSrcChange}
                        onBlur={handleSrcBlur}
                        placeholder="Image URL (http://...)"
                        className="image-url-input"
                    />
                    
                    {/* Placeholder Upload */}
                    <label htmlFor={`upload-${blockIndex}`} className="ph-btn ph-btn--small upload-label">
                        <FontAwesomeIcon icon={faPlus} /> Upload File
                        <input 
                            id={`upload-${blockIndex}`} 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <img 
                    src={currentSrc || "https://via.placeholder.com/200?text=No+Image"} 
                    alt={alt} 
                    style={{ maxWidth: '100%', height: 'auto', border: '2px dashed var(--color-border)' }}
                />
                
                {caption && (
                    <figcaption
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={handleCaptionBlur}
                        className="editable-block"
                    >
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    // Modalità visualizzazione
    return (
        <figure className="theory-image">
            <img src={src} alt={alt} />
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    );
};

export default TheorySection;