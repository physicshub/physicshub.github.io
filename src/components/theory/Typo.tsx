import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faInfoCircle, faExclamationTriangle, faLightbulb, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowDark, stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { BlockMath, InlineMath } from "react-katex";

type Children = { children?: React.ReactNode };

export const TheorySection: React.FC<{ title?: string; className?: string } & Children> = ({ title, children, className }) => (
  <section className={["theory-section", className].filter(Boolean).join(" ")}>
    {title && <h2 className="theory-title">{title}</h2>}
    <div className="theory-blocks">{children}</div>
  </section>
);

export const TheoryParagraph: React.FC<Children> = ({ children }) => (
  <p className="theory-paragraph">{children}</p>
);

export const TheorySubheading: React.FC<Children> = ({ children }) => (
  <h3 className="theory-subheading">{children}</h3>
);

export const TheoryList: React.FC<{ items: React.ReactNode[]; ordered?: boolean }>= ({ items, ordered = false }) =>
  ordered ? (
    <ol className="theory-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ol>
  ) : (
    <ul className="theory-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
  );

export const TheoryFormula: React.FC<{ latex: string; inline?: boolean }> = ({ latex, inline }) => {
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      if (liveRef.current) liveRef.current.textContent = "Copied";
      setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = "";
      }, 1500);
    } catch (e) {}
  };

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
      {inline ? <InlineMath math={latex} /> : <BlockMath math={latex} />}
      <span aria-live="polite" className="visually-hidden" ref={liveRef}></span>
    </div>
  );
};

export const TheoryCodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = "" }) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
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
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };
  {/* <div className="theory-codeblock">
      <div className="code-actions">
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={handleCopy} aria-pressed={copied} title={copied ? "Copied" : "Copy code"}>
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
        </button>
      </div>
      <pre><code className="code-content" data-lang={language}>{code}</code></pre>
    </div> */}
  return (
    <div className='theory-codeblock'>
        <SyntaxHighlighter language={language}
          style={theme === 'light' ? stackoverflowLight : stackoverflowDark}
          customStyle={{ padding: "1rem", fontSize: "15px", borderRadius: "8px"}}
          wrapLongLines={false}>
          {code}
        </SyntaxHighlighter>
      </div>
  );
};

export const TheoryNote: React.FC<Children> = ({ children }) => (
  <div className="theory-note">{children}</div>
);

export const TheoryCallout: React.FC<{ type?: 'info'|'warning'|'tip'|'success'; title?: string } & Children> = ({ type = 'info', title, children }) => {
  const map = {
    info: { icon: faInfoCircle, cls: 'callout-info', label: 'Info' },
    warning: { icon: faExclamationTriangle, cls: 'callout-warning', label: 'Warning' },
    tip: { icon: faLightbulb, cls: 'callout-tip', label: 'Tip' },
    success: { icon: faCheck, cls: 'callout-success', label: 'Success' }
  } as any;
  const cfg = map[type] || map.info;
  return (
    <div className={["theory-callout", cfg.cls].join(" ")} role="note">
      <div className="callout-icon"><FontAwesomeIcon icon={cfg.icon} /></div>
      <div className="callout-body">
        {title && <div className="callout-title">{title}</div>}
        <div className="callout-content">{children}</div>
      </div>
    </div>
  );
};

export const TheoryExample: React.FC<{ title?: string } & Children> = ({ title, children }) => (
  <div className="theory-example">
    {title && <div className="example-title">{title}</div>}
    <div className="example-body">{children}</div>
  </div>
);

export const TheoryTable: React.FC<{ columns: string[]; data: Array<Record<string, any>> }> = ({ columns, data }) => (
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

export const TheoryImage: React.FC<{ src: string; alt?: string; caption?: string }> = ({ src, alt = '', caption }) => (
  <figure className="theory-image">
    <img src={src} alt={alt} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
);

export const TheoryToggle: React.FC<{ title?: string } & Children> = ({ title = 'Details', children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={["theory-toggle", open ? 'open' : ''].join(' ')}>
      <button className="toggle-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="toggle-title">{title}</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
      </button>
      <div className="toggle-panel" style={{ maxHeight: open ? '1000px' : 0 }} aria-hidden={!open}>{children}</div>
    </div>
  );
};

export default TheorySection;
