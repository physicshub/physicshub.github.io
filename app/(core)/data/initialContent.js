// app/(pages)/blog/data/initialContent.js

/**
 * Default structure for the blog post editor. 
 * This JSON structure is processed by the TheoryRenderer component.
 */
export const initialContentData = {
    "sections": [
        {
            "title": "Welcome to the JSON Blog Editor 🚀",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "This editor uses a specific JSON structure that the TheoryRenderer transforms into a readable article. The content is divided into 'sections', and each section contains a list of 'blocks'."
                },
                {
                    "type": "paragraph",
                    "text": "Every block has a 'type' field that defines its nature (e.g., paragraph, formula, code, callout) and specific properties."
                },
                {
                    "type": "callout",
                    "calloutType": "info",
                    "title": "Key Rule",
                    "text": "Always ensure your JSON is properly formatted! Even a single missing or extra comma can cause a parsing error."
                }
            ]
        },
        {
            "title": "1. Standard Blocks (Text and Code)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "For regular text, use the **\"paragraph\"** block type with the **\"text\"** property."
                },
                {
                    "type": "code",
                    "code": "const data = {\n    key: 'value',\n    another: 42\n};",
                    "language": "javascript"
                },
                {
                    "type": "paragraph",
                    "text": "To insert a code block, set the **\"type\"** to **\"code\"** and specify the **\"language\"** property (e.g., javascript, python, css, json) for proper syntax highlighting."
                }
            ]
        },
        {
            "title": "2. How to Write Mathematical Formulas (LaTeX)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "To insert complex mathematical formulas, you must use the **\"formula\"** block type, which supports **LaTeX** syntax via the KaTeX library."
                },
                {
                    "type": "paragraph",
                    "text": "The formula block has two key properties:"
                },
                {
                    "type": "callout",
                    "calloutType": "tip",
                    "title": "Formula Structure",
                    "text": "1. **\"latex\"**: Contains the LaTeX string of your equation.\n2. **\"inline\"**: A boolean. If **true**, the formula is displayed within the text flow. If **false** (recommended for long equations), it's a centered block."
                },
                {
                    "type": "paragraph",
                    "text": "### Block Formula Example (inline: false)"
                },
                {
                    "type": "formula",
                    "latex": "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)",
                    "inline": false
                },
                {
                    "type": "paragraph",
                    "text": "### Inline Formula Example (inline: true)"
                },
                {
                    "type": "paragraph",
                    "text": "The famous Euler's identity is given by:"
                },
                {
                    "type": "formula",
                    "latex": "e^{i\\pi} + 1 = 0",
                    "inline": true
                },
                {
                    "type": "paragraph",
                    "text": "This allows you to mix text and mathematics effectively."
                }
            ]
        }
    ]
};