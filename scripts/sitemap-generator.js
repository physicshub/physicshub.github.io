// sitemap-generator.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { routes } from '../src/routes.js';
import xmlFormat from 'xml-formatter';

const hostname = 'https://physicshub.github.io';

const links = routes.map(r => ({
  url: r.path,
  changefreq: r.changefreq,
  priority: r.priority,
}));

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname });
  links.forEach(link => sitemap.write(link));
  sitemap.end();

  const rawXml = (await streamToPromise(sitemap)).toString();
  const formatted = xmlFormat(rawXml, {
    indentation: '  ',
    collapseContent: true,
  });

  writeFileSync('./public/sitemap.xml', formatted);
  console.log('✅ Sitemap generated & formatted!');

  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${hostname}/sitemap.xml
`.trim();

  writeFileSync('./public/robots.txt', robotsTxt);
  console.log('✅ Robots.txt generated!');
}

generateSitemap();