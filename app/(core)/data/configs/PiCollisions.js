// app/data/configs/PiCollisions.js

export const INITIAL_INPUTS = {
  smallBlockSize: 1,
  largeBlockSize: 10,
  smallBlockMass: 1,
  largeBlockMass: 100,
  smallBlockInitialVelocity: 0,
  largeBlockInitialVelocity: -1,
  smallBlockColor: "#ff0000",
  largeMBlockColor: "#002fff",
};

export const INPUT_FIELDS = [
  {
    name: "smallMass",
    label: "Mass of Small Block (kg): ",
    type: "number",
    min: 1,
    max: 10000000,
    step: 100,
  },
  {
    name: "largeMass",
    label: "Mass of Large Block (kg): ",
    type: "number",
    min: 100,
    max: 1000000000,
    step: 100,
  },
  {
    name: "smallVelocityInitial",
    label: "Velocity of Small Block (m/s): ",
    type: "number",
    min: -100,
    max: 100,
    step: 1,
  },
  {
    name: "largeVelocityInitial",
    label: "Velocity of Large Block (m/s): ",
    type: "number",
    min: -100,
    max: 100,
    step: 1,
  },
];

// Mapper specifico per benchmarking
export const SimInfoMapper = () => {
  // const { p } = context;

  // FPS medio
  const totalCollisions = 0;

  return {
    totalCollisions: totalCollisions + " collisions",
  };
};
