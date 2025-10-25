// src/data/configs/VectorsOperations.js
export const INITIAL_INPUTS = {
  strokeColor: "#00e6e6",
  strokeWeight: 3,
  multiVector: 2,
  operation: "+",
  visualizeMode: "triangle",
  physicsEnabled: false,
  massKg: 5,
  pxPerNewton: 100,
};

export const INPUT_FIELDS = [
  {
    type: "number",
    name: "strokeWeight",
    label: "Vectors lines weight:",
    min: 1,
    step: 1
  },
  {
    type: "select",
    name: "physicsEnabled",
    label: "Physics (Planck):",
    options: [
      { value: "false", label: "Off" },
      { value: "true", label: "On" }
    ]
  },
  {
    type: "select",
    name: "operation",
    label: "Vectors Operation:",
    options: [
      { value: "+", label: "Addition (+)" },
      { value: "-", label: "Subtraction (-)" },
      { value: "x", label: "Scalar Multiplication (x)" },
      { value: "normalize", label: "Normalize (v̂)" },
      { value: "dot", label: "Dot Product (A·B)" },
      { value: "cross", label: "Cross Product 2D (A×B z)" },
    ]
  },
  {
    type: "select",
    name: "visualizeMode",
    label: "Visualization:",
    options: [
      { value: "triangle", label: "Triangle" },
      { value: "parallelogram", label: "Parallelogram" },
    ],
    showCondition: (inputs) => inputs.operation === "+" || inputs.operation === "-"
  },
  {
    type: "number",
    name: "massKg",
    label: "Mass (kg)",
    min: 0.1,
    step: 0.1,
    disabledCondition: (inputs) => !inputs.physicsEnabled
  },
  {
    type: "number",
    name: "pxPerNewton",
    label: "Pixels per Newton",
    min: 1,
    step: 1,
    disabledCondition: (inputs) => !inputs.physicsEnabled
  },
  {
    type: "number",
    name: "multiVector",
    label: "Multiplicate vector (multiplication only):",
    min: -10,
    max: 10,
    step: 0.1,
    disabledCondition: (inputs) => inputs.operation !== "x"
  },
  {
    type: "color",
    name: "strokeColor",
    label: "Vectors color:"
  }
];