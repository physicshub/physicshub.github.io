// app/data/configs/PiCollisions.js

export const INITIAL_INPUTS = {
  smallBlockSize: 0.5,
  largeBlockSize: 1,
  smallBlockMass: 1,
  largeBlockMass: 100,
  smallBlockVelocityInitial: 0,
  largeBlockVelocityInitial: -1,
  smallBlockColor: "#ff0000",
  largeBlockColor: "#002fff",
  trailEnabled: true,
  showVectors: true,
  wallGap: 1,
};

export const INPUT_FIELDS = [
  {
    name: "smallBlockMass",
    label: "Mass of Small Block (kg): ",
    type: "number",
    min: 1,
    max: 10000000,
    step: 100,
  },
  {
    name: "largeBlockMass",
    label: "Mass of Large Block (kg): ",
    type: "number",
    min: 100,
    max: 1000000000,
    step: 100,
  },
  {
    name: "smallBlockVelocityInitial",
    label: "Velocity of Small Block (m/s): ",
    type: "number",
    min: -100,
    max: 100,
    step: 1,
  },
  {
    name: "largeBlockVelocityInitial",
    label: "Velocity of Large Block (m/s): ",
    type: "number",
    min: -100,
    max: 100,
    step: 1,
  },
  {
    name: "smallBlockSize",
    label: "Size of Small Block (m): ",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "largeBlockSize",
    label: "Size of Large Block (m): ",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    name: "wallGap",
    label: "Small Block Wall Gap (m): ",
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    name: "trailEnabled",
    label: "Enable trail",
    type: "checkbox",
  },
  {
    name: "showVectors",
    label: "Show vectors",
    type: "checkbox",
  },
  {
    name: "smallBlockColor",
    label: "Small block",
    type: "color",
  },
  {
    name: "largeBlockColor",
    label: "Large block",
    type: "color",
  },
];

// Mapper specifico per benchmarking
export const SimInfoMapper = (context) => {
  const { smallBlock, largeBlock, totalCollisions = 0 } = context;

  const smallVelocity = smallBlock?.state?.velocity?.x ?? 0;
  const largeVelocity = largeBlock?.state?.velocity?.x ?? 0;

  return {
    "Total Collisions": `${totalCollisions} collisions`,
    "Small Block Velocity": `${smallVelocity.toFixed(3)} m/s`,
    "Large Block Velocity": `${largeVelocity.toFixed(3)} m/s`,
  };
};
