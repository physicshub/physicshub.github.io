// site-seo-kit (https://github.com/mattqdev/site-seo-kit): sitemap.xml, routes.js,
// robots.txt, feed.xml, llms.txt + llms-full.txt and the IndexNow key file, written
// by `npm run generate:seo` before every build. Data imports stay inside the
// functions so `submit` / `indexnow` / `doctor` never load the app.

import { SITE_NAME, SITE_URL } from "./app/(core)/constants/site.js";

const TAGLINE =
  "Free, open-source interactive physics simulations with written theory for students, teachers and developers.";

const data = async () => {
  const [articles, chapters, overviews, authors, tags, formulas] =
    await Promise.all([
      import("./app/(core)/data/articles/index.js"),
      import("./app/(core)/data/chapters.js"),
      import("./app/(core)/data/simulationOverviews.js"),
      import("./app/(core)/data/authors.js"),
      import("./app/(core)/data/tags.js"),
      import("./app/(core)/data/formulas/index.js"),
    ]);
  const getSimId = (link) =>
    link.split("/simulations/")[1]?.split(/[?#]/)[0] || "";
  return {
    blogs: articles.blogsArray,
    chapters: chapters.default,
    indexable: chapters.default.filter(
      (c) => c.level !== "tool" && getSimId(c.link) !== "test"
    ),
    overviews: overviews.default,
    resolveAuthor: authors.resolveAuthor,
    LEVELS: tags.LEVELS,
    DIFFICULTIES: tags.DIFFICULTIES,
    ...formulas,
    getSimId,
  };
};

/** @type {import("site-seo-kit").Config} */
export default {
  site: SITE_URL,
  name: SITE_NAME,
  description: TAGLINE,
  publicDir: "public",
  mirrorDirs: ["out"],

  routes: {
    static: [
      { path: "/", component: "Home", changefreq: "weekly", priority: 1 },
      {
        path: "/contribute",
        component: "Contribute",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        path: "/simulations",
        component: "Simulations",
        changefreq: "weekly",
        priority: 0.9,
      },
      {
        path: "/about",
        component: "About",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        path: "/privacy",
        component: "Privacy",
        changefreq: "yearly",
        priority: 0.3,
      },
      { path: "/blog", component: "Blog", changefreq: "weekly", priority: 0.9 },
      {
        path: "/formulas",
        component: "Formulas",
        changefreq: "weekly",
        priority: 0.8,
      },
    ],
    sources: [
      async () => {
        const { blogs } = await data();
        return blogs.map((blog) => ({
          path: `/blog/${blog.slug}`,
          changefreq: "monthly",
          priority: 0.8,
          lastmod: blog.updated || blog.date,
        }));
      },
      async () => {
        const { chapters } = await data();
        return chapters.map((chapter) => ({
          path: chapter.link,
          changefreq: "weekly",
          priority: 0.7,
        }));
      },
    ],
    exclude: ["/blog/create", "/simulations/test", "/account"],
    manifest: "routes.js",
  },

  sitemap: true,

  robots: {
    aiCrawlers: "allow",
    disallowExcluded: true,
  },

  feed: {
    title: "PhysicsHub Blog",
    link: "/blog",
    id: `${SITE_URL}/blog`,
    items: async () => {
      const { blogs, resolveAuthor } = await data();
      return blogs.map((blog) => ({
        title: blog.name,
        path: `/blog/${blog.slug}`,
        summary: blog.desc,
        published: blog.date,
        updated: blog.updated || blog.date,
        author: resolveAuthor(blog.author).name,
        categories: (blog.tags || []).map((tag) => tag?.name),
      }));
    },
  },

  llms: {
    sections: async ({ feedItems }) => {
      const {
        indexable,
        overviews,
        formulas,
        formulaHref,
        plainText,
        getSimId,
      } = await data();
      return [
        {
          text: `PhysicsHub hosts ${indexable.length} browser-based physics simulations built on a custom, in-house physics engine, each paired with a written explainer. Physics is in SI units, Y-up. All content is free and released under the MIT licence.`,
        },
        {
          title: "Articles",
          links: feedItems.map((item) => ({
            title: item.title,
            url: item.url,
            description: item.summary,
          })),
        },
        {
          title: "Simulations",
          links: indexable.map((c) => ({
            title: c.name,
            path: c.link,
            description: c.desc,
          })),
        },
        {
          title: "Simulation concepts",
          links: indexable
            .map((c) => {
              const ov = overviews[getSimId(c.link)];
              return (
                ov?.intro && {
                  title: `${c.name} — concept`,
                  path: c.link,
                  description: ov.intro,
                }
              );
            })
            .filter(Boolean),
        },
        {
          title: "Formulary",
          links: formulas.map((f) => ({
            title: f.name,
            path: formulaHref(f.id),
            description: plainText(f.summary),
            suffix: `\`${f.latex}\``,
          })),
        },
        {
          title: "About",
          links: [
            {
              title: "About PhysicsHub",
              path: "/about",
              description:
                "Who builds PhysicsHub, why it exists, and how the engine works.",
            },
            {
              title: "Contribute",
              path: "/contribute",
              description:
                "How to add a simulation, write theory, or translate the site.",
            },
          ],
        },
      ];
    },
    files: {
      "llms-full.txt": {
        title: "Full simulation context",
        description:
          "Concepts, controls, and formulas for every indexed simulation.",
        build: async () => {
          const {
            indexable,
            overviews,
            LEVELS,
            DIFFICULTIES,
            resolveFormulaRef,
            formulaHref,
            getSimId,
          } = await data();
          const simulations = indexable
            .map((chapter) => {
              const id = getSimId(chapter.link);
              const overview = overviews[id];
              if (!overview)
                throw new Error(`Missing simulation overview for ${id}`);
              const levels = [chapter.level, ...(chapter.alsoFor || [])].map(
                (level) => {
                  const label = LEVELS[level]?.name;
                  if (!label)
                    throw new Error(`Unknown level "${level}" for ${id}`);
                  return label;
                }
              );
              const difficulty = DIFFICULTIES[chapter.difficulty]?.name;
              if (!difficulty)
                throw new Error(
                  `Unknown difficulty "${chapter.difficulty}" for ${id}`
                );
              const topics = chapter.tags.map((tag) => tag.name).join(", ");
              const controls = overview.controls
                .map((c) => `- ${c}`)
                .join("\n");
              const concepts = overview.concepts
                .map((c) => `- ${c}`)
                .join("\n");
              const keyFormulas = overview.formulas
                .map(resolveFormulaRef)
                .filter(Boolean)
                .map(
                  (f) =>
                    `- ${f.name}: \`${f.latex}\` (${SITE_URL}${formulaHref(f.id)})`
                )
                .join("\n");
              return `## [${chapter.name}](${SITE_URL}${chapter.link})

${overview.intro}

- Educational levels: ${levels.join(", ")}
- Difficulty: ${difficulty}
- Topics: ${topics}

### Controls
${controls}

### Key concepts
${concepts}

### Governing formulas
${keyFormulas}`;
            })
            .join("\n\n");
          return `# PhysicsHub simulation context

> Expanded educational context for the interactive simulations listed in [llms.txt](${SITE_URL}/llms.txt). This file is generated from the same catalogue and overview data rendered by the site.

${simulations}
`;
        },
      },
    },
  },

  hooks: {
    beforeGenerate: async () => {
      const [{ validateFormulas }, { default: overviews }, { blogsArray }] =
        await Promise.all([
          import("./app/(core)/utils/formulaUsage.js"),
          import("./app/(core)/data/simulationOverviews.js"),
          import("./app/(core)/data/articles/index.js"),
        ]);
      const errors = validateFormulas({ overviews, articles: blogsArray });
      if (errors.length)
        throw new Error(
          `Formulary validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`
        );
    },
  },

  indexing: {
    google: true,
    indexnow: { key: "43c4a699f8b33ad61be925817684bdd4" },
  },
};
