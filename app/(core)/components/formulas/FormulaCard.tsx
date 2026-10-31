"use client";
// One entry of the Formulary (/formulas), laid out as a spec sheet: the
// formula on a blueprint plate beside its name, summary and symbol legend.
// The identity card — variables, when it holds, calculator, example,
// pitfalls, history, related formulas, where it is used — sits in a native
// <details>, so it is in the server HTML, works without JS, and the closed
// entry has its final size on first paint.

import { useRef, useState } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCheck,
  faCalculator,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../hooks/useTranslation";
import useCurriculum from "../../hooks/useCurriculum";
import { COLORS, DIFFICULTIES } from "../../data/tags.js";
import { getPlacement } from "../../data/curricula.js";
import { getFormula, formulaHref } from "../../data/formulas/index.js";
import { parseInlineText } from "../theory/utils";
import FormulaCalculator, { formatNumber } from "./FormulaCalculator";
import type { Formula, Tag as TagData, UsageLink } from "./types";

const difficulties = DIFFICULTIES as Record<string, TagData>;
const colors = COLORS as Record<string, { primary: string }>;

function CopyLatex({ latex }: { latex: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      if (liveRef.current) liveRef.current.textContent = t("Copied");
      setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = "";
      }, 1500);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fx-icon-btn fx-plate__copy"
        onClick={copy}
        aria-label={copied ? t("Copied") : t("Copy LaTeX")}
        title={copied ? t("Copied!") : t("Copy LaTeX")}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      </button>
      <span aria-live="polite" className="visually-hidden" ref={liveRef} />
    </>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`fx-section ${className}`}>
      <h4 className="fx-section__title">{title}</h4>
      {children}
    </section>
  );
}

function Dot({ color }: { color?: string }) {
  return (
    <span
      className="fx-meta__dot"
      style={{ background: colors[color || ""]?.primary }}
      aria-hidden="true"
    />
  );
}

