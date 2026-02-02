// app/data/configs/test.js
import { EARTH_G_SI, gravityTypes } from "../../constants/Config.js";

export const INITIAL_INPUTS = {
  size: 0.5, // diametro medio in metri
  mass: 1.0, // kg
  gravity: EARTH_G_SI, // m/s²
  restitution: 1, // coefficiente di rimbalzo
  frictionMu: 0, // coefficiente di attrito dinamico
  numBodies: 1, // numero di corpi (start with 1 for learning)
  trailEnabled: true,
  trailLength: 100, // trail visualization length
  timeScale: 1.0, // time scale multiplier
  color: "#ff0000",
  deterministic: false, // deterministic mode
  randomSeed: 0, // random seed for reproducibility
  energyDissipation: false, // enable energy dissipation over time
  dampingCoefficient: 0.99, // velocity damping factor (0-1, where 1 = no damping)
};

// Physics controls (affect the simulation physics)
export const PHYSICS_CONTROLS = [
  {
    name: "gravity",
    label: "g - Gravity (m/s²):",
    type: "select",
    options: gravityTypes,
    category: "physics",
  },
  {
    name: "numBodies",
    label: "N - Number of bodies:",
    type: "number",
    min: 1,
    max: 1000,
    step: 1,
    category: "physics",
  },
  {
    name: "mass",
    label: "m - Mass (kg):",
    type: "number",
    min: 0.1,
    max: 100,
    step: 0.1,
    category: "physics",
  },
  {
    name: "restitution",
    label: "e - Restitution (bounce):",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    category: "physics",
  },
  {
    name: "frictionMu",
    label: "μ - Friction coefficient:",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    category: "physics",
  },
  {
    name: "energyDissipation",
    label: "Energy Dissipation",
    type: "checkbox",
    category: "physics",
  },
  {
    name: "dampingCoefficient",
    label: "Damping Coefficient:",
    type: "number",
    min: 0.9,
    max: 1.0,
    step: 0.001,
    category: "physics",
    showIf: [{ key: "energyDissipation", value: true }], // Only show when energy dissipation is enabled
  },
];

// Visualization controls (affect only how things are displayed)
export const VISUALIZATION_CONTROLS = [
  {
    name: "trailEnabled",
    label: "Enable trail",
    type: "checkbox",
    category: "visualization",
  },
  {
    name: "trailLength",
    label: "Trail length:",
    type: "number",
    min: 10,
    max: 500,
    step: 10,
    category: "visualization",
  },
];

// Combined for backward compatibility
export const INPUT_FIELDS = [...PHYSICS_CONTROLS, ...VISUALIZATION_CONTROLS];

export const FORCES = [];

// Learning objectives for this simulation
export const LEARNING_OBJECTIVES = {
  title: "Multi-Body Physics Simulation",
  goals: [
    "Understand how gravity affects motion",
    "Observe how number of bodies changes system behavior",
    "See how timestep affects stability",
    "Observe numerical errors and energy conservation",
  ],
  variables: [
    "Gravity (g) - acceleration due to gravity",
    "Number of bodies (N) - system complexity",
    "Mass (m) - affects acceleration via F = ma",
    "Restitution (e) - energy loss on collision",
    "Friction (μ) - resistance to motion",
    "Energy Dissipation - gradual energy loss over time",
    "Damping Coefficient - velocity reduction factor",
  ],
};

// Physics equations shown to students
export const PHYSICS_EQUATIONS = [
  {
    name: "Gravitational Force",
    formula: "F = m · g",
    description: "Force due to gravity",
  },
  {
    name: "Velocity Update",
    formula: "v(t+Δt) = v(t) + a · Δt",
    description: "Velocity integration",
  },
  {
    name: "Position Update",
    formula: "x(t+Δt) = x(t) + v · Δt",
    description: "Position integration",
  },
  {
    name: "Kinetic Energy",
    formula: "KE = ½mv²",
    description: "Energy of motion",
  },
  {
    name: "Potential Energy",
    formula: "PE = mgh",
    description: "Energy due to height",
  },
  {
    name: "Damped Velocity",
    formula: "v(t+Δt) = v(t) · c",
    description: "Velocity damping (c = damping coefficient)",
  },
  {
    name: "Energy Dissipation",
    formula: "E(t+Δt) = E(t) · c²",
    description: "Energy decreases quadratically with damping",
  },
];

