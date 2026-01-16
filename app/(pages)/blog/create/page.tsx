// app/(pages)/blog/create/page.tsx
"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faEdit,
  faSave,
  faArrowLeft,
  faTrash,
  faParagraph,
  faHeading,
  faSquareRootAlt,
  faListOl,
  faInfoCircle,
  faQuoteRight,
  faTable,
  faImage,
  faChevronCircleDown,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer";
import dynamic from "next/dynamic";
import { initialContentData } from "../../../(core)/data/initialContent";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { BlogContent } from "../../../(core)/components/theory/types";

// --- INTERFACCE TYPESCRIPT ---
interface Block {
  id?: string;
  type: string;
  text?: string;
  code?: string;
  language?: string;
  latex?: string;
  inline?: boolean;
  items?: string[];
  ordered?: boolean;
  calloutType?: string;
  title?: string;
  content?: string;
  columns?: string[];
  data?: any[];
  src?: string;
  alt?: string;
  caption?: string;
  level?: number;
}

const DynamicEditor = dynamic(
  () => import("../../../(core)/components/Editor"),
  { ssr: false }
);

const objectToJSString = (obj: any, indent = 2): string => {
  const spacing = " ".repeat(indent);

  if (Array.isArray(obj)) {
    return (
      "[\n" +
      obj
        .map((item) => spacing + "  " + objectToJSString(item, indent + 2))
        .join(",\n") +
      "\n" +
      spacing +
      "]"
    );
  }

  if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj);
    const objectString = keys
      .map((key) => {
        const value = objectToJSString(obj[key], indent + 2);
        const safeKey = /^[a-z$_][a-z0-9$_]*$/i.test(key) ? key : `"${key}"`;
        return `${spacing}  ${safeKey}: ${value.trimStart()}`;
      })
      .join(",\n");
    return "{\n" + objectString + "\n" + spacing + "}";
  }

  return JSON.stringify(obj);
};

const jsStringToObject = (str: string): any => {
  try {
    return new Function(`return ${str}`)();
  } catch (e) {
    throw new Error("Sintassi JS non valida");
  }
};

// Block Templates
const NEW_BLOCK_TEMPLATES = {
  paragraph: {
    type: "paragraph",
    text: "New paragraph content. Use **double asterisks** for bold.",
  },
  subheading: { type: "subheading", text: "New Subheading Title" },
  subtitle: { type: "subtitle", text: "New Subtitle Level 1", level: 1 },
  sectionTitle: { type: "sectionTitle", text: "New Section Title" },
  code: {
    type: "code",
    code: "console.log('Hello World!');",
    language: "javascript",
  },
  formula: {
    type: "formula",
    latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    inline: false,
  },
  note: { type: "note", text: "New Note or important information." },
  list: {
    type: "list",
    items: ["New Item 1", "New Item 2", "New Item 3"],
    ordered: false,
  },
  callout: {
    type: "callout",
    calloutType: "info",
    title: "Information",
    text: "This is a new callout block.",
  },
  example: {
    type: "example",
    title: "Example Title",
    content: "Example content here.",
  },
  table: {
    type: "table",
    columns: ["Header 1", "Header 2"],
    data: [
      { "Header 1": "Row 1 Col 1", "Header 2": "Row 1 Col 2" },
      { "Header 1": "Row 2 Col 1", "Header 2": "Row 2 Col 2" },
    ],
  },
  image: {
    type: "image",
    src: "https://placehold.co/600x400/black/white",
    alt: "Placeholder Image",
    caption: "New Image Caption",
  },
  toggle: {
    type: "toggle",
    title: "Toggle Details",
    content: "Hidden content visible on click.",
  },
};

