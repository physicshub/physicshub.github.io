// sitemap-generator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { writeFileSync } from "fs";
import xmlFormat from "xml-formatter";

import { routes as staticRoutes } from "../routes.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";

const hostname = "https://physicshub.github.io";
const sitemapName = "sitemap-physicshub";

function updateRoutesFile(allRoutes) {
  const content = `export const routes = ${JSON.stringify(allRoutes, null, 2)};`;
  writeFileSync("../routes.js", content);
  console.log("✅ routes.js physical file updated!");
}

async function generateSitemap() {
  const blogRoutes = blogsArray.map((blog) => ({
    path: `/blog/${blog.slug}`,
    changefreq: "monthly",
    priority: 0.8,
  }));

  const allRoutes = [...staticRoutes, ...blogRoutes];

  const sitemap = new SitemapStream({ hostname });

  allRoutes.forEach((route) => {
    sitemap.write({
      url: route.path,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  });

  sitemap.end();

  const rawXml = (await streamToPromise(sitemap)).toString();
  const formatted = xmlFormat(rawXml, {
    indentation: "  ",
    collapseContent: true,
  });

  writeFileSync(`./public/${sitemapName}.xml`, formatted);
  console.log(`✅ Sitemap generated with ${allRoutes.length} links!`);

  // Robots.txt
  const robotsTxt =
    `User-agent: *\nAllow: /\n\nSitemap: ${hostname}/${sitemapName}.xml`.trim();
  writeFileSync("./public/robots.txt", robotsTxt);
  console.log("✅ Robots.txt updated!");

  updateRoutesFile(allRoutes);
}

generateSitemap();
