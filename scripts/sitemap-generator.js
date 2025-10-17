// sitemap-generator.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream, writeFileSync } from 'fs';
import { routes } from '../src/routes.js';

const hostname = 'https://physicshub.github.io';

const links = routes.map(r => ({
  url: r.path,
  changefreq: r.changefreq,
  priority: r.priority,
}));

const sitemap = new SitemapStream({ hostname });
const writeStream = createWriteStream('./public/sitemap.xml');

sitemap.pipe(writeStream);
links.forEach(link => sitemap.write(link));
sitemap.end();

streamToPromise(sitemap).then(() => {
  console.log('✅ Sitemap generated!');
});

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${hostname}/sitemap.xml
`.trim();

writeFileSync('./public/robots.txt', robotsTxt);
console.log('✅ Robots.txt generated!');