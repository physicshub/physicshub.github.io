// src/components/SimulationLayout.jsx (Corrected)
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
  children, // This prop will contain the P5Wrapper and DynamicInputs
}) {
  return (
    <>
      <Stars color="#AEE3FF" opacity={0.3} />
      <GradientBackground />
      <TopSim />

      {/* This renders the simulation canvas and input controls passed from the parent */}
      {children}

      <Controls
        onReset={onReset}
        inputs={inputs}
        simulation={simulation}
        onLoad={onLoad}
      />
      
      <TheoryRenderer theory={theory} />
    </>
  );
}