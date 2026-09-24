// Where each physics/maths concept is taught in each supported curriculum.
//
// This file is the single place to audit (and correct) a school-level
// assignment. Two tables:
//
//   TOPIC_PLACEMENTS   concept -> curriculum -> placement
//   CONTENT_TOPICS     "sim:<Name>" / "blog:<slug>" -> concept
//
// A placement is `at(stage, grades, also?, note?)`:
//   stage   id of a stage in data/curricula.js (the *primary* level)
//   grades  the precise year/grade label shown to the reader
//   also    other stages where the item still works (revisited or previewed)
//   note    a caveat worth surfacing (a syllabus quirk, regional variation)
//
// Rule for the primary stage: the stage where the concept is first taught to
// the depth the item actually reaches — not merely where it is first mentioned.
// A simulation that shows sec/csc/cot and inverse functions belongs where those
// are taught, even though right-angled trigonometry comes earlier.
//
// Sources (checked against the official documents unless marked "from
// memory"): US — NGSS (MS-PS2/3/4, HS-PS2/3/4), Common Core HSG-SRT / HSF-TF,
// AP Physics 1 (2025 units); UK — England National Curriculum KS1-4 and the
// GCSE / A-level physics subject content (AQA, Edexcel); India — NCERT
// Classes 6-12 (Class 9 = the 2026-27 "Exploration" textbook, Class 11 =
// current Part I/II); Australia — Australian Curriculum v9 Science 7-10 and
// Senior Secondary Physics (Units 1-4) plus NSW/QLD/VIC senior courses;
// Italy — Indicazioni nazionali 2012 (primo ciclo) and the liceo scientifico
// guidelines (DPR 89/2010); Singapore — SEAB 6091 (O-Level Physics, 2026) and
// 9749 (H2 Physics, 2025), MOE Lower Secondary Science 2021.
//
// Anything an item has no entry for falls back to its international level
// (see getPlacement in curricula.js), so a missing row degrades gracefully.

const at = (stage, grades, also = [], note) => ({
  stage,
  grades,
  also,
  ...(note ? { note } : {}),
});

