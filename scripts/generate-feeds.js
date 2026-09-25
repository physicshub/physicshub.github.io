// generate-feeds.js
//
// Three build artifacts that make the site legible to machines that are not
// Googlebot:
//   public/feed.xml  — Atom 1.0 feed of the blog, for readers and AI crawlers
//                       that subscribe to sources.
//   public/llms.txt  — the llmstxt.org convention: a flat, link-first map of the
//                       site's primary content for LLM agents.
//   public/llms-full.txt — expanded simulation context derived from the same
//                          source rendered on each simulation page.
//
// It also validates the Formulary (data/formulas/) and every ref to it from
// simulation overviews and articles, and fails the build on a broken one.
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
import { LEVELS, DIFFICULTIES } from "../app/(core)/data/tags.js";
import { SITE_URL, SITE_NAME } from "../app/(core)/constants/site.js";
import {
  formulas,
  resolveFormulaRef,
  plainText,
  formulaHref,
} from "../app/(core)/data/formulas/index.js";
import { validateFormulas } from "../app/(core)/utils/formulaUsage.js";

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

const indexableChapters = chapters.filter(
  (chapter) => chapter.level !== "tool" && getSimId(chapter.link) !== "test"
);

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

  const formulary = formulas
    .map(
      (f) =>
        `${line(f.name, `${SITE_URL}${formulaHref(f.id)}`, plainText(f.summary))} \`${f.latex}\``
    )
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

## Formulary
${formulary}

## About
${line("About PhysicsHub", `${SITE_URL}/about`, "Who builds PhysicsHub, why it exists, and how the engine works.")}
${line("Contribute", `${SITE_URL}/contribute`, "How to add a simulation, write theory, or translate the site.")}

## Optional
${line("Full simulation context", `${SITE_URL}/llms-full.txt`, "Concepts, controls, and formulas for every indexed simulation.")}
${line("Sitemap", `${SITE_URL}/sitemap.xml`)}
${line("Atom feed", `${SITE_URL}/feed.xml`)}
`;
}

function buildLlmsFullTxt() {
  const simulations = indexableChapters
    .map((chapter) => {
      const id = getSimId(chapter.link);
      const overview = simulationOverviews[id];
      if (!overview) {
        throw new Error(`Missing simulation overview for ${id}`);
      }

      const levels = [chapter.level, ...(chapter.alsoFor || [])].map(
        (level) => {
          const label = LEVELS[level]?.name;
          if (!label) {
            throw new Error(`Unknown level "${level}" for ${id}`);
          }
          return label;
        }
      );
      const difficulty = DIFFICULTIES[chapter.difficulty]?.name;
      if (!difficulty) {
        throw new Error(`Unknown difficulty "${chapter.difficulty}" for ${id}`);
      }
      const topics = chapter.tags.map((tag) => tag.name).join(", ");
      const controls = overview.controls
        .map((control) => `- ${control}`)
        .join("\n");
      const concepts = overview.concepts
        .map((concept) => `- ${concept}`)
        .join("\n");
      const keyFormulas = overview.formulas
        .map(resolveFormulaRef)
        .filter(Boolean)
        .map(
          (formula) =>
            `- ${formula.name}: \`${formula.latex}\` (${SITE_URL}${formulaHref(formula.id)})`
        )
        .join("\n");

      return `## [${chapter.name}](${SITE_URL}${chapter.link})

${overview.intro}

- Educational levels: ${levels.join(", ")}
- Difficulty: ${difficulty}
- Topics: ${topics}

### Controls
${controls}

### Key concepts
${concepts}

### Governing formulas
${keyFormulas}`;
    })
    .join("\n\n");

  return `# ${SITE_NAME} simulation context

> Expanded educational context for the interactive simulations listed in [llms.txt](${SITE_URL}/llms.txt). This file is generated from the same catalogue and overview data rendered by the site.

${simulations}
`;
}

function main() {
  if (!existsSync(publicDir)) {
    console.error("❌ public/ not found — run from the repo root");
    process.exit(1);
  }
  const formulaErrors = validateFormulas({
    overviews: simulationOverviews,
    articles: blogsArray,
  });
  if (formulaErrors.length) {
    console.error("❌ Formulary validation failed:");
    for (const error of formulaErrors) console.error(`   - ${error}`);
    process.exit(1);
  }
  console.log(`✅ Formulary — ${formulas.length} formulas, all refs resolve`);
  writeBoth("feed.xml", buildAtom());
  console.log(`✅ feed.xml — ${sortedBlogs.length} entries`);
  writeBoth("llms.txt", buildLlmsTxt());
  console.log("✅ llms.txt");
  writeBoth("llms-full.txt", buildLlmsFullTxt());
  console.log("✅ llms-full.txt");
}

try {
  main();
} catch (err) {
  console.error("❌ Error generating feeds:", err);
  process.exit(1);
}
