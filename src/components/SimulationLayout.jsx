// components/SimulationLayout.jsx
import Stars from "./Stars.jsx";
import GradientBackground from "./GradientBackground.jsx";
import TopSim from "./TopSim.js";
import Screen from "./Screen.jsx";
import Controls from "./Controls.jsx";
import TheoryRenderer from "./theory/TheoryRenderer.js";

export default function SimulationLayout({
  sketch,
  resetVersion,
  onReset,
  inputs,
  simulation,
  onLoad,
  theory,
  children,
}) {
  return (
    <>
      <Stars color="#AEE3FF" opacity={0.3} />
      <GradientBackground />
      <TopSim />
      <Screen sketch={sketch} key={resetVersion} />
      <Controls
        onReset={onReset}
        inputs={inputs}
        simulation={simulation}
        onLoad={onLoad}
      />
      {children}
      <TheoryRenderer theory={theory} />
    </>
  );
}
