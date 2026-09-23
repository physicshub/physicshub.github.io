// app/components/SimulationLayout.jsx
import { useEffect } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import { resetTime } from "../constants/Time.js";
import Stars from "./Stars.jsx";
import GradientBackground from "./GradientBackground.jsx";
import TopSim from "./TopSim.tsx";
import Controls from "./Controls.jsx";

export default function SimulationLayout({
  onReset,
  inputs,
  simulation,
  onLoad,
  children,
  dynamicInputs,
  overview,
  related,
}) {
  const { meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  // Reset time on simulation change
  useEffect(() => {
    resetTime();
  }, [simulation]);

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <Stars color="#AEE3FF" opacity={0.3} />
      <GradientBackground />
      <TopSim />

      {/* On wide screens the canvas is the stage and the controls + parameters
          dock into a sticky side panel; below 1080px everything stacks in the
          same reading order. */}
      <div className="simulation-stage">
        <div className="simulation-stage__canvas">{children}</div>

        <aside className="simulation-stage__panel">
          <Controls
            onReset={onReset}
            inputs={inputs}
            simulation={simulation}
            onLoad={onLoad}
          />
          {dynamicInputs}
        </aside>
      </div>

      {/* Server-rendered slots: the concise summary sits directly under the
          stage, the recommended-reading list closes the page. */}
      {overview}
      {related}
    </div>
  );
}