export const TOPIC_PLACEMENTS = {
  // Speed and motion, first ideas — the Bouncing Ball simulation.
  "motion-basics": {
    us: at("middle", "Grades 6–8", ["elementary"]),
    uk: at("ks3", "Years 7–8", ["primary"]),
    in: at("middle", "Class 7", ["primary"]),
    au: at("junior", "Year 7", ["primary"]),
    it: at("media", "3ª media", ["primaria"]),
    sg: at("lower", "Sec 1–2", ["primary"]),
  },

  // Energy loss at each bounce, coefficient of restitution, geometric series.
  "bouncing-restitution": {
    us: at("high", "Grades 9–12"),
    uk: at("gcse", "Years 10–11", ["alevel"]),
    in: at("secondary", "Class 9", ["senior"]),
    au: at("junior", "Years 9–10", ["senior"]),
    it: at("biennio", "2º anno", ["triennio"]),
    sg: at("upper", "Sec 3–4", ["jc"]),
  },

  // Adding vectors, components, dot and cross products.
  vectors: {
    us: at("high", "Grades 10–12", ["college"]),
    uk: at("alevel", "Year 12", ["gcse"]),
    in: at("senior", "Class 11"),
    au: at("senior", "Year 11"),
    it: at("biennio", "1º–2º anno", ["triennio"]),
    sg: at(
      "jc",
      "JC1",
      ["upper"],
      "O-Level Physics adds vectors graphically only; components arrive at H2."
    ),
  },

  // Velocity, constant acceleration.
  "uniform-acceleration": {
    us: at("middle", "Grade 8", ["high"]),
    uk: at("gcse", "Years 10–11", ["ks3"]),
    in: at("secondary", "Class 9", ["senior"]),
    au: at("junior", "Years 9–10", ["senior"]),
    it: at("biennio", "2º anno"),
    sg: at("upper", "Sec 3", ["jc"]),
  },

  // g, free-fall equations, terminal velocity.
  "free-fall": {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("gcse", "Years 10–11", ["ks3"]),
    in: at("secondary", "Class 9", ["senior"]),
    au: at("junior", "Years 9–10", ["senior"]),
    it: at("biennio", "2º anno"),
    sg: at("upper", "Sec 3", ["jc"]),
  },

  // Hooke's law and elastic energy (the horizontal-spring simulation).
  "hooke-law": {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("gcse", "Years 10–11", ["ks3"]),
    in: at("senior", "Class 11"),
    au: at("senior", "Year 11", ["junior"]),
    it: at("biennio", "1º anno", ["triennio"]),
    sg: at(
      "jc",
      "JC1",
      [],
      "O-Level Physics only covers elastic energy stores; Hooke's law is examined at H2."
    ),
  },

  // Mass on a spring as simple harmonic motion, with energy exchange.
  "spring-shm": {
    us: at("high", "Grades 11–12 · AP Physics 1", ["college"]),
    uk: at("alevel", "Year 13", ["gcse"]),
    in: at("senior", "Class 11"),
    au: at(
      "senior",
      "Year 12",
      [],
      "Simple harmonic motion is not part of the national senior Physics course; NSW teaches it in Mathematics Extension 2."
    ),
    it: at("triennio", "3º anno"),
    sg: at("jc", "JC1–2"),
  },

  // Period of a pendulum, small-angle approximation, energy.
  pendulum: {
    us: at("high", "Grades 9–12"),
    uk: at("alevel", "Year 13", ["gcse"]),
    in: at("senior", "Class 11"),
    au: at(
      "senior",
      "Year 12",
      ["junior"],
      "The period formula belongs to simple harmonic motion, which the national senior Physics course leaves out."
    ),
    it: at("triennio", "3º anno", ["biennio"]),
    sg: at("jc", "JC1–2", ["upper"]),
  },

  // Trajectory, range, maximum height, independent components.
  projectile: {
    us: at("high", "Grades 10–12"),
    uk: at("alevel", "Year 12"),
    in: at("senior", "Class 11"),
    au: at(
      "senior",
      "Years 11–12",
      [],
      "Sits in Year 12 (NSW Module 5, QLD Unit 3) in most states."
    ),
    it: at(
      "triennio",
      "3º anno",
      ["biennio"],
      "Some schools teach the composition of motions in the 2º anno."
    ),
    sg: at(
      "jc",
      "JC1",
      [],
      "O-Level Physics has no projectile motion; it first appears at H2."
    ),
  },

  // Forces on a slope: components, normal force, friction.
  "inclined-plane": {
    us: at("high", "Grades 9–12"),
    uk: at("alevel", "Year 12", ["gcse"]),
    in: at("senior", "Class 11", ["secondary"]),
    au: at("senior", "Year 11", ["junior"]),
    it: at("biennio", "1º–2º anno", ["media"]),
    sg: at("upper", "Sec 3–4", ["jc"]),
  },

  // Uniform circular motion, centripetal acceleration and force.
  "circular-motion": {
    us: at("high", "Grades 11–12 · AP Physics 1", ["college"]),
    uk: at("alevel", "Year 13"),
    in: at("senior", "Class 11"),
    au: at("senior", "Year 12"),
    it: at("triennio", "3º anno", ["biennio"]),
    sg: at("jc", "JC1"),
  },

  // Newtonian gravity for three bodies: numerical, university level.
  "three-body": {
    us: at("college", "Undergraduate", ["high"]),
    uk: at("university", "Undergraduate", ["alevel"]),
    in: at("university", "B.Sc / B.Tech", ["senior"]),
    au: at("university", "Undergraduate", ["senior"]),
    it: at("universita", "Università", ["triennio"]),
    sg: at("university", "Undergraduate", ["jc"]),
  },

  // Chaos in the double pendulum: university level.
  "double-pendulum": {
    us: at("college", "Undergraduate"),
    uk: at("university", "Undergraduate"),
    in: at("university", "B.Sc / B.Tech"),
    au: at("university", "Undergraduate"),
    it: at("universita", "Università"),
    sg: at("university", "Undergraduate"),
  },

  // Momentum conservation, elastic versus inelastic, restitution.
  collisions: {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("alevel", "Year 12", ["gcse"]),
    in: at("senior", "Class 11", ["secondary"]),
    au: at("senior", "Year 11"),
    it: at("triennio", "3º–4º anno"),
    sg: at("jc", "JC1"),
  },

  // Deriving π from block collisions: conservation laws, beyond school.
  "pi-collisions": {
    us: at("college", "Undergraduate", ["high"]),
    uk: at("university", "Undergraduate", ["alevel"]),
    in: at("university", "B.Sc / B.Tech", ["senior"]),
    au: at("university", "Undergraduate", ["senior"]),
    it: at("universita", "Università", ["triennio"]),
    sg: at("university", "Undergraduate", ["jc"]),
  },

  // sin, cos, tan, sec, csc, cot, radians, inverse functions, sin(ωθ+φ).
  "trigonometry-unit-circle": {
    us: at(
      "high",
      "Grades 10–11",
      [],
      "Right-triangle trig sits in Geometry (Grade 10), the unit circle in Algebra II / Precalculus."
    ),
    uk: at("alevel", "Year 12", ["gcse"]),
    in: at(
      "senior",
      "Class 11",
      ["secondary"],
      "Class 10 introduces trigonometric ratios; Class 11 Mathematics covers trigonometric functions."
    ),
    au: at("senior", "Year 11", ["junior"]),
    it: at("triennio", "3º–4º anno"),
    sg: at("upper", "Sec 3–4", ["lower"], "Taught in Additional Mathematics."),
  },

  // Scattering of light and why the sky is blue.
  "light-scattering": {
    us: at("middle", "Grades 6–8", ["high"]),
    uk: at("ks3", "Years 8–9", ["gcse"]),
    in: at(
      "secondary",
      "Class 10",
      [],
      "NCERT Class 10: scattering of light and the colour of the sky."
    ),
    au: at("junior", "Years 9–10", ["senior"]),
    it: at("biennio", "1º–2º anno", ["triennio"]),
    sg: at(
      "lower",
      "Sec 1",
      ["upper"],
      "The Rayleigh law itself is beyond the syllabus."
    ),
  },

  // Lift on a wing.
  "flight-lift": {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("gcse", "Years 10–11", ["alevel"]),
    in: at("senior", "Class 11", ["secondary"]),
    au: at("junior", "Years 7–10", ["senior"]),
    it: at("triennio", "3º–4º anno"),
    sg: at("upper", "Sec 3–4", ["jc"]),
  },

  // Why light beats sound in a thunderstorm.
  "speed-of-sound-and-light": {
    us: at("middle", "Grades 6–8", ["elementary"]),
    uk: at("ks3", "Year 8", ["primary"]),
    in: at("secondary", "Class 9", ["middle"]),
    au: at("junior", "Year 9"),
    it: at("media", "3ª media", ["triennio"]),
    sg: at("upper", "Sec 3–4", ["lower"]),
  },

  // Free fall around the Earth, gravity at the ISS.
  "orbits-weightlessness": {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("gcse", "Years 10–11", ["ks3", "alevel"]),
    in: at("senior", "Class 11", ["secondary"]),
    au: at("senior", "Year 12", ["junior"]),
    it: at("triennio", "4º anno"),
    sg: at("jc", "JC1", ["upper"]),
  },

  // Thermal conductivity, Fourier's law and why metal feels cold.
  "heat-conduction": {
    us: at("high", "Grades 9–12", ["middle"]),
    uk: at("gcse", "Years 10–11", ["ks3"]),
    in: at("senior", "Class 11", ["middle"]),
    au: at("senior", "Year 11", ["junior"]),
    it: at("biennio", "1º–2º anno", ["media", "triennio"]),
    sg: at("upper", "Sec 3–4", ["lower"]),
  },

  // Electromagnetism, optics, modern physics — written for CBSE Class 12.
  "fields-and-modern-physics": {
    us: at("high", "Grades 11–12 · AP Physics 2 / C", ["college"]),
    uk: at("alevel", "Years 12–13"),
    in: at(
      "senior",
      "Class 12",
      [],
      "Written for the CBSE / NCERT Class 12 syllabus."
    ),
    au: at("senior", "Year 12"),
    it: at("triennio", "4º–5º anno"),
    sg: at("jc", "JC1–2"),
  },

  // A first look at what physics is.
  "physics-intro": {
    us: at("elementary", "Grades K–5"),
    uk: at("primary", "Years 1–6"),
    in: at("primary", "Classes 1–5"),
    au: at("primary", "Foundation–Year 6"),
    it: at("primaria", "Classi 1–5"),
    sg: at("primary", "P1–P6"),
  },

  // Coding a physics simulation: computational modelling for developers.
  "programming-simulation": {
    us: at("college", "Undergraduate"),
    uk: at("university", "Undergraduate"),
    in: at("university", "B.Sc / B.Tech"),
    au: at("university", "Undergraduate"),
    it: at("universita", "Università"),
    sg: at("university", "Undergraduate"),
  },
};

