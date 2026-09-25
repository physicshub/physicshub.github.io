// app/(core)/data/configs/RayTracing.js

// Scene units are metres, Y-up, with the ground plane at y = 0. The camera
// always looks at the point (0, 1, 0).
export const INITIAL_INPUTS = {
  camX: 0,
  camY: 1.8,
  camZ: 6.5,
  fov: 50,
  sphereX: 0,
  sphereY: 1,
  sphereZ: 0,
  radius: 1,
  lightX: 3,
  lightY: 5,
  lightZ: 3,
  intensity: 22,
  ka: 0.08,
  kd: 0.9,
  ks: 0.6,
  shininess: 32,
  reflectivity: 0.25,
  diagramView: "side",
  followSphere: true,
  showRays: true,
  showEquations: true,
  sphereColor: "#eb4d38",
};

const position = (name, label, min, max) => ({
  name,
  label,
  unit: "m",
  type: "number",
  min,
  max,
  step: 0.1,
});

export const INPUT_FIELDS = [
  position("camX", "Camera x", -7, 7),
  position("camY", "Camera height", 0.3, 7),
  position("camZ", "Camera z", -4, 9),
  {
    name: "fov",
    label: "Field of view",
    unit: "°",
    type: "number",
    min: 20,
    max: 90,
    step: 1,
  },
  position("sphereX", "Sphere x", -5, 5),
  position("sphereY", "Sphere height", 0.3, 4),
  position("sphereZ", "Sphere z", -4, 5),
  {
    name: "radius",
    label: "Sphere radius",
    symbol: "r",
    unit: "m",
    type: "number",
    min: 0.3,
    max: 2.5,
    step: 0.05,
  },
  position("lightX", "Light x", -7, 7),
  position("lightY", "Light height", 0.5, 7.5),
  position("lightZ", "Light z", -4, 9),
  {
    name: "intensity",
    label: "Light intensity",
    symbol: "I₀",
    unit: "W/sr",
    type: "number",
    min: 5,
    max: 80,
    step: 1,
  },
  {
    name: "ka",
    label: "Ambient coefficient",
    symbol: "k_a",
    type: "number",
    min: 0,
    max: 0.4,
    step: 0.01,
  },
  {
    name: "kd",
    label: "Diffuse coefficient",
    symbol: "k_d",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    name: "ks",
    label: "Specular coefficient",
    symbol: "k_s",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    name: "shininess",
    label: "Shininess",
    symbol: "n",
    type: "number",
    min: 1,
    max: 200,
    step: 1,
  },
  {
    name: "reflectivity",
    label: "Reflectivity",
    symbol: "ρ",
    type: "number",
    min: 0,
    max: 0.9,
    step: 0.05,
  },
  {
    name: "diagramView",
    label: "Diagram view",
    type: "select",
    options: [
      { value: "side", label: "Side view (z–y)" },
      { value: "top", label: "Top view (x–z)" },
    ],
  },
  {
    name: "followSphere",
    label: "Aim the traced ray at the sphere",
    type: "checkbox",
  },
  {
    name: "showRays",
    label: "Show normal, shadow and reflected rays",
    type: "checkbox",
  },
  {
    name: "showEquations",
    label: "Show live equations",
    type: "checkbox",
  },
  {
    name: "sphereColor",
    label: "Sphere color",
    type: "color",
  },
];

const f = (x, d = 2) => (x === null || x === undefined ? "—" : x.toFixed(d));

// Receives the record of the one ray being followed (see RayTracing.jsx).
export const SimInfoMapper = (rec) => {
  const base = {
    Pixel: `(${rec.px}, ${rec.py})`,
    "Discriminant Δ": f(rec.sphereHit.disc, 3),
  };
  if (rec.hit === "sky") return { ...base, Hits: "nothing (sky)" };

  return {
    ...base,
    Hits: `${rec.hit} at t = ${f(rec.t, 3)} m`,
    "Distance to light d": `${f(rec.d, 3)} m`,
    "Irradiance E = I₀/d²": `${f(rec.E, 3)} W/m²`,
    "N̂·L̂ (cos θᵢ)": f(rec.NdotL, 3),
    "Shadow ray": rec.blocked ? "blocked" : "clear",
    "Diffuse I_d": f(rec.diffuse, 3),
    "Specular I_s": f(rec.specular, 3),
    "Reflection angle θᵣ": `${f(rec.reflectionAngle, 1)}°`,
    "Pixel colour": `rgb(${rec.display.join(", ")})`,
  };
};
