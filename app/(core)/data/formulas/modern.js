import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const modern = [
  {
    id: "de-broglie-wavelength",
    name: "de Broglie wavelength",
    aka: ["Matter wave"],
    latex: "\\lambda = \\dfrac{h}{m v}",
    summary:
      "Every moving particle behaves like a wave whose wavelength shrinks as its momentum grows. For everyday objects it is far too small to notice.",
    variables: [
      {
        key: "lambda",
        latex: "\\lambda",
        name: "Wavelength",
        unit: "m",
        min: 0,
      },
      {
        key: "h",
        latex: "h",
        name: "Planck constant",
        unit: "J·s",
        constant: 6.62607015e-34,
      },
      {
        key: "m",
        latex: "m",
        name: "Mass",
        unit: "kg",
        value: 9.109e-31,
        min: 0,
      },
      { key: "v", latex: "v", name: "Speed", unit: "m/s", value: 1e6, min: 0 },
    ],
    validity: [
      "Non-relativistic speeds (otherwise use the relativistic momentum)",
    ],
    tags: [TAGS.QUANTUM],
    level: "upperSecondary",
    difficulty: "advanced",
    solve: {
      lambda: ({ h, m, v }) => h / (m * v),
      m: ({ lambda, h, v }) => h / (lambda * v),
      v: ({ lambda, h, m }) => h / (lambda * m),
    },
    example: {
      problem: "What is the wavelength of an electron moving at $10^6$ m/s?",
      solution:
        "$\\lambda = 6.63\\times10^{-34} / (9.11\\times10^{-31} \\cdot 10^6) \\approx 0.73$ nm — about the spacing of atoms in a crystal, which is why electrons diffract.",
    },
    history: {
      who: "Louis de Broglie",
      year: "1924",
      text: "Proposed in his PhD thesis; Nobel Prize 1929.",
    },
  },
];

export default modern;
