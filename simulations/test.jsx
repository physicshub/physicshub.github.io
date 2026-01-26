// app/pages/simulations/test.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/test.js";
import chapters from "../app/(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import { drawBallWithTrail } from "../app/(core)/utils/drawUtils.js";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

// --- Centralized Body class ---
import Body from "../app/(core)/physics/Body.ts";

export default function Test() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  const { simData, updateSimInfo } = useSimInfo();
  const bodiesRef = useRef([]);
  const trailLayerRef = useRef(null);

  // 🔧 Gestione input
  const handleInputChange = useCallback(
    (name, value) => setInputs((prev) => ({ ...prev, [name]: value })),
    [setInputs]
  );

  // 📚 Teoria associata
  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  // 🔄 Funzione per creare corpi
  const createBodies = useCallback((p, numBodies, params) => {
    const { mass, size, gravity, restitution, frictionMu } = params;
    const { clientWidth: w, clientHeight: h } = p._userNode;

    return Array.from({ length: numBodies }, () => {
      const randomColor = p.color(
        p.random(0, 255),
        p.random(0, 255),
        p.random(0, 255)
      );
      const randomX = toMeters(p.random(50, w - 50));
      const randomY = toMeters(p.random(50, h / 2));

      return new Body(
        p,
        {
          mass: mass * p.random(0.5, 2),
          size: size * p.random(0.5, 1.5),
          gravity,
          restitution,
          frictionMu,
          color: randomColor,
        },
        p.createVector(randomX, randomY)
      );
    });
  }, []);

  // 🎨 Inizializza layer trail
  const initTrailLayer = useCallback((p, w, h) => {
    const layer = p.createGraphics(w, h);
    layer.pixelDensity(1);
    layer.clear();
    return layer;
  }, []);

  // 🖌️ Sketch P5
  const sketch = useCallback(
    (p) => {
      let lastNumBodies = inputsRef.current.numBodies;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        trailLayerRef.current = initTrailLayer(p, w, h);
        bodiesRef.current = createBodies(
          p,
          inputsRef.current.numBodies,
          inputsRef.current
        );
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        const { gravity, numBodies, trailEnabled } = inputsRef.current;
        const dt = computeDelta(p);
        if (dt <= 0) return;

        // 🔄 Ricrea corpi se numBodies cambia
        if (numBodies !== lastNumBodies) {
          bodiesRef.current = createBodies(p, numBodies, inputsRef.current);
          lastNumBodies = numBodies;
        }

        p.clear();
        p.image(trailLayerRef.current, 0, 0);

        bodiesRef.current.forEach((body, i) => {
          body.params.gravity = gravity;
          body.step(p, dt);

          const { pos } = body.state;
          const pixelX = toPixels(pos.x);
          const pixelY = toPixels(pos.y);
          const bodySizePx = toPixels(body.params.size);

          drawBallWithTrail(p, trailLayerRef.current, {
            bg: getBackgroundColor(),
            trailEnabled,
            trailAlpha: 60,
            pixelX,
            pixelY,
            size: bodySizePx,
            isHover: body.isHover(p),
            ballColor: body.params.color,
          });

          // Aggiorna sim info solo sul primo corpo
          if (i === 0) {
            updateSimInfo(p, {}, { p }, SimInfoMapper);
          }
        });
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
        trailLayerRef.current = initTrailLayer(p, w, h);
      };
    },
    [inputsRef, updateSimInfo, createBodies, initTrailLayer]
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
