import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const electromagnetism = [
  {
    id: "coulombs-law",
    name: "Coulomb's law",
    aka: ["Electrostatic force"],
    latex: "F = \\dfrac{1}{4\\pi\\varepsilon_0}\\,\\dfrac{q_1 q_2}{r^{2}}",
    summary:
      "Two charges push apart (same sign) or pull together (opposite signs) with a force that falls off as the square of the distance — the electric twin of Newton's gravity.",
    variables: [
      {
        key: "F",
        latex: "F",
        name: "Electrostatic force (positive = repulsive)",
        unit: "N",
      },
      {
        key: "ke",
        latex: "\\tfrac{1}{4\\pi\\varepsilon_0}",
        name: "Coulomb constant",
        unit: "N·m²/C²",
        constant: 8.9875e9,
      },
      { key: "q1", latex: "q_1", name: "First charge", unit: "C", value: 1e-6 },
      {
        key: "q2",
        latex: "q_2",
        name: "Second charge",
        unit: "C",
        value: 1e-6,
      },
      { key: "r", latex: "r", name: "Distance", unit: "m", value: 0.1, min: 0 },
    ],
    validity: [
      "Point charges at rest",
      "In vacuum (in a material, divide by its relative permittivity)",
    ],
    tags: [TAGS.ELECTROMAGNETISM, TAGS.FORCES],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["newtons-law-of-gravitation"],
    solve: {
      F: ({ ke, q1, q2, r }) => (ke * q1 * q2) / (r * r),
      q1: ({ F, ke, q2, r }) => (F * r * r) / (ke * q2),
      q2: ({ F, ke, q1, r }) => (F * r * r) / (ke * q1),
      r: ({ F, ke, q1, q2 }) => Math.sqrt((ke * q1 * q2) / F),
    },
    history: {
      who: "Charles-Augustin de Coulomb",
      year: "1785",
      text: "Measured with a torsion balance.",
    },
  },
  {
    id: "wire-resistance",
    name: "Resistance of a wire",
    aka: ["Resistivity formula"],
    latex: "R = \\dfrac{\\rho L}{A}",
    summary:
      "A longer wire resists current more, a thicker one less. The material enters through its resistivity $\\rho$.",
    variables: [
      { key: "R", latex: "R", name: "Resistance", unit: "Ω", min: 0 },
      {
        key: "rho",
        latex: "\\rho",
        name: "Resistivity",
        unit: "Ω·m",
        value: 1.68e-8,
        min: 0,
      },
      { key: "L", latex: "L", name: "Length", unit: "m", value: 10, min: 0 },
      {
        key: "A",
        latex: "A",
        name: "Cross-sectional area",
        unit: "m²",
        value: 1.5e-6,
        min: 0,
      },
    ],
    validity: ["Uniform wire", "Constant temperature"],
    tags: [TAGS.ELECTROMAGNETISM],
    level: "upperSecondary",
    difficulty: "core",
    solve: {
      R: ({ rho, L, A }) => (rho * L) / A,
      rho: ({ R, L, A }) => (R * A) / L,
      L: ({ R, rho, A }) => (R * A) / rho,
      A: ({ R, rho, L }) => (rho * L) / R,
    },
  },
];

export default electromagnetism;
