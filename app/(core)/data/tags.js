export const COLORS = {
  green: { primary: "#00c62e", secondary: "#00ff3c" },
  lightorange: { primary: "#ffc823", secondary: "#ffb300" },
  red: { primary: "#dc3545", secondary: "#ff0019" },
  bluesky: { primary: "#007bff", secondary: "#00cfff" },
  purple: { primary: "#8e44ad", secondary: "#c678dd" },
  orange: { primary: "#fd7e14", secondary: "#ffb07c" },
  cyan: { primary: "#20c997", secondary: "#00ffb3" },
  grey: { primary: "#6c757d", secondary: "#adb5bd" },
  pink: { primary: "#e83e8c", secondary: "#ff6fba" },
  coral: { primary: "#ff6f61", secondary: "#ff9a8d" },
  navy: { primary: "#2c3e50", secondary: "#34495e" },
  gold: { primary: "#f1c40f", secondary: "#f39c12" },
  lime: { primary: "#a2d149", secondary: "#badc58" },
  indigo: { primary: "#6610f2", secondary: "#8f5fe8" },
  teal: { primary: "#17a2b8", secondary: "#20c997" },
  maroon: { primary: "#800000", secondary: "#a52a2a" },
};

const TAGS = {
  PHYSICS: {
    name: "Physics",
    color: "cyan",
  },
  MATH: {
    name: "Math",
    color: "green",
  },
  KINEMATICS: {
    name: "Kinematics",
    color: "green",
  },
  ACCELERATION: {
    name: "Acceleration",
    color: "cyan",
  },
  VECTORS: {
    name: "Vectors",
    color: "lightorange",
  },
  FORCES: {
    name: "Forces",
    color: "red",
  },
  GRAVITY: {
    name: "Gravity",
    color: "grey",
  },
  FRICTION: {
    name: "Friction",
    color: "grey",
  },
  COLLISION: {
    name: "Collision",
    color: "bluesky",
  },
  ENERGY: {
    name: "Energy",
    color: "coral",
  },
  OSCILLATIONS: {
    name: "Oscillations",
    color: "pink",
  },
  SPRINGS: {
    name: "Springs",
    color: "orange",
  },
  WAVES: {
    name: "Waves",
    color: "indigo",
  },
  THERMODYNAMICS: {
    name: "Thermodynamics",
    color: "maroon",
  },
  ELECTROMAGNETISM: {
    name: "Electromagnetism",
    color: "gold",
  },
  FLUIDS: {
    name: "Fluids",
    color: "teal",
  },
  OPTICS: {
    name: "Optics",
    color: "lime",
  },
  RELATIVITY: {
    name: "Relativity",
    color: "navy",
  },
  QUANTUM: {
    name: "Quantum",
    color: "purple",
  },
  ANIMATIONS: {
    name: "Animations",
    color: "purple",
  },
  INTERACTIVE: {
    name: "Interactive",
    color: "coral",
  },
  EXPERIMENTAL: {
    name: "Experimental",
    color: "lightorange",
  },
  DYNAMICS: {
    name: "Dynamics",
    color: "red",
  },
  TRIGONOMETRY: {
    name: "Trigonometry",
    color: "purple",
  },
  BENCHMARK: {
    name: "Benchmark",
    color: "grey",
  },
  PERFORMANCE: {
    name: "Performance",
    color: "navy",
  },
  OSCILLATIONS: {
    name: "Oscillations",
    color: "pink",
  },
};

// School levels. Ordered deliberately: Elementary → Undergraduate, then Tool.
// `equivalents` lists the most widely recognised international correspondences
// (US grades, UK key stages, Cambridge, IB) — shown as helper text in the UI.
export const LEVELS = {
  elementary: {
    id: "elementary",
    name: "Elementary",
    age: "Ages 6-11",
    equivalents: ["Grades K-5", "UK Key Stages 1-2", "IB PYP"],
    color: "green",
  },
  lowerSecondary: {
    id: "lowerSecondary",
    name: "Middle School",
    age: "Ages 11-14",
    equivalents: [
      "Grades 6-8",
      "UK Key Stage 3",
      "IGCSE foundation",
      "IB MYP 1-3",
    ],
    color: "teal",
  },
  upperSecondary: {
    id: "upperSecondary",
    name: "High School",
    age: "Ages 14-18",
    equivalents: ["Grades 9-12", "IGCSE", "AS & A-Level", "IB Diploma"],
    color: "bluesky",
  },
  undergraduate: {
    id: "undergraduate",
    name: "University",
    age: "Ages 18+",
    equivalents: ["First-year university", "Physics olympiads"],
    color: "purple",
  },
  tool: {
    id: "tool",
    name: "Tool / Demo",
    age: "Non-curricular",
    equivalents: ["Reference & fun"],
    color: "grey",
  },
};

export const LEVEL_ORDER = [
  LEVELS.elementary,
  LEVELS.lowerSecondary,
  LEVELS.upperSecondary,
  LEVELS.undergraduate,
  LEVELS.tool,
];

// Difficulty *within* a school level, replacing the old Easy/Medium/Advanced.
export const DIFFICULTIES = {
  core: { id: "core", name: "Core", color: "green" },
  extended: { id: "extended", name: "Extended", color: "lightorange" },
  advanced: { id: "advanced", name: "Advanced", color: "red" },
};

export default TAGS;
