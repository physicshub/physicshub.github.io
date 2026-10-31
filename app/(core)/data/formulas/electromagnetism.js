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
  {
    id: "ohms-law",
    name: "Ohm's law",
    latex: "V = IR",
    summary:
      "The voltage across a resistor is proportional to the current through it; the constant of proportionality is its resistance $R$.",
    variables: [
      { key: "V", latex: "V", name: "Voltage across the resistor", unit: "V" },
      { key: "I", latex: "I", name: "Current", unit: "A", value: 2 },
      { key: "R", latex: "R", name: "Resistance", unit: "Ω", value: 6, min: 0 },
    ],
    validity: [
      "Ohmic conductors (metals at constant temperature)",
      "Not diodes, lamps heating up or other non-linear components",
    ],
    tags: [TAGS.ELECTROMAGNETISM],
    level: "lowerSecondary",
    difficulty: "core",
    related: ["wire-resistance", "joule-heating", "emf-terminal-voltage"],
    solve: {
      V: ({ I, R }) => I * R,
      I: ({ V, R }) => V / R,
      R: ({ V, I }) => V / I,
    },
    history: {
      who: "Georg Simon Ohm",
      year: "1827",
      text: "Published in Die galvanische Kette, mathematisch bearbeitet.",
    },
  },
  {
    id: "kirchhoffs-current-law",
    name: "Kirchhoff's current law",
    aka: ["Junction rule", "KCL"],
    latex: "\\sum_{\\text{into node}} I = \\sum_{\\text{out of node}} I",
    summary:
      "The current flowing into any junction equals the current flowing out of it — charge is neither created nor stored at a node.",
    variables: [
      { key: "I", latex: "I", name: "Branch current at the node", unit: "A" },
    ],
    validity: [
      "Steady (DC) or slowly varying currents",
      "Lumped circuits, where no charge builds up at a junction",
    ],
    tags: [TAGS.ELECTROMAGNETISM],
    level: "upperSecondary",
    difficulty: "core",
    related: ["kirchhoffs-voltage-law", "ohms-law"],
    note: "Written with signed currents it becomes $\\sum_k I_k = 0$.",
    history: {
      who: "Gustav Kirchhoff",
      year: "1845",
    },
  },
  {
    id: "kirchhoffs-voltage-law",
    name: "Kirchhoff's voltage law",
    aka: ["Loop rule", "KVL"],
    latex: "\\sum_{\\text{closed loop}} \\Delta V = 0",
    summary:
      "Going once round any closed loop, the rises in potential (across cells) and the drops (across resistances) add up to zero — energy conservation for a unit charge.",
    variables: [
      {
        key: "dV",
        latex: "\\Delta V",
        name: "Potential change across each element",
        unit: "V",
      },
    ],
    validity: [
      "Steady (DC) circuits",
      "No changing magnetic flux through the loop",
    ],
    tags: [TAGS.ELECTROMAGNETISM, TAGS.ENERGY],
    level: "upperSecondary",
    difficulty: "core",
    related: ["kirchhoffs-current-law", "emf-terminal-voltage"],
    history: {
      who: "Gustav Kirchhoff",
      year: "1845",
    },
  },
  {
    id: "emf-terminal-voltage",
    name: "Terminal voltage of a real cell",
    aka: ["EMF and internal resistance"],
    latex: "V = \\mathcal{E} - Ir",
    summary:
      "A real cell loses part of its EMF $\\mathcal{E}$ across its own internal resistance $r$, so the voltage at its terminals drops as it delivers more current.",
    variables: [
      { key: "V", latex: "V", name: "Terminal voltage", unit: "V" },
      { key: "E", latex: "\\mathcal{E}", name: "EMF", unit: "V", value: 12 },
      { key: "I", latex: "I", name: "Current", unit: "A", value: 1.2 },
      {
        key: "r",
        latex: "r",
        name: "Internal resistance",
        unit: "Ω",
        value: 0.5,
        min: 0,
      },
    ],
    validity: ["Internal resistance roughly constant over the current range"],
    tags: [TAGS.ELECTROMAGNETISM],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["ohms-law", "kirchhoffs-voltage-law"],
    solve: {
      V: ({ E, I, r }) => E - I * r,
      E: ({ V, I, r }) => V + I * r,
      I: ({ V, E, r }) => (E - V) / r,
      r: ({ V, E, I }) => (E - V) / I,
    },
  },
  {
    id: "joule-heating",
    name: "Power dissipated in a resistor",
    aka: ["Joule heating", "Electrical power"],
    latex: "P = I^{2} R",
    summary:
      "A current through a resistance turns electrical energy into heat at a rate that grows with the square of the current.",
    variables: [
      { key: "P", latex: "P", name: "Power", unit: "W" },
      { key: "I", latex: "I", name: "Current", unit: "A", value: 2 },
      { key: "R", latex: "R", name: "Resistance", unit: "Ω", value: 6, min: 0 },
    ],
    validity: ["Ohmic resistor"],
    tags: [TAGS.ELECTROMAGNETISM, TAGS.ENERGY],
    level: "upperSecondary",
    difficulty: "core",
    related: ["ohms-law"],
    note: "With Ohm's law it can also be written $P = VI = V^2/R$.",
    solve: {
      P: ({ I, R }) => I * I * R,
      I: ({ P, R }) => Math.sqrt(P / R),
      R: ({ P, I }) => P / (I * I),
    },
    history: {
      who: "James Prescott Joule",
      year: "1841",
    },
  },
];

export default electromagnetism;
