// sitemap-generator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { writeFileSync } from "fs";
import xmlFormat from "xml-formatter";

import { routes as staticRoutes } from "../routes.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";
import chapters from "../app/(core)/data/chapters.js";

const hostname = "https://physicshub.github.io";
const sitemapName = "sitemap";

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

  const simulationRoutes = chapters.map((chapter) => ({
    path: chapter.link,
    changefreq: "weekly",
    priority: 0.7,
  }));

  const combinedRoutes = [...staticRoutes, ...blogRoutes, ...simulationRoutes];

  const uniqueRoutesMap = new Map();
  combinedRoutes.forEach((route) => {
    uniqueRoutesMap.set(route.path, route);
  });
  const allRoutes = Array.from(uniqueRoutesMap.values());

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

  try {
    const fs = await import("fs");
    if (fs.existsSync("./out")) {
      writeFileSync(`./out/${sitemapName}.xml`, formatted);
      console.log(`✅ Sitemap copied to ./out!`);
    }
  } catch (e) {
    console.error("Error writing to out directory:", e);
  }

  // Robots.txt
  const robotsTxt =
    `User-agent: *\nAllow: /\n\nSitemap: ${hostname}/${sitemapName}.xml`.trim();
  writeFileSync("./public/robots.txt", robotsTxt);

  try {
    const fs = await import("fs");
    if (fs.existsSync("./out")) {
      writeFileSync("./out/robots.txt", robotsTxt);
      console.log(`✅ Robots.txt copied to ./out!`);
    }
  } catch (e) {
    console.error("Error writing robots.txt to out directory:", e);
  }

  console.log("✅ Robots.txt updated!");

  updateRoutesFile(allRoutes);
}

generateSitemap();
