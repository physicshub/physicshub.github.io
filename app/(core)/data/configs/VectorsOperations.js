// app/data/configs/VectorsOperations.js
export const INITIAL_INPUTS = {
  strokeColor: "#00e6e6",
  strokeWeight: 3,
  multiVector: 2,
  operation: "+",
  visualizeMode: "triangle",
  physicsEnabled: false,
  massKg: 5,
  pxPerNewton: 100,
  vectorAMag: 150,
  vectorAAngle: 30,
};

export const INPUT_FIELDS = [
  {
    type: "number",
    name: "strokeWeight",
    label: "Vector line weight",
    unit: "px",
    min: 1,
    max: 12,
    step: 1,
  },
  {
    type: "select",
    name: "physicsEnabled",
    label: "Physics (Planck)",
    options: [
      { value: "false", label: "Off" },
      { value: "true", label: "On" },
    ],
  },
  {
    type: "select",
    name: "operation",
    label: "Vector operation",
    options: [
      { value: "+", label: "Addition (+)" },
      { value: "-", label: "Subtraction (-)" },
      { value: "x", label: "Scalar Multiplication (x)" },
      { value: "normalize", label: "Normalize (v̂)" },
      { value: "dot", label: "Dot Product (A·B)" },
      { value: "cross", label: "Cross Product 2D (A×B z)" },
    ],
  },
  {
    type: "select",
    name: "visualizeMode",
    label: "Visualization",
    options: [
      { value: "triangle", label: "Triangle" },
      { value: "parallelogram", label: "Parallelogram" },
    ],
    showCondition: (inputs) =>
      inputs.operation === "+" || inputs.operation === "-",
  },
  {
    type: "number",
    name: "vectorAMag",
    label: "Vector A magnitude",
    symbol: "|A|",
    unit: "px",
    min: 10,
    max: 500,
    step: 10,
    showCondition: (inputs) =>
      inputs.operation === "dot" ||
      inputs.operation === "cross" ||
      (inputs.visualizeMode === "parallelogram" &&
        (inputs.operation === "+" || inputs.operation === "-")),
  },
  {
    type: "number",
    name: "vectorAAngle",
    label: "Vector A angle",
    symbol: "∠A",
    unit: "°",
    min: -180,
    max: 180,
    step: 5,
    showCondition: (inputs) =>
      inputs.operation === "dot" ||
      inputs.operation === "cross" ||
      (inputs.visualizeMode === "parallelogram" &&
        (inputs.operation === "+" || inputs.operation === "-")),
  },
  {
    type: "number",
    name: "massKg",
    label: "Mass",
    symbol: "m",
    unit: "kg",
    min: 0.1,
    max: 20,
    step: 0.1,
    disabledCondition: (inputs) => !inputs.physicsEnabled,
  },
  {
    type: "number",
    name: "pxPerNewton",
    label: "Pixels per newton",
    unit: "px/N",
    min: 1,
    max: 400,
    step: 1,
    disabledCondition: (inputs) => !inputs.physicsEnabled,
  },
  {
    type: "number",
    name: "multiVector",
    label: "Vector multiplier (multiplication only)",
    min: -10,
    max: 10,
    step: 0.1,
    disabledCondition: (inputs) => inputs.operation !== "x",
  },
  {
    type: "color",
    name: "strokeColor",
    label: "Vectors color",
  },
];
