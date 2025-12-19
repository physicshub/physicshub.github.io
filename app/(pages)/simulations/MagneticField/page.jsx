// app/(pages)/simulations/MagneticField/page.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

import MagneticParticle from "../../../(core)/physics/MagneticField.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../../../(core)/data/configs/MagneticField.js";

import chapters from "../../../(core)/data/chapters.js";
import { SCALE } from "../../../(core)/constants/Config.js";

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
    let trailLayer = null;
    let originX = 0;
    let originY = 0;

    const createParticle = () => {
      const { clientHeight: h } = p._userNode;
      originX = 0;
      originY = (h - 50) / SCALE;

      particleRef.current = new MagneticParticle(p, originX, originY, inputsRef.current.mass);
      particleRef.current.charge = inputsRef.current.charge;
      particleRef.current.radius = inputsRef.current.size / 2;
      particleRef.current.color = inputsRef.current.particleColor;
    };

    const launchParticle = () => {
      const particle = particleRef.current;
      if (!particle) return;

      const velocity = typeof inputsRef.current.initialVelocity === "number"
        ? inputsRef.current.initialVelocity
        : INITIAL_INPUTS.initialVelocity;
      const launchAngle = typeof inputsRef.current.angle === "number"
        ? inputsRef.current.angle
        : INITIAL_INPUTS.angle;

      timeRef.current = 0;

      particle.launch(velocity, launchAngle);
      setPause(false);
    };

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();

      createParticle();
      particleRef.current.stop();
      setPause(true);
      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const particle = particleRef.current;
      if (!particle || !trailLayer) return;

      const dt = computeDelta(p);

      if (dt && !particle.isDragging) {
        particle.mass = inputsRef.current.mass;
        particle.charge = inputsRef.current.charge;
        particle.radius = inputsRef.current.size / 2;
        particle.color = inputsRef.current.particleColor;

        // Apply magnetic field
        const Bz = inputsRef.current.B;
        particle.applyMagneticField(Bz);

        particle.update(dt);

        timeRef.current += dt;
      }

      // Trail
      const bg = getBackgroundColor();
      const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
      if (!inputsRef.current.trailEnabled) {
        trailLayer.background(r, g, b);
      } else {
        trailLayer.noStroke();
        trailLayer.fill(r, g, b, 60);
        trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
      }

      particle.show(trailLayer);

      // Composite
      p.clear();
      p.image(trailLayer, 0, 0);

      // Ground strip for visual reference
      p.fill(80, 150, 80);
      p.noStroke();
      p.rect(0, p.height - 50, p.width, 50);

      // Glow
      const partPos = particle.state.pos;
      const partX = partPos.x * SCALE;
      const partY = partPos.y * SCALE;
      const partRadius = particle.radius * SCALE;

      const isHover = p.dist(partX, partY, p.mouseX, p.mouseY) <= partRadius;
      drawGlow(p, isHover, particle.color, () => {
        p.noStroke();
        p.fill(particle.color);
        p.circle(partX, partY, partRadius * 2);
      }, 20, p);

      // Update SimInfo
      updateSimInfo(
        p,
        {
          pos: particle.state.pos,
          vel: particle.state.vel,
          mass: particle.mass,
        },
        {
          B: inputsRef.current.B,
          mass: inputsRef.current.mass,
          charge: inputsRef.current.charge,
        },
        SimInfoMapper
      );
    };

    p.mousePressed = () => {
      const particle = particleRef.current;
      if (particle?.clicked(p.mouseX, p.mouseY)) {
        setPause(true);
      }
    };

    p.mouseDragged = () => {
      const particle = particleRef.current;
      if (!particle || !particle.isDragging) return;

      particle.drag(p.mouseX, p.mouseY);

      const launchVec = particle.getLaunchVector(originX, originY);
      const velocity = launchVec.mag();
      const rawAngle = p.degrees(-launchVec.heading());
      const angle = rawAngle;

      inputsRef.current.initialVelocity = velocity;
      inputsRef.current.angle = angle;

      const roundedVelocity = Number(velocity.toFixed(2));
      const roundedAngle = Number(angle.toFixed(2));

      setInputs((prev) => {
        if (
          Math.abs((prev.initialVelocity ?? 0) - roundedVelocity) < 0.01 &&
          Math.abs((prev.angle ?? 0) - roundedAngle) < 0.01
        ) {
          return prev;
        }
        return {
          ...prev,
          initialVelocity: roundedVelocity,
          angle: roundedAngle,
        };
      });
    };

    p.mouseReleased = () => {
      const particle = particleRef.current;
      if (!particle || !particle.isDragging) return;
      particle.stopDragging();
      launchParticle();
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();
      createParticle();
      particleRef.current.stop();
      setPause(true);
      timeRef.current = 0;
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
