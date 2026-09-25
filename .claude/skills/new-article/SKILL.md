---
name: new-article
description: How to write a PhysicsHub blog article (app/(core)/data/articles/*.js) — the answer-first house style, the theory block vocabulary, the takeaways/faq/key-fact blocks and the FAQ JSON-LD they emit, length targets per archetype, and the rule that keeps code out of non-developer articles. Use whenever adding, rewriting or splitting anything under app/(core)/data/articles/, or when asked how an article is put together.
---

# Writing a PhysicsHub article

Read this before touching `app/(core)/data/articles/`. Then read one finished
article end to end: **`pi-from-block-collisions-explained.js`** (long, scoped) or
**`projectile-parabolic-motion.js`** (short) — those are the house style; the
older ~4,000-word "Phase 1 … Phase 9" essays are not.

## The brief: one topic in, one question answered

The reader arrives from a search box or an AI chat with **one question**. The
article's job is to answer that question in the first two sentences, then let a
skimmer confirm the details and leave. Nobody reads a wall of prose on a website,
and nobody scrolls past a code dump to find a formula.

So: pick the single question the article answers. Put it in the `name`. Answer it
at the top. Everything after that is depth for the reader who wants it — never a
prerequisite for the reader who doesn't.

## The four things that must agree

An article is one file, `app/(core)/data/articles/<slug>.js`, exporting one
object, registered in `app/(core)/data/articles/index.js`. It connects to the
rest of the site by `slug`:

1. **`<slug>.js`** — the article object (shape below).
2. **`articles/index.js`** — import it, add it to `allBlogs`. Position in
   `allBlogs` sets listing order **and** the prev/next links on article pages —
   place a new article deliberately (e.g. a "…in code" spin-off right after its
   parent), don't just append.
3. **`app/(core)/data/chapters.js`** — if the article explains a simulation, that
   chapter's `relatedBlogSlug` must equal this `slug`. The link is one-way,
   slug-based, and drives the "Read the full theory →" link plus `isBasedOn` in
   the simulation's JSON-LD.
4. **`app/(core)/data/simulationOverviews.js`** — unaffected, but it already
   holds a concise per-simulation summary; don't duplicate it, link to the sim.

## The article object

```js
import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const someArticleBlog = {
  slug: "how-a-spring-works", // kebab-case, STABLE — never rename (no
  // redirects on GitHub Pages); it is the
  // URL, the registry key, the sitemap entry
  name: "How does a spring work?", // the question, ≤ ~60 chars. Rendered as
  // <h1>, <title> (+ " | PhysicsHub"),
  // schema headline
  desc: "A spring pushes back in proportion to how far you stretch it — that is Hooke's law, and it is why a mass on a spring oscillates.", // 120–160 chars, answer-first. Meta description, card subtitle, schema description, feed <summary>
  tags: [
    // exactly one LEVEL + one DIFFICULTY, then
    LEVELS.upperSecondary, // 2–5 topical TAGS.*  (min 2 tags total)
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.OSCILLATIONS,
    TAGS.SPRINGS,
  ],
  date: "21/01/2026", // DD/MM/YYYY — first published. Byline,
  // datePublished, sitemap/feed
  updated: "14/09/2026", // DD/MM/YYYY — OPTIONAL, last substantive
  // edit. Falls back to `date`. Sets
  // dateModified, OG modifiedTime, sitemap
  // lastmod, and a "· Updated …" byline note.
  // Bump it whenever you change the body.
  author: "mattq", // OPTIONAL — a key in app/(core)/data/authors.js.
  // Omit for the default community/org byline.
  // Add a person only with a public profile
  // to link. Never put an email here.
  theory: {
    sections: [
      {
        blocks: [
          /* BlockData[] */
        ],
      },
    ],
  },
};
```

`LEVELS` keys: `elementary`, `lowerSecondary`, `upperSecondary`, `undergraduate`,
`tool`. `DIFFICULTIES` keys: `core`, `extended`, `advanced` (the challenge
_within_ the level). Pick the level a curious reader at that stage can follow;
push anything harder into a `toggle`.

`LEVELS` is the international default; the reader also sees the level in their
own country's system (A-Level · Year 13, Class 11, JC1…). That comes from
`data/curriculumTopics.js`: add a `"blog:<slug>": "<concept>"` row to
`CONTENT_TOPICS`, reusing a concept from `TOPIC_PLACEMENTS` if one fits or
adding one with a placement for all six curricula, checked against each
country's real syllabus (see the header comment there). Without a row the
article falls back to its international level, only approximately.

### Sections

Use **one section** with a flat `blocks` array unless you have a real reason to
split. Section structure comes from `sectionTitle` blocks, not from `section`
objects. (A `section.title` string renders no heading — only a hidden anchor —
so don't rely on it.)

## The canonical skeleton (block order)

1. **`sectionTitle`** — a question-shaped H2 hook ("Why does a spring
   oscillate?"). The first one sits flush at the top.
2. **1–2 `paragraph`** — the answer, front-loaded. The first sentence must stand
   on its own out of context (an AI will quote it): ≤ ~320 chars, no "as we saw
   above".
3. **`callout` with `calloutType: "key"`** — the one-sentence, quotable answer.
   Its text also becomes the article's `abstract` in JSON-LD. One per article.
4. **`takeaways`** — `{ type: "takeaways", title?: "Key takeaways", items: [...] }`,
   3–5 bullets. The "read this if nothing else" box. One per article, right after
   the intro.
5. **Body** — repeated question-shaped `sectionTitle` → `paragraph` /
   `formula` / `list` / `image` / `table`. `toggle` for depth past the tagged
   level. `callout` (`info` / `tip` / `warning` / `success`) for asides.
6. **`faq`** — `{ type: "faq", title?: "Frequently asked questions",
items: [{ q, a }] }`, 3–6 pairs. Each answer self-contained, 2–4 sentences,
   readable in isolation. The first `faq` block also emits `FAQPage` JSON-LD
   (server-side, via `utils/blogSchema.ts`) — so questions must be real
   questions people ask, phrased naturally.
7. **`sectionTitle` "Keep exploring"** → a `list` of internal links: the related
   simulation(s) as `[label](/simulations/<Id>)` and 2–3 sibling articles as
   `[label](/blog/<slug>)`. Internal links are mandatory.

## Block vocabulary (theory renderer)

`sectionTitle` (H2, in the table of contents) · `subheading` (H3) ·
`subtitle` (`level` 1–3, H4) · `paragraph` · `list` (`items`, `ordered`) ·
`formula` (`latex`, `inline`, `ref`) · `callout` (`calloutType`: `info` `tip` `warning`
`success` `key`; `title`, `text`) · `note` · `example` (`title`, `content`) ·
`toggle` (`title`, `content` — collapsible; use for optional depth) ·
`table` (`columns`, `data`) · `image` (`src`, `alt`, `caption`, `size`, `href`) ·
**`takeaways`** · **`faq`**.

**Inline syntax** in any prose field (`paragraph`, `list` items, `callout`/
`toggle` body, `faq` q & a, `takeaways` items, **and `table` cells/headers**):
`$x = vt$` → KaTeX · `**bold**` · `` `code` `` · `[label](url)` ·
`[[formula-id]]` → a link to that Formulary card, labelled with its name. Nothing else —
**no single-`*` italics** (they render literally), no block `$$`, no line breaks.

**Formulas from the Formulary.** The headline formulas of an article (the ones a
reader would look up, usually one to three) belong to cards in
`app/(core)/data/formulas/`. Give their block a `ref`:
`{ type: "formula", ref: "hookes-law" }` takes its LaTeX from the card, and
`{ type: "formula", ref: "hookes-law", latex: "…" }` keeps the article's own form
(several equations aligned, a special case). Either way a link to the card
appears under the formula, and `/formulas` lists the article under "Used in".
Derivation steps stay plain `{ type: "formula", latex }`. A formula the article
leans on that has no card yet gets one (see the `new-simulation` skill,
"The overview and its formulas", for the card fields). An unknown `ref` or
`[[id]]` fails the build.

## Length targets

| Archetype             | Words       | Sections | Notes                                                                                                                    |
| --------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Q&A answer post**   | 600–900     | 2–4      | `key` callout + `faq` mandatory. Most new articles.                                                                      |
| **Scoped explainer**  | 1,200–2,000 | 4–7      | Models: `pi-from-block-collisions-explained`, `physics-behind-three-body-problem`.                                       |
| **Reference / index** | longer OK   | many     | e.g. `class-12-physics`. Must be TOC-first: every section independently skimmable, each opening with a one-line summary. |

A new article over ~3,000 words, or one whose scope has crept past its `name`
(free fall → relativity → CFD → careers), is wrong — split it.

## Code policy

`code` blocks are allowed **only** when `tags` includes `TAGS.PROGRAMMING`. The
audience is physics learners, not programmers. In a physics article, replace code
with a `formula`, a diagram `image`, an analogy, or a `table`.

When splitting a code-heavy essay: the physics stays in the main article (no
code); the implementation moves to a new `<verb>-a-<thing>-in-code.js` /
`coding-a-<thing>.js` article tagged
`[LEVELS.undergraduate, DIFFICULTIES.advanced, TAGS.PROGRAMMING, …]`, registered
in `index.js` next to its parent, cross-linked both ways in each one's
"Keep exploring" list.

## Verify

No test suite. Before proposing the change:

- `npm run lint` and `npm run format:check` (CI gate).
- `npm run build` — a new article missing from `index.js` still 404s; a malformed
  `theory` renders "Error: Invalid content structure."
- `npm run generate:sitemap && npm run generate:feeds` — the article should
  appear in `public/sitemap.xml`, `public/feed.xml`, `public/llms.txt`.
- Load `/blog/<slug>`: the lead answers the `name` in ≤ 2 sentences; the `key`
  callout, `takeaways` and `faq` all render; the TOC (right rail) is populated
  from the `sectionTitle` blocks; reading time is sane.
- `view-source` on `/blog/<slug>`: exactly one `<title>` ending ` | PhysicsHub`;
  one `application/ld+json` graph containing `BlogPosting`/`LearningResource`
  with `wordCount` + `dateModified`, a `BreadcrumbList`, and — if the article has
  a `faq` block — an `FAQPage` node.
- No `code` block unless the article is tagged `TAGS.PROGRAMMING`.

## Keep this current

If the theory block types, the article object shape, or the blog schema pipeline
change, update this skill, `CLAUDE.md` and `AGENTS.md` in the same change — a
stale skill here produces broken articles elsewhere.
