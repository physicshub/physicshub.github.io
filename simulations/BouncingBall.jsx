// app/pages/simulations/BouncingBall.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, collideBoundary } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/BouncingBall.js";
import chapters from "../app/(core)/data/chapters.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import ForceCalculator from "../app/(core)/physics/ForceCalculator.js";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";
import DragController from "../app/(core)/physics/DragController.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function BouncingBall() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodyRef = useRef(null);
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);
  const maxHeightRef = useRef(0);
  const fallStartTimeRef = useRef(0);

  // Sim info
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { maxHeightRef, fallStartTimeRef },
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
      let trailLayer = null;

      const setupSimulation = () => {
        const w = p.width;
        const h = p.height;

        const ballRadius = inputsRef.current.size / 2;
        const topMarginMeters = ballRadius + 0.3;
        const initialX = toMeters(w / 2);
        const initialY = toMeters(h) - topMarginMeters;

        if (!bodyRef.current) {
          bodyRef.current = new PhysicsBody(p, {
            mass: inputsRef.current.mass,
            size: inputsRef.current.size,
            color: inputsRef.current.ballColor,
            shape: "circle",
            restitution: inputsRef.current.restitution,
            position: p.createVector(initialX, initialY),
          });

          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.maxLength = 200;
          bodyRef.current.trail.color = inputsRef.current.ballColor;
        } else {
          bodyRef.current.reset({
            position: p.createVector(initialX, initialY),
          });
          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.color = inputsRef.current.ballColor;
        }

        maxHeightRef.current = 0;
        fallStartTimeRef.current = p.millis();

        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 10,
            showLabels: true,
            showMagnitude: true,
          });
        }

        if (!dragControllerRef.current) {
          dragControllerRef.current = new DragController({
            snapBack: false,
            smoothing: 0.3,
          });
        }
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupSimulation();

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayer.background(r, g, b);
        p.background(r, g, b);
      };

      p.draw = () => {
        if (!bodyRef.current || !trailLayer) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

        const { size, gravity, trailEnabled, ballColor, mass, restitution } =
          inputsRef.current;

        // Sync body parameters
        bodyRef.current.updateParams({
          mass,
          size,
          color: ballColor,
          restitution,
        });
        bodyRef.current.trail.enabled = trailEnabled;
        bodyRef.current.trail.color = ballColor;

        // Apply gravity
        const gravityForce = ForceCalculator.gravity(mass, gravity);
        bodyRef.current.applyForce(
          p.createVector(gravityForce.x, gravityForce.y)
        );

        // Physics step + collision (if not dragging)
        if (!dragControllerRef.current.isDragging()) {
          // FIX: Save acceleration BEFORE step() resets it to 0.
          // collideBoundary needs the real gravity value to correctly
          // conserve energy during floor penetration sub-steps.
          // Without this, gravity is always 0, work is 0, and the ball
          // loses energy on every bounce even with restitution = 1.
          const accBeforeStep = bodyRef.current.state.acceleration.copy();

          bodyRef.current.step(dt);

          const bounds = {
            w: toMeters(p.width),
            h: toMeters(p.height),
          };
          const { pos, vel } = collideBoundary(
            bodyRef.current.state.position,
            bodyRef.current.state.velocity,
            bounds,
            size / 2,
            restitution,
            accBeforeStep
          );
          bodyRef.current.state.position = pos;
          bodyRef.current.state.velocity = vel;
        }

        // Height above floor = ball center y - radius
        const currentHeight = bodyRef.current.state.position.y - size / 2;
        if (currentHeight > maxHeightRef.current) {
          maxHeightRef.current = currentHeight;
        }

        // Render scene
        renderScene(p, { gravityForce });

        const floorY = size / 2;
        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
            mass,
            kineticEnergy: bodyRef.current.getKineticEnergy(),
            potentialEnergy: bodyRef.current.getPotentialEnergy(
              gravity,
              floorY
            ),
          },
          {
            gravity,
            canvasHeight: p.height,
            maxHeight: maxHeightRef.current,
          },
          SimInfoMapper
        );
      };

      const renderScene = (p) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        if (inputsRef.current.trailEnabled) {
          trailLayer.fill(r, g, b, 60);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
          p.clear();
          p.image(trailLayer, 0, 0);
        } else {
          trailLayer.background(r, g, b);
          p.background(r, g, b);
        }

        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        const renderer = forceRendererRef.current;
        renderer.drawWeight(
          p,
          screenPos.x,
          screenPos.y,
          bodyRef.current.params.mass,
          inputsRef.current.gravity
        );
      };

      p.mousePressed = () => {
        if (!bodyRef.current) return;
        const pressed = dragControllerRef.current.handlePress(
          p,
          bodyRef.current
        );
        if (pressed) maxHeightRef.current = 0;
      };

      p.mouseDragged = () => {
        dragControllerRef.current.handleDrag(p);
      };

      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease(() => {
          fallStartTimeRef.current = p.millis();
        });
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        if (trailLayer) trailLayer.remove();
        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayer.background(r, g, b);

        if (bodyRef.current) {
          const { size } = bodyRef.current.params;
          const radius = size / 2;
          const maxX = toMeters(w) - radius;
          const maxY = toMeters(h) - radius;

          if (bodyRef.current.state.position.x > maxX)
            bodyRef.current.state.position.x = maxX;
          if (bodyRef.current.state.position.y > maxY)
            bodyRef.current.state.position.y = maxY;
          if (bodyRef.current.state.position.x < radius)
            bodyRef.current.state.position.x = radius;
          if (bodyRef.current.state.position.y < radius)
            bodyRef.current.state.position.y = radius;
        }
      };
    },
    [inputsRef, maxHeightRef, fallStartTimeRef, updateSimInfo]
  );

  useEffect(() => {
    return () => {
      if (bodyRef.current) bodyRef.current = null;
    };
  }, []);

  const handleReset = useCallback(() => {
    const wasPaused = isPaused();
    resetTime();
    maxHeightRef.current = 0;
    fallStartTimeRef.current = 0;
    setTimeout(() => {
      if (wasPaused) setPause(true);
      setResetVersion((v) => v + 1);
    }, 0);
  }, []);

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
