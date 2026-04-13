"use client";
import React from "react";
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
import useTranslation from "../../../(core)/hooks/useTranslation.ts";

export default function BlogPostContent({
  blog,
  prevPost,
  nextPost,
  relatedPosts,
  readingTime,
  tocItems,
  slug,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  return (
    <div className={`blog-page-wrapper ${isCompleted ? "notranslate" : ""}`}>
      {/* --- BREADCRUMBS --- */}
      <nav className="breadcrumb-nav">
        <Link href="/">{t("Home")}</Link>
        <FontAwesomeIcon icon={faChevronRight} className="breadcrumb-sep" />
        <Link href="/blog">{t("Blog")}</Link>
        <FontAwesomeIcon icon={faChevronRight} className="breadcrumb-sep" />
        <span className="current-path">{t(blog.name)}</span>
      </nav>

      <div className="blog-layout">
        <main className="blog-main-column">
          <div className="blog-container">
            <div className="blog-header">
              <div className="chapter-card-tags-container">
                {blog.tags.map((tag, idx) => (
                  <Tag tag={tag} key={tag.id || idx} />
                ))}
              </div>
              <h1 className="blog-title">{t(blog.name)}</h1>
              <p className="blog-desc">{t(blog.desc)}</p>

              <div className="blog-meta-footer">
                <div className="author-info">
                  {blog.avatar ? (
                    <Image
                      className="author-avatar"
                      src={blog.avatar}
                      alt={t("Author")}
                      width={40}
                      height={40}
                    />
                  ) : blog.author ? (
                    <div className="author-avatar">{blog.author[0]}</div>
                  ) : (
                    <Image
                      className="author-avatar"
                      src="/Logo.png"
                      alt={t("Logo")}
                      width={40}
                      height={40}
                    />
                  )}
                  <div className="author-details">
                    <span className="author-name">
                      {t(blog.author || "PhysicsHub Community")}
                    </span>
                    <span className="publish-date">
                      {t("Last update:")} {blog.date || "--/--/----"}
                    </span>
                  </div>
                </div>
                <div className="reading-time-wrapper">
                  <div className="reading-time-content">
                    <span className="reading-time-label">
                      {t("Time to read")}
                    </span>
                    <span className="reading-time-value">
                      <FontAwesomeIcon icon={faClock} /> {readingTime}{" "}
                      {t("min")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <BlogInteractions title={t(blog.name)} slug={slug} />

            <div className="blog-content">
              {blog.theory && <TheoryRenderer theory={blog.theory} />}
            </div>

            <div className="blog-navigation">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="blog-nav-link prev"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="nav-icon" />
                  <div className="nav-content">
                    <span className="nav-label">{t("Previous Article")}</span>
                    <span className="nav-title">{t(prevPost.name)}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="blog-nav-link next"
                >
                  <div className="nav-content">
                    <span className="nav-label">{t("Next Article")}</span>
                    <span className="nav-title">{t(nextPost.name)}</span>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="nav-icon" />
                </Link>
              )}
            </div>

            {relatedPosts.length > 0 && (
              <div className="related-section">
                <h3 className="related-title">{t("Related Articles")}</h3>
                <div className="related-grid">
                  {relatedPosts.map((post) => (
                    <Link
                      href={`/blog/${post.slug}`}
                      key={post.slug}
                      className="related-card"
                    >
                      <h4 className="related-card-title">{t(post.name)}</h4>
                      <p className="related-card-desc">{t(post.desc)}</p>
                      <span className="related-cta">
                        {t("Read more")} <FontAwesomeIcon icon={faArrowRight} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="blog-toc-sidebar">
          <div className="toc-container">
            <h4 className="toc-title">{t("Contents")}</h4>
            <ul className="toc-list">
              {tocItems.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.isSubSection ? "toc-item-sub" : "toc-item-main"
                  }
                >
                  <a href={`#${item.id}`}>{t(item.title)}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
