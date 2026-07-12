// app/(pages)/blog/create/page.tsx
"use client";
import React, { useState, useCallback, useMemo } from "react";
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
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer";
import useTranslation from "../../../(core)/hooks/useTranslation.ts";
import TAGS from "@/app/(core)/data/tags.js";
import Tag from "@/app/(core)/components/Tag.jsx";
import dynamic from "next/dynamic";
import { initialContentData } from "../../../(core)/data/initialContent";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { BlogContent } from "../../../(core)/components/theory/types";
import AuthStatus from "../../../(core)/components/AuthStatus";

// --- INTERFACCE TYPESCRIPT ---

const DynamicEditor = dynamic(
  () => import("../../../(core)/components/Editor"),
  { ssr: false }
);

const objectToJSString = (obj: unknown, indent = 2): string => {
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
        const value = objectToJSString(
          (obj as Record<string, unknown>)[key],
          indent + 2
        );
        const safeKey = /^[a-z$_][a-z0-9$_]*$/i.test(key) ? key : `"${key}"`;
        return `${spacing}  ${safeKey}: ${value.trimStart()}`;
      })
      .join(",\n");
    return "{\n" + objectString + "\n" + spacing + "}";
  }

  return JSON.stringify(obj);
};

const jsStringToObject = (str: string, t: (k: string) => string): unknown => {
  try {
    return new Function(`return ${str}`)();
  } catch {
    throw new Error(t("Invalid JS syntax"));
  }
};

const createThumbnailDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 675;
        const scale = Math.min(
          maxWidth / image.width,
          maxHeight / image.height,
          1
        );
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to prepare thumbnail"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => reject(new Error("Invalid image file"));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });

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
  t: (k: string) => string;
}> = ({ dataContent, setDataContent, t }) => {
  const handleContentUpdate = useCallback(
    (
      sectionIndex: number,
      blockIndex: number,
      field: string,
      newValue: unknown
    ) => {
      const newData = { ...dataContent };

      if (sectionIndex === -1 && field === "title") {
        newData.title = newValue as string;
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
      if (!window.confirm(t("Are you sure?"))) return;

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
    [dataContent, setDataContent, t]
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
          {t("Error: JS structure must contain 'sections'.")}
        </div>
      );
    }

    const dndItems = dataContent.sections.flatMap((sec, i: number) =>
      sec.blocks.map((_, j: number) => `s${i}-b${j}`)
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
            {dataContent.title || t("Untitled Blog")}
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
        {t("Error parsing JS:")} {(e as Error).message}
      </div>
    );
  }
};

// --- COMPONENTE 2: LIVE PREVIEW (Sola Lettura) ---
const LivePreviewRenderer: React.FC<{
  dataContent: BlogContent;
  t: (k: string) => string;
}> = ({ dataContent, t }) => {
  try {
    if (!dataContent?.sections || !Array.isArray(dataContent.sections)) {
      return (
        <div className="preview-error">
          {t("Error: JS structure must contain 'sections'.")}
        </div>
      );
    }

    return (
      <div className="preview-output read-mode">
        <h1 className="main-blog-title">
          {dataContent.title || t("Untitled Blog")}
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
        {t("Error parsing JS:")} {(e as Error).message}
      </div>
    );
  }
};

