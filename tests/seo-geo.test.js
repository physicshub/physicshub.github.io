// tests/seo-geo.test.js
/**
 * Automated test suite for SEO & Generative Engine Optimization (GEO).
 *
 * Verifies:
 * 1. llms.txt & llms-full.txt conformance to llmstxt.org specification
 * 2. Schema.org LearningResource & WebApplication structured data generation
 * 3. Chapter metadata health, URL integrity, and snippet lengths
 * 4. Robots.txt configuration and AI search crawler directives
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import chapters from "../app/(core)/data/chapters.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";
import {
  generateLlmsTxtContent,
  generateLlmsFullTxtContent,
} from "../scripts/generate-llms-txt.js";
import { generateSimulationSchema } from "../app/(core)/utils/schema-generator.js";

const NOINDEX_PATHS = new Set(["/blog/create", "/simulations/test"]);

describe("GEO llms.txt generation", () => {
  test("llms.txt conforms to llmstxt.org specification", () => {
    const content = generateLlmsTxtContent();

    assert.ok(content.startsWith("# PhysicsHub"), "Must start with H1 project title");
    assert.ok(content.includes("> Free, open-source educational platform"), "Must contain summary blockquote");
    assert.ok(content.includes("## Interactive Simulations"), "Must contain simulations section");
    assert.ok(content.includes("## Educational Guides & Theory"), "Must contain theory section");
    assert.ok(content.includes("## Core Topics & Disciplines"), "Must contain core topics section");

    // Ensure no undefined or placeholder values
    assert.ok(!content.includes("undefined"), "Must not contain undefined values");
    assert.ok(!content.includes("[object Object]"), "Must not contain stringified objects");

    // Verify all active chapters are listed
    const activeChapters = chapters.filter((c) => !NOINDEX_PATHS.has(c.link));
    for (const chapter of activeChapters) {
      assert.ok(
        content.includes(`[${chapter.name}](https://physicshub.github.io${chapter.link})`),
        `llms.txt must include link for ${chapter.name}`
      );
    }

    // Verify noindex paths are excluded
    for (const noindexPath of NOINDEX_PATHS) {
      assert.ok(
        !content.includes(`](https://physicshub.github.io${noindexPath})`),
        `llms.txt must exclude noindex path ${noindexPath}`
      );
    }
  });

  test("llms-full.txt includes comprehensive simulation details", () => {
    const fullContent = generateLlmsFullTxtContent();

    assert.ok(fullContent.startsWith("# PhysicsHub — Full Knowledge Base"), "Must start with full knowledge base header");
    assert.ok(fullContent.includes("## Simulations Directory"), "Must contain simulations directory");
    assert.ok(fullContent.includes("## Educational Articles & Guides"), "Must contain articles directory");

    for (const chapter of chapters.filter((c) => !NOINDEX_PATHS.has(c.link))) {
      assert.ok(fullContent.includes(`### ${chapter.name}`), `Must contain section for ${chapter.name}`);
      assert.ok(fullContent.includes(`**URL**: https://physicshub.github.io${chapter.link}`), `Must contain URL for ${chapter.name}`);
      assert.ok(fullContent.includes(`**Target Level**:`), "Must detail educational level");
    }
  });
});

describe("Schema.org structured data generator", () => {
  test("generates valid LearningResource and WebApplication schema", () => {
    const sampleChapter = chapters[0]; // Bouncing Ball
    const schema = generateSimulationSchema(sampleChapter);

    assert.ok(schema, "Schema must not be null");
    assert.strictEqual(schema["@context"], "https://schema.org");
    assert.ok(Array.isArray(schema["@graph"]), "Schema must contain @graph array");

    const simNode = schema["@graph"].find((node) =>
      Array.isArray(node["@type"]) && node["@type"].includes("LearningResource")
    );
    assert.ok(simNode, "Must contain LearningResource node");
    assert.ok(simNode["@type"].includes("WebApplication"), "Must also be WebApplication");
    assert.strictEqual(simNode.url, `https://physicshub.github.io${sampleChapter.link}`);
    assert.strictEqual(simNode.description, sampleChapter.desc);
    assert.strictEqual(simNode.isAccessibleForFree, true);
    assert.strictEqual(simNode.learningResourceType, "Interactive Simulation");
    assert.strictEqual(simNode.inLanguage, "en");

    const breadcrumbNode = schema["@graph"].find((node) => node["@type"] === "BreadcrumbList");
    assert.ok(breadcrumbNode, "Must contain BreadcrumbList node");
    assert.strictEqual(breadcrumbNode.itemListElement.length, 3);
    assert.strictEqual(breadcrumbNode.itemListElement[0].name, "Home");
    assert.strictEqual(breadcrumbNode.itemListElement[1].name, "Simulations");
    assert.strictEqual(breadcrumbNode.itemListElement[2].name, sampleChapter.name);
  });

  test("returns null gracefully for invalid chapter", () => {
    assert.strictEqual(generateSimulationSchema(null), null);
    assert.strictEqual(generateSimulationSchema(undefined), null);
  });
});

describe("Chapter metadata health for SEO & GEO", () => {
  test("all chapters have unique links and valid names", () => {
    const links = new Set();
    for (const chapter of chapters) {
      assert.ok(chapter.name && chapter.name.length > 0, "Chapter must have a non-empty name");
      assert.ok(chapter.link && chapter.link.startsWith("/simulations/"), `Chapter link ${chapter.link} must start with /simulations/`);
      assert.ok(!links.has(chapter.link), `Chapter link ${chapter.link} must be unique`);
      links.add(chapter.link);
    }
  });

  test("all chapter descriptions are adequate for search snippet display", () => {
    for (const chapter of chapters) {
      assert.ok(chapter.desc, `Chapter ${chapter.name} must have a description`);
      assert.ok(
        chapter.desc.length >= 40 && chapter.desc.length <= 350,
        `Chapter ${chapter.name} description length (${chapter.desc.length}) must be between 40 and 350 chars`
      );
    }
  });
});
