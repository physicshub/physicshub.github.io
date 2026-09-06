// constants/site.js
//
// Single source of truth for the public identity of the site. Kept as plain JS
// (not .ts) so the Node ESM build scripts — scripts/sitemap-generator.js,
// scripts/generate-feeds.js — can import it directly alongside the app.

export const SITE_URL = "https://physicshub.github.io";
export const SITE_NAME = "PhysicsHub";

// Appended to every page <title> via the root layout's `title.template`.
// Child routes must NOT re-add this suffix in their own `title` strings.
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;

// Stable JSON-LD @id anchors for the two site-wide entities defined in
// app/layout.tsx. Referenced from per-page graphs (publisher, isPartOf, …).
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