// Main Component
export default function CreateBlogPage() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const router = useRouter();
  const [dataContent, setDataContent] = useState<BlogContent>(
    initialContentData as BlogContent
  );
  const [viewMode, setViewMode] = useState<"Editor" | "JS" | "Preview">(
    "Editor"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dataContentString = useMemo(
    () => objectToJSString(dataContent),
    [dataContent]
  );

  const handleAddBlock = useCallback(
    (blockType: keyof typeof NEW_BLOCK_TEMPLATES) => {
      const template = NEW_BLOCK_TEMPLATES[blockType];
      const newBlock = JSON.parse(JSON.stringify(template));

      // Translate template defaults if they exist
      if (newBlock.text) newBlock.text = t(newBlock.text);
      if (newBlock.title) newBlock.title = t(newBlock.title);
      if (newBlock.caption) newBlock.caption = t(newBlock.caption);
      if (newBlock.content) newBlock.content = t(newBlock.content);
      if (newBlock.items)
        newBlock.items = newBlock.items.map((it: string) => t(it));
      if (newBlock.data) {
        newBlock.data = newBlock.data.map((row: Record<string, string>) => {
          const newRow: Record<string, string> = {};
          Object.keys(row).forEach((k) => {
            newRow[t(k)] = t(row[k]);
          });
          return newRow;
        });
      }
      if (newBlock.columns)
        newBlock.columns = newBlock.columns.map((col: string) => t(col));

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
    [setDataContent, t]
  );

  const handleClearAllBlocks = useCallback(() => {
    if (
      !window.confirm(
        t("Delete ALL blocks and section titles? This cannot be undone!")
      )
    )
      return;

    try {
      const newData = { ...dataContent };
      newData.sections = newData.sections.map(() => ({
        blocks: [],
      }));
      setDataContent(newData);
    } catch (e) {
      console.error("Error clearing blocks:", e);
    }
  }, [dataContent, setDataContent, t]);

  const handleSave = useCallback(async () => {
    if (!dataContent.title?.trim()) {
      alert("Please enter a blog title");
      return;
    }

    if (!dataContent.desc?.trim()) {
      alert("Please enter a blog description");
      return;
    }

    if (!dataContent.tags || dataContent.tags.length < 2) {
      alert("Please select at least 2 tags");
      return;
    }

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonContent: dataContent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          t("Request sent successfully! The blog will be online after review.")
        );
        router.push("/blog"); // Torna alla lista
      } else if (result.requiresAuth) {
        alert("Please sign in with GitHub first, then try saving again.");
        window.location.href = "/api/auth/github";
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
      alert(t("Error during publication. Please try again later."));
    } finally {
    }
  }, [dataContent, router, t]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;

    setDataContent({
      ...dataContent,
      title: newTitle,
    });
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;

    setDataContent({
      ...dataContent,
      desc: newDescription,
    });
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(t("Please upload an image file."));
      e.target.value = "";
      return;
    }

    try {
      const thumbnail = await createThumbnailDataUrl(file);
      setDataContent((prev) => ({
        ...prev,
        thumbnail,
      }));
    } catch (error) {
      console.error("Error preparing thumbnail:", error);
      alert(t("Could not prepare this thumbnail. Please try another image."));
    } finally {
      e.target.value = "";
    }
  };

  const handleThumbnailRemove = () => {
    setDataContent((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  return (
    <div
      className={`create-blog-container ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="top-controls-bar">
        <button
          onClick={() => router.back()}
          className="btn-glow back-to-home__link"
          aria-label={t("Back to Blog List")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> {t("Back")}
        </button>
        <h1 className="editor-title">{t("New Blog")}</h1>
        <button
          onClick={handleSave}
          className="ph-btn ph-btn--primary cursor-pointer save-button-top"
          type="button"
          disabled={!isAuthenticated}
          title={
            !isAuthenticated ? "Sign in with GitHub to publish" : undefined
          }
        >
          <FontAwesomeIcon icon={faSave} /> {t("Save")}
        </button>
      </div>

      <AuthStatus
        onAuthChange={(state) => setIsAuthenticated(state.authenticated)}
      />

      <main className="blog-editor-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="form-group title-group">
            <label htmlFor="title">{t("Title:")}</label>
            <input
              id="title"
              type="text"
              placeholder={t("Title for your blog...")}
              value={dataContent.title}
              onChange={handleTitleChange}
              required
            />
          </div>
          <div className="form-group title-group">
            <label htmlFor="desc">{t("Desc:")}</label>
            <input
              id="desc"
              type="text"
              placeholder={t("Write a brief summary of your blog...")}
              value={dataContent.desc}
              onChange={handleDescriptionChange}
              required
            />
          </div>
          <div className="form-group title-group thumbnail-upload-group">
            <label htmlFor="thumbnail-upload">{t("Blog thumbnail:")}</label>
            <div className="thumbnail-upload-card">
              {dataContent.thumbnail ? (
                // Thumbnail may be a local data URL or external URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataContent.thumbnail}
                  alt={t("Blog thumbnail preview")}
                  className="thumbnail-upload-preview"
                />
              ) : (
                <div className="thumbnail-upload-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>{t("No thumbnail selected")}</span>
                </div>
              )}

              <div className="thumbnail-upload-actions">
                <label
                  htmlFor="thumbnail-upload"
                  className="ph-btn ph-btn--ghost thumbnail-upload-button"
                >
                  <FontAwesomeIcon icon={faUpload} />
                  {t("Upload thumbnail")}
                </label>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="thumbnail-upload-input"
                />
                {dataContent.thumbnail && (
                  <button
                    type="button"
                    className="ph-btn ph-btn--ghost thumbnail-remove-button"
                    onClick={handleThumbnailRemove}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    {t("Remove")}
                  </button>
                )}
              </div>
            </div>
          </div>
          {dataContent.tags.length > 0 && (
            <div className="mb-4">
              <label className="block mb-2">
                Selected Tags ({dataContent.tags.length})
              </label>

              <div className="flex gap-2 flex-wrap mb-3!">
                {dataContent.tags.map((tagKey) => {
                  const tag = TAGS[tagKey as keyof typeof TAGS];

                  return (
                    <div key={tagKey} className="flex items-center gap-1">
                      <Tag tag={tag} />

                      <button
                        type="button"
                        onClick={() =>
                          setDataContent((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tagKey),
                          }))
                        }
                        className="remove-tag-btn mb-2! "
                      >
                        <svg
                          data-prefix="fas"
                          data-icon="circle-xmark"
                          className="svg-inline--fa fa-circle-xmark"
                          role="img"
                          viewBox="0 0 512 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mb-16!">
            <label>Add Tags</label>

            <div className="flex gap-4 overflow-x-auto whitespace-nowrap px-3! py-3! hide-scrollbar">
              {Object.entries(TAGS).map(([key, tag]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setDataContent((prev) => ({
                      ...prev,
                      tags: prev.tags.includes(key)
                        ? prev.tags.filter((t) => t !== key)
                        : [...prev.tags, key],
                    }));
                  }}
                  className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                    dataContent.tags.includes(key)
                      ? "opacity-100"
                      : "opacity-70"
                  }`}
                >
                  <Tag tag={tag} />

                  {dataContent.tags.includes(key) && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-button ${viewMode === "Editor" ? "active" : ""}`}
              onClick={() => setViewMode("Editor")}
              disabled={viewMode === "Editor" && !dataContent}
            >
              <FontAwesomeIcon icon={faEdit} /> {t("Visual Editor")}
            </button>
            <button
              type="button"
              className={`tab-button ${viewMode === "JS" ? "active" : ""}`}
              onClick={() => setViewMode("JS")}
            >
              <FontAwesomeIcon icon={faCode} /> {t("JS Editor")}
            </button>
            <button
              type="button"
              className={`tab-button ${viewMode === "Preview" ? "active" : ""}`}
              onClick={() => setViewMode("Preview")}
            >
              <FontAwesomeIcon icon={faEye} /> {t("Preview")}
            </button>

            {viewMode === "Editor" && (
              <>
                <div className="add-block-controls">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("paragraph")}
                    className="add-block-btn"
                    title={t("Add Paragraph")}
                  >
                    <FontAwesomeIcon icon={faParagraph} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("sectionTitle")}
                    className="add-block-btn"
                    title={t("Add Section Title")}
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
                    title={t("Add H3 Subheading")}
                  >
                    <FontAwesomeIcon icon={faHeading} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("subtitle")}
                    className="add-block-btn"
                    title={t("Add H4/H5 Subtitle")}
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
                    title={t("Add Code Block")}
                  >
                    <FontAwesomeIcon icon={faCode} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("formula")}
                    className="add-block-btn"
                    title={t("Add Formula (LaTeX)")}
                  >
                    <FontAwesomeIcon icon={faSquareRootAlt} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("list")}
                    className="add-block-btn"
                    title={t("Add List")}
                  >
                    <FontAwesomeIcon icon={faListOl} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("callout")}
                    className="add-block-btn"
                    title={t("Add Callout/Note")}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("example")}
                    className="add-block-btn"
                    title={t("Add Example/Quote")}
                  >
                    <FontAwesomeIcon icon={faQuoteRight} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("table")}
                    className="add-block-btn"
                    title={t("Add Table")}
                  >
                    <FontAwesomeIcon icon={faTable} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("image")}
                    className="add-block-btn"
                    title={t("Add Image")}
                  >
                    <FontAwesomeIcon icon={faImage} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("toggle")}
                    className="add-block-btn"
                    title={t("Add Toggle/Spoiler")}
                  >
                    <FontAwesomeIcon icon={faChevronCircleDown} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClearAllBlocks}
                  className="clear-all-btn-toolbar"
                  title={t("Delete all blocks")}
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
                      const parsed = jsStringToObject(newString, t);
                      if (parsed && typeof parsed === "object") {
                        setDataContent(parsed as BlogContent);
                      }
                    } catch {
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
                t={t}
              />
            )}

            {viewMode === "Preview" && (
              <LivePreviewRenderer dataContent={dataContent} t={t} />
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
