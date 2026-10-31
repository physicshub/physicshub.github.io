import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const fluidsHeat = [
  {
    id: "heat-conduction",
    name: "Fourier's law of heat conduction",
    aka: ["Heat conduction", "Thermal conduction"],
    latex: "\\dot Q = -k\\,A\\,\\dfrac{\\Delta T}{d}",
    summary:
      "Heat flows through a material from hot to cold at a rate set by its conductivity, its area, and how steep the temperature drop is.",
    variables: [
      { key: "Q", latex: "\\dot Q", name: "Heat flow rate", unit: "W" },
      {
        key: "k",
        latex: "k",
        name: "Thermal conductivity",
        unit: "W/(m·K)",
        value: 205,
        min: 0,
      },
      { key: "A", latex: "A", name: "Area", unit: "m²", value: 0.01, min: 0 },
      {
        key: "dT",
        latex: "\\Delta T",
        name: "Temperature change across the layer",
        unit: "K",
        value: -20,
      },
      {
        key: "d",
        latex: "d",
        name: "Thickness",
        unit: "m",
        value: 0.02,
        min: 0,
      },
    ],
    validity: ["Steady state", "Uniform slab of one material"],
    tags: [TAGS.THERMODYNAMICS],
    level: "upperSecondary",
    difficulty: "extended",
    solve: {
      Q: ({ k, A, dT, d }) => (-k * A * dT) / d,
      k: ({ Q, A, dT, d }) => (-Q * d) / (A * dT),
      d: ({ Q, k, A, dT }) => (-k * A * dT) / Q,
    },
    pitfalls: [
      "Metal feels colder than wood at the same temperature because its high $k$ draws heat out of your hand faster — not because it is colder.",
    ],
    history: {
      who: "Joseph Fourier",
      year: "1822",
      text: "Théorie analytique de la chaleur, the book that also introduced Fourier series.",
    },
  },
];

export default fluidsHeat;
