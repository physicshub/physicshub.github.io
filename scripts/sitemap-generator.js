// sitemap-generator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import xmlFormat from "xml-formatter";

import { routes as staticRoutes } from "../routes.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = "https://physicshub.github.io";
const sitemapName = "sitemap";

// Current date in W3C format (YYYY-MM-DD) for lastmod
const getCurrentDate = () => new Date().toISOString().split("T")[0];

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
    lastmod: currentDate,
  }));

  const combinedRoutes = [...staticRoutes, ...blogRoutes];

  // Deduplicate routes based on path
  const uniqueRoutesMap = new Map();
  combinedRoutes.forEach((route) => {
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

  // Add XML declaration and format
  const formatted = xmlFormat(rawXml, {
    indentation: "  ",
    collapseContent: true,
    lineSeparator: "\n",
  });

  const xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n${formatted}`;

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
    `   - Unused namespaces removed for better crawler compatibility`,
  );
}

generateSitemap().catch((err) => {
  console.error("❌ Error generating sitemap:", err);
  process.exit(1);
});
