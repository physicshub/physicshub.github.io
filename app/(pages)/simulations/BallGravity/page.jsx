// app/pages/simulations/BallGravity.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Physics & Constants ---
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../../../(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  FORCES,
  SimInfoMapper,
} from "../../../(core)/data/configs/BallGravity.js";
import chapters from "../../../(core)/data/chapters.js";
import { toMeters, toPixels } from "../../../(core)/constants/Utils.js";

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
} from "../../../(core)/utils/drawUtils.js";

// --- Centralized Body class ---
import Body from "../../../(core)/physics/Body";

export default function BallGravity() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Overlay vento
  const [isBlowing, setIsBlowing] = useState(false);
  const isBlowingRef = useRef(isBlowing);
  useEffect(() => {
    isBlowingRef.current = isBlowing;
  }, [isBlowing]);

  // Sim info
  const maxHeightRef = useRef(0);
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { maxHeightRef },
  });

  // Corpo fisico
  const bodyRef = useRef(null);

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
      let trailLayer = null;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        // Inizializza corpo (unità: metri)
        bodyRef.current = new Body(
          p,
          {
            mass: inputsRef.current.mass,
            size: inputsRef.current.size,
            gravity: inputsRef.current.gravity,
            restitution: inputsRef.current.restitution,
            frictionMu: inputsRef.current.frictionMu,
            color: inputsRef.current.color,
          },
          p.createVector(toMeters(w / 2), toMeters(h / 4))
        );

        // Altezza iniziale dal suolo
        const bottomM = toMeters(p.height);
        maxHeightRef.current =
          bottomM -
          bodyRef.current.state.pos.y -
          bodyRef.current.params.size / 2;

        p.background(getBackgroundColor());
      };

      p.draw = () => {
        const {
          mass,
          gravity,
          wind,
          color,
          trailEnabled,
          size,
          restitution,
          frictionMu,
        } = inputsRef.current;
        const dt = computeDelta(p);
        if (!bodyRef.current || dt <= 0) return;

        // Sincronizza i parametri del corpo con gli input correnti (reattività senza re-instanziare)
        bodyRef.current.params.mass = mass;
        bodyRef.current.params.gravity = gravity;
        bodyRef.current.params.color = color;
        bodyRef.current.params.restitution = Math.max(
          0,
          Math.min(1, restitution ?? bodyRef.current.params.restitution)
        );
        bodyRef.current.params.frictionMu = frictionMu;

        // Se cambia la size, aggiorna in modo coerente (mantieni il centro, evita salti visivi)
        if (size !== bodyRef.current.params.size) {
          const prevRadius = bodyRef.current.params.size / 2;
          const newRadius = size / 2;
          // Opzionale: correzione fine per evitare penetrazioni al cambio
          const bottomM = toMeters(p.height);
          const lowest = bodyRef.current.state.pos.y + newRadius;
          if (lowest > bottomM) {
            bodyRef.current.state.pos.y = bottomM - newRadius;
            bodyRef.current.state.vel.y = Math.min(
              bodyRef.current.state.vel.y,
              0
            );
          }
          bodyRef.current.params.size = size;
        }

        // Vento come accelerazione (F = m * a → a = F/m). Qui 'wind' è forza in N.
        let externalAcc = null;
        if (p.mouseIsPressed && wind > 0) {
          externalAcc = p.createVector(wind / mass, 0);
        }

        // Step fisico centralizzato (collisioni con bordi in metri)
        bodyRef.current.step(p, dt, externalAcc);

        const { pos, vel } = bodyRef.current.state;

        // Rendering in pixel
        const pixelX = toPixels(pos.x);
        const pixelY = toPixels(pos.y);
        const isHover = bodyRef.current.isHover(p);

        // Aggiorna max height (metri dal suolo)
        {
          const bottomM = toMeters(p.height);
          const hFromGround = bottomM - pos.y - bodyRef.current.params.size / 2;
          if (hFromGround > maxHeightRef.current) {
            maxHeightRef.current = hFromGround;
          }
        }

        // Trail + palla
        drawBallWithTrail(p, trailLayer, {
          bg: getBackgroundColor(),
          trailEnabled,
          trailAlpha: 60,
          pixelX,
          pixelY,
          size: toPixels(bodyRef.current.params.size),
          isHover,
          ballColor: bodyRef.current.params.color,
        });

        p.clear();
        p.image(trailLayer, 0, 0);

        // Force vectors (only visual)
        const activeForces = FORCES.map((fDef) => {
          const vec = fDef.computeFn(
            {
              pos,
              vel,
              radius: bodyRef.current.params.size / 2,
              mass,
              isBlowing: isBlowingRef.current,
            },
            inputsRef.current,
            { canvasHeightMeters: toMeters(p.height) }
          );
          return vec ? { vec, color: fDef.color } : null;
        }).filter(Boolean);

        for (const f of activeForces) {
          drawForceVector(p, pixelX, pixelY, f.vec, f.color);
        }

        // Sim info (passa p per FPS, maxHeight per quota)
        updateSimInfo(
          p,
          { pos, vel, mass },
          {
            gravity,
            canvasHeight: p.height,
            p,
            maxHeight: maxHeightRef.current,
          },
          SimInfoMapper
        );
      };

      p.mousePressed = () => setIsBlowing(true);
      p.mouseReleased = () => setIsBlowing(false);

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        // Ricrea il layer del trail
        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        // Garantisci che il corpo resti dentro i nuovi bordi
        if (bodyRef.current) {
          const bottomM = toMeters(p.height);
          const radius = bodyRef.current.params.size / 2;
          bodyRef.current.state.pos.x = Math.min(
            Math.max(bodyRef.current.state.pos.x, radius),
            toMeters(p.width) - radius
          );
          bodyRef.current.state.pos.y = Math.min(
            Math.max(bodyRef.current.state.pos.y, radius),
            toMeters(p.height) - radius
          );
        }
      };
    },
    [inputsRef]
  );

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
      simulation={location}
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

      {/* Overlay vento */}
      <div
        className={`wind-overlay ${isBlowing ? "blowing" : ""}`}
        aria-hidden="true"
      >
        <svg className="wind-icon" viewBox="0 0 64 32" width="80" height="40">
          <path
            d="M2 10 Q18 5, 30 10 T62 10"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M8 20 Q22 15, 34 20 T62 20"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="58" cy="10" r="2" fill="white" />
          <circle cx="56" cy="20" r="2" fill="white" />
        </svg>
      </div>
    </SimulationLayout>
  );
}