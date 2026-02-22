// app/pages/simulations/BallGravity.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";

// --- Core Physics & Constants ---
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
} from "../app/(core)/data/configs/BallGravity.js";
import chapters from "../app/(core)/data/chapters.js";
import { toMeters } from "../app/(core)/constants/Utils.js";

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

export default function BallGravity() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Wind state
  const [isBlowing, setIsBlowing] = useState(false);

  // References
  const bodyRef = useRef(null);
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);
  const maxHeightRef = useRef(0);

  // Sim info
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { maxHeightRef },
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

        // Initialize body using PhysicsBody
        const initialX = toMeters(w / 2);
        const initialY = toMeters(h / 4);

        if (!bodyRef.current) {
          bodyRef.current = new PhysicsBody(p, {
            mass: inputsRef.current.mass,
            size: inputsRef.current.size,
            color: inputsRef.current.color,
            shape: "circle",
            restitution: inputsRef.current.restitution,
            position: p.createVector(initialX, initialY),
          });

          // Enable trail
          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.maxLength = 150;
          bodyRef.current.trail.color = inputsRef.current.color;
        } else {
          bodyRef.current.reset({
            position: p.createVector(initialX, initialY),
          });
        }

        // Reset max height
        maxHeightRef.current = 0;

        // Initialize force renderer
        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 10,
            showLabels: true,
            showMagnitude: true,
          });
        }

        // Initialize drag controller
        if (!dragControllerRef.current) {
          dragControllerRef.current = new DragController({
            snapBack: false,
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
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        if (!bodyRef.current) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

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

        // Sync body parameters
        bodyRef.current.updateParams({
          mass,
          size,
          color,
          restitution: Math.max(0, Math.min(1, restitution)),
        });
        bodyRef.current.trail.enabled = trailEnabled;
        bodyRef.current.trail.color = color;

        // Calculate forces
        const gravityForce = ForceCalculator.gravity(mass, gravity);
        bodyRef.current.applyForce(
          p.createVector(gravityForce.x, gravityForce.y)
        );

        // Wind force (when mouse pressed)
        let windForce = null;
        if (p.mouseIsPressed && wind > 0) {
          windForce = p.createVector(wind, 0);
          bodyRef.current.applyForce(windForce);
        }

        // Ground friction (simplified)
        const bottomM = toMeters(p.height);
        const onGround =
          bodyRef.current.state.position.y + size / 2 >= bottomM - 0.01;
        if (
          onGround &&
          bodyRef.current.state.velocity.mag() > 0.01 &&
          frictionMu > 0
        ) {
          const friction = ForceCalculator.friction(
            mass * gravity, // Normal force
            frictionMu,
            frictionMu * 0.8,
            bodyRef.current.state.velocity.x,
            0
          );
          bodyRef.current.applyForce(p.createVector(friction, 0));
        }

        // Physics step (if not dragging)
        if (!dragControllerRef.current.isDragging()) {
          bodyRef.current.step(dt);

          // Constrain to bounds
          bodyRef.current.constrainToBounds(
            size / 2,
            toMeters(p.width) - size / 2,
            size / 2,
            toMeters(p.height) - size / 2
          );
        }

        // Update max height
        const hFromGround =
          bottomM - bodyRef.current.state.position.y - size / 2;
        if (hFromGround > maxHeightRef.current) {
          maxHeightRef.current = hFromGround;
        }

        // Render scene
        renderScene(p, { gravityForce, windForce, onGround });

        // Update sim info
        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
            mass,
            kineticEnergy: bodyRef.current.getKineticEnergy(),
            potentialEnergy: bodyRef.current.getPotentialEnergy(
              gravity,
              toMeters(p.height)
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

      const renderScene = (p, forces) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        // Trail layer
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.fill(r, g, b, 60);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        // Main canvas
        p.clear();
        p.image(trailLayer, 0, 0);

        // Draw body
        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        // Draw forces
        const renderer = forceRendererRef.current;

        // Gravity
        renderer.drawWeight(
          p,
          screenPos.x,
          screenPos.y,
          bodyRef.current.params.mass,
          inputsRef.current.gravity
        );

        // Wind (if active)
        if (forces.windForce && inputsRef.current.wind > 0) {
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            forces.windForce.x,
            0,
            "#6366f1",
            "Wind"
          );
        }

        // Ground line
        if (forces.onGround) {
          p.stroke(100, 100, 120);
          p.strokeWeight(2);
          p.line(0, p.height - 2, p.width, p.height - 2);
        }
      };

      // Mouse events
      p.mousePressed = () => {
        if (!bodyRef.current) return;

        // Check if clicking on ball for drag
        const clicked = dragControllerRef.current.handlePress(
          p,
          bodyRef.current
        );

        // If not dragging, then wind is blowing
        if (!clicked) {
          setIsBlowing(true);
        }
      };

      p.mouseDragged = () => {
        dragControllerRef.current.handleDrag(p);
      };

      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease();
        setIsBlowing(false);
      };

      // Window resize
      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupSimulation();
      };
    },
    [inputsRef, setIsBlowing, updateSimInfo]
  );

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);

        maxHeightRef.current = 0;
        if (bodyRef.current) {
          const w = 800; // default width
          const h = 600; // default height
          bodyRef.current.reset({
            position: bodyRef.current.p.createVector(
              toMeters(w / 2),
              toMeters(h / 4)
            ),
          });
        }

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

      {/* Wind overlay */}
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