// --- COMPONENTE 1: VISUAL EDITOR (Modifica) ---
const VisualEditorRenderer: React.FC<{
  dataContent: BlogContent;
  setDataContent: React.Dispatch<React.SetStateAction<BlogContent>>;
}> = ({ dataContent, setDataContent }) => {
  const handleContentUpdate = useCallback(
    (
      sectionIndex: number,
      blockIndex: number,
      field: string,
      newValue: any
    ) => {
      const newData = { ...dataContent };

      if (sectionIndex === -1 && field === "title") {
        newData.title = newValue;
      } else if (newData.sections[sectionIndex]?.blocks[blockIndex]) {
        const newSections = [...newData.sections];
        const newBlocks = [...newSections[sectionIndex].blocks];

        newBlocks[blockIndex] = {
          ...newBlocks[blockIndex],
          [field]: newValue,
        };

        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          blocks: newBlocks,
        };

        newData.sections = newSections;
      }

      setDataContent(newData);
    },
    [dataContent, setDataContent]
  );

  const handleDeleteBlock = useCallback(
    (sectionIndex: number, blockIndex: number) => {
      if (!window.confirm("Are you sure?")) return;

      const newData = { ...dataContent };
      const newSections = [...newData.sections];
      const newBlocks = [...newSections[sectionIndex].blocks];

      newBlocks.splice(blockIndex, 1);
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        blocks: newBlocks,
      };
      newData.sections = newSections;

      setDataContent(newData);
    },
    [dataContent, setDataContent]
  );

  const handleDuplicateBlock = useCallback(
    (sectionIndex: number, blockIndex: number) => {
      try {
        if (dataContent.sections[sectionIndex]?.blocks[blockIndex]) {
          const blockToDuplicate =
            dataContent.sections[sectionIndex].blocks[blockIndex];
          const duplicatedBlock = { ...blockToDuplicate };
          dataContent.sections[sectionIndex].blocks.splice(
            blockIndex + 1,
            0,
            duplicatedBlock
          );
          setDataContent({ ...dataContent });
        }
      } catch (e) {
        console.error("Error duplicating block:", e);
      }
    },
    [dataContent, setDataContent]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      try {
        const activeMatch = String(active.id).match(/^s(\d+)-b(\d+)$/);
        const overMatch = String(over.id).match(/^s(\d+)-b(\d+)$/);

        if (!activeMatch || !overMatch) return;

        const activeSec = parseInt(activeMatch[1]);
        const activeBlock = parseInt(activeMatch[2]);
        const overSec = parseInt(overMatch[1]);
        const overBlock = parseInt(overMatch[2]);

        if (activeSec === overSec) {
          const blocks = dataContent.sections[activeSec].blocks;
          const reorderedBlocks = arrayMove(blocks, activeBlock, overBlock);
          dataContent.sections[activeSec].blocks = reorderedBlocks;
          setDataContent({ ...dataContent });
        }
      } catch (e) {
        console.error("Error in drag operation:", e);
      }
    },
    [dataContent, setDataContent]
  );

  try {
    if (!dataContent?.sections || !Array.isArray(dataContent.sections)) {
      return (
        <div className="preview-error">
          Error: JS structure must contain 'sections'.
        </div>
      );
    }

    const dndItems = dataContent.sections.flatMap((sec: any, i: number) =>
      sec.blocks.map((_: any, j: number) => `s${i}-b${j}`)
    );

    return (
      <div className="preview-output edit-mode">
        <div className="blog-main-title-editor">
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleContentUpdate(-1, -1, "title", e.currentTarget.innerText)
            }
            className="main-blog-title editable-block"
          >
            {dataContent.title || "Untitled Blog"}
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
              theory={dataContent}
              isEditing={true} // Modalità Edit
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
    return (
      <div className="preview-error">
        Error parsing JS: {(e as Error).message}
      </div>
    );
  }
};

// --- COMPONENTE 2: LIVE PREVIEW (Sola Lettura) ---
const LivePreviewRenderer: React.FC<{
  dataContent: BlogContent;
}> = ({ dataContent }) => {
  try {
    if (!dataContent?.sections || !Array.isArray(dataContent.sections)) {
      return (
        <div className="preview-error">
          Error: JS structure must contain 'sections'.
        </div>
      );
    }

    return (
      <div className="preview-output read-mode">
        <h1 className="main-blog-title">
          {dataContent.title || "Untitled Blog"}
        </h1>

        <TheoryRenderer
          theory={dataContent}
          isEditing={false} // Modalità Read-Only
          onContentUpdate={() => {}}
        />
      </div>
    );
  } catch (e) {
    return (
      <div className="preview-error">
        Error parsing JS: {(e as Error).message}
      </div>
    );
  }
};

