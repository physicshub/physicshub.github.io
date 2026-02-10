// app/components/SimulationLayout.jsx
import { useEffect, useMemo } from "react";
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
  hideDefaultControls = false,
}) {
  const theory = useMemo(() => {
    const chapter = chapters.find((ch) => ch.link === simulation);
    const slug = chapter?.relatedBlogSlug;

    return slug && allBlogs[slug]
      ? allBlogs[slug].theory
      : {
          sections: [],
        };
  }, [simulation]);

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

      {/* 2. Render the Main Controls (unless hidden) */}
      {!hideDefaultControls && (
        <Controls
          onReset={onReset}
          inputs={inputs}
          simulation={simulation}
          onLoad={onLoad}
        />
      )}

      {/* 3. Render the Dynamic Inputs */}
      {dynamicInputs}

      <TheoryRenderer theory={theory} />
    </>
  );
}
