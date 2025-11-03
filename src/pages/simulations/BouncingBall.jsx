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
import { drawBallWithTrail, drawForceVector, getActiveForces } from "../../utils/drawUtils.js";

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

    let trailLayer;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

      trailLayer = p.createGraphics(w, h);
      trailLayer.pixelDensity(1);

      // Initialize ball state
      ballState.current.pos = p.createVector((w / 2) / SCALE, (h / 4) / SCALE);
      ballState.current.vel = p.createVector(0, 0);

      // Reset per-bounce metrics
      maxHeightRef.current = 0;
      fallStartTimeRef.current = p.millis();

      // Inizializza il trailLayer con background pieno
      const bg = getBackgroundColor();
      const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
      trailLayer.background(r, g, b);
    };

    p.draw = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
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

      // Coordinate palla
      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);
      const radius = toPixels(size) / 2;
      const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radius;

      // Trail + palla + glow centralizzati
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

      // Clear main canvas e composita trailLayer
      p.clear();
      p.image(trailLayer, 0, 0);

      // Vettori (ridisegnati ogni frame, niente trail)
      const activeForces = getActiveForces(
        FORCES,
        { pos, vel, radius: size / 2, mass },
        inputsRef.current,
        { canvasHeightMeters: h / SCALE }
      );

      for (const f of activeForces) {
        drawForceVector(p, pixelX, pixelY, f.vec, f.color);
      }

      // Aggiorna sim info
      updateSimInfo(
        p,
        { pos, vel, mass },
        { gravity, canvasHeight: h },
        SimInfoMapper
      );
    };


    // Mouse interaction for dragging the ball
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

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);

      // Recreate trailLayer
      trailLayer = p.createGraphics(w, h);
      trailLayer.pixelDensity(1);
      const bg = getBackgroundColor();
      const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
      trailLayer.background(r, g, b);
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
