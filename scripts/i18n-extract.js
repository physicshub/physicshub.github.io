// scripts/i18n-extract.js — `npm run i18n:extract`
//
// Collects every translatable string in the app and keeps the locale files in
// step with the code. Zero dependencies (the i18next-parser config this script
// replaces never existed in the repo).
//
// A translatable string is, as hooks/useTranslation.ts treats it, an English
// sentence used as its own key:
//   - a string literal passed straight to t():      t("Sign in")
//   - a literal inside a `popupContent={{ … }}` prop — Popup runs t() on its
//     title and description itself;
//   - a literal marked `/* i18n */ "…"` — for strings that reach t() through a
//     variable (error messages, formatted values).
//
// What it does:
//   1. adds every key missing from en.json (value = the key itself);
//   2. lists, per locale marked `completed` in meta.json, the keys it lacks —
//      those languages hide the Google Translate widget, so a missing key
//      shows up in English. Translate them by hand.
// Pass --check to only report (exit 1 if anything is missing), e.g. in CI.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LOCALES = join(ROOT, "app/(core)/locales");
const SOURCES = ["app", "simulations"];
const EXTENSIONS = /\.(jsx?|tsx?)$/;
const CHECK_ONLY = process.argv.includes("--check");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (EXTENSIONS.test(name)) files.push(path);
  }
  return files;
}

// JS string literal body → its value (enough for the escapes used in UI copy).
const unescape = (body) =>
  body.replace(/\\(["'`\\])/g, "$1").replace(/\\n/g, "\n");

const T_CALL = /\bt\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1\s*[,)]/g;
const LITERAL = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
const MARKED = /\/\*\s*i18n\s*\*\/\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;

function extract(source) {
  const keys = new Set();

  for (const pattern of [T_CALL, MARKED]) {
    for (const [, quote, body] of source.matchAll(pattern)) {
      if (quote === "`" && body.includes("${")) continue;
      keys.add(unescape(body));
    }
  }

  // popupContent={{ title: "…", description: "…" }} — including literals in a
  // ternary (`copied ? "Link copied!" : "Share this simulation"`).
  let from = 0;
  while ((from = source.indexOf("popupContent={{", from)) !== -1) {
    const end = source.indexOf("}}", from);
    if (end === -1) break;
    const block = source.slice(from, end);
    for (const [, quote, body] of block.matchAll(LITERAL)) {
      if (quote === "`" && body.includes("${")) continue;
      if (/^(primary|secondary)$/.test(body)) continue; // button types
      keys.add(unescape(body));
    }
    from = end;
  }

  return keys;
}

const found = new Map(); // key → first file it appears in
for (const dir of SOURCES) {
  for (const file of walk(join(ROOT, dir))) {
    for (const key of extract(readFileSync(file, "utf8"))) {
      if (key.trim() && !found.has(key)) found.set(key, relative(ROOT, file));
    }
  }
}

const readJson = (name) =>
  JSON.parse(readFileSync(join(LOCALES, name), "utf8"));
// Existing order is kept (new keys are appended) so diffs stay readable.
const writeJson = (name, data) =>
  writeFileSync(join(LOCALES, name), JSON.stringify(data, null, 2) + "\n");

const meta = readJson("meta.json");
let missingTotal = 0;

// 1. en.json: add missing keys.
const en = readJson("en.json");
const newKeys = [...found.keys()].filter((key) => !(key in en));
if (newKeys.length > 0) {
  missingTotal += newKeys.length;
  console.log(`en.json: ${newKeys.length} new key(s)`);
  for (const key of newKeys)
    console.log(`  + ${JSON.stringify(key)}  (${found.get(key)})`);
  if (!CHECK_ONLY) {
    for (const key of newKeys) en[key] = key;
    writeJson("en.json", en);
  }
}

// 2. Completed locales: report what needs a human translation.
for (const [lang, info] of Object.entries(meta)) {
  if (lang === "en" || !info.completed) continue;
  const locale = readJson(`${lang}.json`);
  const missing = [...found.keys()].filter((key) => !(key in locale));
  if (missing.length === 0) continue;
  missingTotal += missing.length;
  console.log(
    `\n${lang}.json (${info.name}): ${missing.length} key(s) to translate`
  );
  for (const key of missing) console.log(`  - ${JSON.stringify(key)}`);
}

if (missingTotal === 0) console.log("All locales are up to date.");
if (CHECK_ONLY && missingTotal > 0) process.exit(1);
