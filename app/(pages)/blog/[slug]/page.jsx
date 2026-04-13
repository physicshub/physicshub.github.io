import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx";
import Tag from "../../../(core)/components/Tag.jsx";
import BlogInteractions from "../../../(core)/components/blog/BlogInteractions.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faChevronRight,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import {
  getReadingTime,
  getTitles,
} from "../../../(core)/utils/blogHandling.ts";
import BlogPostContent from "./BlogPostContent.jsx";

export async function generateStaticParams() {
  return blogsArray.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = blogsArray.find((b) => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.name,
    description: blog.desc,
    openGraph: {
      title: blog.name,
      description: blog.desc,
      type: "article",
      authors: [blog.author || "PhysicsHub"],
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

  return (
    <BlogPostContent
      blog={blog}
      prevPost={prevPost}
      nextPost={nextPost}
      relatedPosts={relatedPosts}
      readingTime={readingTime}
      tocItems={tocItems}
      slug={slug}
    />
  );
}
