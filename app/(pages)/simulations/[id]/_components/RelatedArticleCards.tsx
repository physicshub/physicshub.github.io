"use client";

// Client half of the recommended-reading section: it renders the very same
// `Chapter` card as the /blog index (in its `detailed` form, which adds level,
// difficulty and read time) and translates the heading. The list itself is
// computed on the server in RelatedArticles.tsx.
import Chapter from "@/app/(core)/components/Chapter.jsx";
import useTranslation from "@/app/(core)/hooks/useTranslation";

export type RelatedCard = {
  slug: string;
  name: string;
  desc: string;
  tags: { name: string; color: string }[];
  thumbnail: string;
  level?: string;
  difficulty?: string;
  readingTime: number;
};

export default function RelatedArticleCards({
  articles,
}: {
  articles: RelatedCard[];
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  return (
    <section
      className={`simulation-related ${isCompleted ? "notranslate" : ""}`}
      aria-labelledby="related-heading"
    >
      <header className="simulation-related__header">
        <h2 id="related-heading" className="simulation-related__title">
          {t("Recommended reading")}
        </h2>
        <p className="simulation-related__lead">
          {t("Go deeper into the physics behind this simulation.")}
        </p>
      </header>
      <div className="simulation-related__grid">
        {articles.map((article) => (
          <Chapter
            key={article.slug}
            id={`related-${article.slug}`}
            name={article.name}
            desc={article.desc}
            slug={article.slug}
            thumbnail={article.thumbnail}
            tags={article.tags}
            level={article.level}
            difficulty={article.difficulty}
            readingTime={article.readingTime}
            isABlog
            detailed
          />
        ))}
      </div>
    </section>
  );
}
