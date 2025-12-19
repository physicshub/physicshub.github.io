// app/(pages)/simulations/MagneticField/page.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

import MagneticRod from "../../../(core)/physics/MagneticField.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../../../(core)/data/configs/MagneticField.js";

import chapters from "../../../(core)/data/chapters.js";
import { SCALE } from "../../../(core)/constants/Config.js";
import { toMeters } from "../../../(core)/constants/Utils.js";

import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../../../(core)/constants/Time.js";
import getBackgroundColor from "../../../(core)/utils/getBackgroundColor";
import { drawGlow } from "../../../(core)/utils/drawUtils.js";

import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";

export default function MagneticFieldPage() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );

  const [resetVersion, setResetVersion] = useState(0);

  const particleRef = useRef(null);
  const timeRef = useRef(0);
  const infoRefs = useMemo(() => ({ timeRef }), []);
  const { simData, updateSimInfo } = useSimInfo({ updateIntervalMs: 50, customRefs: infoRefs });

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(() => chapters.find((ch) => ch.link === location)?.theory, [location]);

  const sketch = useCallback((p) => {
    // Magnetic rod visualization
    let fieldLayer = null;
    let rod = null;
    const createScene = () => {
      const { clientHeight: h, clientWidth: w } = p._userNode;
      const cx = toMeters(w / 2);
      const cy = toMeters((h - 50) / 2);

      rod = new MagneticRod(p, cx, cy, inputsRef.current.rodLength, inputsRef.current.angle, inputsRef.current.moment);

      // Initialize sidebar inputs for rod position
      try {
        setInputs((prev) => ({ ...prev, rodX: Number(cx.toFixed(2)), rodY: Number(cy.toFixed(2)) }));
      } catch (e) {}
    };

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      fieldLayer = p.createGraphics(w, h);
      fieldLayer.clear();
      createScene();
      p.background(getBackgroundColor());
      setPause(true);
    };

    p.draw = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      if (!rod || !fieldLayer) return;

      // update rod parameters from inputs
      rod.length = inputsRef.current.rodLength;
      rod.moment = inputsRef.current.moment;
      rod.setAngleDeg(inputsRef.current.angle);

      // redraw field layer
      fieldLayer.clear();
      const bg = getBackgroundColor();
      const [br, bgc, bb] = Array.isArray(bg) ? bg : [0, 0, 0];
      if (!inputsRef.current.trailEnabled) fieldLayer.background(br, bgc, bb);

      // draw streamlines (cached for responsiveness) — fixed seeds
      if (inputsRef.current.showFieldLines) {
        const seeds = 24;
        const seedR = 0.6;
        const paramsKey = `${seeds}_${seedR}_${rod.moment}_${rod.length}_${inputsRef.current.angle}_${rod.pos.x.toFixed(3)}_${rod.pos.y.toFixed(3)}`;
        if (fieldLayer._cachedKey !== paramsKey) {
          fieldLayer._cachedKey = paramsKey;
          fieldLayer._lines = [];
          const maxSteps = 300;
          const step = 0.04;
          for (let i = 0; i < seeds; i++) {
            const theta = (i / seeds) * Math.PI * 2;
            const sx = rod.pos.x + seedR * Math.cos(theta);
            const sy = rod.pos.y + seedR * Math.sin(theta);
            const forward = rod.traceField(p.createVector(sx, sy), step, maxSteps);
            const backward = rod.traceField(p.createVector(sx, sy), -step, maxSteps);
            backward.reverse();
            const pts = backward.concat([p.createVector(sx, sy)]).concat(forward);
            fieldLayer._lines.push(pts);
          }
        }

        fieldLayer.noFill();
        fieldLayer.stroke(100, 200, 255, 160);
        fieldLayer.strokeWeight(1);
        const lines = fieldLayer._lines || [];
        for (const drawPts of lines) {
          fieldLayer.beginShape();
          for (const pw of drawPts) {
            fieldLayer.vertex(pw.x * SCALE, pw.y * SCALE);
          }
          fieldLayer.endShape();
        }
      }

      // composite
      p.clear();
      p.image(fieldLayer, 0, 0);

      // draw rod
      rod.draw(p);

      // draw right-hand rule indicator
      const indicatorX = 60;
      const indicatorY = 60;
      p.push();
      p.translate(indicatorX, indicatorY);
      p.noFill();
      p.stroke(180);
      p.strokeWeight(2);
      p.circle(0, 0, 48);
      // arrow showing circulation (use rod.angle to orient)
      p.push();
      p.rotate(-rod.angle);
      p.stroke(255, 200, 0);
      p.strokeWeight(2);
      p.noFill();
      p.arc(0, 0, 40, 40, -Math.PI / 3, Math.PI / 3);
      // arrow head
      p.translate(20, -6);
      p.rotate(Math.PI / 6);
      p.fill(255, 200, 0);
      p.noStroke();
      p.triangle(0, 0, -6, 4, 6, 4);
      p.pop();
      // thumb (dipole moment) direction
      p.stroke(200);
      p.strokeWeight(3);
      p.line(-30, 0, 30, 0);
      p.strokeWeight(1);
      p.pop();

      // (test particle removed) focused on rod & field lines only

      // UI ground strip
      p.fill(80, 150, 80);
      p.noStroke();
      p.rect(0, p.height - 50, p.width, 50);

      // Update SimInfo: report rod-tip so s(x,y) updates with rotation
      const tip = p.createVector(rod.pos.x + (rod.length / 2) * Math.cos(rod.angle), rod.pos.y - (rod.length / 2) * Math.sin(rod.angle));
      updateSimInfo(p, { pos: tip, vel: p.createVector(0, 0) }, { moment: rod.moment, angle: (rod.angle * 180) / Math.PI }, SimInfoMapper);
    };

    p.mousePressed = () => {
      const d = p.dist(p.mouseX, p.mouseY, rod.pos.x * SCALE, rod.pos.y * SCALE);
      if (d < 40) {
        const isShift = (p.keyIsDown && p.keyIsDown(p.SHIFT)) || (p.mouseEvent && p.mouseEvent.shiftKey);
        if (isShift) {
          rod.isTranslating = true;
          const mxM = toMeters(p.mouseX);
          const myM = toMeters(p.mouseY);
          rod.dragOffset = p.createVector(rod.pos.x - mxM, rod.pos.y - myM);
        } else {
          rod.isDragging = true;
        }
      }
    };

    p.mouseDragged = () => {
      if (!rod) return;
      // translation
      if (rod.isTranslating) {
        const mxM = toMeters(p.mouseX);
        const myM = toMeters(p.mouseY);
        rod.pos.set(mxM + (rod.dragOffset?.x || 0), myM + (rod.dragOffset?.y || 0));
        // invalidate cached fieldlines so they recompute while dragging
        if (fieldLayer) fieldLayer._cachedKey = null;
        // update sidebar inputs for position
        try {
          setInputs((prev) => ({ ...prev, rodX: Number(rod.pos.x.toFixed(2)), rodY: Number(rod.pos.y.toFixed(2)) }));
        } catch (e) {}
        return;
      }

      if (!rod.isDragging) return;
      const mxM = toMeters(p.mouseX);
      const myM = toMeters(p.mouseY);
      const dx = mxM - rod.pos.x;
      const dy = rod.pos.y - myM; // upward positive
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      setInputs((prev) => ({ ...prev, angle: Number(ang.toFixed(2)) }));
    };

    p.mouseReleased = () => {
      if (rod) {
        rod.isDragging = false;
        if (rod.isTranslating) {
          rod.isTranslating = false;
          // ensure final sidebar position saved
          try {
            setInputs((prev) => ({ ...prev, rodX: Number(rod.pos.x.toFixed(2)), rodY: Number(rod.pos.y.toFixed(2)) }));
          } catch (e) {}
        }
      }
      if (particleRef.current) particleRef.current.stopDragging();
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      fieldLayer = p.createGraphics(w, h);
      fieldLayer.clear();
      createScene();
    };
  }, [inputsRef, updateSimInfo, setInputs]);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);
        resetInputs(true);
        timeRef.current = 0;
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        timeRef.current = 0;
        setResetVersion((v) => v + 1);
      }}
      theory={theory}
      dynamicInputs={
        <DynamicInputs config={INPUT_FIELDS} values={inputs} onChange={handleInputChange} />
      }
    >
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} cooldown={50} />} />
    </SimulationLayout>
  );
}
