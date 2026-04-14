"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { resetTime, computeDelta } from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/HorizontalSpring.js";
import chapters from "../app/(core)/data/chapters.js";
import {
  toMeters,
  toPixels,
  setCanvasHeight,
  screenYToPhysicsY,
} from "../app/(core)/constants/Utils.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import Spring from "../app/(core)/physics/Spring";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";
import DragController from "../app/(core)/physics/DragController.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState";
import useSimInfo from "../app/(core)/hooks/useSimInfo";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor";

export default function HorizontalSpring() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodyRef = useRef(null);
  const springRef = useRef(null);
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);

  const { simData, updateSimInfo } = useSimInfo();

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
      const setupSimulation = () => {
        const canvasWidth = p.width;
        const canvasHeight = p.height;

        // Update canvas height for coordinate conversions
        setCanvasHeight(canvasHeight);

        const {
          springRestLength,
          springK,
          bobMass,
          bobSize,
          bobColor,
          springColor,
          anchorColor,
        } = inputsRef.current;

        const canvasWidthMeters = toMeters(canvasWidth);
        const canvasHeightMeters = toMeters(canvasHeight);

        // Anchor position: left wall, vertically centered
        // In physics coords (Y-up, origin bottom-left):
        //   X = 0.2 m from left wall
        //   Y = canvasHeightMeters / 2 (vertical center)
        const anchorPhysics = p.createVector(
          0.2, // near left wall
          canvasHeightMeters / 2
        );

        // Initial body position: to the right of anchor by rest length
        const initialPhysics = p.createVector(
          anchorPhysics.x + springRestLength,
          anchorPhysics.y // same Y — horizontal axis
        );

        // Initialize body
        bodyRef.current = new PhysicsBody(p, {
          mass: bobMass,
          size: bobSize,
          color: bobColor,
          shape: "circle",
        });
        bodyRef.current.state.position.set(initialPhysics);
        // Horizontal only — zero out vertical velocity always
        bodyRef.current.state.velocity.set(0, 0);

        // Initialize spring anchored at the left wall
        springRef.current = new Spring(
          p,
          anchorPhysics,
          springRestLength,
          springK,
          {
            color: springColor,
            anchorColor: anchorColor,
          }
        );

        forceRendererRef.current = new ForceRenderer({
          showLabels: true,
          colors: { spring: springColor },
        });

        dragControllerRef.current = new DragController({ snapBack: false });
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        setupSimulation();
      };

      p.draw = () => {
        if (!bodyRef.current || !springRef.current) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

        const {
          springK,
          springRestLength,
          bobMass,
          bobDamping,
          minLength,
          maxLength,
        } = inputsRef.current;

        // Update canvas height for coordinate conversions
        setCanvasHeight(p.height);

        // 1. Sync live parameters
        springRef.current.k = springK;
        springRef.current.restLength = springRestLength;
        bodyRef.current.updateParams({
          mass: bobMass,
          size: inputsRef.current.bobSize,
          color: inputsRef.current.bobColor,
        });

        // 2. Physics update (only when not dragging)
        if (!dragControllerRef.current.isDragging()) {
          const anchorX = springRef.current.anchor.x;
          const bodyX = bodyRef.current.state.position.x;

          // Current spring length (horizontal distance only — body is on X axis)
          const currentLength = bodyX - anchorX;

          // Clamp to min/max length limits
          const clampedLength = Math.max(
            minLength,
            Math.min(maxLength, currentLength)
          );
          if (clampedLength !== currentLength) {
            // Enforce hard length constraint by repositioning body on X
            bodyRef.current.state.position.x = anchorX + clampedLength;
            bodyRef.current.state.velocity.x = 0;
          }

          // Hooke's Law: F = -k * (currentLength - restLength)
          // Positive displacement (body to the right of rest) → force pulls left (negative X)
          // Negative displacement (body compressed left)      → force pushes right (positive X)
          const displacement = clampedLength - springRestLength;
          const springForceX = -springK * displacement;
          bodyRef.current.applyForce(p.createVector(springForceX, 0));

          // Damping: F = -c * vx  (horizontal only)
          const vx = bodyRef.current.state.velocity.x;
          if (Math.abs(vx) > 0.001) {
            bodyRef.current.applyForce(p.createVector(-bobDamping * vx, 0));
          }

          // Physics integration (Euler step via built-in step())
          bodyRef.current.step(dt);

          // ── HARD HORIZONTAL CONSTRAINT ──
          // Zero out any Y drift that PhysicsBody.step() may have introduced
          bodyRef.current.state.position.y = springRef.current.anchor.y;
          bodyRef.current.state.velocity.y = 0;
        }

        // 3. Render
        renderScene(p);

        // 4. Update info panel
        const canvasHeightMeters = toMeters(p.height);

        // Horizontal-only spring measurements
        const anchorX = springRef.current.anchor.x;
        const currentLengthM = bodyRef.current.state.position.x - anchorX;
        const displacement = currentLengthM - springRestLength;
        const springForceMag = -springK * displacement; // Hooke's Law (signed)
        const potentialEnergyElastic =
          0.5 * springK * displacement * displacement;

        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
            mass: bobMass,
            k: springK,
            restLength: springRestLength,
            potentialEnergyElastic,
            springForceMag,
            currentLengthM,
            anchorX,
          },
          { canvasHeight: p.height, canvasHeightMeters },
          SimInfoMapper
        );
      };

      const renderScene = (p) => {
        p.background(getBackgroundColor());

        // Draw left wall
        drawWall(p);

        // Draw spring line and anchor dot
        springRef.current.showLine(bodyRef.current, true);
        springRef.current.show();

        // Draw body with hover effect
        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        // Draw spring force vector (horizontal only)
        const renderer = forceRendererRef.current;

        const anchorX = springRef.current.anchor.x;
        const currentLength = bodyRef.current.state.position.x - anchorX;
        const displacement = currentLength - inputsRef.current.springRestLength;
        const springForceMagnitude = -inputsRef.current.springK * displacement; // signed: negative = leftward

        renderer.drawVector(
          p,
          screenPos.x,
          screenPos.y,
          springForceMagnitude, // X component (positive = rightward on screen)
          0, // Y component — horizontal spring, no vertical force
          inputsRef.current.springColor,
          "Spring"
        );
      };

      /**
       * Draws a simple left-wall indicator so the anchor attachment is obvious.
       */
      const drawWall = (p) => {
        const anchorScreenX = toPixels(springRef.current.anchor.x);
        const wallThickness = 14;
        const wallHeight = p.height;

        // Wall fill
        p.noStroke();
        p.fill(100, 100, 110, 180);
        p.rect(0, 0, anchorScreenX, wallHeight);

        // Hatching lines for a mechanical "wall" look
        p.stroke(140, 140, 150, 120);
        p.strokeWeight(1);
        const spacing = 18;
        for (let y = -wallHeight; y < wallHeight * 2; y += spacing) {
          p.line(0, y, anchorScreenX, y + anchorScreenX);
        }

        // Bright edge line
        p.stroke(200, 200, 210, 220);
        p.strokeWeight(2);
        p.line(anchorScreenX, 0, anchorScreenX, wallHeight);
        p.noStroke();
      };

      // ── Mouse interaction ──────────────────────────────────────────────────

      p.mousePressed = () => {
        const mousePhysics = p.createVector(
          toMeters(p.mouseX),
          screenYToPhysicsY(p.mouseY)
        );
        dragControllerRef.current.handlePress(p, bodyRef.current, mousePhysics);
      };

      p.mouseDragged = () => {
        if (dragControllerRef.current.isDragging()) {
          // Constrain drag to horizontal axis — keep Y fixed to anchor Y
          const clampedX = toMeters(p.mouseX);
          bodyRef.current.state.position.set(
            clampedX,
            springRef.current.anchor.y // lock Y
          );
          bodyRef.current.state.velocity.set(0, 0);
        }
      };

      p.mouseReleased = () => dragControllerRef.current.handleRelease();

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
        setupSimulation();
      };
    },
    [inputsRef, updateSimInfo]
  );

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        resetTime();
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loaded) => {
        setInputs(loaded);
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
      <div className="flex-1 relative">
        <P5Wrapper sketch={sketch} key={resetVersion} />

        {/* RIGHT PANEL inside canvas */}
        <div className="absolute top-4 right-4 w-[300px]">
          <SimInfoPanel data={simData} />
        </div>
      </div>
      {/* <P5Wrapper
        sketch={sketch}
        key={resetVersion}
        simInfos={<SimInfoPanel data={simData} />}
      /> */}
    </SimulationLayout>
  );
}
