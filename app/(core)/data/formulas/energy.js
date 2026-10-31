import TAGS from "../tags.js";

// Final velocities of a 1-D elastic collision; only masses and initial
// velocities go in, so the calculator must not ask for the other final one.
const ELASTIC_INPUTS = ["m1", "m2", "u1", "u2"];

/** @type {import("./index.js").Formula[]} */
const energy = [
  {
    id: "kinetic-energy",
    name: "Kinetic energy",
    aka: ["Energy of motion"],
    latex: "K = \\tfrac{1}{2} m v^{2}",
    summary:
      "The energy a body has because it moves. It grows with the square of speed: twice as fast carries four times the energy.",
    variables: [
      { key: "K", latex: "K", name: "Kinetic energy", unit: "J", min: 0 },
      { key: "m", latex: "m", name: "Mass", unit: "kg", value: 1000, min: 0 },
      { key: "v", latex: "v", name: "Speed", unit: "m/s", value: 14, min: 0 },
    ],
    validity: ["Speeds far below the speed of light"],
    tags: [TAGS.ENERGY],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "gravitational-potential-energy",
      "elastic-potential-energy",
      "free-fall-speed",
    ],
    solve: {
      K: ({ m, v }) => 0.5 * m * v * v,
      m: ({ K, v }) => (2 * K) / (v * v),
      v: ({ K, m }) => Math.sqrt((2 * K) / m),
    },
    example: {
      problem:
        "How much kinetic energy does a 1000 kg car have at 50 km/h (about 14 m/s)?",
      solution:
        "$K = \\tfrac12 \\cdot 1000 \\cdot 14^2 = 98\\,000$ J. At 100 km/h it is four times as much.",
    },
  },
  {
    id: "gravitational-potential-energy",
    name: "Gravitational potential energy",
    aka: ["GPE", "Potential energy near the Earth"],
    latex: "U = m g h",
    summary:
      "The energy stored by lifting a mass against gravity. Only changes in $h$ matter, so you choose where $h = 0$ is.",
    variables: [
      { key: "U", latex: "U", name: "Potential energy", unit: "J" },
      { key: "m", latex: "m", name: "Mass", unit: "kg", value: 2, min: 0 },
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
        name: "Height above the reference level",
        unit: "m",
        value: 5,
      },
    ],
    validity: ["Near a planet's surface, where $g$ is roughly constant"],
    tags: [TAGS.ENERGY, TAGS.GRAVITY],
    level: "upperSecondary",
    difficulty: "core",
    related: ["kinetic-energy", "free-fall-speed", "weight"],
    solve: {
      U: ({ m, g, h }) => m * g * h,
      m: ({ U, g, h }) => U / (g * h),
      h: ({ U, m, g }) => U / (m * g),
    },
  },
  {
    id: "elastic-potential-energy",
    name: "Elastic potential energy",
    aka: ["Energy stored in a spring"],
    latex: "U = \\tfrac{1}{2} k x^{2}",
    summary:
      "The energy stored in a stretched or compressed spring. At the turning points of an oscillation all the energy is here, so the total is $\\tfrac12 k A^2$.",
    variables: [
      {
        key: "U",
        latex: "U",
        name: "Elastic potential energy",
        unit: "J",
        min: 0,
      },
      {
        key: "k",
        latex: "k",
        name: "Spring constant",
        unit: "N/m",
        value: 50,
        min: 0,
      },
      {
        key: "x",
        latex: "x",
        name: "Displacement from rest length",
        unit: "m",
        value: 0.1,
      },
    ],
    validity: ["Within the elastic limit (Hooke's law holds)"],
    tags: [TAGS.ENERGY, TAGS.SPRINGS],
    level: "upperSecondary",
    difficulty: "core",
    related: ["hookes-law", "shm-position", "kinetic-energy"],
    solve: {
      U: ({ k, x }) => 0.5 * k * x * x,
      k: ({ U, x }) => (2 * U) / (x * x),
      x: ({ U, k }) => Math.sqrt((2 * U) / k),
    },
  },
  {
    id: "pendulum-speed-bottom",
    name: "Pendulum speed at the bottom",
    aka: ["Maximum speed of a pendulum"],
    latex: "v = \\sqrt{2 g L\\,(1 - \\cos\\theta_0)}",
    summary:
      "Released from an angle $\\theta_0$, the bob drops a height $L(1-\\cos\\theta_0)$ and turns it all into speed at the lowest point.",
    variables: [
      {
        key: "v",
        latex: "v",
        name: "Speed at the bottom",
        unit: "m/s",
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
      { key: "L", latex: "L", name: "Length", unit: "m", value: 1, min: 0 },
      {
        key: "theta0",
        latex: "\\theta_0",
        name: "Release angle",
        unit: "°",
        value: 30,
        angle: true,
        min: 0,
        max: 180,
      },
    ],
    validity: [
      "No friction or air resistance",
      "Rigid, massless rod or taut string",
    ],
    tags: [TAGS.ENERGY, TAGS.OSCILLATIONS],
    level: "upperSecondary",
    difficulty: "extended",
    related: [
      "gravitational-potential-energy",
      "kinetic-energy",
      "pendulum-period",
    ],
    solve: {
      v: ({ g, L, theta0 }) => Math.sqrt(2 * g * L * (1 - Math.cos(theta0))),
      L: ({ v, g, theta0 }) => (v * v) / (2 * g * (1 - Math.cos(theta0))),
      theta0: ({ v, g, L }) => Math.acos(1 - (v * v) / (2 * g * L)),
    },
  },
  {
    id: "momentum-conservation",
    name: "Conservation of momentum",
    aka: ["Momentum balance in a collision"],
    latex: "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2",
    summary:
      "In any collision the total momentum before equals the total after — elastic, inelastic or sticky.",
    variables: [
      {
        key: "m1",
        latex: "m_1",
        name: "Mass of body 1",
        unit: "kg",
        value: 2,
        min: 0,
      },
      {
        key: "u1",
        latex: "u_1",
        name: "Velocity of body 1 before",
        unit: "m/s",
        value: 3,
      },
      {
        key: "m2",
        latex: "m_2",
        name: "Mass of body 2",
        unit: "kg",
        value: 1,
        min: 0,
      },
      {
        key: "u2",
        latex: "u_2",
        name: "Velocity of body 2 before",
        unit: "m/s",
        value: 0,
      },
      {
        key: "v1",
        latex: "v_1",
        name: "Velocity of body 1 after",
        unit: "m/s",
        value: 1,
      },
      {
        key: "v2",
        latex: "v_2",
        name: "Velocity of body 2 after",
        unit: "m/s",
      },
    ],
    validity: ["Isolated system: no net external force during the collision"],
    tags: [TAGS.COLLISION],
    level: "upperSecondary",
    difficulty: "core",
    related: [
      "elastic-collision",
      "coefficient-of-restitution",
      "kinetic-energy",
    ],
    solve: {
      v2: ({ m1, u1, m2, u2, v1 }) => (m1 * u1 + m2 * u2 - m1 * v1) / m2,
      v1: ({ m1, u1, m2, u2, v2 }) => (m1 * u1 + m2 * u2 - m2 * v2) / m1,
      u1: ({ m1, m2, u2, v1, v2 }) => (m1 * v1 + m2 * v2 - m2 * u2) / m1,
      u2: ({ m1, u1, m2, v1, v2 }) => (m1 * v1 + m2 * v2 - m1 * u1) / m2,
    },
    pitfalls: [
      "Velocities are signed: pick a positive direction and give anything moving the other way a minus sign.",
      "Momentum is conserved even when kinetic energy is not.",
    ],
  },
  {
    id: "elastic-collision",
    name: "Elastic collision in one dimension",
    aka: ["Final velocities of an elastic collision"],
    latex:
      "v_1 = \\dfrac{m_1 - m_2}{m_1 + m_2}\\,u_1 + \\dfrac{2 m_2}{m_1 + m_2}\\,u_2,\\qquad v_2 = \\dfrac{2 m_1}{m_1 + m_2}\\,u_1 + \\dfrac{m_2 - m_1}{m_1 + m_2}\\,u_2",
    summary:
      "When both momentum and kinetic energy are conserved, the velocities after a head-on collision follow from the masses and the velocities before.",
    variables: [
      {
        key: "m1",
        latex: "m_1",
        name: "Mass of body 1",
        unit: "kg",
        value: 2,
        min: 0,
      },
      {
        key: "m2",
        latex: "m_2",
        name: "Mass of body 2",
        unit: "kg",
        value: 1,
        min: 0,
      },
      {
        key: "u1",
        latex: "u_1",
        name: "Velocity of body 1 before",
        unit: "m/s",
        value: 3,
      },
      {
        key: "u2",
        latex: "u_2",
        name: "Velocity of body 2 before",
        unit: "m/s",
        value: 0,
      },
      {
        key: "v1",
        latex: "v_1",
        name: "Velocity of body 1 after",
        unit: "m/s",
      },
      {
        key: "v2",
        latex: "v_2",
        name: "Velocity of body 2 after",
        unit: "m/s",
      },
    ],
    validity: ["Perfectly elastic ($e = 1$)", "Head-on, along one line"],
    tags: [TAGS.COLLISION, TAGS.ENERGY],
    level: "upperSecondary",
    difficulty: "extended",
    related: [
      "momentum-conservation",
      "coefficient-of-restitution",
      "pi-collision-count",
    ],
    solve: {
      v1: {
        from: ELASTIC_INPUTS,
        fn: ({ m1, m2, u1, u2 }) =>
          ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2,
      },
      v2: {
        from: ELASTIC_INPUTS,
        fn: ({ m1, m2, u1, u2 }) =>
          ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2,
      },
    },
    note: "Equal masses simply swap velocities — the Newton's cradle effect.",
  },
  {
    id: "coefficient-of-restitution",
    name: "Coefficient of restitution",
    aka: ["Restitution", "Bounciness"],
    latex: "e = \\dfrac{v_2 - v_1}{u_1 - u_2}",
    summary:
      "How much of the approach speed survives a collision as separation speed: 1 for a perfectly elastic bounce, 0 when the bodies stick.",
    variables: [
      {
        key: "e",
        latex: "e",
        name: "Coefficient of restitution",
        value: 0.8,
        min: 0,
        max: 1,
      },
      {
        key: "u1",
        latex: "u_1",
        name: "Velocity of body 1 before",
        unit: "m/s",
        value: 3,
      },
      {
        key: "u2",
        latex: "u_2",
        name: "Velocity of body 2 before",
        unit: "m/s",
        value: 0,
      },
      {
        key: "v1",
        latex: "v_1",
        name: "Velocity of body 1 after",
        unit: "m/s",
        value: 1.2,
      },
      {
        key: "v2",
        latex: "v_2",
        name: "Velocity of body 2 after",
        unit: "m/s",
        value: 3.6,
      },
    ],
    validity: ["Head-on collision", "$0 \\le e \\le 1$ for ordinary materials"],
    tags: [TAGS.COLLISION],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["momentum-conservation", "elastic-collision"],
    solve: {
      e: ({ u1, u2, v1, v2 }) => (v2 - v1) / (u1 - u2),
      v2: ({ e, u1, u2, v1 }) => v1 + e * (u1 - u2),
      v1: ({ e, u1, u2, v2 }) => v2 - e * (u1 - u2),
    },
    note: "Against a fixed wall or floor it reduces to $e = |v_{\\text{after}}| / |v_{\\text{before}}|$: each bounce reverses the velocity and scales it, $v \\rightarrow -e\\,v$, and the rebound height by $e^2$.",
  },
  {
    id: "pi-collision-count",
    name: "π from colliding blocks",
    aka: ["Galperin's billiards", "Block collision count"],
    latex: "N_{\\text{collisions}} = \\lfloor \\pi \\cdot 10^{N} \\rfloor",
    summary:
      "A block $100^N$ times heavier than a small one, sliding into it towards a wall, makes the two collide exactly as many times as the first $N+1$ digits of π.",
    variables: [
      {
        key: "count",
        latex: "N_{\\text{collisions}}",
        name: "Number of collisions",
      },
      {
        key: "N",
        latex: "N",
        name: "Mass ratio exponent: the big block is 100ᴺ times heavier",
        value: 3,
        min: 0,
        max: 8,
      },
    ],
    validity: [
      "Perfectly elastic collisions with each other and with the wall",
      "No friction",
    ],
    tags: [TAGS.COLLISION, TAGS.MATH],
    level: "undergraduate",
    difficulty: "advanced",
    related: ["elastic-collision", "momentum-conservation", "kinetic-energy"],
    solve: {
      count: ({ N }) =>
        Number.isInteger(N) ? Math.floor(Math.PI * 10 ** N) : NaN,
    },
    note: "Both momentum and kinetic energy are conserved in every collision; drawn in the right coordinates, energy conservation is a circle and each collision a fixed rotation around it.",
    history: {
      who: "Gregory Galperin",
      year: "2003",
      text: "Published as “Playing pool with π”.",
    },
  },
];

export default energy;
