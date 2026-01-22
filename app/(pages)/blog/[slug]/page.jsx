import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx";
import Tag from "../../../(core)/components/Tag.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

/**
 * 1. Obbligatorio per output: export
 */
export async function generateStaticParams() {
  return blogsArray.map((blog) => ({
    slug: blog.slug,
  }));
}

function getReadingTime(text) {
  const wordsPerMinute = 225;

  const noOfWords = text.split(/\s+/).length;

  return Math.ceil(noOfWords / wordsPerMinute);
}

/**
 * 2. Genera Metadati (Fix Next.js 15: await params)
 */
export async function generateMetadata({ params }) {
  // UNWRAP della Promise params
  const { slug } = await params;

  const blog = blogsArray.find((b) => b.slug === slug);

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.name,
    description: blog.desc,
  };
}

/**
 * 3. Componente Pagina (Fix Next.js 15: await params)
 */
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const blog = blogsArray.find((b) => b.slug === slug);

  if (!blog) notFound();

  const readingTime = blog.theory
    ? getReadingTime(JSON.stringify(blog.theory))
    : 1;

  return (
    <div className="blog-container">
      {/* Container Info Articolo */}
      <div className="blog-header">
        <div className="chapter-card-tags-container">
          {blog.tags.map((tag, idx) => (
            <Tag tag={tag} key={tag.id || idx} />
          ))}
        </div>

        <h1 className="blog-title">{blog.name}</h1>

        <p className="blog-desc theory-paragraph">{blog.desc}</p>

        <div className="blog-meta-footer">
          <div className="author-info">
            {blog.avatar ? (
              <img className="author-avatar" src={blog.avatar} />
            ) : blog.author ? (
              <div className="author-avatar">{blog.author?.[0]}</div>
            ) : (
              <img className="author-avatar" src="../../Logo.png" />
            )}

            <div className="author-details">
              <span className="author-name">
                {blog.author || "PhysicsHub Community"}
              </span>
              <span className="publish-date">
                Last update: {blog.date || "--/--/----"}
              </span>
            </div>
          </div>

          <div className="reading-time-wrapper">
            <div className="reading-time-content">
              <span className="reading-time-label">Time to read</span>
              <span className="reading-time-value">
                <FontAwesomeIcon icon={faClock} />
                {readingTime} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering Contenuto */}
      <div className="blog-content">
        {blog.theory && <TheoryRenderer theory={blog.theory} />}
      </div>
    </div>
  );
}
