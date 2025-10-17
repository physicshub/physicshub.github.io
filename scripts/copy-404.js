// scripts/copy-404.js
import fs from "fs";
import path from "path";

const publicDir = path.resolve("public");
const indexFile = path.join("", "index.html");
const notFoundFile = path.join(publicDir, "404.html");

try {
  fs.copyFileSync(indexFile, notFoundFile);
  console.log("✅ Copied index.html in 404.html");
} catch (err) {
  console.error("❌ Error copying index.html in 404.html:", err);
  process.exit(1);
}
