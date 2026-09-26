import TAGS from "../tags.js";

const G = {
  key: "G",
  latex: "G",
  name: "Gravitational constant",
  unit: "N·m²/kg²",
  constant: 6.674e-11,
};

/** @type {import("./index.js").Formula[]} */
const gravitation = [
  {
    id: "newtons-law-of-gravitation",
    name: "Newton's law of universal gravitation",
    aka: ["Inverse-square law of gravity"],
    latex: "F = G\\,\\dfrac{m_1 m_2}{r^{2}}",
    summary:
      "Every two masses attract each other along the line between them, with a force that falls off as the square of the distance.",
    variables: [
      { key: "F", latex: "F", name: "Gravitational force", unit: "N", min: 0 },
      G,
      {
        key: "m1",
        latex: "m_1",
        name: "First mass",
        unit: "kg",
        value: 5.972e24,
        min: 0,
      },
      {
        key: "m2",
        latex: "m_2",
        name: "Second mass",
        unit: "kg",
        value: 70,
        min: 0,
      },
      {
        key: "r",
        latex: "r",
        name: "Distance between the centres",
        unit: "m",
        value: 6.371e6,
        min: 0,
      },
    ],
    validity: [
      "Point masses or spherically symmetric bodies",
      "Weak fields and slow speeds (otherwise general relativity)",
    ],
    tags: [TAGS.GRAVITY, TAGS.FORCES],
    level: "upperSecondary",
    difficulty: "extended",
    related: [
      "weight",
      "orbital-speed",
      "gravitational-superposition",
      "gravity-at-altitude",
    ],
    solve: {
      F: ({ G, m1, m2, r }) => (G * m1 * m2) / (r * r),
      m1: ({ F, G, m2, r }) => (F * r * r) / (G * m2),
      m2: ({ F, G, m1, r }) => (F * r * r) / (G * m1),
      r: ({ F, G, m1, m2 }) => Math.sqrt((G * m1 * m2) / F),
    },
    note: "In vector form, the force on body $i$ from body $j$ is $\\vec{F}_{ij} = -G\\,\\dfrac{m_i m_j}{|\\vec{r}_{ij}|^{2}}\\,\\hat{r}_{ij}$.",
    history: {
      who: "Isaac Newton",
      year: "1687",
      text: "The same law explains a falling apple and the orbit of the Moon.",
    },
  },
  {
    id: "gravitational-superposition",
    name: "Net gravitational force",
    aka: ["Superposition of forces", "N-body force"],
    latex: "\\vec{F}_i = \\sum_{j \\ne i} \\vec{F}_{ij}",
    summary:
      "With many bodies, each one feels the vector sum of the pulls from all the others. With three or more there is no general closed-form solution.",
    variables: [
      {
        key: "Fi",
        latex: "\\vec{F}_i",
        name: "Net force on body $i$",
        unit: "N",
      },
      {
        key: "Fij",
        latex: "\\vec{F}_{ij}",
        name: "Force on body $i$ from body $j$",
        unit: "N",
      },
    ],
    validity: ["Newtonian gravity"],
    tags: [TAGS.GRAVITY, TAGS.VECTORS],
    level: "undergraduate",
    difficulty: "advanced",
    related: ["newtons-law-of-gravitation", "vector-sum"],
  },
  {
    id: "orbital-speed",
    name: "Circular orbital speed",
    aka: ["Orbital velocity"],
    latex: "v = \\sqrt{\\dfrac{G M}{r}}",
    summary:
      "The speed that keeps a satellite on a circular orbit: gravity supplies exactly the centripetal force it needs.",
    variables: [
      { key: "v", latex: "v", name: "Orbital speed", unit: "m/s", min: 0 },
      G,
      {
        key: "M",
        latex: "M",
        name: "Mass of the central body",
        unit: "kg",
        value: 5.972e24,
        min: 0,
      },
      {
        key: "r",
        latex: "r",
        name: "Orbit radius (from the centre)",
        unit: "m",
        value: 6.771e6,
        min: 0,
      },
    ],
    validity: [
      "Circular orbit",
      "Satellite much lighter than the central body",
    ],
    tags: [TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "extended",
    related: [
      "newtons-law-of-gravitation",
      "centripetal-force",
      "circular-period",
    ],
    solve: {
      v: ({ G, M, r }) => Math.sqrt((G * M) / r),
      M: ({ v, G, r }) => (v * v * r) / G,
      r: ({ v, G, M }) => (G * M) / (v * v),
    },
    example: {
      problem:
        "The ISS orbits about 400 km up, so $r \\approx 6771$ km. How fast does it go?",
      solution:
        "$v = \\sqrt{6.674\\times10^{-11} \\cdot 5.972\\times10^{24} / 6.771\\times10^{6}} \\approx 7.67$ km/s.",
    },
    note: "It comes from setting $G M m / r^2 = m v^2 / r$ — the satellite's own mass cancels.",
  },
  {
    id: "gravity-at-altitude",
    name: "Gravity at altitude",
    aka: ["Variation of g with height"],
    latex: "g(h) = g_0\\left(\\dfrac{R}{R+h}\\right)^{2}",
    summary:
      "Gravity weakens slowly with height. At the International Space Station it is still about 90% of its value on the ground.",
    variables: [
      {
        key: "g",
        latex: "g(h)",
        name: "Gravitational acceleration at height h",
        unit: "m/s²",
        min: 0,
      },
      {
        key: "g0",
        latex: "g_0",
        name: "Surface gravitational acceleration",
        unit: "m/s²",
        value: 9.81,
        min: 0,
      },
      {
        key: "R",
        latex: "R",
        name: "Planet radius",
        unit: "m",
        value: 6.371e6,
        min: 0,
      },
      {
        key: "h",
        latex: "h",
        name: "Height above the surface",
        unit: "m",
        value: 4e5,
        min: 0,
      },
    ],
    validity: ["Spherical planet", "Above the surface"],
    tags: [TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["weight", "newtons-law-of-gravitation"],
    solve: {
      g: ({ g0, R, h }) => g0 * (R / (R + h)) ** 2,
      h: ({ g, g0, R }) => R * Math.sqrt(g0 / g) - R,
    },
    pitfalls: [
      "Astronauts float because they are in free fall around the Earth, not because gravity is missing.",
    ],
  },
];

export default gravitation;
