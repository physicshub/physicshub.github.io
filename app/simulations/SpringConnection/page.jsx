// app/pages/simulations/SpringConnection.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Classes & Config ---
import Bob from "../../components/classes/Bob.js";
import Spring from "../../components/classes/Spring.js";
import { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper } from "../../data/configs/SpringConnection.js";
import chapters from "../../data/chapters.js";

// --- Core Utils ---
import { resetTime, isPaused, setPause, computeDelta } from "../../constants/Time.js";
import { toPixels, accelSI_to_pxSec, springK_SI_to_px } from "../../constants/Utils.js";
import getBackgroundColor from "../../utils/getBackgroundColor";

// --- Reusable UI Components ---
import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";

// --- Hooks ---
import useSimulationState from "../../hooks/useSimulationState";
import useSimInfo from "../../hooks/useSimInfo";

export default function SpringConnection() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info
  const { simData, updateSimInfo } = useSimInfo();

  // Refs per oggetti fisici
  const springRef = useRef(null);
  const bobRef = useRef(null);

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback((p) => {
    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

      // Anchor al centro in alto
      springRef.current = new Spring(p, w / 2, 50, toPixels(inputsRef.current.springRestLength));
      springRef.current.k = springK_SI_to_px(inputsRef.current.springK);

      // Bob inizializzato più in basso
      bobRef.current = new Bob(p, w / 2, 250);
      bobRef.current.mass = inputsRef.current.bobMass;
      bobRef.current.damping = inputsRef.current.bobDamping;
      // size in metri → convertito in pixel
      bobRef.current.size = toPixels(inputsRef.current.bobSize);
      bobRef.current.color = inputsRef.current.bobColor;
    };

    p.draw = () => {
      const {
        gravity,
        springK,
        springRestLength,
        bobMass,
        bobDamping,
        bobSize,
        bobColor,
        springColor,
        anchorColor,
        minLength,
        maxLength,
      } = inputsRef.current;

      const spring = springRef.current;
      const bob = bobRef.current;
      if (!spring || !bob) return;

      // Background
      const bg = getBackgroundColor();
      const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
      p.background(r, g, b);

      // Forza di gravità (in pixel/s²)
      const GravityForce = p.createVector(0, accelSI_to_pxSec(gravity) * bob.mass);
      bob.applyForce(GravityForce);

      // Aggiorna proprietà
      spring.k = springK_SI_to_px(springK);
      spring.restLength = toPixels(springRestLength);
      bob.mass = bobMass;
      bob.damping = bobDamping;
      bob.size = toPixels(bobSize);
      bob.color = bobColor;
      spring.color = springColor;
      spring.anchorColor = anchorColor;

      // Update dinamica
      bob.update(computeDelta(p));
      bob.handleDrag(p.mouseX, p.mouseY);

      spring.connect(bob);
      spring.constrainLength(bob, toPixels(minLength), toPixels(maxLength));

      // Disegno
      spring.showLine(bob);
      bob.show();
      spring.show();

      // Update SimInfo (in metri)
      updateSimInfo(
        p,
        {
          pos: bob.pos, // in pixel, convertito nel mapper
          vel: bob.vel,
          mass: bob.mass,
          k: spring.k,
          restLength: springRestLength, // già in metri
        },
        { gravity, canvasHeight: p.height },
        SimInfoMapper
      );
    };

    p.mousePressed = () => {
      bobRef.current?.handleClick(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
      bobRef.current?.stopDragging();
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);

      springRef.current = new Spring(p, w / 2, 50, toPixels(inputsRef.current.springRestLength));
      springRef.current.k = springK_SI_to_px(inputsRef.current.springK);

      bobRef.current = new Bob(p, w / 2, 250);
      bobRef.current.mass = inputsRef.current.bobMass;
      bobRef.current.damping = inputsRef.current.bobDamping;
      bobRef.current.size = toPixels(inputsRef.current.bobSize);
      bobRef.current.color = inputsRef.current.bobColor;
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