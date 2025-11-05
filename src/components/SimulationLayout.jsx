// src/components/SimulationLayout.jsx
import { useEffect } from "react";
import { resetTime } from "../constants/Time.js";
import Stars from "./Stars.jsx";
import GradientBackground from "./GradientBackground.jsx";
import TopSim from "./TopSim.tsx";
import Controls from "./Controls.jsx";
import TheoryRenderer from "./theory/TheoryRenderer.tsx";

export default function SimulationLayout({
  onReset,
  inputs,
  simulation,
  onLoad,
  theory,
  children, // This will now ONLY be the canvas (P5Wrapper)
  dynamicInputs, // A new prop for the simulation-specific inputs
}) {

  // Reset time on simulation change
  useEffect(() => {
    resetTime();
  }, [simulation]);

  return (
    <>
      <Stars color="#AEE3FF" opacity={0.3} />
      <GradientBackground />
      <TopSim />

      {/* 1. Render the Canvas */}
      {children}

      {/* 2. Render the Main Controls */}
      <Controls
        onReset={onReset}
        inputs={inputs}
        simulation={simulation}
        onLoad={onLoad}
      />

      {/* 3. Render the Dynamic Inputs */}
      {dynamicInputs}
      
      <TheoryRenderer theory={theory} />
    </>
  );
}