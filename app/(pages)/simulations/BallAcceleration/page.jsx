// app/pages/simulations/BallAcceleration.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Physics & Constants ---
import { SCALE } from "../../../(core)/constants/Config.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../../(core)/constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper, FORCES } from "../../../(core)/data/configs/BallAcceleration.js";
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
import { drawBallWithTrail, drawForceVector } from "../../../(core)/utils/drawUtils.js";

// --- Centralized Body class ---
import Body from "../../../(core)/physics/Body";

export default function BallAcceleration() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const { simData, updateSimInfo } = useSimInfo();

  // Corpo fisico riusabile
  const bodyRef = useRef(null);

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback((p) => {
    let trailLayer = null;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();

      // Inizializza corpo con parametri
      bodyRef.current = new Body(p, {
        mass: 1,
        size: inputsRef.current.size,
        gravity: 0,
        frictionMu: 0,
        color: inputsRef.current.color,
      }, p.createVector(w / 2 / SCALE, h / 2 / SCALE));

      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const { size, acc, maxspeed, color, trailEnabled } = inputsRef.current;
      const dt = computeDelta(p);
      if (!bodyRef.current || dt <= 0) return;

      const { pos, vel } = bodyRef.current.state;

      // Accelerazione verso il mouse
      const target = p.createVector(p.mouseX / SCALE, p.mouseY / SCALE);
      const offset = target.sub(pos);
      let dir = p.createVector(0, 0);
      if (offset.magSq() > 1e-8) {
        dir = offset.copy().normalize().mult(acc);
      }

      // Step fisico con forza esterna
      bodyRef.current.step(p, dt, dir.magSq() > 0 ? dir : undefined);

      // Clamp velocità
      if (bodyRef.current.state.vel.mag() > maxspeed) {
        bodyRef.current.state.vel.setMag(maxspeed);
      }

      const pixelX = pos.x * SCALE;
      const pixelY = pos.y * SCALE;
      const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= size * SCALE / 2;

      // --- Trail + palla ---
      drawBallWithTrail(p, trailLayer, {
        bg: getBackgroundColor(),
        trailEnabled,
        trailAlpha: 60,
        pixelX,
        pixelY,
        size: size * SCALE,
        isHover,
        ballColor: color,
      });

      p.clear();
      p.image(trailLayer, 0, 0);

/*       // --- Vettori ---
      drawForceVector(p, pixelX, pixelY, dir.copy().mult(200), "red"); // Accelerazione
      drawForceVector(p, pixelX, pixelY, bodyRef.current.state.vel.copy().mult(20), "blue"); // Velocità */

      // Force vectors (only visual)
      const activeForces = FORCES
        .map((fDef) => {
          const vec = fDef.computeFn(
            { dir, vel },
            inputsRef.current,
            {  }
          );
          return vec ? { vec, color: fDef.color } : null;
        })
        .filter(Boolean);

        console.log(activeForces)
      for (const f of activeForces) {
        drawForceVector(p, pixelX, pixelY, f.vec, f.color);
      }

      // Aggiornamento SimInfo
      updateSimInfo(
        p,
        { pos, vel, acc, maxspeed },
        { canvasHeight: p.height },
        SimInfoMapper
      );
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
    };
  }, [inputsRef, updateSimInfo]);

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
      dynamicInputs={<DynamicInputs config={INPUT_FIELDS} values={inputs} onChange={handleInputChange} />}
    >
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} />} />
    </SimulationLayout>
  );
}