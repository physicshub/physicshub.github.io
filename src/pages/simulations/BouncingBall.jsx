// src/pages/simulations/BouncingBall.jsx
import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Physics & Constants ---
import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate, collideBoundary, toMeters, invertYAxis } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS } from "../../data/configs/BouncingBall.js";
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
import { drawBackground, drawGlow } from "../../utils/DrawUtils.js";

export function BouncingBall() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const { simData, updateSimInfo, maxHeightRef, fallStartTimeRef } = useSimInfo();

  // Use a ref to hold the physics state (position, velocity) of the ball.
  const ballState = useRef({ pos: null, vel: null });

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  // Mapper specific for bouncing ball 
  // Computes velocity, acceleration, position, per-bounce maxHeight and fallTime
  const bouncingBallMapper = (state, context, refs) => {
    const { pos, vel } = state;
    const { gravity, canvasHeight } = context;
    const { maxHeightRef } = refs;

    const pixelX = toPixels(pos.x);
    const pixelY = toPixels(pos.y);

    const speedMs = toMeters(vel.mag());
    const posXM = toMeters(pixelX);
    const posYM = invertYAxis(canvasHeight, toMeters(pixelY));

    // Current height in meters (from ground)
    const currentHeightM = toMeters(canvasHeight - pixelY);

    // Update maxHeight for this bounce
    if (currentHeightM > maxHeightRef.current) {
      maxHeightRef.current = currentHeightM;
    }

    // Compute fallTime from maxHeight of this bounce (ideal free-fall time)
    let fallTime = 0;
    if (gravity > 0) {
      fallTime = Math.sqrt((2 * maxHeightRef.current) / gravity);
    }

    // Work done by gravity: W = m * g * h
    const work = inputsRef.current.mass * gravity * currentHeightM;

    return {
      velocity: `${speedMs.toFixed(2)} m/s`,
      acceleration: `${gravity.toFixed(2)} m/s²`,
      position: `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
      fallTime: `${fallTime.toFixed(2)} s`,
      maxHeight: `${maxHeightRef.current.toFixed(2)} m`,
      work: `${work.toFixed(2)} J`,
    };
  };

  const sketch = useCallback((p) => {
    // -- DRAG STATE & UTILITY FUNCTIONS --
    const dragState = { active: false };
    const pixelToWorld = (n) => n / SCALE;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

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
      const { size, restitution, gravity, trailEnabled, ballColor } = inputsRef.current;
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
      drawBackground(p, getBackgroundColor(), trailEnabled);

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
          p.noStroke();
          p.fill(ballColor);
          p.circle(pixelX, pixelY, toPixels(size));
        },
        20
      );

      // Centralized SimInfo update with mapper
      updateSimInfo(
        p,
        { pos, vel },
        { gravity, canvasHeight: h },
        bouncingBallMapper
      );
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      p.background(getBackgroundColor());
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