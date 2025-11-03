// src/pages/simulations/BouncingBall.jsx
import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Physics & Constants ---
import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate, collideBoundary } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, FORCES, SimInfoMapper } from "../../data/configs/BouncingBall.js";
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
import { drawBackground, drawGlow, drawForceVector, getActiveForces } from "../../utils/drawUtils.js";

export function BouncingBall() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const maxHeightRef = useRef(0);
  const fallStartTimeRef = useRef(0);
  const { simData, updateSimInfo } = useSimInfo({ customRefs: { maxHeightRef, fallStartTimeRef } });

  // Physics state of the ball
  const ballState = useRef({ pos: null, vel: null });

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  const sketch = useCallback((p) => {
    // -- DRAG STATE & UTILITY FUNCTIONS --
    const dragState = { active: false };
    const pixelToWorld = (n) => n / SCALE;

    let vectorLayer;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

      // Layer for vectors (always cleared each frame)
      vectorLayer = p.createGraphics(w, h);

      // Initialize ball state
      ballState.current.pos = p.createVector((w / 2) / SCALE, (h / 4) / SCALE);
      ballState.current.vel = p.createVector(0, 0);

      // Reset per-bounce metrics
      maxHeightRef.current = 0;
      fallStartTimeRef.current = p.millis();

      p.background(getBackgroundColor());
    };

    p.mousePressed = () => {
      const { pos } = ballState.current;
      if (!pos) return;
      const d = p.dist(toPixels(pos.x), toPixels(pos.y), p.mouseX, p.mouseY);
      if (d <= toPixels(inputsRef.current.size) / 2) {
        dragState.active = true;
      }
    };

    p.mouseDragged = () => {
      if (!dragState.active) return;
      ballState.current.pos.x = pixelToWorld(p.mouseX);
      ballState.current.pos.y = pixelToWorld(p.mouseY);
      ballState.current.vel.set(0, 0);
    };

    p.mouseReleased = () => {
      dragState.active = false;
    };

    p.draw = () => {
      const { clientHeight: h } = p._userNode;
      const { size, restitution, gravity, trailEnabled, ballColor, mass } = inputsRef.current;
      const { pos, vel } = ballState.current;
      const dt = computeDelta(p);
      if (!pos || !vel) return;

      // Physics update
      if (!dragState.active && dt > 0) {
        const acc = p.createVector(0, gravity);
        const newState = integrate(pos, vel, acc, dt);
        const collided = collideBoundary(
          newState.pos,
          newState.vel,
          { w: p.width / SCALE, h: p.height / SCALE },
          size / 2,
          restitution
        );

        if (collided.pos.y + (size / 2) >= h / SCALE) {
          maxHeightRef.current = 0;
          fallStartTimeRef.current = p.millis();
        }

        ballState.current.pos = collided.pos;
        ballState.current.vel = collided.vel;
      }

      // 1. Background / trail
      drawBackground(p, getBackgroundColor(), trailEnabled, 60);

      // 2. Ball with hover glow
      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);
      const radius = toPixels(size) / 2;
      const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radius;

      drawGlow(
        p,
        isHover,
        ballColor,
        () => {
          p.noStroke();
          p.fill(ballColor);
          p.circle(pixelX, pixelY, toPixels(size));
        },
        20
      );

      // 3. Vectors on a separate cleared layer
      vectorLayer.clear();
      const activeForces = getActiveForces(
        FORCES,
        { pos, vel, radius: size / 2, mass },
        inputsRef.current,
        { canvasHeightMeters: h / SCALE }
      );

      for (const f of activeForces) {
        drawForceVector(vectorLayer, pixelX, pixelY, f.vec, f.color);
      }
      p.image(vectorLayer, 0, 0);

      // 4. Update sim info
      updateSimInfo(
        p,
        { pos, vel, mass },
        { gravity, canvasHeight: h },
        SimInfoMapper
      );
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      vectorLayer = p.createGraphics(w, h);
    };
  }, [inputsRef, maxHeightRef, fallStartTimeRef]);

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
      <P5Wrapper
        sketch={sketch}
        key={resetVersion}
        simInfos={<SimInfoPanel data={simData} />}
      />
    </SimulationLayout>
  );
}
