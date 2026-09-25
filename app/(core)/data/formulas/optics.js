import TAGS from "../tags.js";

/** @type {import("./index.js").Formula[]} */
const optics = [
  {
    id: "snells-law",
    name: "Snell's law",
    aka: ["Law of refraction"],
    latex: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
    summary:
      "Light bends when it crosses into a medium where it travels at a different speed. The refractive indices decide by how much.",
    variables: [
      {
        key: "n1",
        latex: "n_1",
        name: "Refractive index of the first medium",
        value: 1,
        min: 1,
      },
      {
        key: "theta1",
        latex: "\\theta_1",
        name: "Angle of incidence",
        unit: "°",
        value: 30,
        angle: true,
        min: 0,
        max: 90,
      },
      {
        key: "n2",
        latex: "n_2",
        name: "Refractive index of the second medium",
        value: 1.33,
        min: 1,
      },
      {
        key: "theta2",
        latex: "\\theta_2",
        name: "Angle of refraction",
        unit: "°",
        angle: true,
        min: 0,
        max: 90,
      },
    ],
    validity: ["Angles measured from the normal to the surface"],
    tags: [TAGS.OPTICS],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["law-of-reflection"],
    solve: {
      theta2: ({ n1, theta1, n2 }) => Math.asin((n1 * Math.sin(theta1)) / n2),
      theta1: ({ n1, n2, theta2 }) => Math.asin((n2 * Math.sin(theta2)) / n1),
      n2: ({ n1, theta1, theta2 }) =>
        (n1 * Math.sin(theta1)) / Math.sin(theta2),
      n1: ({ theta1, n2, theta2 }) =>
        (n2 * Math.sin(theta2)) / Math.sin(theta1),
    },
    pitfalls: [
      "Going from a dense to a less dense medium, past the critical angle there is no refracted ray at all: total internal reflection.",
    ],
    history: {
      who: "Ibn Sahl, Willebrord Snellius",
      year: "984, 1621",
      text: "First described by Ibn Sahl in Baghdad, rediscovered by Snellius six centuries later.",
    },
  },
  {
    id: "law-of-reflection",
    name: "Law of reflection",
    aka: ["Mirror reflection"],
    latex: "\\hat{D}_r = \\hat{D} - 2(\\hat{D}\\cdot\\hat{N})\\,\\hat{N}",
    summary:
      "A ray bounces off a mirror at the same angle it arrived ($\\theta_i = \\theta_r$). In vector form: flip the part of the direction along the normal.",
    variables: [
      { key: "D", latex: "\\hat{D}", name: "Incoming direction (unit vector)" },
      { key: "N", latex: "\\hat{N}", name: "Surface normal (unit vector)" },
      { key: "Dr", latex: "\\hat{D}_r", name: "Reflected direction" },
    ],
    validity: ["Smooth, mirror-like surface"],
    tags: [TAGS.OPTICS, TAGS.VECTORS],
    level: "upperSecondary",
    difficulty: "extended",
    related: ["snells-law", "dot-product", "ray-equation"],
  },
  {
    id: "inverse-square-law",
    name: "Inverse-square law of light",
    aka: ["Irradiance from a point source"],
    latex: "E = \\dfrac{I_0}{d^2}",
    summary:
      "Light from a point source spreads over a sphere, so its brightness falls with the square of the distance: twice as far, a quarter as bright.",
    variables: [
      {
        key: "E",
        latex: "E",
        name: "Irradiance on the surface",
        unit: "W/m²",
        min: 0,
      },
      {
        key: "I0",
        latex: "I_0",
        name: "Source intensity",
        unit: "W/sr",
        value: 100,
        min: 0,
      },
      {
        key: "d",
        latex: "d",
        name: "Distance from the source",
        unit: "m",
        value: 2,
        min: 0,
      },
    ],
    validity: ["Point source", "No absorption along the way"],
    tags: [TAGS.OPTICS],
    level: "upperSecondary",
    difficulty: "core",
    related: ["lamberts-cosine-law", "newtons-law-of-gravitation"],
    solve: {
      E: ({ I0, d }) => I0 / (d * d),
      I0: ({ E, d }) => E * d * d,
      d: ({ E, I0 }) => Math.sqrt(I0 / E),
    },
  },
  {
    id: "lamberts-cosine-law",
    name: "Lambert's cosine law",
    aka: ["Diffuse shading"],
    latex: "I_d = k_d\\,E\\,\\max(0,\\ \\hat{N}\\cdot\\hat{L})",
    summary:
      "A matte surface looks brightest when it faces the light and darker as it turns away, following the cosine of the angle between normal and light.",
    variables: [
      {
        key: "Id",
        latex: "I_d",
        name: "Diffuse brightness",
        unit: "W/m²",
        min: 0,
      },
      {
        key: "kd",
        latex: "k_d",
        name: "Diffuse reflectance (albedo)",
        value: 0.8,
        min: 0,
        max: 1,
      },
      {
        key: "E",
        latex: "E",
        name: "Incoming irradiance",
        unit: "W/m²",
        value: 25,
        min: 0,
      },
      {
        key: "theta",
        latex: "\\theta",
        name: "Angle between normal $\\hat{N}$ and light $\\hat{L}$",
        unit: "°",
        value: 60,
        angle: true,
      },
    ],
    validity: ["Ideal matte (Lambertian) surface"],
    tags: [TAGS.OPTICS],
    level: "undergraduate",
    difficulty: "extended",
    related: ["inverse-square-law", "dot-product"],
    solve: {
      Id: ({ kd, E, theta }) => kd * E * Math.max(0, Math.cos(theta)),
    },
    note: "For unit vectors, $\\hat{N}\\cdot\\hat{L} = \\cos\\theta$; the $\\max$ keeps surfaces facing away from the light black instead of negative.",
    history: {
      who: "Johann Heinrich Lambert",
      year: "1760",
      text: "Photometria.",
    },
  },
  {
    id: "ray-equation",
    name: "Parametric ray",
    aka: ["Ray equation"],
    latex: "\\vec{P}(t) = \\vec{O} + t\\,\\hat{D}",
    summary:
      "Every point on a ray: start at the origin $\\vec{O}$ and walk a distance $t$ along the direction $\\hat{D}$. Ray tracing is finding the smallest $t$ that hits something.",
    variables: [
      { key: "P", latex: "\\vec{P}(t)", name: "Point on the ray" },
      { key: "O", latex: "\\vec{O}", name: "Ray origin (the camera)" },
      { key: "D", latex: "\\hat{D}", name: "Direction (unit vector)" },
      { key: "t", latex: "t", name: "Distance along the ray", unit: "m" },
    ],
    validity: ["Straight-line propagation (geometric optics)"],
    tags: [TAGS.OPTICS, TAGS.VECTORS],
    level: "undergraduate",
    difficulty: "core",
    related: ["ray-sphere-intersection", "law-of-reflection"],
  },
  {
    id: "ray-sphere-intersection",
    name: "Ray–sphere intersection",
    aka: ["Ray–sphere discriminant"],
    latex:
      "\\Delta = b^2 - 4ac,\\quad b = 2\\,\\hat{D}\\cdot(\\vec{O}-\\vec{C}),\\quad c = |\\vec{O}-\\vec{C}|^2 - r^2",
    summary:
      "Substituting the ray into the sphere's equation gives a quadratic in $t$. Its discriminant says whether the ray misses ($\\Delta < 0$), grazes, or hits the sphere.",
    variables: [
      { key: "Delta", latex: "\\Delta", name: "Discriminant" },
      { key: "C", latex: "\\vec{C}", name: "Sphere centre" },
      { key: "r", latex: "r", name: "Sphere radius", unit: "m" },
      {
        key: "a",
        latex: "a",
        name: "$\\hat{D}\\cdot\\hat{D}$, equal to 1 for a unit direction",
      },
    ],
    validity: ["Perfect sphere"],
    tags: [TAGS.OPTICS, TAGS.MATH],
    level: "undergraduate",
    difficulty: "extended",
    related: ["ray-equation"],
  },
];

export default optics;
