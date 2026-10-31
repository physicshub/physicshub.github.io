// Recommended reading shown at the bottom of a /simulations/<id> page. It
// replaces the full theory article that used to be embedded there: the article
// lives at /blog/<slug>, and this list points to it and to its neighbours.
// The ranking and the reading-time maths run here, on the server; the cards
// themselves are the shared `Chapter` card, rendered by RelatedArticleCards.
import { blogsArray } from "@/app/(core)/data/articles/index.js";
import { getRelatedArticles } from "@/app/(core)/utils/relatedArticles.js";
import { getFirstBlogImage } from "@/app/(core)/utils/blogImages.js";
import { getBlogFacets } from "@/app/(core)/utils/catalogFilters.js";
import { getReadingTime, getPlainText } from "@/app/(core)/utils/blogHandling";
import { COLORS } from "@/app/(core)/data/tags";
import RelatedArticleCards, { type RelatedCard } from "./RelatedArticleCards";

type Chapter = {
  name: string;
  level?: string;
  alsoFor?: string[];
  relatedBlogSlug?: string;
  tags?: { name: string }[];
};

type Article = {
  slug: string;
  name: string;
  desc: string;
  tags: { name: string; color: string; id?: string }[];
  theory?: Parameters<typeof getPlainText>[0];
};

export default function RelatedArticles({ chapter }: { chapter: Chapter }) {
  const articles = getRelatedArticles(chapter, blogsArray) as Article[];
  if (articles.length === 0) return null;

  const cards: RelatedCard[] = articles.map((article) => {
    const { levels, difficulties } = getBlogFacets(article);
    // Level and difficulty get their own tiles on the card, so its tags are the
    // topics only — most specific first, the catch-all "Physics" last.
    const topics = article.tags
      .filter((tag) => !tag.id && tag.color in COLORS)
      .sort(
        (a, b) => Number(a.name === "Physics") - Number(b.name === "Physics")
      );

    return {
      slug: article.slug,
      name: article.name,
      desc: article.desc,
      tags: topics,
      thumbnail: getFirstBlogImage(article),
      level: levels[0],
      difficulty: difficulties[0],
      readingTime: article.theory
        ? getReadingTime(getPlainText(article.theory))
        : 0,
    };
  });

  return <RelatedArticleCards articles={cards} />;
}