// Guided experiments
export const GUIDED_EXPERIMENTS = [
  {
    id: "drop-test",
    name: "Drop Test",
    description: "Observe free fall under gravity",
    instructions: [
      "Watch a single body fall from rest",
      "Observe the velocity increase over time",
      "Check energy conservation in the readouts",
    ],
    question: "Why does velocity increase linearly with time?",
    parameters: {
      numBodies: 1,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 1.0,
      frictionMu: 0,
    },
  },
  {
    id: "energy-conservation",
    name: "Energy Conservation",
    description: "Verify total energy remains constant",
    instructions: [
      "Start with a single body",
      "Watch the kinetic and potential energy",
      "Verify total energy stays constant",
    ],
    question: "What happens to energy when restitution < 1?",
    parameters: {
      numBodies: 1,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 1.0,
      frictionMu: 0,
    },
  },
  {
    id: "energy-dissipation",
    name: "Energy Dissipation",
    description: "Observe bodies gradually lose energy and reach equilibrium",
    instructions: [
      "Enable Energy Dissipation",
      "Watch bodies gradually slow down",
      "Observe energy decreasing over time",
      "Notice bodies eventually come to rest",
    ],
    question: "Why do bodies eventually stop moving with energy dissipation?",
    parameters: {
      numBodies: 5,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 0.8,
      frictionMu: 0.1,
      energyDissipation: true,
      dampingCoefficient: 0.995,
    },
  },
  {
    id: "numerical-instability",
    name: "Numerical Instability Demo",
    description: "See what happens with large timesteps",
    instructions: [
      "Increase number of bodies to 100+",
      "Watch for warnings about instability",
      "Observe energy drift",
    ],
    question: "Why does energy increase over time with many bodies?",
    parameters: {
      numBodies: 100,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 1.0,
      frictionMu: 0,
    },
  },
  {
    id: "stress-test-50",
    name: "Stress Test - 50 Bodies",
    description: "Test performance with 50 bodies",
    instructions: [
      "Monitor FPS and frame time",
      "Check system statistics",
      "Observe performance metrics",
    ],
    question: "What is the maximum number of bodies your system can handle at 60 FPS?",
    parameters: {
      numBodies: 50,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 0.8,
      frictionMu: 0.1,
    },
  },
  {
    id: "stress-test-200",
    name: "Stress Test - 200 Bodies",
    description: "Push the limits with 200 bodies",
    instructions: [
      "Watch for performance warnings",
      "Monitor frame time degradation",
      "Check optimization suggestions",
    ],
    question: "How does performance scale with number of bodies?",
    parameters: {
      numBodies: 200,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 0.8,
      frictionMu: 0.1,
    },
  },
  {
    id: "stress-test-500",
    name: "Stress Test - 500 Bodies",
    description: "Maximum stress test",
    instructions: [
      "This will likely cause performance issues",
      "Observe system limits",
      "Check optimization recommendations",
    ],
    question: "What optimizations could improve performance?",
    parameters: {
      numBodies: 500,
      gravity: EARTH_G_SI,
      mass: 1.0,
      restitution: 0.8,
      frictionMu: 0.1,
      trailEnabled: false, // Disable trails for better performance
    },
  },
];

