
const fs = require('fs');
const { XMLValidator } = require('fast-xml-parser');

try {
    const xmlData = fs.readFileSync('sitemap_live.xml', 'utf8');

    // Check for leading whitespace
    if (xmlData.trimStart() !== xmlData) {
        console.log("WARNING: Found leading whitespace/newlines!");
    }

    // Validate
    const result = XMLValidator.validate(xmlData);
    if (result === true) {
        console.log("XML is Valid");
    } else {
        console.log("XML Invalid:", result);
    }
} catch (err) {
    console.error("Error reading file:", err);
}
