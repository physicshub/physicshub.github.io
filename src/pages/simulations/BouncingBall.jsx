// src/pages/simulations/BouncingBall.jsx
import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Physics & Constants ---
import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate, collideBoundary } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS } from "../../data/configs/BouncingBall.js";
import chapters from "../../data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import useSimulationState from "../../hooks/useSimulationState.js";
import getBackgroundColor from "../../utils/getBackgroundColor.js";

export function BouncingBall() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Use a ref to hold the physics state (position, velocity) of the ball.
  const ballState = useRef({
    pos: null,
    vel: null,
  });

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

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

      // Initialize ball state here
      ballState.current.pos = p.createVector(w/2, h/2);
      ballState.current.vel = p.createVector(0, 0);

      p.background(getBackgroundColor());
    };

    p.mousePressed = () => {
      const { pos } = ballState.current;
      if (!pos) return;
      const d = p.dist(
        toPixels(pos.x),
        toPixels(pos.y),
        p.mouseX,
        p.mouseY
      );
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
        ballState.current.pos = collided.pos;
        ballState.current.vel = collided.vel;
      }

      // draw background
      const bg = getBackgroundColor();
      if (trailEnabled) {
        p.noStroke();
        p.fill(bg[0], bg[1], bg[2], 60);
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(bg);
      }

      // Hover detection
      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);
      const radius = toPixels(size) / 2;
      const isHover = p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radius;

      // Cambia cursore e applica alone quando hover
      if (isHover) {
        p.cursor("grab");
      } else {
        p.cursor("default");
      }

      // Disegna palla con glow se hover
      if (isHover) {
        const ctx = p.drawingContext;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = ballColor;
      }

      p.noStroke();
      p.fill(ballColor);
      p.circle(pixelX, pixelY, toPixels(size));

      if (isHover) {
        p.drawingContext.restore();
      }
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
    };
  }, [inputsRef]);

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
      dynamicInputs={(
        <DynamicInputs
          config={INPUT_FIELDS}
          values={inputs}
          onChange={handleInputChange}
        />
      )}
    >
      <P5Wrapper sketch={sketch} key={resetVersion} />
    </SimulationLayout>
  );
}