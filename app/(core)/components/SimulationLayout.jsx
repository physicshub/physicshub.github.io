// app/components/SimulationLayout.jsx
import { useEffect, useMemo } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import { resetTime } from "../constants/Time.js";
import Stars from "./Stars.jsx";
import GradientBackground from "./GradientBackground.jsx";
import TopSim from "./TopSim.tsx";
import Controls from "./Controls.jsx";
import TheoryRenderer from "./theory/TheoryRenderer.tsx";
import chapters from "../data/chapters.js";
import { allBlogs } from "../data/articles/index.js";

export default function SimulationLayout({
  onReset,
  inputs,
  simulation,
  onLoad,
  children,
  dynamicInputs,
  overview,
}) {
  const { meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const theory = useMemo(() => {
    const chapter = chapters.find((ch) => ch.link === simulation);
    const slug = chapter?.relatedBlogSlug;

    return slug && allBlogs[slug] ? allBlogs[slug].theory : { sections: [] };
  }, [simulation]);

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

      {/* Concise, server-rendered summary — sits directly under the stage, above
          the long theory article. */}
      {overview}

      <TheoryRenderer theory={theory} />
    </div>
  );
}
