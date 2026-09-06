// generate-feeds.js
//
// Two build artifacts that make the site legible to machines that are not
// Googlebot:
//   public/feed.xml  — Atom 1.0 feed of the blog, for readers and AI crawlers
//                       that subscribe to sources.
//   public/llms.txt  — the llmstxt.org convention: a flat, link-first map of the
//                       site's primary content for LLM agents.
//
// Runs before `next build` (see package.json) so the export in out/ picks the
// files up. Mirrors scripts/sitemap-generator.js: same imports, same dual write
// to public/ and out/, xml-formatter as a parse-check.

import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import xmlFormat from "xml-formatter";

import { blogsArray } from "../app/(core)/data/articles/index.js";
import chapters from "../app/(core)/data/chapters.js";
import simulationOverviews from "../app/(core)/data/simulationOverviews.js";
import { resolveAuthor } from "../app/(core)/data/authors.js";
import { SITE_URL, SITE_NAME } from "../app/(core)/constants/site.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");
const outDir = join(__dirname, "../out");

const SITE_TAGLINE =
  "Free, open-source interactive physics simulations with written theory for students, teachers and developers.";

// Article `date` / `updated` are authored as DD/MM/YYYY. Return an RFC 3339
// timestamp (Atom requires a time), or the build time when unparseable.
const buildNow = new Date().toISOString();
function toRFC3339(value) {
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const iso = `${m[3]}-${m[2]}-${m[1]}`;
      if (!Number.isNaN(Date.parse(iso))) return `${iso}T00:00:00Z`;
    }
  }
  return buildNow;
}

const escapeXml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getSimId = (link) =>
  link.split("/simulations/")[1]?.split(/[?#]/)[0] || "";

// Newest first, by last substantive edit.
const sortedBlogs = [...blogsArray].sort(
  (a, b) =>
    Date.parse(toRFC3339(b.updated || b.date)) -
    Date.parse(toRFC3339(a.updated || a.date))
);

function writeBoth(name, content) {
  writeFileSync(join(publicDir, name), content);
  if (existsSync(outDir)) writeFileSync(join(outDir, name), content);
}

// ─── feed.xml (Atom 1.0) ─────────────────────────────────────────────────────
function buildAtom() {
  const updated = sortedBlogs.length
    ? toRFC3339(sortedBlogs[0].updated || sortedBlogs[0].date)
    : buildNow;

  const entries = sortedBlogs
    .map((blog) => {
      const url = `${SITE_URL}/blog/${blog.slug}`;
      const author = resolveAuthor(blog.author);
      const categories = (blog.tags || [])
        .map((t) => t?.name)
        .filter(Boolean)
        .map((n) => `    <category term="${escapeXml(n)}" />`)
        .join("\n");
      return `  <entry>
    <title>${escapeXml(blog.name)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${toRFC3339(blog.date)}</published>
    <updated>${toRFC3339(blog.updated || blog.date)}</updated>
    <summary>${escapeXml(blog.desc)}</summary>
    <author><name>${escapeXml(author.name)}</name></author>
${categories}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_NAME)} Blog</title>
  <subtitle>${escapeXml(SITE_TAGLINE)}</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self" />
  <link href="${SITE_URL}/blog" />
  <id>${SITE_URL}/blog</id>
  <updated>${updated}</updated>
${entries}
</feed>
`;

  // Parse-check: xml-formatter throws on markup it cannot parse.
  xmlFormat(xml);
  return xml;
}

// ─── llms.txt (llmstxt.org) ──────────────────────────────────────────────────
function buildLlmsTxt() {
  const indexableChapters = chapters.filter(
    (c) => c.level !== "tool" && getSimId(c.link) !== "test"
  );

  const line = (label, url, desc) =>
    `- [${label}](${url})${desc ? `: ${desc.replace(/\s+/g, " ").trim()}` : ""}`;

  const articles = sortedBlogs
    .map((b) => line(b.name, `${SITE_URL}/blog/${b.slug}`, b.desc))
    .join("\n");

  const sims = indexableChapters
    .map((c) => line(c.name, `${SITE_URL}${c.link}`, c.desc))
    .join("\n");

  const concepts = indexableChapters
    .map((c) => {
      const ov = simulationOverviews[getSimId(c.link)];
      return ov?.intro
        ? line(`${c.name} — concept`, `${SITE_URL}${c.link}`, ov.intro)
        : null;
    })
    .filter(Boolean)
    .join("\n");

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_NAME} hosts ${indexableChapters.length} browser-based physics simulations built on a custom, in-house physics engine, each paired with a written explainer. Physics is in SI units, Y-up. All content is free and released under the MIT licence.

## Articles
${articles}

## Simulations
${sims}

## Simulation concepts
${concepts}

## About
${line("About PhysicsHub", `${SITE_URL}/about`, "Who builds PhysicsHub, why it exists, and how the engine works.")}
${line("Contribute", `${SITE_URL}/contribute`, "How to add a simulation, write theory, or translate the site.")}

## Optional
${line("Sitemap", `${SITE_URL}/sitemap.xml`)}
${line("Atom feed", `${SITE_URL}/feed.xml`)}
`;
}

function main() {
  if (!existsSync(publicDir)) {
    console.error("❌ public/ not found — run from the repo root");
    process.exit(1);
  }
  writeBoth("feed.xml", buildAtom());
  console.log(`✅ feed.xml — ${sortedBlogs.length} entries`);
  writeBoth("llms.txt", buildLlmsTxt());
  console.log("✅ llms.txt");
}

try {
  main();
} catch (err) {
  console.error("❌ Error generating feeds:", err);
  process.exit(1);
}
