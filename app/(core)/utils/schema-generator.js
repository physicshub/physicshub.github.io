// app/(core)/utils/schema-generator.js
/**
 * Schema.org JSON-LD generator for interactive simulations and learning resources.
 *
 * Implements Google Rich Results and Generative Engine Optimization (GEO) structured data:
 * - LearningResource & WebApplication for interactive educational simulations
 * - BreadcrumbList for hierarchical site navigation
 */

const SITE_URL = "https://physicshub.github.io";

const LEVEL_MAP = {
  elementary: "Primary / Elementary Education",
  lowerSecondary: "Lower Secondary / Middle School (Ages 11-14)",
  upperSecondary: "Upper Secondary / High School (Ages 14-18)",
  tertiary: "Undergraduate / College Physics",
};

/**
 * Generate Schema.org JSON-LD for an interactive simulation chapter.
 *
 * @param {Object} chapter - Chapter metadata object from chapters.js
 * @returns {Object} JSON-LD structured data graph
 */
export function generateSimulationSchema(chapter, relatedBlog = null) {
  if (!chapter) return null;

  const url = `${SITE_URL}${chapter.link}`;
  const thumbnailUrl = chapter.thumbnail ? `${SITE_URL}${chapter.thumbnail}` : `${SITE_URL}/Thumbnail.jpg`;
  const educationalLevel = LEVEL_MAP[chapter.level] || "General Physics Education";
  const keywords = Array.isArray(chapter.tags)
    ? chapter.tags.map((t) => (typeof t === "object" && t !== null ? t.name : t)).filter(Boolean).join(", ")
    : "physics, simulation, interactive";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "WebApplication"],
        "@id": `${url}#simulation`,
        name: `${chapter.name} – Interactive Physics Simulation`,
        description: chapter.desc,
        url: url,
        image: thumbnailUrl,
        educationalLevel: educationalLevel,
        learningResourceType: "Interactive Simulation",
        interactivityType: "active",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires HTML5 and Canvas support",
        inLanguage: "en",
        isAccessibleForFree: true,
        keywords: keywords,
        ...(relatedBlog
          ? {
              isBasedOn: `${SITE_URL}/blog/${relatedBlog.slug}`,
            }
          : {}),
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "PhysicsHub",
          url: `${SITE_URL}/`,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Simulations",
            item: `${SITE_URL}/simulations`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: chapter.name,
            item: url,
          },
        ],
      },
    ],
  };
}
