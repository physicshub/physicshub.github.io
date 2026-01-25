// app/pages/simulations/BouncingBall.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../../../(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
  cleanupInstance,
} from "../../../(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  FORCES,
  SimInfoMapper,
} from "../../../(core)/data/configs/BouncingBall.js";
import chapters from "../../../(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";
import getBackgroundColor from "../../../(core)/utils/getBackgroundColor";
import {
  drawBallWithTrail,
  drawForceVector,
  getActiveForces,
} from "../../../(core)/utils/drawUtils.js";

// --- Centralized Body class ---
import Body from "../../../(core)/physics/Body";

export default function BouncingBall() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
  const maxHeightRef = useRef(0);
  const fallStartTimeRef = useRef(0);
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { maxHeightRef, fallStartTimeRef },
  });

  // Corpo fisico riusabile
  const bodyRef = useRef(null);

  // Ref per tracking ultimo update dei parametri
  const lastParamsRef = useRef({
    mass: INITIAL_INPUTS.mass,
    size: INITIAL_INPUTS.size,
    gravity: INITIAL_INPUTS.gravity,
    restitution: INITIAL_INPUTS.restitution,
  });

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
    },
    [setInputs]
  );

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback(
    (p) => {
      const dragState = { active: false, lastX: 0, lastY: 0 };
      let trailLayer;
      let instanceId;
      let isSetupComplete = false;

      p.setup = () => {
        try {
          const { clientWidth: w, clientHeight: h } = p._userNode;
          p.createCanvas(w, h);

          // Imposta instanceId per Time.js
          instanceId = p._userNode?.id || `sim-${Date.now()}`;
          p._instanceId = instanceId;

          // Crea trail layer con densità consistente
          trailLayer = p.createGraphics(w, h);
          trailLayer.pixelDensity(p.pixelDensity());

          // Inizializza corpo con tutti i parametri corretti
          const currentInputs = inputsRef.current;
          bodyRef.current = new Body(
            p,
            {
              mass: currentInputs.mass,
              size: currentInputs.size,
              gravity: currentInputs.gravity,
              restitution: currentInputs.restitution,
              color: currentInputs.ballColor,
              frictionMu: 0,
            },
            p.createVector(toMeters(w / 2), toMeters(h / 4))
          );

          // Reset refs per sim info
          maxHeightRef.current = 0;
          fallStartTimeRef.current = p.millis();

          // Inizializza background del trail
          const bg = getBackgroundColor();
          const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
          trailLayer.background(r, g, b);

          // Salva parametri iniziali
          lastParamsRef.current = {
            mass: currentInputs.mass,
            size: currentInputs.size,
            gravity: currentInputs.gravity,
            restitution: currentInputs.restitution,
          };

          isSetupComplete = true;
        } catch (error) {
          console.error("[BouncingBall] Setup error:", error);
        }
      };

      p.draw = () => {
        // ⚡ SAFETY: Aspetta che setup sia completo
        if (!isSetupComplete || !bodyRef.current || !trailLayer) {
          return;
        }

        try {
          const currentInputs = inputsRef.current;
          const { size, gravity, trailEnabled, ballColor, mass, restitution } =
            currentInputs;

          const dt = computeDelta(p);
          if (dt <= 0) return;

          // ⚡ FIX: Aggiorna TUTTI i parametri del body
          const paramsChanged =
            lastParamsRef.current.mass !== mass ||
            lastParamsRef.current.size !== size ||
            lastParamsRef.current.gravity !== gravity ||
            lastParamsRef.current.restitution !== restitution;

          if (paramsChanged) {
            bodyRef.current.params.mass = mass;
            bodyRef.current.params.size = size;
            bodyRef.current.params.gravity = gravity;
            bodyRef.current.params.restitution = restitution;
            bodyRef.current.params.color = ballColor;

            lastParamsRef.current = { mass, size, gravity, restitution };

            // Reset maxHeight quando cambiano parametri significativi
            if (
              lastParamsRef.current.gravity !== gravity ||
              lastParamsRef.current.restitution !== restitution
            ) {
              maxHeightRef.current = 0;
            }
          }

          // Step fisico (solo se non in dragging)
          if (!dragState.active) {
            bodyRef.current.step(p, dt);
          }

          const { pos, vel } = bodyRef.current.state;
          const pixelX = toPixels(pos.x);
          const pixelY = toPixels(pos.y);
          const radiusPx = toPixels(size / 2);
          const isHover =
            p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= radiusPx;

          // ⚡ FIX: Trail management con safety check
          if (trailEnabled && trailLayer) {
            drawBallWithTrail(p, trailLayer, {
              bg: getBackgroundColor(),
              trailEnabled: true,
              trailAlpha: 60,
              pixelX,
              pixelY,
              size: toPixels(size),
              isHover,
              ballColor,
            });

            p.clear();
            p.image(trailLayer, 0, 0);
          } else {
            // Trail disabilitato: background + palla
            const bg = getBackgroundColor();
            const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
            p.background(r, g, b);

            p.fill(ballColor);
            p.noStroke();
            if (isHover) {
              p.strokeWeight(3);
              p.stroke(255, 255, 255, 150);
            }
            p.circle(pixelX, pixelY, toPixels(size));
          }

          // Vettori forze
          const activeForces = getActiveForces(
            FORCES,
            { pos, vel, radius: size / 2, mass },
            currentInputs,
            { canvasHeightMeters: toMeters(p.height) }
          );

          for (const f of activeForces) {
            if (f && f.vec) {
              drawForceVector(p, pixelX, pixelY, f.vec, f.color);
            }
          }

          // Aggiorna sim info
          updateSimInfo(
            p,
            { pos, vel, mass },
            { gravity, canvasHeight: p.height },
            SimInfoMapper
          );
        } catch (error) {
          console.error("[BouncingBall] Draw error:", error);
        }
      };

      // ⚡ Dragging migliorato
      p.mousePressed = () => {
        if (!bodyRef.current) return;

        const { pos } = bodyRef.current.state;
        const d = p.dist(toPixels(pos.x), toPixels(pos.y), p.mouseX, p.mouseY);
        if (d <= toPixels(inputsRef.current.size / 2)) {
          dragState.active = true;
          dragState.lastX = p.mouseX;
          dragState.lastY = p.mouseY;
        }
      };

      p.mouseDragged = () => {
        if (!dragState.active || !bodyRef.current) return;

        const newX = toMeters(p.mouseX);
        const newY = toMeters(p.mouseY);

        bodyRef.current.state.pos.x = newX;
        bodyRef.current.state.pos.y = newY;

        // Calcola velocità dal movimento del mouse
        const dx =
          ((p.mouseX - dragState.lastX) / Math.max(p.deltaTime, 1)) * 16.67;
        const dy =
          ((p.mouseY - dragState.lastY) / Math.max(p.deltaTime, 1)) * 16.67;

        bodyRef.current.state.vel.set(toMeters(dx), toMeters(dy));

        dragState.lastX = p.mouseX;
        dragState.lastY = p.mouseY;

        maxHeightRef.current = 0;
      };

      p.mouseReleased = () => {
        dragState.active = false;
      };

      // ⚡ Window resize
      p.windowResized = () => {
        try {
          const { clientWidth: w, clientHeight: h } = p._userNode;
          p.resizeCanvas(w, h);

          if (trailLayer) {
            trailLayer.remove();
          }

          trailLayer = p.createGraphics(w, h);
          trailLayer.pixelDensity(p.pixelDensity());

          const bg = getBackgroundColor();
          const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
          trailLayer.background(r, g, b);

          // Mantieni palla nei bounds
          if (bodyRef.current) {
            const { pos } = bodyRef.current.state;
            const { size } = bodyRef.current.params;
            const radius = size / 2;

            const maxX = toMeters(w) - radius;
            const maxY = toMeters(h) - radius;

            if (pos.x > maxX) pos.x = maxX;
            if (pos.y > maxY) pos.y = maxY;
            if (pos.x < radius) pos.x = radius;
            if (pos.y < radius) pos.y = radius;
          }
        } catch (error) {
          console.error("[BouncingBall] Resize error:", error);
        }
      };

      // ⚡ Cleanup
      p.remove = () => {
        cleanupInstance(p);
        if (trailLayer) {
          trailLayer.remove();
          trailLayer = null;
        }
        isSetupComplete = false;
      };
    },
    [inputsRef, maxHeightRef, fallStartTimeRef, updateSimInfo]
  );

  // Cleanup quando componente viene smontato
  useEffect(() => {
    return () => {
      if (bodyRef.current) {
        bodyRef.current = null;
      }
    };
  }, []);

  // ⚡ Reset migliorato
  const handleReset = useCallback(() => {
    const wasPaused = isPaused();
    resetTime();

    maxHeightRef.current = 0;
    fallStartTimeRef.current = 0;

    setTimeout(() => {
      if (wasPaused) setPause(true);
      setResetVersion((v) => v + 1);
    }, 0);
  }, [maxHeightRef, fallStartTimeRef]);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={handleReset}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        maxHeightRef.current = 0;
        fallStartTimeRef.current = 0;
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
