// sitemap-generator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import xmlFormat from "xml-formatter";

import { routes as staticRoutes } from "../routes.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";
import chapters from "../app/(core)/data/chapters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = "https://physicshub.github.io";
const sitemapName = "sitemap";

// Routes that are reachable but must never be indexed (kept out of the sitemap
// and served with a noindex robots tag by their own metadata). The blog editor
// is a pure app screen; `/simulations/test` is a browser stress test.
const NOINDEX_PATHS = new Set(["/blog/create", "/simulations/test"]);

// Current date in W3C format (YYYY-MM-DD) for lastmod
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Article `date` fields are authored as DD/MM/YYYY. Convert to YYYY-MM-DD for
// <lastmod>, falling back to the build date when a date is missing or invalid.
const toW3CDate = (value, fallback) => {
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      const iso = `${yyyy}-${mm}-${dd}`;
      if (!Number.isNaN(Date.parse(iso))) return iso;
    }
  }
  return fallback;
};

// A malformed sitemap (the classic failure here is a duplicated `<?xml ?>`
// prolog) is silently rejected by Search Console. Fail the build instead.
function assertValidSitemap(xml) {
  const declarations = xml.match(/<\?xml[\s\S]*?\?>/g) || [];
  if (declarations.length !== 1) {
    throw new Error(
      `sitemap.xml must contain exactly one XML declaration, found ${declarations.length}`
    );
  }
  if (!xml.startsWith("<?xml")) {
    throw new Error(
      "sitemap.xml: XML declaration is not at the start of the document"
    );
  }
  const open = (xml.match(/<loc>/g) || []).length;
  const close = (xml.match(/<\/loc>/g) || []).length;
  if (open === 0 || open !== close) {
    throw new Error(
      `sitemap.xml: unbalanced <loc> tags (${open} open, ${close} close)`
    );
  }
  // xml-formatter throws on markup it cannot parse — use it as a validator.
  xmlFormat(xml);
}

function updateRoutesFile(allRoutes) {
  const content = `export const routes = ${JSON.stringify(allRoutes, null, 2)};`;
  writeFileSync(join(__dirname, "../routes.js"), content);
  console.log("✅ routes.js physical file updated!");
}

async function generateSitemap() {
  const currentDate = getCurrentDate();

  const blogRoutes = blogsArray.map((blog) => ({
    path: `/blog/${blog.slug}`,
    changefreq: "monthly",
    priority: 0.8,
    lastmod: toW3CDate(blog.date, currentDate),
  }));

  const simulationRoutes = chapters.map((chapter) => ({
    path: chapter.link,
    changefreq: "weekly",
    priority: 0.7,
    lastmod: currentDate,
  }));

  const combinedRoutes = [...staticRoutes, ...blogRoutes, ...simulationRoutes];

  const uniqueRoutesMap = new Map();
  combinedRoutes.forEach((route) => {
    if (NOINDEX_PATHS.has(route.path)) return;
    uniqueRoutesMap.set(route.path, route);
  });
  const allRoutes = Array.from(uniqueRoutesMap.values());

  // Generate sitemap with only the required namespace
  // Removing unused news, xhtml, image, video namespaces that can confuse crawlers
  const sitemap = new SitemapStream({
    hostname,
    xmlns: {
      news: false,
      xhtml: false,
      image: false,
      video: false,
    },
  });

  allRoutes.forEach((route) => {
    sitemap.write({
      url: route.path,
      changefreq: route.changefreq,
      priority: route.priority,
      lastmod: route.lastmod || currentDate,
    });
  });

  sitemap.end();

  const rawXml = (await streamToPromise(sitemap)).toString();

  // `SitemapStream` already emits an XML prolog, and `xml-formatter` can emit
  // another — two prologs make the document invalid. Strip every declaration,
  // format the body, then prepend exactly one.
  const body = xmlFormat(rawXml.replace(/<\?xml[\s\S]*?\?>\s*/gi, ""), {
    indentation: "  ",
    collapseContent: true,
    lineSeparator: "\n",
  }).replace(/^\s*<\?xml[\s\S]*?\?>\s*/i, "");

  const xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;

  assertValidSitemap(xmlOutput);

  // Ensure public directory exists
  const publicDir = join(__dirname, "../public");
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Write to public directory
  const publicPath = join(publicDir, `${sitemapName}.xml`);
  writeFileSync(publicPath, xmlOutput);
  console.log(`✅ Sitemap generated with ${allRoutes.length} links in public/`);

  // Also write to out/ if it exists (for deployment consistency)
  const outDir = join(__dirname, "../out");
  if (existsSync(outDir)) {
    writeFileSync(join(outDir, `${sitemapName}.xml`), xmlOutput);
    console.log(`✅ Sitemap copied to ./out/`);
  }

  // Generate robots.txt with sitemap reference
  const robotsTxt =
    `User-agent: *\nAllow: /\n\nSitemap: ${hostname}/${sitemapName}.xml`.trim();

  writeFileSync(join(publicDir, "robots.txt"), robotsTxt);
  console.log("✅ robots.txt updated in public/");

  if (existsSync(outDir)) {
    writeFileSync(join(outDir, "robots.txt"), robotsTxt);
    console.log("✅ robots.txt copied to ./out/");
  }

  updateRoutesFile(allRoutes);

  console.log("\n📋 Sitemap Summary:");
  console.log(`   - Total URLs: ${allRoutes.length}`);
  console.log(`   - Lastmod date: ${currentDate}`);
  console.log(
    `   - Unused namespaces removed for better crawler compatibility`
  );
}

generateSitemap().catch((err) => {
  console.error("❌ Error generating sitemap:", err);
  process.exit(1);
});