export const CONTENT_TOPICS = {
  // Simulations
  "sim:BouncingBall": "motion-basics",
  "sim:VectorsOperations": "vectors",
  "sim:BallAcceleration": "uniform-acceleration",
  "sim:BallGravity": "free-fall",
  "sim:SpringConnection": "spring-shm",
  "sim:SimplePendulum": "pendulum",
  "sim:ParabolicMotion": "projectile",
  "sim:InclinedPlane": "inclined-plane",
  "sim:CircularMotion": "circular-motion",
  "sim:ThreeBody": "three-body",
  "sim:HorizontalSpring": "hooke-law",
  "sim:DoublePendulum": "double-pendulum",
  "sim:CollisionSimulation": "collisions",
  "sim:PiCollisions": "pi-collisions",
  "sim:TrigonometricCircle": "trigonometry-unit-circle",

  // Articles
  "blog:what-is-physics": "physics-intro",
  "blog:class-12-physics-complete-guide": "fields-and-modern-physics",
  "blog:why-is-the-sky-blue": "light-scattering",
  "blog:why-does-metal-feel-colder-than-wood": "heat-conduction",
  "blog:physics-bouncing-ball-comprehensive-educational-guide":
    "bouncing-restitution",
  "blog:coding-a-bouncing-ball-simulation": "programming-simulation",
  "blog:elastic-inelastic-collisions": "collisions",
  "blog:comprehensive-guide-to-vector-operations": "vectors",
  "blog:unit-circle-trigonometry": "trigonometry-unit-circle",
  "blog:ball-uniformly-accelerated-motion": "uniform-acceleration",
  "blog:why-do-we-see-lightning-before-thunder": "speed-of-sound-and-light",
  "blog:ball-free-fall-comprehensive-guide": "free-fall",
  "blog:simulating-air-resistance-in-code": "programming-simulation",
  "blog:how-do-airplanes-fly": "flight-lift",
  "blog:inclined-plane-forces": "inclined-plane",
  "blog:circular-motion-centripetal-force": "circular-motion",
  "blog:why-do-astronauts-float-in-space": "orbits-weightlessness",
  "blog:spring-connection": "spring-shm",
  "blog:physics-of-pendulum-explained": "pendulum",
  "blog:simulating-a-pendulum-in-code": "programming-simulation",
  "blog:double-pendulum-chaos": "double-pendulum",
  "blog:projectile-parabolic-motion": "projectile",
  "blog:physics-behind-three-body-problem": "three-body",
  "blog:pi-from-block-collisions-explained": "pi-collisions",
};
