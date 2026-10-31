import TAGS from "../tags.js";

// Smallest non-negative root of ½a·t² + v0·t − s = 0 — the first time an object
// starting at v0 with acceleration a has covered displacement s.
const firstTime = ({ s, v0, a }) => {
  if (a === 0) return v0 === 0 ? NaN : s / v0 >= 0 ? s / v0 : NaN;
  const disc = v0 * v0 + 2 * a * s;
  if (disc < 0) return NaN;
  const roots = [(-v0 + Math.sqrt(disc)) / a, (-v0 - Math.sqrt(disc)) / a];
  const valid = roots.filter((t) => t >= 0);
  return valid.length ? Math.min(...valid) : NaN;
};

/** @type {import("./index.js").Formula[]} */
const kinematics = [
  {
    id: "uniform-motion",
    name: "Uniform motion",
    aka: ["Constant-velocity motion", "Position update"],
    latex: "x = x_0 + v\\,t",
    summary:
      "An object moving at constant velocity covers equal distances in equal times, so its position grows linearly with time.",
    variables: [
      { key: "x", latex: "x", name: "Position", unit: "m", value: 10 },
      {
        key: "x0",
        latex: "x_0",
        name: "Initial position",
        unit: "m",
        value: 0,
      },
      { key: "v", latex: "v", name: "Velocity", unit: "m/s", value: 2 },
      { key: "t", latex: "t", name: "Time", unit: "s", value: 5, min: 0 },
    ],
    validity: [
      "Constant velocity: no acceleration",
      "Applies to each component separately in 2-D or 3-D",
    ],
    tags: [TAGS.KINEMATICS],
    level: "lowerSecondary",
    difficulty: "core",
    related: [
      "velocity-constant-acceleration",
      "displacement-constant-acceleration",
    ],
    solve: {
      x: ({ x0, v, t }) => x0 + v * t,
      x0: ({ x, v, t }) => x - v * t,
      v: ({ x, x0, t }) => (x - x0) / t,
      t: ({ x, x0, v }) => (x - x0) / v,
    },
    note: "A simulation applies this rule once per time step, $\\vec{x}_{t+\\Delta t} = \\vec{x}_t + \\vec{v}\\,\\Delta t$ — during a short enough step, any motion looks uniform.",
  },
  {
    id: "velocity-constant-acceleration",
    name: "Velocity under constant acceleration",
    aka: ["First equation of motion", "SUVAT v = u + at"],
    latex: "v = v_0 + a\\,t",
    summary:
      "With a constant acceleration, velocity changes by the same amount every second: acceleration is the rate of change of velocity.",
    variables: [
      { key: "v", latex: "v", name: "Final velocity", unit: "m/s", value: 12 },
      {
        key: "v0",
        latex: "v_0",
        name: "Initial velocity",
        unit: "m/s",
        value: 0,
      },
      { key: "a", latex: "a", name: "Acceleration", unit: "m/s²", value: 3 },
      { key: "t", latex: "t", name: "Time", unit: "s", value: 4, min: 0 },
    ],
    validity: ["Acceleration constant in magnitude and direction"],
    tags: [TAGS.KINEMATICS, TAGS.ACCELERATION],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "displacement-constant-acceleration",
      "newtons-second-law",
      "free-fall-speed",
    ],
    solve: {
      v: ({ v0, a, t }) => v0 + a * t,
      v0: ({ v, a, t }) => v - a * t,
      a: ({ v, v0, t }) => (v - v0) / t,
      t: ({ v, v0, a }) => (v - v0) / a,
    },
    example: {
      problem:
        "A car pulls away from rest with an acceleration of 3 m/s². How fast is it going after 4 s?",
      solution: "$v = 0 + 3 \\times 4 = 12$ m/s, about 43 km/h.",
    },
  },
  {
    id: "displacement-constant-acceleration",
    name: "Displacement under constant acceleration",
    aka: ["Second equation of motion", "SUVAT s = ut + ½at²"],
    latex: "x = x_0 + v_0 t + \\tfrac{1}{2} a t^{2}",
    summary:
      "Position under constant acceleration: the $v_0 t$ term is the distance you would cover anyway, the $\\tfrac12 a t^2$ term is what the acceleration adds.",
    variables: [
      { key: "x", latex: "x", name: "Position", unit: "m", value: 19.6 },
      {
        key: "x0",
        latex: "x_0",
        name: "Initial position",
        unit: "m",
        value: 0,
      },
      {
        key: "v0",
        latex: "v_0",
        name: "Initial velocity",
        unit: "m/s",
        value: 0,
      },
      { key: "a", latex: "a", name: "Acceleration", unit: "m/s²", value: 9.8 },
      { key: "t", latex: "t", name: "Time", unit: "s", value: 2, min: 0 },
    ],
    validity: ["Acceleration constant in magnitude and direction"],
    tags: [TAGS.KINEMATICS, TAGS.ACCELERATION],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "velocity-constant-acceleration",
      "uniform-motion",
      "free-fall-speed",
    ],
    solve: {
      x: ({ x0, v0, a, t }) => x0 + v0 * t + 0.5 * a * t * t,
      x0: ({ x, v0, a, t }) => x - v0 * t - 0.5 * a * t * t,
      v0: ({ x, x0, a, t }) => (x - x0 - 0.5 * a * t * t) / t,
      a: ({ x, x0, v0, t }) => (2 * (x - x0 - v0 * t)) / (t * t),
      t: ({ x, x0, v0, a }) => firstTime({ s: x - x0, v0, a }),
    },
    pitfalls: [
      "Solving for $t$ means solving a quadratic: the calculator returns the first non-negative time the position is reached.",
    ],
  },
  {
    id: "free-fall-speed",
    name: "Speed after a free fall",
    aka: ["Impact speed", "Torricelli's equation from rest"],
    latex: "v = \\sqrt{2 g h}",
    summary:
      "An object dropped from rest reaches this speed after falling a height $h$. Its mass does not appear: without air, everything falls alike.",
    variables: [
      { key: "v", latex: "v", name: "Speed", unit: "m/s", value: 9.9, min: 0 },
      {
        key: "g",
        latex: "g",
        name: "Gravitational acceleration",
        unit: "m/s²",
        value: 9.81,
        min: 0,
      },
      {
        key: "h",
        latex: "h",
        name: "Height fallen",
        unit: "m",
        value: 5,
        min: 0,
      },
    ],
    validity: [
      "Starts from rest",
      "No air resistance",
      "$g$ constant over the fall",
    ],
    tags: [TAGS.KINEMATICS, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "gravitational-potential-energy",
      "kinetic-energy",
      "displacement-constant-acceleration",
    ],
    solve: {
      v: ({ g, h }) => Math.sqrt(2 * g * h),
      g: ({ v, h }) => (v * v) / (2 * h),
      h: ({ v, g }) => (v * v) / (2 * g),
    },
    note: "It follows from energy conservation, $mgh = \\tfrac12 m v^2$, and the fall takes $t = \\sqrt{2h/g}$.",
  },
  {
    id: "projectile-trajectory",
    name: "Projectile trajectory",
    aka: ["Parabolic path", "Equation of the trajectory"],
    latex:
      "y = x\\tan\\theta - \\dfrac{g\\,x^{2}}{2\\,v_0^{2}\\cos^{2}\\theta}",
    summary:
      "Eliminating time from the two equations of motion leaves height as a function of horizontal distance: a parabola.",
    variables: [
      { key: "y", latex: "y", name: "Height", unit: "m" },
      {
        key: "x",
        latex: "x",
        name: "Horizontal distance",
        unit: "m",
        value: 10,
      },
      {
        key: "theta",
        latex: "\\theta",
        name: "Launch angle",
        unit: "°",
        value: 45,
        angle: true,
      },
      {
        key: "v0",
        latex: "v_0",
        name: "Launch speed",
        unit: "m/s",
        value: 15,
        min: 0,
      },
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
      "No air resistance",
      "Launched from the origin (add the launch height $h_0$ otherwise)",
    ],
    tags: [TAGS.KINEMATICS, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["projectile-range", "projectile-max-height"],
    solve: {
      y: ({ x, theta, v0, g }) =>
        x * Math.tan(theta) -
        (g * x * x) / (2 * v0 * v0 * Math.cos(theta) ** 2),
      v0: ({ y, x, theta, g }) =>
        Math.sqrt(
          (g * x * x) / (2 * Math.cos(theta) ** 2 * (x * Math.tan(theta) - y))
        ),
    },
    note: "Solving for $v_0$ answers the aiming question: how fast must I throw at this angle to pass through the point $(x, y)$?",
  },
  {
    id: "projectile-range",
    name: "Range of a projectile",
    aka: ["Horizontal range"],
    latex: "R = \\dfrac{v_0^{2}\\sin 2\\theta}{g}",
    summary:
      "How far a projectile lands on level ground. For a given speed it peaks at 45°, where $\\sin 2\\theta = 1$.",
    variables: [
      { key: "R", latex: "R", name: "Range", unit: "m", min: 0 },
      {
        key: "v0",
        latex: "v_0",
        name: "Launch speed",
        unit: "m/s",
        value: 20,
        min: 0,
      },
      {
        key: "theta",
        latex: "\\theta",
        name: "Launch angle",
        unit: "°",
        value: 45,
        angle: true,
        min: 0,
        max: 90,
      },
      {
        key: "g",
        latex: "g",
        name: "Gravitational acceleration",
        unit: "m/s²",
        value: 9.81,
        min: 0,
      },
    ],
    validity: ["Level ground: lands at launch height", "No air resistance"],
    tags: [TAGS.KINEMATICS, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["projectile-trajectory", "projectile-max-height"],
    solve: {
      R: ({ v0, theta, g }) => (v0 * v0 * Math.sin(2 * theta)) / g,
      v0: ({ R, theta, g }) => Math.sqrt((R * g) / Math.sin(2 * theta)),
      theta: ({ R, v0, g }) => 0.5 * Math.asin((R * g) / (v0 * v0)),
      g: ({ R, v0, theta }) => (v0 * v0 * Math.sin(2 * theta)) / R,
    },
    example: {
      problem: "A ball is kicked at 20 m/s and 45°. How far does it go?",
      solution: "$R = 20^2 \\cdot \\sin 90° / 9.81 \\approx 40.8$ m.",
    },
    pitfalls: [
      "Complementary angles ($\\theta$ and $90° - \\theta$) give the same range. Solving for $\\theta$ returns the lower one.",
    ],
  },
  {
    id: "projectile-max-height",
    name: "Maximum height of a projectile",
    aka: ["Apex height"],
    latex: "H = \\dfrac{v_0^{2}\\sin^{2}\\theta}{2g}",
    summary:
      "Only the vertical part of the launch velocity, $v_0 \\sin\\theta$, fights gravity — so only it sets how high the projectile climbs.",
    variables: [
      { key: "H", latex: "H", name: "Maximum height", unit: "m", min: 0 },
      {
        key: "v0",
        latex: "v_0",
        name: "Launch speed",
        unit: "m/s",
        value: 20,
        min: 0,
      },
      {
        key: "theta",
        latex: "\\theta",
        name: "Launch angle",
        unit: "°",
        value: 60,
        angle: true,
        min: 0,
        max: 90,
      },
      {
        key: "g",
        latex: "g",
        name: "Gravitational acceleration",
        unit: "m/s²",
        value: 9.81,
        min: 0,
      },
    ],
    validity: ["No air resistance", "Measured from launch height"],
    tags: [TAGS.KINEMATICS, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["projectile-range", "free-fall-speed"],
    solve: {
      H: ({ v0, theta, g }) => (v0 * v0 * Math.sin(theta) ** 2) / (2 * g),
      v0: ({ H, theta, g }) => Math.sqrt(2 * g * H) / Math.sin(theta),
      theta: ({ H, v0, g }) => Math.asin(Math.sqrt(2 * g * H) / v0),
      g: ({ H, v0, theta }) => (v0 * v0 * Math.sin(theta) ** 2) / (2 * H),
    },
  },
  {
    id: "centripetal-acceleration",
    name: "Centripetal acceleration",
    aka: ["Radial acceleration"],
    latex: "a_c = \\dfrac{v^{2}}{r} = \\omega^{2} r",
    summary:
      "Moving in a circle at constant speed is still accelerated motion: the velocity keeps turning, and that takes an acceleration pointing to the centre.",
    variables: [
      {
        key: "a",
        latex: "a_c",
        name: "Centripetal acceleration",
        unit: "m/s²",
        min: 0,
      },
      { key: "v", latex: "v", name: "Speed", unit: "m/s", value: 10, min: 0 },
      { key: "r", latex: "r", name: "Radius", unit: "m", value: 5, min: 0 },
    ],
    validity: ["Uniform circular motion (constant speed)"],
    tags: [TAGS.KINEMATICS, TAGS.ACCELERATION],
    level: "upperSecondary",
    difficulty: "core",
    related: ["centripetal-force", "circular-period"],
    solve: {
      a: ({ v, r }) => (v * v) / r,
      v: ({ a, r }) => Math.sqrt(a * r),
      r: ({ a, v }) => (v * v) / a,
    },
    note: "With angular speed $\\omega = v / r$ the same acceleration reads $\\omega^2 r$.",
  },
  {
    id: "circular-period",
    name: "Period of circular motion",
    aka: ["Orbital period"],
    latex: "T = \\dfrac{2\\pi r}{v} = \\dfrac{2\\pi}{\\omega}",
    summary:
      "The time for one full lap: the circumference divided by the speed.",
    variables: [
      { key: "T", latex: "T", name: "Period", unit: "s", min: 0 },
      { key: "r", latex: "r", name: "Radius", unit: "m", value: 5, min: 0 },
      { key: "v", latex: "v", name: "Speed", unit: "m/s", value: 10, min: 0 },
    ],
    validity: ["Uniform circular motion (constant speed)"],
    tags: [TAGS.KINEMATICS],
    level: "upperSecondary",
    difficulty: "core",
    related: ["centripetal-acceleration", "orbital-speed"],
    solve: {
      T: ({ r, v }) => (2 * Math.PI * r) / v,
      r: ({ T, v }) => (T * v) / (2 * Math.PI),
      v: ({ T, r }) => (2 * Math.PI * r) / T,
    },
  },
];

export default kinematics;
