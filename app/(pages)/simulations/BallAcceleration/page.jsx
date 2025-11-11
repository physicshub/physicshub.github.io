// app/pages/simulations/BallAcceleration.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Physics & Constants ---
import { SCALE } from "../../../(core)/constants/Config.js";
import { toPixels, integrate } from "../../../(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../../../(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../../../(core)/data/configs/BallAcceleration.js";
import chapters from "../../../(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";
import getBackgroundColor from "../../../(core)/utils/getBackgroundColor";
import {
  drawBallWithTrail,
  drawForceVector,
} from "../../../(core)/utils/drawUtils.js";

export default function BallAcceleration() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const { simData, updateSimInfo } = useSimInfo();

  // Physics state
  const ballState = useRef({ pos: null, vel: null });

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
    },
    [setInputs]
  );

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback(
    (p) => {
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
        const { size, acceleration, maxspeed, color, trailEnabled } =
          inputsRef.current;
        const { pos, vel } = ballState.current;
        const dt = computeDelta(p);
        if (!pos || !vel) return;
        if (dt < 0) return;

        let dir = null;

        // Physics update: accelerate toward mouse
        const target = p.createVector(p.mouseX / SCALE, p.mouseY / SCALE);
        dir = target.copy().sub(pos).normalize().mult(acceleration);
        const newState = integrate(pos, vel, dir, dt);

        // clamp speed
        if (newState.vel.mag() > maxspeed) {
          newState.vel.setMag(maxspeed);
        }

        ballState.current.pos = newState.pos;
        ballState.current.vel = newState.vel;

        const pixelX = toPixels(pos.x);
        const pixelY = toPixels(pos.y);
        const isHover =
          p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= toPixels(size) / 2;

        // --- Trail + palla + glow centralizzati ---
        drawBallWithTrail(p, trailLayer, {
          bg: getBackgroundColor(),
          trailEnabled,
          trailAlpha: 60,
          pixelX,
          pixelY,
          size: toPixels(size),
          isHover,
          ballColor: color,
        });

        // Clear main canvas e composita trailLayer
        p.clear();
        p.image(trailLayer, 0, 0);

        // --- Vettori (ridisegnati ogni frame, niente trail) ---
        if (dir) {
          drawForceVector(p, pixelX, pixelY, dir.copy().mult(200), "red"); // Accelerazione
        }
        if (vel) {
          drawForceVector(p, pixelX, pixelY, vel.copy().mult(20), "blue"); // Velocità
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
    },
    [inputsRef, updateSimInfo]
  );

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
      simulation={location}
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
      <P5Wrapper
        sketch={sketch}
        key={resetVersion}
        simInfos={<SimInfoPanel data={simData} />}
      />
    </SimulationLayout>
  );
}
