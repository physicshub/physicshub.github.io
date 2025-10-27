// src/pages/simulations/SimplePendulum.jsx
import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Classes & Config ---
import Pendulum from "../../components/classes/Pendulum.js";
import { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper } from "../../data/configs/SimplePendulum.js";
import chapters from "../../data/chapters.js";
import { SCALE } from "../../constants/Config.js";

// --- Core Utils ---
import { resetTime, isPaused, setPause } from "../../constants/Time.js";
import getBackgroundColor from "../../utils/getBackgroundColor.js";
import { drawBackground, drawGlow } from "../../utils/drawUtils.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";

// --- Hooks ---
import useSimulationState from "../../hooks/useSimulationState.js";
import useSimInfo from "../../hooks/useSimInfo.js";

export function SimplePendulum() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info
  const { simData, updateSimInfo } = useSimInfo();

  // Ref to hold the pendulum instance
  const pendulumRef = useRef(null);

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  const sketch = useCallback((p) => {
    let trailLayer = null;

    const createPendulum = () => {
      const { clientWidth: w } = p._userNode;
      pendulumRef.current = new Pendulum(p, w / 2, 0, inputsRef.current.length * SCALE);
    };

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();
      createPendulum();
      p.background(getBackgroundColor());
    };

    p.draw = () => {
      drawBackground(p, getBackgroundColor(), inputsRef.current.trailEnabled, trailLayer);

      const pendulum = pendulumRef.current;
      if (!pendulum) return;

      // Update properties
      pendulum.damping = inputsRef.current.damping;
      pendulum.size = inputsRef.current.size * SCALE;
      pendulum.gravity = inputsRef.current.gravity;
      pendulum.color = inputsRef.current.color;
      pendulum.r = inputsRef.current.length * SCALE;

      pendulum.update();

      // Calcola posizione bob in pixel
      const bobX = pendulum.pivot.x + pendulum.r * p.sin(pendulum.angle);
      const bobY = pendulum.pivot.y + pendulum.r * p.cos(pendulum.angle);

      // Disegna l’asta sul trailLayer
      trailLayer.stroke(0);
      trailLayer.strokeWeight(2);
      trailLayer.line(pendulum.pivot.x, pendulum.pivot.y, bobX, bobY);

      // Hover detection (usa coordinate pixel dirette)
      const isHover = p.dist(bobX, bobY, p.mouseX, p.mouseY) <= pendulum.size;

      // Disegna bob con glow
      drawGlow(
        p,
        isHover,
        pendulum.color,
        () => {
          trailLayer.noStroke();
          trailLayer.fill(pendulum.color);
          trailLayer.circle(bobX, bobY, pendulum.size * 2);
        },
        20,
        trailLayer
      );

      // Mostra il layer
      p.image(trailLayer, 0, 0);

      pendulum.drag();

      updateSimInfo(
        p,
        { angle: pendulum.angle, angleVelocity: pendulum.angleVelocity, length: inputsRef.current.length },
        { gravity: pendulum.gravity },
        SimInfoMapper
      );
    };


    p.mousePressed = () => {
      pendulumRef.current?.clicked(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
      pendulumRef.current?.stopDragging();
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();
      createPendulum();
    };
  }, [inputsRef]);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);
        resetInputs(true);
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location.pathname}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      }}
      theory={theory}
      dynamicInputs={<DynamicInputs config={INPUT_FIELDS} values={inputs} onChange={handleInputChange} />}
    >
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} />} />
    </SimulationLayout>
  );
}