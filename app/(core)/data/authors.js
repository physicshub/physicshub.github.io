// (core)/data/authors.js
//
// Author registry for blog articles. An article opts in by setting
// `author: "<key>"` on its exported object; `resolveAuthor` turns that key into
// the shape the byline (BlogPostContent.jsx) and the JSON-LD graph
// (blog/[slug]/page.jsx) need.
//
// Default is `community` — an Organization-backed byline that references the
// site's #organization node instead of a Person. Sign an article with a real
// person only when they have a public profile to link and want the attribution.
// Never put a private email here: `url` / `sameAs` are public profiles only.

import { SITE_NAME, ORG_ID } from "../constants/site.js";

export const AUTHORS = {
  community: {
    id: "community",
    name: `${SITE_NAME} Community`,
    // Organization-backed: schema references #organization, no Person node.
    org: true,
    url: "https://github.com/physicshub",
  },
  mattq: {
    id: "mattq",
    name: "MattQ",
    org: false,
    url: "https://github.com/mattqdev",
    sameAs: ["https://github.com/mattqdev"],
  },
};

export const DEFAULT_AUTHOR_KEY = "community";

/**
 * Resolve an article's `author` field to a usable author object.
 * - falsy            → the default community/organization byline
 * - known key        → the registry entry
 * - any other string → treated as a literal display name (back-compat with the
 *                      few older articles that set `author: "Some Name"`)
 *
 * @param {string | undefined | null} key
 * @returns {{ id?: string, name: string, org?: boolean, url?: string, sameAs?: string[] }}
 */
export function resolveAuthor(key) {
  if (!key) return AUTHORS[DEFAULT_AUTHOR_KEY];
  if (AUTHORS[key]) return AUTHORS[key];
  return { name: String(key), org: false };
}

/**
 * The JSON-LD `author` value for an article. Returns either a reference to the
 * site #organization node or an inline Person node anchored at `${canonical}#author`.
 *
 * @param {string | undefined | null} key
 * @param {string} canonical absolute URL of the article
 */
export function authorSchema(key, canonical) {
  const author = resolveAuthor(key);
  if (author.org) return { "@id": ORG_ID };
  return {
    "@type": "Person",
    "@id": `${canonical}#author`,
    name: author.name,
    ...(author.url ? { url: author.url } : {}),
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  };
}
