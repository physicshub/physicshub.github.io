// Shapes of the Formulary registry (app/(core)/data/formulas/), which is plain
// JS documented with JSDoc; these mirror those typedefs for the TSX components.

export type FormulaVariable = {
  key: string;
  latex: string;
  name: string;
  unit?: string;
  value?: number;
  constant?: number;
  angle?: boolean;
  min?: number;
  max?: number;
};

export type SolverFn = (values: Record<string, number>) => number;
export type Solver = SolverFn | { from: string[]; fn: SolverFn };

export type Tag = { name: string; color: string; id?: string };

export type Formula = {
  id: string;
  name: string;
  aka?: string[];
  latex: string;
  summary: string;
  variables: FormulaVariable[];
  validity?: string[];
  tags: Tag[];
  level: string;
  difficulty: string;
  related?: string[];
  solve?: Record<string, Solver>;
  note?: string;
  example?: { problem: string; solution: string };
  pitfalls?: string[];
  history?: { who: string; year: string; text?: string };
  domain: string;
};

export type UsageLink = { name: string; href: string };
export type FormulaUsage = Record<
  string,
  { simulations: UsageLink[]; articles: UsageLink[] }
>;
