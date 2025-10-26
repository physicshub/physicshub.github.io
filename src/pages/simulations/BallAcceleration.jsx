// src/pages/simulations/BallAcceleration.jsx
import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Physics & Constants ---
import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper } from "../../data/configs/BallAcceleration.js";
import chapters from "../../data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../../hooks/useSimulationState.js";
import useSimInfo from "../../hooks/useSimInfo.js";
import getBackgroundColor from "../../utils/getBackgroundColor.js";
import { drawBackground, drawForceVector } from "../../utils/drawUtils.js";

export function BallAcceleration() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const { simData, updateSimInfo } = useSimInfo();

  // Physics state
  const ballState = useRef({ pos: null, vel: null });

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  const sketch = useCallback((p) => {
    let trailLayer = null;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();

      // init ball
      ballState.current.pos = p.createVector(w / 2 / SCALE, h / 2 / SCALE);
      ballState.current.vel = p.createVector(0, 0);

      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const { size, acceleration, maxspeed, color, trailEnabled } = inputsRef.current;
      const { pos, vel } = ballState.current;
      const dt = computeDelta(p);
      if (!pos || !vel) return;

      let dir = null;

      // Physics update: accelerate toward mouse
      if (dt > 0) {
        const target = p.createVector(p.mouseX / SCALE, p.mouseY / SCALE);
        dir = target.copy().sub(pos).normalize().mult(acceleration);
        const newState = integrate(pos, vel, dir, dt);

        // clamp speed
        if (newState.vel.mag() > maxspeed) {
          newState.vel.setMag(maxspeed);
        }

        ballState.current.pos = newState.pos;
        ballState.current.vel = newState.vel;
      }

      drawBackground(p, getBackgroundColor(), trailEnabled, trailLayer);

      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);

      // Disegno palla
      trailLayer.noStroke();
      trailLayer.fill(color);
      trailLayer.circle(pixelX, pixelY, toPixels(size));

      p.image(trailLayer, 0, 0);

      // --- Disegno vettori come in BouncingBall ---
      if (dir) {
        // Accelerazione (rosso)
        drawForceVector(p, pixelX, pixelY, dir.copy().mult(200), "red");
      }
      if (vel) {
        // Velocità (blu)
        drawForceVector(p, pixelX, pixelY, vel.copy().mult(20), "blue");
      }

      // Aggiornamento SimInfo
      updateSimInfo(
        p,
        { pos, vel, acceleration, maxspeed },
        { canvasHeight: p.height },
        SimInfoMapper
      );
    };


    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
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
      dynamicInputs={
        <DynamicInputs
          config={INPUT_FIELDS}
          values={inputs}
          onChange={handleInputChange}
        />
      }
    >
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} />} />
    </SimulationLayout>
  );
}
