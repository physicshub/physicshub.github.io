// IMPORTANT!
// This is a template file to use if you want create another brand new simulation.
// THIS FILE IS INACTIVE RIGHT NOW, USE BouncingBall Simulation as a model to follow, It's right now the best and more optimized simulation
// If you make some changes about code centralized that every simulation should use, add it here.
// If you have any questions, please ask on the Github repository opening an issue.

"use client";
import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { computeDelta, resetTime, isPaused, setPause } from "../../../(core)/constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, FORCES, SimInfoMapper } from "../../../(core)/data/configs/test.js";
import chapters from "../../../(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";
import { drawForceVector, getActiveForces } from "../../../(core)/utils/drawUtils.js";

// --- Centralized Body classes ---

export default function Test() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const { simData, updateSimInfo } = useSimInfo({  });

  

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

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        p.background(getBackgroundColor());
      };

      p.draw = () => {
        const { } = inputsRef.current;
        const dt = computeDelta(p);

        // Vettori forze
        const activeForces = getActiveForces(
          FORCES,
        );

        for (const f of activeForces) {
          drawForceVector(p, pixelX, pixelY, f.vec, f.color);
        }

        // Aggiorna sim info
        updateSimInfo(
          p,

          SimInfoMapper
        );
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