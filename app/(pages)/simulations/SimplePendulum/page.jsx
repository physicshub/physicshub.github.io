// app/pages/simulations/SimplePendulum.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Classes & Config ---
import Pendulum from "../../../(core)/physics/Pendulum.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../../../(core)/data/configs/SimplePendulum.js";
import chapters from "../../../(core)/data/chapters.js";
import { SCALE } from "../../../(core)/constants/Config.js";

// --- Core Utils ---
import {
  resetTime,
  isPaused,
  setPause,
} from "../../../(core)/constants/Time.js";
import getBackgroundColor from "../../../(core)/utils/getBackgroundColor";
import { drawGlow } from "../../../(core)/utils/drawUtils.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

// --- Hooks ---
import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";

export default function SimplePendulum() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info
  const { simData, updateSimInfo } = useSimInfo();

  // Ref to hold the pendulum instance
  const pendulumRef = useRef(null);

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

      const createPendulum = () => {
        const { clientWidth: w } = p._userNode;
        pendulumRef.current = new Pendulum(
          p,
          w / 2,
          0,
          inputsRef.current.length * SCALE
        );
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
        const pendulum = pendulumRef.current;
        if (!pendulum) return;

        // Aggiorna proprietà dinamiche
        pendulum.damping = inputsRef.current.damping;
        pendulum.size = inputsRef.current.size * SCALE;
        pendulum.gravity = inputsRef.current.gravity;
        pendulum.bobColor = inputsRef.current.bobColor;
        pendulum.stringColor = inputsRef.current.stringColor;
        pendulum.r = inputsRef.current.length * SCALE;

        // 1) Fisica
        pendulum.update();

        // 2) Posizione bob aggiornata
        const { x: bobX, y: bobY } = pendulum.getBobPosition();

        // 3) Trail: sfondo + asta + bob senza glow
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.noStroke();
          trailLayer.fill(r, g, b, 60);
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        // Disegna asta
        trailLayer.stroke(p.color(pendulum.stringColor));
        trailLayer.strokeWeight(2);
        trailLayer.line(pendulum.pivot.x, pendulum.pivot.y, bobX, bobY);

        // Disegna bob (senza glow)
        trailLayer.noStroke();
        trailLayer.fill(pendulum.bobColor);
        trailLayer.circle(bobX, bobY, pendulum.size * 2);

        // 4) Compositing
        p.clear();
        p.image(trailLayer, 0, 0);

        // 5) Glow solo sul canvas principale
        const isHover = p.dist(bobX, bobY, p.mouseX, p.mouseY) <= pendulum.size;
        drawGlow(
          p,
          isHover,
          pendulum.bobColor,
          () => {
            p.noStroke();
            p.fill(pendulum.bobColor);
            p.circle(bobX, bobY, pendulum.size * 2);
          },
          20,
          p
        );

        // 6) Drag
        pendulum.drag();

        // 7) Update SimInfo
        updateSimInfo(
          p,
          {
            angle: pendulum.angle,
            angleVelocity: pendulum.angleVelocity,
            length: inputsRef.current.length,
          },
          { gravity: pendulum.gravity },
          SimInfoMapper
        );
      };

      // Mouse interactions
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
