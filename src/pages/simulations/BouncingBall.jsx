import { useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate, collideBoundary } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";

import useSimulationState from "../../hooks/useSimulationState.js";
import SimulationLayout from "../../components/SimulationLayout.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";

import { INITIAL_INPUTS, INPUT_FIELDS } from "../../data/configs/BouncingBall.js";
import chapters from "../../data/chapters.js";

export function BouncingBall() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
    },
    [setInputs]
  );

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  // 🎨 Sketch p5
  const Sketch = useCallback(
    (p) => {
      let pos, vel;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        pos = p.createVector(1, 1);
        vel = p.createVector(inputsRef.current.velocityX, inputsRef.current.velocityY);

        const bg = getComputedStyle(document.body).backgroundColor
          .match(/\d+/g)
          .map(Number);
        p.background(...bg);
      };

      p.draw = () => {
        const { size, restitution, gravity, trailEnabled, ballColor } = inputsRef.current;
        const dt = computeDelta(p);
        if (dt === 0) return;

        const acc = p.createVector(0, gravity);

        ({ pos, vel } = integrate(pos, vel, acc, dt));
        ({ pos, vel } = collideBoundary(
          pos,
          vel,
          { w: p.width / SCALE, h: p.height / SCALE },
          size / 2,
          restitution
        ));

        const bg = getComputedStyle(document.body).backgroundColor
          .match(/\d+/g)
          .map(Number);
        if (trailEnabled) {
          p.noStroke();
          p.fill(bg[0], bg[1], bg[2], 60);
          p.rect(0, 0, p.width, p.height);
        } else {
          p.background(...bg);
        }

        p.noStroke();
        p.fill(ballColor);
        p.circle(toPixels(pos.x), toPixels(pos.y), toPixels(size));
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
      };
    },
    [inputsRef]
  );

  return (
    <SimulationLayout
      sketch={Sketch}
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);

        resetInputs(true); // preferisci i valori salvati se ci sono
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location.pathname}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      }}
      theory={theory}
    >
      {/* 🎛️ Pannello input dinamico */}
      <DynamicInputs
        config={INPUT_FIELDS}
        values={inputs}
        onChange={handleInputChange}
      />
    </SimulationLayout>
  );
}
