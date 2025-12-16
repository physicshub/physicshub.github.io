// app/(core)/data/initialContent.js

/**
 * Quick start guide for the Visual Blog Editor
 */
export const initialContentData = {
    "title": "Visual Editor Guide",
    "sections": [
        {
            "blocks": [
                {
                    "type": "sectionTitle",
                    "text": "🎨 Getting Started"
                },
                {
                    "type": "paragraph",
                    "text": "Welcome! This is a **visual editor** where you can edit text directly, drag blocks to reorder them, and add content with one click."
                },
                {
                    "type": "callout",
                    "calloutType": "info",
                    "title": "Two Modes",
                    "text": "Switch between **Visual Editor** (easy editing) and **JSON Editor** (advanced) using the tabs above."
                }
            ]
        },
        {
            "blocks": [
                {
                    "type": "sectionTitle",
                    "text": "✏️ Editing Basics"
                },
                {
                    "type": "paragraph",
                    "text": "**Click any text** to edit it. **Hover over blocks** to reveal controls: drag handle (⋮⋮), duplicate (⎘), and delete (×)."
                },
                {
                    "type": "callout",
                    "calloutType": "tip",
                    "title": "Text Formatting",
                    "text": "Use **double asterisks** for bold: \\*\\*text\\*\\* becomes **text**"
                }
            ]
        },
        {
            "blocks": [
                {
                    "type": "sectionTitle",
                    "text": "➕ Block Types"
                },
                {
                    "type": "paragraph",
                    "text": "Use the **toolbar buttons** at the top to add blocks:"
                },
                {
                    "type": "list",
                    "items": [
                        "**¶** Paragraph - Regular text",
                        "**H** Section Title - Large section heading (H2)",
                        "**H** Heading - Subsection title (H3)",
                        "**</>** Code - Syntax highlighted code",
                        "**√** Formula - LaTeX math equations",
                        "**≡** List - Bullet or numbered lists",
                        "**ⓘ** Callout - Info, warning, tip, success boxes",
                        "**⊞** Table - Editable data tables",
                        "**⊡** Image - Images with captions"
                    ],
                    "ordered": false
                }
            ]
        },
        {
            "blocks": [
                {
                    "type": "sectionTitle",
                    "text": "📝 Examples"
                },
                {
                    "type": "code",
                    "code": "// Code with syntax highlighting\nconst hello = () => {\n  console.log('Hello!');\n};",
                    "language": "javascript"
                },
                {
                    "type": "formula",
                    "latex": "E = mc^2",
                    "inline": false
                },
                {
                    "type": "table",
                    "columns": ["Feature", "Status"],
                    "data": [
                        { "Feature": "Direct Editing", "Status": "✓" },
                        { "Feature": "Drag & Drop", "Status": "✓" },
                        { "Feature": "Bold Text", "Status": "✓" }
                    ]
                },
                {
                    "type": "callout",
                    "calloutType": "success",
                    "title": "Ready!",
                    "text": "Delete this guide and start creating your content!"
                }
            ]
        }
    ]
};