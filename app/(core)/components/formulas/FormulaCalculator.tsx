"use client";
// The calculator on a Formulary card: pick the unknown, type the other values
// in SI units, read the result live. Every solver is a plain function declared
// on the formula (data/formulas/) — nothing is parsed or eval'd here.

import { useId, useMemo, useState } from "react";
import { InlineMath } from "react-katex";
import useTranslation from "../../hooks/useTranslation";
import { parseInlineText } from "../theory/utils";
import type { Formula, FormulaVariable, Solver } from "./types";

const DEG = Math.PI / 180;

// Four significant figures; scientific notation outside [0.001, 100 000).
export function formatNumber(value: number): React.ReactNode {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) {
    const [mantissa, exponent] = value.toExponential(3).split("e");
    return (
      <>
        {Number(mantissa)} × 10<sup>{Number(exponent)}</sup>
      </>
    );
  }
  return String(Number(value.toPrecision(4)));
}

const solverFn = (solver: Solver) =>
  typeof solver === "function" ? solver : solver.fn;

// The values a solver reads: its `from` list, or every other non-constant.
const inputsFor = (formula: Formula, unknown: string, solver: Solver) => {
  const from = typeof solver === "function" ? null : solver.from;
  return formula.variables.filter(
    (v) =>
      v.constant === undefined &&
      v.key !== unknown &&
      (!from || from.includes(v.key))
  );
};

type Outcome =
  | { kind: "result"; value: number; warning?: string }
  | { kind: "error"; message: string };

export default function FormulaCalculator({ formula }: { formula: Formula }) {
  const { t } = useTranslation();
  const uid = useId();
  const solvable = Object.keys(formula.solve || {});
  const [unknown, setUnknown] = useState(solvable[0]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      formula.variables.map((v) => [
        v.key,
        v.value === undefined ? "" : String(v.value),
      ])
    )
  );

  const byKey = useMemo(
    () => Object.fromEntries(formula.variables.map((v) => [v.key, v])),
    [formula]
  );
  const solver = formula.solve?.[unknown];
  const inputs = solver ? inputsFor(formula, unknown, solver) : [];
  const constants = formula.variables.filter((v) => v.constant !== undefined);
  const target = byKey[unknown] as FormulaVariable | undefined;

  const outcome = ((): Outcome | null => {
    if (!solver || !target) return null;
    const args: Record<string, number> = {};

    for (const c of constants) args[c.key] = c.constant as number;

    for (const v of inputs) {
      const raw = values[v.key]?.trim() ?? "";
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n)) {
        return {
          kind: "error",
          message: `${t("Enter a value for")} ${v.name}`,
        };
      }
      if (v.min !== undefined && n < v.min) {
        return {
          kind: "error",
          message: `${v.name} ${t("must be at least")} ${v.min}${v.unit ? ` ${v.unit}` : ""}`,
        };
      }
      if (v.max !== undefined && n > v.max) {
        return {
          kind: "error",
          message: `${v.name} ${t("must be at most")} ${v.max}${v.unit ? ` ${v.unit}` : ""}`,
        };
      }
      args[v.key] = v.angle ? n * DEG : n;
    }

    let result: number;
    try {
      result = solverFn(solver)(args);
    } catch {
      result = NaN;
    }
    if (Number.isNaN(result)) {
      return {
        kind: "error",
        message: t("No real solution for these values."),
      };
    }
    if (!Number.isFinite(result)) {
      return {
        kind: "error",
        message: t("Undefined for these values: it would divide by zero."),
      };
    }

    const value = target.angle ? result / DEG : result;
    const outside =
      (target.min !== undefined && value < target.min - 1e-9) ||
      (target.max !== undefined && value > target.max + 1e-9);
    return {
      kind: "result",
      value,
      warning: outside
        ? t("This is outside the physically meaningful range.")
        : undefined,
    };
  })();

  if (!solver || !target) return null;

  const readout = (
    <output
      className={`fx-calc__readout ${outcome?.kind === "error" ? "is-error" : ""}`}
      aria-live="polite"
    >
      {outcome?.kind === "result" ? (
        <>
          <span className="fx-calc__readout-symbol">
            <InlineMath math={target.latex} />
            <span aria-hidden="true">=</span>
          </span>
          <span className="fx-calc__readout-value">
            <strong>{formatNumber(outcome.value)}</strong>
            {target.unit && (
              <span className="fx-calc__readout-unit">{target.unit}</span>
            )}
          </span>
          {outcome.warning && (
            <span className="fx-calc__warning">{outcome.warning}</span>
          )}
        </>
      ) : (
        <span className="fx-calc__error">{outcome?.message}</span>
      )}
    </output>
  );

  return (
    <div className="fx-calc">
      <div
        className="fx-calc__solve"
        role="radiogroup"
        aria-label={t("Solve for")}
      >
        <span className="fx-calc__solve-label">{t("Solve for")}</span>
        <div className="fx-calc__segments">
          {solvable.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={key === unknown}
              aria-label={byKey[key]?.name}
              title={byKey[key]?.name}
              className={`fx-calc__segment ${key === unknown ? "is-active" : ""}`}
              onClick={() => setUnknown(key)}
            >
              <InlineMath math={byKey[key]?.latex || key} />
            </button>
          ))}
        </div>
      </div>

      {readout}

      <div className="fx-calc__fields">
        {inputs.map((v) => (
          <div className="fx-calc__field" key={v.key}>
            <label className="fx-calc__label" htmlFor={`${uid}-${v.key}`}>
              <span className="fx-calc__symbol">
                <InlineMath math={v.latex} />
              </span>
              <span className="fx-calc__name">{parseInlineText(v.name)}</span>
            </label>
            <div className="fx-calc__control">
              <input
                id={`${uid}-${v.key}`}
                type="number"
                step="any"
                inputMode="decimal"
                className="fx-calc__input"
                value={values[v.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [v.key]: e.target.value }))
                }
              />
              {v.unit && <span className="fx-calc__unit">{v.unit}</span>}
            </div>
          </div>
        ))}

        {constants.map((c) => (
          <div className="fx-calc__field is-constant" key={c.key}>
            <span className="fx-calc__label">
              <span className="fx-calc__symbol">
                <InlineMath math={c.latex} />
              </span>
              <span className="fx-calc__name">{c.name}</span>
            </span>
            <div className="fx-calc__control">
              <span className="fx-calc__const">
                {formatNumber(c.constant as number)}
              </span>
              {c.unit && <span className="fx-calc__unit">{c.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