export default function FormulaCard({
  formula,
  usage,
}: {
  formula: Formula;
  usage?: { simulations: UsageLink[]; articles: UsageLink[] };
}) {
  const { t } = useTranslation();
  const { curriculumId } = useCurriculum();
  const stage = getPlacement(formula, curriculumId)?.stage as
    | TagData
    | undefined;
  const difficulty = difficulties[formula.difficulty];
  const related = (formula.related || [])
    .map((id) => getFormula(id) as Formula | null)
    .filter((f): f is Formula => f !== null);
  const legend = formula.variables.filter((v) => v.constant === undefined);
  const constants = formula.variables.filter((v) => v.constant !== undefined);
  const hasCalculator = Object.keys(formula.solve || {}).length > 0;
  const simulations = usage?.simulations || [];
  const articles = usage?.articles || [];
  const usedCount = simulations.length + articles.length;

  return (
    <article id={formula.id} className="fx">
      <div className="fx__face">
        <div className="fx-plate">
          <div className="fx-plate__math">
            <BlockMath math={formula.latex} />
          </div>
          <CopyLatex latex={formula.latex} />
        </div>

        <div className="fx__info">
          <header className="fx__head">
            <h3 className="fx__name">
              <a href={`#${formula.id}`} className="fx__anchor">
                {formula.name}
                <FontAwesomeIcon
                  icon={faLink}
                  className="fx__anchor-icon"
                  aria-hidden="true"
                />
              </a>
            </h3>
            {formula.aka?.length ? (
              <p className="fx__aka">{formula.aka.join(" · ")}</p>
            ) : null}
          </header>

          <p className="fx__summary">{parseInlineText(formula.summary)}</p>

          <ul className="fx-legend" aria-label={t("Variables")}>
            {legend.map((v) => (
              <li key={v.key} className="fx-legend__item">
                <span className="fx-legend__symbol">
                  <InlineMath math={v.latex} />
                </span>
                <span className="fx-legend__name">
                  {parseInlineText(v.name)}
                </span>
                {v.unit && <span className="formula-unit">{v.unit}</span>}
              </li>
            ))}
          </ul>

          <p className="fx-meta">
            {stage && (
              <span className="fx-meta__item">
                <Dot color={stage.color} />
                {t(stage.name)}
              </span>
            )}
            {difficulty && (
              <span className="fx-meta__item">
                <Dot color={difficulty.color} />
                {t(difficulty.name)}
              </span>
            )}
            <span className="fx-meta__item fx-meta__topics">
              {formula.tags.map((tag) => t(tag.name)).join(", ")}
            </span>
            {usedCount > 0 && (
              <span className="fx-meta__item">
                {t("Used in")} {usedCount}
              </span>
            )}
          </p>
        </div>
      </div>

      <details className="fx-details">
        <summary className="fx-details__toggle">
          <span className="fx-details__label">{t("Identity card")}</span>
          {hasCalculator && (
            <span className="fx-details__hint">
              <FontAwesomeIcon icon={faCalculator} aria-hidden="true" />
              {t("Calculator")}
            </span>
          )}
          <span className="fx-details__chevron" aria-hidden="true" />
        </summary>

        <div className="fx-details__body">
          <div className="fx-details__main">
            <Section title={t("Variables")}>
              <table className="fx-table">
                <tbody>
                  {legend.map((v) => (
                    <tr key={v.key}>
                      <th scope="row">
                        <InlineMath math={v.latex} />
                      </th>
                      <td>{parseInlineText(v.name)}</td>
                      <td className="fx-table__unit">
                        {v.unit && (
                          <span className="formula-unit">{v.unit}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {constants.length > 0 && (
                <ul className="fx-constants">
                  {constants.map((c) => (
                    <li key={c.key}>
                      <InlineMath math={c.latex} />
                      <span className="fx-constants__value">
                        = {formatNumber(c.constant as number)}
                      </span>
                      {c.unit && <span className="formula-unit">{c.unit}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {formula.validity?.length ? (
              <Section title={t("When it holds")}>
                <ul className="fx-list">
                  {formula.validity.map((item) => (
                    <li key={item}>{parseInlineText(item)}</li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {formula.note && (
              <Section title={t("Good to know")}>
                <p className="fx-prose">{parseInlineText(formula.note)}</p>
              </Section>
            )}

            {formula.example && (
              <Section title={t("Worked example")}>
                <div className="fx-example">
                  <p className="fx-prose">
                    {parseInlineText(formula.example.problem)}
                  </p>
                  <p className="fx-prose fx-example__solution">
                    {parseInlineText(formula.example.solution)}
                  </p>
                </div>
              </Section>
            )}

            {formula.pitfalls?.length ? (
              <Section title={t("Common mistakes")}>
                <ul className="fx-list fx-list--warn">
                  {formula.pitfalls.map((item) => (
                    <li key={item}>{parseInlineText(item)}</li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {formula.history && (
              <Section title={t("History")}>
                <p className="fx-prose">
                  <strong>{formula.history.who}</strong>
                  <span className="fx-history__year">
                    {" "}
                    · {formula.history.year}
                  </span>
                  {formula.history.text ? (
                    <>
                      <br />
                      {formula.history.text}
                    </>
                  ) : null}
                </p>
              </Section>
            )}
          </div>

          <aside className="fx-details__side">
            {hasCalculator && (
              <Section title={t("Calculator")}>
                <FormulaCalculator formula={formula} />
              </Section>
            )}

            {related.length > 0 && (
              <Section title={t("Related formulas")}>
                <ul className="fx-links">
                  {related.map((f) => (
                    <li key={f.id}>
                      <a href={formulaHref(f.id)}>{f.name}</a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {usedCount > 0 && (
              <Section title={t("Used in")}>
                <ul className="fx-links fx-links--usage">
                  {simulations.map((link) => (
                    <li key={link.href}>
                      <span className="fx-links__kind">{t("Simulation")}</span>
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                  {articles.map((link) => (
                    <li key={link.href}>
                      <span className="fx-links__kind">{t("Article")}</span>
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </aside>
        </div>
      </details>
    </article>
  );
}
