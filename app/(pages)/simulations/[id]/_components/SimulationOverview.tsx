// Server-rendered learning content shown right under the interactive stage.
// This is the crawlable, citable part of a /simulations/<id> page — the canvas
// itself is loaded client-only (ssr: false), so without this block the page has
// no body text at all. SimulationWrapper slots it beside the client-only
// simulation (not inside it), so it is in the initial HTML and its space is
// already reserved when the stage mounts.
import katex from "katex";
import Link from "next/link";
import simulationOverviews from "@/app/(core)/data/simulationOverviews.js";
import { blogsArray } from "@/app/(core)/data/articles/index.js";
import {
  resolveFormulaRef,
  formulaHref,
  plainText,
} from "@/app/(core)/data/formulas/index.js";

type Chapter = {
  name: string;
  desc: string;
  relatedBlogSlug?: string;
};

// A Formulary id, or `{ ref, label?, latex? }` for the simulation's own form.
type FormulaRef = string | { ref: string; label?: string; latex?: string };
type Overview = {
  intro: string;
  controls: string[];
  concepts: string[];
  formulas: FormulaRef[];
};
type Variable = {
  key: string;
  latex: string;
  name: string;
  unit?: string;
  constant?: number;
};
type ResolvedFormula = {
  id: string;
  name: string;
  latex: string;
  formula: { latex: string; variables: Variable[] };
};

const overviews = simulationOverviews as Record<string, Overview>;

function renderMath(latex: string, displayMode = true): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
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
  const formulas = (overview?.formulas ?? [])
    .map((entry) => resolveFormulaRef(entry) as ResolvedFormula | null)
    .filter((f): f is ResolvedFormula => f !== null);

  return (
    <section className="simulation-overview">
      <div className="simulation-overview__main">
        <h1 className="simulation-overview__title">{chapter.name}</h1>
        <p className="simulation-overview__intro">{intro}</p>

        {formulas.length > 0 && (
          <div className="simulation-overview__block">
            <h2>Key formulas</h2>
            <ul className="simulation-overview__formulas">
              {formulas.map((f) => (
                <li key={f.id} className="fx-mini">
                  <div
                    className="fx-mini__plate"
                    dangerouslySetInnerHTML={{ __html: renderMath(f.latex) }}
                  />
                  <div className="fx-mini__body">
                    <h3 className="fx-mini__name">{f.name}</h3>
                    {/* The legend describes the card's own form; a simulation
                        showing a variant of it (vector form, special case)
                        leaves the legend to the card. */}
                    {f.latex === f.formula.latex && (
                      <dl className="fx-mini__legend">
                        {f.formula.variables
                          .filter((v) => v.constant === undefined)
                          .map((v) => (
                            <div key={v.key}>
                              <dt
                                dangerouslySetInnerHTML={{
                                  __html: renderMath(v.latex, false),
                                }}
                              />
                              <dd>
                                <span>{plainText(v.name)}</span>
                                {v.unit && (
                                  <span className="formula-unit">{v.unit}</span>
                                )}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    )}
                    <Link className="fx-mini__link" href={formulaHref(f.id)}>
                      Open the formula card
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="simulation-overview__aside">
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

        {relatedBlog && (
          <p className="simulation-overview__theory-link">
            <Link href={`/blog/${relatedBlog.slug}`}>
              Read the full theory: {relatedBlog.name} →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
