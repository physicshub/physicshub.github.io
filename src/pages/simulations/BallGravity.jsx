// src/pages/simulations/BallGravity.jsx
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

// --- Core Physics & Constants ---
import { SCALE } from "../../constants/Config.js";
import { toPixels, integrate, collideBoundary } from "../../constants/Utils.js";
import { computeDelta, resetTime, isPaused, setPause } from "../../constants/Time.js";
import { INITIAL_INPUTS, INPUT_FIELDS, FORCES, SimInfoMapper } from "../../data/configs/BallGravity.js";
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
import { drawBackground, drawForceVector } from "../../utils/drawUtils.js";

export function BallGravity() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Animazione vento (overlay)
  const [isBlowing, setIsBlowing] = useState(false);
  const isBlowingRef = useRef(isBlowing);
  useEffect(() => {
    isBlowingRef.current = isBlowing;
  }, [isBlowing]);

  // Centralized sim info system
  const maxHeightRef = useRef(0);
  const { simData, updateSimInfo } = useSimInfo({ customRefs: { maxHeightRef } });

  // Physics state
  const ballState = useRef({ pos: null, vel: null });

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  const sketch = useCallback((p) => {
    let trailLayer = null;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      trailLayer = p.createGraphics(w, h);
      trailLayer.clear();

      // init ball
      ballState.current.pos = p.createVector(w / 2 / SCALE, h / 4 / SCALE);
      ballState.current.vel = p.createVector(0, 0);

      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const { size, mass, gravity, wind, frictionMu, restitution, color, trailEnabled } = inputsRef.current;
      const { pos, vel } = ballState.current;
      const dt = computeDelta(p);
      if (!pos || !vel) return;

      if (dt > 0) {
        // Accelerazioni/forze risultanti
        let acc = p.createVector(0, gravity);

        // Vento quando premi il mouse (dipende dalla massa)
        if (p.mouseIsPressed && wind > 0) {
          acc.add(p.createVector(wind / mass, 0));
        }

        // Attrito (solo se a contatto col suolo e con velocità)
        const bottomM = p.height / SCALE;
        const onGround = pos.y + size / 2 >= bottomM - 1e-9;
        if (onGround && vel.mag() > 0) {
          const fric = vel.copy().mult(-1).setMag(frictionMu * gravity);
          acc.add(fric);
        }

        // Integrazione
        const newState = integrate(pos, vel, acc, dt);

        // Collisione/rimbalzo
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

      // Background / trail
      drawBackground(p, getBackgroundColor(), trailEnabled, trailLayer);

      // Disegno palla
      const pixelX = toPixels(pos.x);
      const pixelY = toPixels(pos.y);
      trailLayer.noStroke();
      trailLayer.fill(color);
      trailLayer.circle(pixelX, pixelY, toPixels(size));
      p.image(trailLayer, 0, 0);

      // Vettori forze (come in BouncingBall): FORCES -> [{ vec, color }]
      const activeForces = FORCES
        .map(fDef => {
          const vec = fDef.computeFn(
            { pos, vel, radius: size / 2, mass, isBlowing: isBlowingRef.current },
            inputsRef.current,
            { canvasHeightMeters: p.height / SCALE }
          );
          return vec ? { vec, color: fDef.color } : null; // qui aggiungi il colore
        })
        .filter(Boolean);


      for (const f of activeForces) {
        drawForceVector(p, pixelX, pixelY, f.vec, f.color);
      }

      // Aggiornamento info
      updateSimInfo(p, { pos, vel, mass }, { gravity, canvasHeight: p.height }, SimInfoMapper);
    };

    // Toggle animazione vento (overlay) in sync con press/release
    p.mousePressed = () => setIsBlowing(true);
    p.mouseReleased = () => setIsBlowing(false);

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
      dynamicInputs={<DynamicInputs config={INPUT_FIELDS} values={inputs} onChange={handleInputChange} />}
    >
      {/* Canvas + SimInfo */}
      <P5Wrapper sketch={sketch} key={resetVersion} simInfos={<SimInfoPanel data={simData} />} />

      {/* Overlay vento (come prima), sovrapposto al canvas */}
      <div className={`wind-overlay ${isBlowing ? "blowing" : ""}`} aria-hidden="true">
        <svg className="wind-icon" viewBox="0 0 64 32" width="80" height="40">
          <path d="M2 10 Q18 5, 30 10 T62 10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M8 20 Q22 15, 34 20 T62 20" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="58" cy="10" r="2" fill="white" />
          <circle cx="56" cy="20" r="2" fill="white" />
        </svg>
      </div>
    </SimulationLayout>
  );
}
