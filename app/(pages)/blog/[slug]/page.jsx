import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";

import {
  getReadingTime,
  getTitles,
  getPlainText,
  getWordCount,
} from "../../../(core)/utils/blogHandling.ts";
import {
  getFaqSchema,
  getKeyFactText,
} from "../../../(core)/utils/blogSchema.ts";
import { getBlogFacets } from "../../../(core)/utils/catalogFilters.js";
import { LEVELS } from "../../../(core)/data/tags.js";
import { resolveAuthor, authorSchema } from "../../../(core)/data/authors.js";
import {
  SITE_URL,
  ORG_ID,
  WEBSITE_ID,
} from "../../../(core)/constants/site.js";
import BlogPostContent from "./BlogPostContent.jsx";

// Articles author their `date` as DD/MM/YYYY. Return an ISO date for schema
// (`datePublished`), or undefined when it is missing/unparseable.
function toISODate(value) {
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  return Number.isNaN(Date.parse(iso)) ? undefined : iso;
}

function firstImage(blog) {
  for (const section of blog.theory?.sections ?? []) {
    const image = section.blocks?.find((b) => b.type === "image" && b.src);
    if (image?.src) return image.src;
  }
  return `${SITE_URL}/Thumbnail.jpg`;
}

export async function generateStaticParams() {
  return blogsArray.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = blogsArray.find((b) => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };

  const canonical = `/blog/${slug}`;
  const published = toISODate(blog.date);
  const modified = toISODate(blog.updated) || published;
  const { topics } = getBlogFacets(blog);

  return {
    title: blog.name,
    description: blog.desc,
    keywords: topics.length ? topics : undefined,
    alternates: { canonical },
    openGraph: {
      title: blog.name,
      description: blog.desc,
      type: "article",
      url: `${SITE_URL}${canonical}`,
      publishedTime: published,
      modifiedTime: modified,
      authors: [resolveAuthor(blog.author).name],
      tags: topics,
      images: [firstImage(blog)],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.name,
      description: blog.desc,
      images: [firstImage(blog)],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const currentIndex = blogsArray.findIndex((b) => b.slug === slug);
  const blog = blogsArray[currentIndex];

  if (!blog) notFound();

  // Logic: Prev / Next / Related
  const prevPost = blogsArray[currentIndex - 1] || null;
  const nextPost = blogsArray[currentIndex + 1] || null;

  const relatedPosts = blogsArray
    .filter((b) => b.slug !== slug && b.tags.some((t) => blog.tags.includes(t)))
    .slice(0, 3);

  const readingTime = blog.theory
    ? getReadingTime(getPlainText(blog.theory))
    : 1;
  const wordCount = getWordCount(blog.theory);

  const tocItems = getTitles(blog);

  const canonical = `${SITE_URL}/blog/${slug}`;
  const published = toISODate(blog.date);
  const modified = toISODate(blog.updated) || published;

  const { topics, levels } = getBlogFacets(blog);
  const educationalLevel = levels
    .map((id) => LEVELS[id]?.name)
    .filter(Boolean)[0];
  const keyFact = getKeyFactText(blog);
  const faqSchema = getFaqSchema(blog, canonical);
  const author = authorSchema(blog.author, canonical);
  const authorRef = author["@id"] ? { "@id": author["@id"] } : author;

  const blogPosting = {
    "@type": ["BlogPosting", "LearningResource"],
    "@id": `${canonical}#article`,
    headline: blog.name,
    description: blog.desc,
    ...(keyFact ? { abstract: keyFact } : {}),
    image: [firstImage(blog)],
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
    inLanguage: "en",
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: authorRef,
    publisher: { "@id": ORG_ID },
    isAccessibleForFree: true,
    ...(wordCount ? { wordCount } : {}),
    timeRequired: `PT${readingTime}M`,
    ...(topics.length
      ? {
          keywords: topics.join(", "),
          about: topics.map((name) => ({ "@type": "Thing", name })),
          articleSection: topics[0],
        }
      : { articleSection: "Physics" }),
    learningResourceType: "explanation",
    ...(educationalLevel ? { educationalLevel } : {}),
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
  };

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: blog.name, item: canonical },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      blogPosting,
      breadcrumbList,
      ...(author["@type"] === "Person" ? [author] : []),
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent
        blog={blog}
        prevPost={prevPost}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
        readingTime={readingTime}
        tocItems={tocItems}
        slug={slug}
      />
    </>
  );
}
