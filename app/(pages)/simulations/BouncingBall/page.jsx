// app/pages/simulations/BouncingBall.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../../../(core)/constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../../(core)/constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, FORCES, SimInfoMapper } from "../../../(core)/data/configs/BouncingBall.js";
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
import { drawBallWithTrail, drawForceVector, getActiveForces } from "../../../(core)/utils/drawUtils.js";

// --- Centralized Body class ---
import Body from "../../../(core)/physics/Body";

export default function BouncingBall() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const maxHeightRef = useRef(0);
  const fallStartTimeRef = useRef(0);
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { maxHeightRef, fallStartTimeRef },
  });

  // Corpo fisico riusabile
  const bodyRef = useRef(null);

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
      const dragState = { active: false };
      let trailLayer;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(3);

        // Inizializza corpo con parametri
        bodyRef.current = new Body(
          p,
          {
            mass: inputsRef.current.mass,
            size: inputsRef.current.size,
            gravity: inputsRef.current.gravity,
            restitution: inputsRef.current.restitution,
            color: inputsRef.current.ballColor,
          },
          p.createVector(toMeters(w / 2), toMeters(h / 4))
        );

        maxHeightRef.current = 0;
        fallStartTimeRef.current = p.millis();

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
        trailLayer.background(r, g, b);
      };

      p.draw = () => {
        const { size, gravity, trailEnabled, ballColor, mass } = inputsRef.current;
        const dt = computeDelta(p);
        if (!bodyRef.current || dt <= 0) return;

        // Step fisico centralizzato
        if (!dragState.active) {
          bodyRef.current.step(p, dt);
        }

        const { pos, vel } = bodyRef.current.state;
        const pixelX = toPixels(pos.x);
        const pixelY = toPixels(pos.y);
        const radiusPx = toPixels(size / 2);
        const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radiusPx;

        // Trail + palla
        drawBallWithTrail(p, trailLayer, {
          bg: getBackgroundColor(),
          trailEnabled,
          trailAlpha: 60,
          pixelX,
          pixelY,
          size: toPixels(size),
          isHover,
          ballColor,
        });

        p.clear();
        p.image(trailLayer, 0, 0);

        // Vettori forze
        const activeForces = getActiveForces(
          FORCES,
          { pos, vel, radius: size / 2, mass },
          inputsRef.current,
          { canvasHeightMeters: toMeters(p.height) }
        );

        for (const f of activeForces) {
          drawForceVector(p, pixelX, pixelY, f.vec, f.color);
        }

        // Aggiorna sim info
        updateSimInfo(
          p,
          { pos, vel, mass },
          { gravity, canvasHeight: p.height },
          SimInfoMapper
        );
      };

      // Dragging interattivo
      p.mousePressed = () => {
        const { pos } = bodyRef.current.state;
        const d = p.dist(toPixels(pos.x), toPixels(pos.y), p.mouseX, p.mouseY);
        if (d <= toPixels(inputsRef.current.size / 2)) {
          dragState.active = true;
        }
      };

      p.mouseDragged = () => {
        if (!dragState.active) return;
        bodyRef.current.state.pos.x = toMeters(p.mouseX);
        bodyRef.current.state.pos.y = toMeters(p.mouseY);
        bodyRef.current.state.vel.set(0, 0);
      };

      p.mouseReleased = () => {
        dragState.active = false;
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
        trailLayer.background(r, g, b);
      };
    },
    [inputsRef, maxHeightRef, fallStartTimeRef]
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
