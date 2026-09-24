// app/components/SimulationLayout.jsx
import { useEffect } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import { resetTime } from "../constants/Time.js";
import Stars from "./Stars.jsx";
import GradientBackground from "./GradientBackground.jsx";
import TopSim from "./TopSim.tsx";
import Controls from "./Controls.jsx";
import { buildSimulationUrl } from "../utils/simulationUrl.js";

export default function SimulationLayout({
  onReset,
  inputs,
  initialInputs,
  simulation,
  onLoad,
  children,
  dynamicInputs,
}) {
  const { t, meta } = useTranslation();
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
        <div className="simulation-stage__canvas">
          {children}
          {/* Shown only in embed mode (CSS), so it never changes the layout. */}
          <a
            className="embed-open-link"
            href={buildSimulationUrl(simulation, inputs, initialInputs ?? {})}
            target="_blank"
            rel="noopener"
          >
            {t("Open on PhysicsHub")} ↗
          </a>
        </div>

        <aside className="simulation-stage__panel">
          <Controls
            onReset={onReset}
            inputs={inputs}
            initialInputs={initialInputs}
            simulation={simulation}
            onLoad={onLoad}
          />
          {dynamicInputs}
        </aside>
      </div>
    </div>
  );
}
