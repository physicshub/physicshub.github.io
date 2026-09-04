import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";

import {
  getReadingTime,
  getTitles,
} from "../../../(core)/utils/blogHandling.ts";
import BlogPostContent from "./BlogPostContent.jsx";

const SITE_URL = "https://physicshub.github.io";

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

  return {
    title: blog.name,
    description: blog.desc,
    alternates: { canonical },
    openGraph: {
      title: blog.name,
      description: blog.desc,
      type: "article",
      url: `${SITE_URL}${canonical}`,
      publishedTime: published,
      authors: [blog.author || "PhysicsHub Community"],
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
    ? getReadingTime(JSON.stringify(blog.theory))
    : 1;

  const tocItems = getTitles(blog);

  const canonical = `${SITE_URL}/blog/${slug}`;
  const published = toISODate(blog.date);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: blog.name,
        description: blog.desc,
        image: [firstImage(blog)],
        url: canonical,
        mainEntityOfPage: canonical,
        inLanguage: "en",
        ...(published
          ? { datePublished: published, dateModified: published }
          : {}),
        author: blog.author
          ? { "@type": "Person", name: blog.author }
          : { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
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
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: blog.name,
            item: canonical,
          },
        ],
      },
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
