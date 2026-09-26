// app/(core)/utils/blogSchema.ts
//
// Server-side helpers that turn an article's `theory` document into JSON-LD and
// plain-text summaries. The theory renderer is a client component, so anything
// that must land in the server-rendered <head>/<script> is derived here instead,
// straight from the same block data. Keep this file free of React / "use client".

import type { BlockData, BlogContent } from "../components/theory/types";
import { getFormula } from "../data/formulas/index.js";

type Article = { theory?: BlogContent } & Record<string, unknown>;

/**
 * Drop the lightweight inline syntax (see components/theory/utils.tsx) so a
 * string is safe to put in schema text or a meta description:
 *   $x=vt$ → x=vt   **bold** → bold   `code` → code   [label](url) → label
 *   [[formula-id]] → the formula's name
 */
export function stripInlineSyntax(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/\[\[([a-z0-9-]+)\]\]/g, (_, id) => getFormula(id)?.name ?? id)
    .replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, "$1")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/`([^`]+?)`/g, "$1")
    .replace(/\$([^$]+?)\$/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Every block in the document, in reading order (mirrors getTitles). */
export function walkBlocks(article: Article): BlockData[] {
  return (article.theory?.sections ?? []).flatMap((s) => s.blocks ?? []);
}

function normalizeFaqItems(raw: unknown): { q: string; a: string }[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (it): it is Record<string, unknown> => !!it && typeof it === "object"
    )
    .map((it) => ({
      q: stripInlineSyntax(String(it.q ?? "")),
      a: stripInlineSyntax(String(it.a ?? "")),
    }))
    .filter((it) => it.q && it.a);
}

/**
 * FAQPage JSON-LD from the first `faq` block in the article, or null when there
 * isn't one. One FAQPage per page is the schema.org expectation.
 */
export function getFaqSchema(
  article: Article,
  canonical: string
): Record<string, unknown> | null {
  const faqBlock = walkBlocks(article).find((b) => b.type === "faq");
  if (!faqBlock) return null;

  const items = normalizeFaqItems(faqBlock.items);
  if (items.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * The first `callout` flagged as the article's key fact — a one-sentence,
 * quotable answer. Handy for `description` fallbacks and `speakable`.
 */
export function getKeyFactText(article: Article): string | null {
  const block = walkBlocks(article).find(
    (b) => b.type === "callout" && b.calloutType === "key"
  );
  const text = block?.text;
  if (typeof text !== "string") return null;
  const clean = stripInlineSyntax(text);
  return clean || null;
}
