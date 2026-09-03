// Server-rendered learning content shown above the interactive canvas. This is
// the crawlable, citable part of a /simulations/<id> page — the canvas itself
// is loaded client-only (ssr: false), so without this block the page has no
// body text at all.
import katex from "katex";
import Link from "next/link";
import simulationOverviews from "@/app/(core)/data/simulationOverviews.js";
import { blogsArray } from "@/app/(core)/data/articles/index.js";

type Chapter = {
  name: string;
  desc: string;
  relatedBlogSlug?: string;
};

type Formula = { label: string; latex: string };
type Overview = {
  intro: string;
  controls: string[];
  concepts: string[];
  formulas: Formula[];
};

const overviews = simulationOverviews as Record<string, Overview>;

function renderMath(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    return latex;
  }
}

export default function SimulationOverview({
  id,
  chapter,
}: {
  id: string;
  chapter: Chapter;
}) {
  const overview = overviews[id];
  const relatedBlog = chapter.relatedBlogSlug
    ? blogsArray.find(
        (b: { slug: string }) => b.slug === chapter.relatedBlogSlug
      )
    : null;

  const intro = overview?.intro ?? chapter.desc;
  const controls = overview?.controls ?? [];
  const concepts = overview?.concepts ?? [];
  const formulas = overview?.formulas ?? [];

  return (
    <section className="simulation-overview">
      <h1 className="simulation-overview__title">{chapter.name}</h1>
      <p className="simulation-overview__intro">{intro}</p>

      {controls.length > 0 && (
        <div className="simulation-overview__block">
          <h2>What you can change</h2>
          <ul className="simulation-overview__inputs">
            {controls.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}

      {concepts.length > 0 && (
        <div className="simulation-overview__block">
          <h2>Key concepts</h2>
          <ul className="simulation-overview__concepts">
            {concepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
        </div>
      )}

      {formulas.length > 0 && (
        <div className="simulation-overview__block">
          <h2>Key formulas</h2>
          <dl className="simulation-overview__formulas">
            {formulas.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd dangerouslySetInnerHTML={{ __html: renderMath(f.latex) }} />
              </div>
            ))}
          </dl>
        </div>
      )}

      {relatedBlog && (
        <p className="simulation-overview__theory-link">
          <Link href={`/blog/${relatedBlog.slug}`}>
            Read the full theory: {relatedBlog.name} →
          </Link>
        </p>
      )}
    </section>
  );
}
