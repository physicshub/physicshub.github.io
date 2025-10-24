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
  const { simData, updateSimInfo } = useSimInfo({customRefs: { maxHeightRef, fallStartTimeRef }});

  // Use a ref to hold the physics state (position, velocity) of the ball.
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

    let trailLayer = null;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h); // layer dedicato alla palla
      trailLayer.clear();

      // Initialize ball state here
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
      const d = p.dist(toPixels(pos.x), toPixels(pos.y), p.mouseX, p.mouseY); // measure distance between ball and mouse 
      // if you click on the ball, enter drag mode
      if (d <= toPixels(inputsRef.current.size) / 2) {
        dragState.active = true;
      }
    };

    p.mouseDragged = () => {
      if (!dragState.active) return;
      // update position directly with the mouse
      ballState.current.pos.x = pixelToWorld(p.mouseX);
      ballState.current.pos.y = pixelToWorld(p.mouseY);
      // reset velocity
      ballState.current.vel.set(0, 0);
    };

    p.mouseReleased = () => {
      dragState.active = false;
    };

    p.draw = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      const { size, restitution, gravity, trailEnabled, ballColor, mass } = inputsRef.current;
      const { pos, vel } = ballState.current;
      const dt = computeDelta(p);
      if (!pos || !vel) return;

      // if not dragging, update physics
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

        // If touch ground, reset per-bounce metrics
        if (collided.pos.y + (size / 2) >= h / SCALE) {
          maxHeightRef.current = 0;
          fallStartTimeRef.current = p.millis();
        }

        ballState.current.pos = collided.pos;
        ballState.current.vel = collided.vel;
      }

      // Background / trail (centralized)
      drawBackground(p, getBackgroundColor(), trailEnabled, trailLayer);

      // Hover detection
      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);
      const radius = toPixels(size) / 2;
      const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radius;

      // Draw ball with hover glow (centralized)
      drawGlow(
        p,
        isHover,
        ballColor,
        () => {
          trailLayer.noStroke();
          trailLayer.fill(ballColor);
          trailLayer.circle(pixelX, pixelY, toPixels(size));
        },
        20
      );

      p.image(trailLayer, 0, 0);

      const activeForces = getActiveForces(
        FORCES,
        { pos, vel, radius: size / 2, mass },
        inputsRef.current,
        { canvasHeightMeters: h / SCALE }
      );

      for (const f of activeForces) {
        drawForceVector(p, pixelX, pixelY, f.vec, f.color);
      }

      // Centralized SimInfo update with mapper
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
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} />} />
    </SimulationLayout>
  );
}