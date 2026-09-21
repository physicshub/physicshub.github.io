// scripts/generate-llms-txt.js
/**
 * Generates /llms.txt and /llms-full.txt according to the llmstxt.org GEO standard.
 *
 * Generative search engines (Perplexity, SearchGPT, Claude, Gemini) use llms.txt
 * to discover structured site knowledge, simulation directories, and deep links.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import chapters from "../app/(core)/data/chapters.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HOSTNAME = "https://physicshub.github.io";
const NOINDEX_PATHS = new Set(["/blog/create", "/simulations/test"]);

export function generateLlmsTxtContent() {
  const simulationEntries = chapters
    .filter((c) => !NOINDEX_PATHS.has(c.link))
    .map(
      (c) =>
        `- [${c.name}](${HOSTNAME}${c.link}): ${c.desc.replace(/\s+/g, " ").trim()}`
    )
    .join("\n");

  const blogEntries = blogsArray
    .filter((b) => !NOINDEX_PATHS.has(`/blog/${b.slug}`))
    .map((b) => {
      const title = b.name || b.theory?.title || b.title || b.slug;
      const desc = b.desc || b.description || "Educational physics guide and mathematical theory.";
      return `- [${title}](${HOSTNAME}/blog/${b.slug}): ${desc.replace(/\s+/g, " ").trim()}`;
    })
    .join("\n");

  return `# PhysicsHub

> Free, open-source educational platform featuring interactive physics simulations and theoretical guides for students, educators, and developers.

## Overview

PhysicsHub provides real-time browser-based physics visualizations covering kinematics, dynamics, harmonic motion, vectors, collision theory, and modern physics. Each simulation provides interactive controls, mathematical formulations, and visual representations to help students understand abstract physical concepts.

- Website: ${HOSTNAME}
- Repository: https://github.com/physicshub/physicshub.github.io
- License: Open Source (MIT)

## Interactive Simulations

${simulationEntries}

## Educational Guides & Theory

${blogEntries}

## Core Topics & Disciplines

- **Kinematics & Motion**: Displacement, velocity, uniform acceleration, parabolic trajectories.
- **Classical Dynamics**: Newton's laws of motion, gravitational fields, air resistance, elastic & inelastic collisions.
- **Harmonic Oscillations**: Simple harmonic motion (SHM), Hooke's law, spring-mass systems, pendulums.
- **Mathematical Tools**: Vector arithmetic, 2D vector decomposition, dot products, trigonometry.

## Optional & Deep Resources

- [Full Knowledge Base](${HOSTNAME}/llms-full.txt): Detailed simulation parameters, formulas, target educational levels, and complete documentation.
`;
}

export function generateLlmsFullTxtContent() {
  const simulationSections = chapters
    .filter((c) => !NOINDEX_PATHS.has(c.link))
    .map((c) => {
      const tagsStr = Array.isArray(c.tags) ? c.tags.join(", ") : "";
      const relatedGuide = c.relatedBlogSlug
        ? `\n- **Related Guide**: [Read Guide](${HOSTNAME}/blog/${c.relatedBlogSlug})`
        : "";

      return `### ${c.name}

- **URL**: ${HOSTNAME}${c.link}
- **Description**: ${c.desc.replace(/\s+/g, " ").trim()}
- **Target Level**: ${c.level || "General"}
- **Difficulty**: ${c.difficulty || "core"}
- **Physics Topics**: ${tagsStr}${relatedGuide}
`;
    })
    .join("\n");

  const blogSections = blogsArray
    .filter((b) => !NOINDEX_PATHS.has(`/blog/${b.slug}`))
    .map((b) => {
      const title = b.name || b.theory?.title || b.title || b.slug;
      const summary = b.desc || b.description || "Educational physics guide and mathematical theory.";
      return `### ${title}

- **URL**: ${HOSTNAME}/blog/${b.slug}
- **Summary**: ${summary.replace(/\s+/g, " ").trim()}
- **Date Published**: ${b.date || "N/A"}
`;
    })
    .join("\n");

  return `# PhysicsHub — Full Knowledge Base (LLMs Full)

> Comprehensive directory of interactive simulations, physical formulas, and educational resources for Large Language Models and AI answer engines.

## Simulations Directory

${simulationSections}

## Educational Articles & Guides

${blogSections}
`;
}

export function writeLlmsFiles() {
  const publicDir = join(__dirname, "../public");
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const llmsTxt = generateLlmsTxtContent();
  const llmsFullTxt = generateLlmsFullTxtContent();

  const publicLlmsPath = join(publicDir, "llms.txt");
  const publicLlmsFullPath = join(publicDir, "llms-full.txt");

  writeFileSync(publicLlmsPath, llmsTxt, "utf-8");
  writeFileSync(publicLlmsFullPath, llmsFullTxt, "utf-8");

  console.log(`✅ llms.txt generated in public/ (${chapters.length} simulations, ${blogsArray.length} blogs)`);
  console.log(`✅ llms-full.txt generated in public/`);

  const outDir = join(__dirname, "../out");
  if (existsSync(outDir)) {
    writeFileSync(join(outDir, "llms.txt"), llmsTxt, "utf-8");
    writeFileSync(join(outDir, "llms-full.txt"), llmsFullTxt, "utf-8");
    console.log(`✅ llms.txt & llms-full.txt copied to ./out/`);
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith("generate-llms-txt.js")) {
  try {
    writeLlmsFiles();
  } catch (err) {
    console.error("❌ Error generating llms.txt:", err);
    process.exit(1);
  }
}