// Enhanced mapper with comprehensive physics and performance data
export const SimInfoMapper = (state, context, refs = {}) => {
  const { p, bodies, performanceMetrics } = context;
  const { initialEnergyRef } = refs;
  const fps = Math.round(p.frameRate());
  const frameTime = performanceMetrics?.frameTime || 0;
  const updateTime = performanceMetrics?.updateTime || 0;
  const renderTime = performanceMetrics?.renderTime || 0;
  
  // System-wide statistics
  const numBodies = bodies?.length || 0;
  let totalMass = 0;
  let totalKineticEnergy = 0;
  let totalPotentialEnergy = 0;
  let totalMomentumX = 0;
  let totalMomentumY = 0;
  let collisionCount = 0;
  let activeBodies = 0;
  
  if (bodies && bodies.length > 0) {
    bodies.forEach((body) => {
      const { pos, vel, acc } = body.state;
      const { mass, gravity } = body.params;
      
      totalMass += mass;
      const height = Math.max(0, pos.y);
      totalPotentialEnergy += mass * gravity * height;
      const velocityMag = vel.mag();
      totalKineticEnergy += 0.5 * mass * velocityMag * velocityMag;
      totalMomentumX += mass * vel.x;
      totalMomentumY += mass * vel.y;
      
      if (velocityMag > 0.01 || Math.abs(acc.mag()) > 0.01) {
        activeBodies++;
      }
      
      // Count collisions (if body has collision tracking)
      if (body.collisionCount !== undefined) {
        collisionCount += body.collisionCount;
      }
    });
  }
  
  const totalEnergy = totalKineticEnergy + totalPotentialEnergy;
  const totalMomentum = Math.sqrt(totalMomentumX * totalMomentumX + totalMomentumY * totalMomentumY);
  
  // Track initial energy on first calculation
  if (initialEnergyRef && initialEnergyRef.current === null && totalEnergy > 0) {
    initialEnergyRef.current = totalEnergy;
  }
  
  // Calculate energy conservation
  let energyConservation = "";
  if (initialEnergyRef && initialEnergyRef.current !== null && initialEnergyRef.current > 0) {
    const energyChange = totalEnergy - initialEnergyRef.current;
    const energyPercentChange = (energyChange / initialEnergyRef.current) * 100;
    
    if (Math.abs(energyPercentChange) < 0.1) {
      energyConservation = "✓ Conserved";
    } else if (energyPercentChange > 0) {
      energyConservation = `+${energyPercentChange.toFixed(2)}% (Gained)`;
    } else {
      energyConservation = `${energyPercentChange.toFixed(2)}% (Lost)`;
    }
  }
  
  // Performance metrics
  const performanceData = {
    "FPS": `${fps} fps`,
    "Frame Time": `${frameTime.toFixed(2)} ms`,
    "Update Time": `${updateTime.toFixed(2)} ms`,
    "Render Time": `${renderTime.toFixed(2)} ms`,
  };
  
  // System statistics
  const systemData = {
    "Total Bodies": numBodies.toString(),
    "Active Bodies": `${activeBodies} / ${numBodies}`,
    "Total Mass": `${totalMass.toFixed(2)} kg`,
    "System KE": `${totalKineticEnergy.toFixed(2)} J`,
    "System PE": `${totalPotentialEnergy.toFixed(2)} J`,
    "System Total E": `${totalEnergy.toFixed(2)} J`,
    "Total Momentum": `${totalMomentum.toFixed(2)} kg·m/s`,
    "Collisions": collisionCount.toString(),
  };
  
  // Add energy conservation
  if (energyConservation) {
    systemData["Energy Conservation"] = energyConservation;
  }
  
  // Performance warnings and optimization suggestions
  const optimizationSuggestions = [];
  if (fps < 30) {
    systemData["⚠ Performance"] = "Low FPS - Consider reducing bodies";
    optimizationSuggestions.push("Reduce number of bodies");
  }
  if (frameTime > 33) {
    systemData["⚠ Frame Time"] = "High - May cause stuttering";
    if (!optimizationSuggestions.includes("Reduce number of bodies")) {
      optimizationSuggestions.push("Reduce number of bodies");
    }
  }
  if (updateTime > frameTime * 0.7) {
    systemData["⚠ Update Time"] = "Physics update is bottleneck";
    optimizationSuggestions.push("Optimize physics calculations");
  }
  if (renderTime > frameTime * 0.5) {
    systemData["⚠ Render Time"] = "Rendering is bottleneck";
    optimizationSuggestions.push("Disable trails or reduce quality");
  }
  if (numBodies > 100 && fps < 60) {
    optimizationSuggestions.push("Consider spatial partitioning");
    optimizationSuggestions.push("Use object pooling");
  }
  if (collisionCount > numBodies * 10) {
    systemData["⚠ Collisions"] = "High collision rate";
    optimizationSuggestions.push("Optimize collision detection");
  }
  
  if (optimizationSuggestions.length > 0) {
    systemData["💡 Optimizations"] = optimizationSuggestions.join(", ");
  }
  
  // Performance rating
  let performanceRating = "Excellent";
  if (fps < 30) performanceRating = "Poor";
  else if (fps < 45) performanceRating = "Fair";
  else if (fps < 55) performanceRating = "Good";
  
  systemData["Performance Rating"] = performanceRating;
  
  return {
    ...performanceData,
    ...systemData,
  };
};
