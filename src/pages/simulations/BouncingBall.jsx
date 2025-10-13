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
    const getBackgroundColor = () => {
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      return bodyBg.match(/\d+/g).map(Number);
    };

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      
      // Initialize ball state here
      ballState.current.pos = p.createVector(1, 1);
      ballState.current.vel = p.createVector(0, 0);

      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const { size, restitution, gravity, trailEnabled, ballColor } = inputsRef.current;
      const { pos, vel } = ballState.current;
      
      const dt = computeDelta(p);
      if (dt === 0 || !pos || !vel) return;

      const acc = p.createVector(0, gravity);

      const newState = integrate(pos, vel, acc, dt);
      const collidedState = collideBoundary(
        newState.pos, newState.vel,
        { w: p.width / SCALE, h: p.height / SCALE },
        size / 2,
        restitution
      );
      
      ballState.current.pos = collidedState.pos;
      ballState.current.vel = collidedState.vel;

      const bgColor = getBackgroundColor();
      if (trailEnabled) {
        p.noStroke();
        p.fill(bgColor[0], bgColor[1], bgColor[2], 60);
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(bgColor);
      }

      p.noStroke();
      p.fill(ballColor);
      p.circle(toPixels(ballState.current.pos.x), toPixels(ballState.current.pos.y), toPixels(size));
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