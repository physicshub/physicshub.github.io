import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const oscillations = [
  {
    id: "spring-angular-frequency",
    name: "Angular frequency of a mass on a spring",
    aka: ["Natural frequency"],
    latex: "\\omega = \\sqrt{\\dfrac{k}{m}}",
    summary:
      "How fast a mass on a spring oscillates: a stiffer spring speeds it up, a heavier mass slows it down.",
    variables: [
      {
        key: "omega",
        latex: "\\omega",
        name: "Angular frequency",
        unit: "rad/s",
        min: 0,
      },
      {
        key: "k",
        latex: "k",
        name: "Spring constant",
        unit: "N/m",
        value: 20,
        min: 0,
      },
      { key: "m", latex: "m", name: "Mass", unit: "kg", value: 0.5, min: 0 },
    ],
    validity: ["Ideal spring obeying Hooke's law", "No damping"],
    tags: [TAGS.OSCILLATIONS, TAGS.SPRINGS],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["spring-period", "hookes-law", "shm-position"],
    solve: {
      omega: ({ k, m }) => Math.sqrt(k / m),
      k: ({ omega, m }) => omega * omega * m,
      m: ({ omega, k }) => k / (omega * omega),
    },
  },
  {
    id: "spring-period",
    name: "Period of a mass on a spring",
    aka: ["Mass–spring period"],
    latex: "T = 2\\pi\\sqrt{\\dfrac{m}{k}}",
    summary:
      "The time for one full oscillation. The amplitude is missing on purpose: small or large swings take the same time.",
    variables: [
      { key: "T", latex: "T", name: "Period", unit: "s", min: 0 },
      { key: "m", latex: "m", name: "Mass", unit: "kg", value: 0.5, min: 0 },
      {
        key: "k",
        latex: "k",
        name: "Spring constant",
        unit: "N/m",
        value: 20,
        min: 0,
      },
    ],
    validity: ["Ideal spring obeying Hooke's law", "No damping"],
    tags: [TAGS.OSCILLATIONS, TAGS.SPRINGS],
    level: "upperSecondary",
    difficulty: "core",
    related: ["spring-angular-frequency", "pendulum-period", "hookes-law"],
    solve: {
      T: ({ m, k }) => 2 * Math.PI * Math.sqrt(m / k),
      m: ({ T, k }) => k * (T / (2 * Math.PI)) ** 2,
      k: ({ T, m }) => m / (T / (2 * Math.PI)) ** 2,
    },
    example: {
      problem:
        "A 0.5 kg mass hangs from a spring with $k = 20$ N/m. What is its period?",
      solution:
        "$T = 2\\pi\\sqrt{0.5/20} \\approx 0.99$ s — almost exactly one bounce per second.",
    },
    pitfalls: [
      "Hanging the spring vertically does not change the period: gravity only shifts the rest position.",
    ],
  },
  {
    id: "shm-position",
    name: "Simple harmonic motion",
    aka: ["Position over time in SHM"],
    latex: "x(t) = A\\cos(\\omega t + \\varphi)",
    summary:
      "A linear restoring force makes a body oscillate as a cosine: amplitude $A$, angular frequency $\\omega$, phase $\\varphi$.",
    variables: [
      { key: "x", latex: "x", name: "Displacement", unit: "m" },
      {
        key: "A",
        latex: "A",
        name: "Amplitude",
        unit: "m",
        value: 0.1,
        min: 0,
      },
      {
        key: "omega",
        latex: "\\omega",
        name: "Angular frequency",
        unit: "rad/s",
        value: 6.32,
        min: 0,
      },
      { key: "t", latex: "t", name: "Time", unit: "s", value: 0.5 },
      { key: "phi", latex: "\\varphi", name: "Phase", unit: "rad", value: 0 },
    ],
    validity: ["Restoring force proportional to displacement", "No damping"],
    tags: [TAGS.OSCILLATIONS],
    level: "upperSecondary",
    difficulty: "extended",
    related: [
      "spring-angular-frequency",
      "elastic-potential-energy",
      "sine-wave",
    ],
    solve: {
      x: ({ A, omega, t, phi }) => A * Math.cos(omega * t + phi),
    },
  },
  {
    id: "pendulum-period",
    name: "Period of a simple pendulum",
    aka: ["Pendulum formula"],
    latex: "T = 2\\pi\\sqrt{\\dfrac{L}{g}}",
    summary:
      "For small swings a pendulum's period depends only on its length and on gravity — not on the mass, not on how far it swings.",
    variables: [
      { key: "T", latex: "T", name: "Period", unit: "s", min: 0 },
      { key: "L", latex: "L", name: "Length", unit: "m", value: 1, min: 0 },
      {
        key: "g",
        latex: "g",
        name: "Gravitational acceleration",
        unit: "m/s²",
        value: 9.81,
        min: 0,
      },
    ],
    validity: [
      "Small angles (below about 15°), where $\\sin\\theta \\approx \\theta$",
      "Point mass on a massless string, no friction",
    ],
    tags: [TAGS.OSCILLATIONS, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "pendulum-equation-of-motion",
      "pendulum-speed-bottom",
      "spring-period",
    ],
    solve: {
      T: ({ L, g }) => 2 * Math.PI * Math.sqrt(L / g),
      L: ({ T, g }) => g * (T / (2 * Math.PI)) ** 2,
      g: ({ T, L }) => L / (T / (2 * Math.PI)) ** 2,
    },
    example: {
      problem:
        "How long must a pendulum be to tick once per second (a period of 2 s)?",
      solution:
        "$L = g\\,(T/2\\pi)^2 = 9.81 \\cdot (2/2\\pi)^2 \\approx 0.99$ m — the “seconds pendulum” of grandfather clocks.",
    },
    pitfalls: [
      "At large amplitudes the real period is longer: about 1.7% longer at 30°, 18% at 90°.",
    ],
    history: {
      who: "Galileo Galilei, Christiaan Huygens",
      year: "1602–1673",
      text: "Galileo noticed that a pendulum's swings take equal times; Huygens derived the formula and built the first pendulum clock.",
    },
  },
  {
    id: "pendulum-equation-of-motion",
    name: "Pendulum equation of motion",
    aka: ["Nonlinear pendulum equation"],
    latex: "\\ddot{\\theta} + \\dfrac{g}{L}\\sin\\theta = 0",
    summary:
      "The exact equation for a swinging pendulum. The $\\sin\\theta$ makes it nonlinear; replacing it with $\\theta$ for small angles gives simple harmonic motion.",
    variables: [
      {
        key: "theta",
        latex: "\\theta",
        name: "Angle from the vertical",
        unit: "rad",
      },
      {
        key: "thetaddot",
        latex: "\\ddot{\\theta}",
        name: "Angular acceleration",
        unit: "rad/s²",
      },
      {
        key: "g",
        latex: "g",
        name: "Gravitational acceleration",
        unit: "m/s²",
      },
      { key: "L", latex: "L", name: "Length", unit: "m" },
    ],
    validity: ["Point mass on a rigid, massless rod", "No friction"],
    tags: [TAGS.OSCILLATIONS, TAGS.DYNAMICS],
    level: "undergraduate",
    difficulty: "extended",
    related: ["pendulum-period", "euler-lagrange"],
  },
];

export default oscillations;
