import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const math = [
  {
    id: "vector-magnitude",
    name: "Magnitude of a vector",
    aka: ["Length of a vector", "Norm"],
    latex: "|\\vec{a}| = \\sqrt{a_x^{2} + a_y^{2}}",
    summary:
      "The length of a vector from its components — Pythagoras' theorem on the right triangle they form.",
    variables: [
      { key: "a", latex: "|\\vec{a}|", name: "Magnitude", min: 0 },
      { key: "ax", latex: "a_x", name: "x component", value: 3 },
      { key: "ay", latex: "a_y", name: "y component", value: 4 },
    ],
    validity: ["Cartesian components (add $a_z^2$ in 3-D)"],
    tags: [TAGS.VECTORS, TAGS.MATH],
    level: "upperSecondary",
    difficulty: "core",
    related: ["vector-sum", "dot-product", "pythagorean-identity"],
    solve: {
      a: ({ ax, ay }) => Math.hypot(ax, ay),
      ax: ({ a, ay }) => Math.sqrt(a * a - ay * ay),
      ay: ({ a, ax }) => Math.sqrt(a * a - ax * ax),
    },
    note: "Its direction is $\\theta = \\arctan(a_y / a_x)$, and back again: $a_x = |\\vec{a}|\\cos\\theta$, $a_y = |\\vec{a}|\\sin\\theta$.",
  },
  {
    id: "vector-sum",
    name: "Sum of two vectors",
    aka: ["Vector addition", "Tip-to-tail rule"],
    latex: "\\vec{a} + \\vec{b} = (a_x + b_x,\\; a_y + b_y)",
    summary:
      "To add vectors, add their components. Geometrically: place the tail of $\\vec{b}$ on the tip of $\\vec{a}$.",
    variables: [
      { key: "a", latex: "\\vec{a}", name: "First vector" },
      { key: "b", latex: "\\vec{b}", name: "Second vector" },
    ],
    tags: [TAGS.VECTORS, TAGS.MATH],
    level: "upperSecondary",
    difficulty: "core",
    related: ["vector-magnitude", "dot-product"],
  },
  {
    id: "dot-product",
    name: "Dot product",
    aka: ["Scalar product", "Inner product"],
    latex:
      "\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y = |\\vec{a}||\\vec{b}|\\cos\\theta",
    summary:
      "Multiplies two vectors into a number that measures how much they point the same way: zero when they are perpendicular.",
    variables: [
      { key: "dot", latex: "\\vec{a}\\cdot\\vec{b}", name: "Dot product" },
      {
        key: "a",
        latex: "|\\vec{a}|",
        name: "Magnitude of a",
        value: 3,
        min: 0,
      },
      {
        key: "b",
        latex: "|\\vec{b}|",
        name: "Magnitude of b",
        value: 4,
        min: 0,
      },
      {
        key: "theta",
        latex: "\\theta",
        name: "Angle between them",
        unit: "°",
        value: 60,
        angle: true,
        min: 0,
        max: 180,
      },
    ],
    tags: [TAGS.VECTORS, TAGS.MATH],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["vector-magnitude", "lamberts-cosine-law", "law-of-reflection"],
    solve: {
      dot: ({ a, b, theta }) => a * b * Math.cos(theta),
      theta: ({ dot, a, b }) => Math.acos(dot / (a * b)),
    },
    note: "In physics it gives work: $W = \\vec{F}\\cdot\\vec{s}$ counts only the part of the force along the motion.",
  },
  {
    id: "pythagorean-identity",
    name: "Pythagorean identity",
    aka: ["sin² + cos² = 1"],
    latex: "\\sin^{2}\\theta + \\cos^{2}\\theta = 1",
    summary:
      "On the unit circle, $\\cos\\theta$ and $\\sin\\theta$ are the legs of a right triangle with hypotenuse 1 — so this holds for every angle.",
    variables: [
      { key: "theta", latex: "\\theta", name: "Any angle", unit: "°" },
    ],
    tags: [TAGS.TRIGONOMETRY, TAGS.MATH],
    level: "upperSecondary",
    difficulty: "core",
    related: ["tangent-ratio", "vector-magnitude"],
  },
  {
    id: "tangent-ratio",
    name: "Tangent as a ratio",
    aka: ["Definition of tangent"],
    latex: "\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}",
    summary:
      "The tangent is the slope of the line from the origin through the point on the unit circle. It blows up at 90°, where the cosine is zero.",
    variables: [{ key: "theta", latex: "\\theta", name: "Angle", unit: "°" }],
    tags: [TAGS.TRIGONOMETRY, TAGS.MATH],
    level: "upperSecondary",
    difficulty: "core",
    related: ["pythagorean-identity", "sine-wave"],
  },
  {
    id: "sine-wave",
    name: "Sine wave",
    aka: ["Sinusoid", "Generalised sine function"],
    latex: "y = A\\sin(\\omega\\theta + \\varphi)",
    summary:
      "The shape of every oscillation and wave: $A$ stretches it vertically, $\\omega$ squeezes it horizontally, $\\varphi$ slides it sideways.",
    variables: [
      { key: "y", latex: "y", name: "Value" },
      { key: "A", latex: "A", name: "Amplitude", value: 2 },
      { key: "omega", latex: "\\omega", name: "Angular frequency", value: 1 },
      {
        key: "theta",
        latex: "\\theta",
        name: "Angle",
        unit: "°",
        value: 30,
        angle: true,
      },
      {
        key: "phi",
        latex: "\\varphi",
        name: "Phase",
        unit: "°",
        value: 0,
        angle: true,
      },
    ],
    tags: [TAGS.TRIGONOMETRY, TAGS.WAVES],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["shm-position", "tangent-ratio"],
    solve: {
      y: ({ A, omega, theta, phi }) => A * Math.sin(omega * theta + phi),
    },
  },
];

export default math;