// Main Component
export default function CreateBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("New Blog Title");
  const [dataContent, setDataContent] = useState<BlogContent>(
    initialContentData as BlogContent
  );
  const [viewMode, setViewMode] = useState<"Editor" | "JS" | "Preview">(
    "Editor"
  );

  const jsTitle = useMemo(() => {
    try {
      return dataContent.title || "New Blog Title";
    } catch (e) {
      return "New Blog Title";
    }
  }, [dataContent]);

  const dataContentString = useMemo(
    () => objectToJSString(dataContent),
    [dataContent]
  );

  useEffect(() => {
    setTitle(jsTitle);
  }, [jsTitle]);

  const handleAddBlock = useCallback(
    (blockType: keyof typeof NEW_BLOCK_TEMPLATES) => {
      const newBlock = JSON.parse(
        JSON.stringify(NEW_BLOCK_TEMPLATES[blockType])
      );

      newBlock.id = crypto.randomUUID();

      setDataContent((prev) => {
        if (prev.sections.length === 0) return prev;
        const newSections = [...prev.sections];
        newSections[0] = {
          ...newSections[0],
          blocks: [newBlock, ...newSections[0].blocks],
        };
        return { ...prev, sections: newSections };
      });
    },
    [setDataContent]
  );

  const handleClearAllBlocks = useCallback(() => {
    if (
      !window.confirm(
        "Delete ALL blocks and section titles? This cannot be undone!"
      )
    )
      return;

    try {
      const newData = { ...dataContent };
      newData.sections = newData.sections.map((section: any) => ({
        blocks: [],
      }));
      setDataContent(newData);
    } catch (e) {
      console.error("Error clearing blocks:", e);
    }
  }, [dataContent, setDataContent]);

  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = useCallback(async () => {
    setIsPublishing(true);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          dataContent: dataContent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          "Richiesta inviata con successo! Il blog sarà online dopo la revisione."
        );
        router.push("/blog"); // Torna alla lista
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
      alert("Errore durante la pubblicazione. Riprova più tardi.");
    } finally {
      setIsPublishing(false);
    }
  }, [dataContent, title, router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    setDataContent({
      ...dataContent,
      title: newTitle,
    });
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
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
              className={`tab-button ${viewMode === "Editor" ? "active" : ""}`}
              onClick={() => setViewMode("Editor")}
              disabled={viewMode === "Editor" && !dataContent}
            >
              <FontAwesomeIcon icon={faEdit} /> Visual Editor
            </button>
            <button
              type="button"
              className={`tab-button ${viewMode === "JS" ? "active" : ""}`}
              onClick={() => setViewMode("JS")}
            >
              <FontAwesomeIcon icon={faCode} /> JS Editor
            </button>
            <button
              type="button"
              className={`tab-button ${viewMode === "Preview" ? "active" : ""}`}
              onClick={() => setViewMode("Preview")}
            >
              <FontAwesomeIcon icon={faEye} /> Preview
            </button>

            {viewMode === "Editor" && (
              <>
                <div className="add-block-controls">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("paragraph")}
                    className="add-block-btn"
                    title="Add Paragraph"
                  >
                    <FontAwesomeIcon icon={faParagraph} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("sectionTitle")}
                    className="add-block-btn"
                    title="Add Section Title"
                  >
                    <FontAwesomeIcon
                      icon={faHeading}
                      style={{ fontSize: "1.2em" }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("subheading")}
                    className="add-block-btn"
                    title="Add H3 Subheading"
                  >
                    <FontAwesomeIcon icon={faHeading} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("subtitle")}
                    className="add-block-btn"
                    title="Add H4/H5 Subtitle"
                  >
                    <FontAwesomeIcon
                      icon={faHeading}
                      style={{ fontSize: "0.8em" }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("code")}
                    className="add-block-btn"
                    title="Add Code Block"
                  >
                    <FontAwesomeIcon icon={faCode} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("formula")}
                    className="add-block-btn"
                    title="Add Formula (LaTeX)"
                  >
                    <FontAwesomeIcon icon={faSquareRootAlt} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("list")}
                    className="add-block-btn"
                    title="Add List"
                  >
                    <FontAwesomeIcon icon={faListOl} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("callout")}
                    className="add-block-btn"
                    title="Add Callout/Note"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("example")}
                    className="add-block-btn"
                    title="Add Example/Quote"
                  >
                    <FontAwesomeIcon icon={faQuoteRight} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("table")}
                    className="add-block-btn"
                    title="Add Table"
                  >
                    <FontAwesomeIcon icon={faTable} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("image")}
                    className="add-block-btn"
                    title="Add Image"
                  >
                    <FontAwesomeIcon icon={faImage} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("toggle")}
                    className="add-block-btn"
                    title="Add Toggle/Spoiler"
                  >
                    <FontAwesomeIcon icon={faChevronCircleDown} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClearAllBlocks}
                  className="clear-all-btn-toolbar"
                  title="Delete all blocks"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>

          <div className="content-area">
            {viewMode === "JS" && (
              <div className="form-group full-height">
                <DynamicEditor
                  value={dataContentString}
                  onChange={(newString: string) => {
                    try {
                      const parsed = jsStringToObject(newString);
                      if (parsed && typeof parsed === "object") {
                        setDataContent(parsed);
                      }
                    } catch (e) {
                      // Silenzioso durante la digitazione per evitare crash
                    }
                  }}
                />
              </div>
            )}

            {viewMode === "Editor" && (
              <VisualEditorRenderer
                dataContent={dataContent}
                setDataContent={setDataContent}
              />
            )}

            {viewMode === "Preview" && (
              <LivePreviewRenderer dataContent={dataContent} />
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
