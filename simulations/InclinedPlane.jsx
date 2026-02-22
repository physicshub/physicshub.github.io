// app/pages/simulations/InclinedPlane.jsx
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
} from "../app/(core)/data/configs/InclinedPlane.js";
import chapters from "../app/(core)/data/chapters.js";
import { toPixels } from "../app/(core)/constants/Utils.js";

// --- Physics Classes ---
import { InclinedPlaneBody } from "../app/(core)/physics/InclinedPlaneBody.js";
import { InclinedPlaneForces } from "../app/(core)/physics/ForceCalculator.js";
import { ForceRenderer } from "../app/(core)/physics/ForceRenderer.js";
import { InclinedPlaneDragController } from "../app/(core)/physics/DragController.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function InclinedPlane() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodyRef = useRef(null);
  const planeRef = useRef({ startX: 0, startY: 0, length: 0 });
  const forceCalculatorRef = useRef(null);
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);

  // Sim info
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
      let trailLayer = null;

      const setupSimulation = () => {
        const w = p.width;
        const h = p.height;
        const planeLength = Math.min(w, h) * 0.6;

        // Setup plane
        planeRef.current = {
          startX: w * 0.25,
          startY: h * 0.75,
          length: planeLength / 100, // Convert to meters
        };

        // Initialize body
        const initialPos = inputsRef.current.size / 2 + 1;
        if (!bodyRef.current) {
          bodyRef.current = new InclinedPlaneBody(
            p,
            {
              mass: inputsRef.current.mass,
              size: inputsRef.current.size,
              color: inputsRef.current.blockColor,
              shape: "square",
              restitution: 0.3,
            },
            initialPos
          );

          // Enable trail
          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.maxLength = 150;
          bodyRef.current.trail.color = inputsRef.current.blockColor;
        } else {
          bodyRef.current.reset(initialPos);
        }

        // Initialize force calculator
        if (!forceCalculatorRef.current) {
          forceCalculatorRef.current = new InclinedPlaneForces({
            gravity: inputsRef.current.gravity,
            angle: inputsRef.current.angle,
            frictionStatic: inputsRef.current.frictionStatic,
            frictionKinetic: inputsRef.current.frictionKinetic,
            appliedForce: inputsRef.current.appliedForce,
            appliedAngle: inputsRef.current.appliedAngle,
          });
        }

        // Initialize force renderer
        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 5,
            showLabels: true,
            showMagnitude: true,
            arrowSize: 12,
            strokeWeight: 3,
          });
        }

        // Initialize drag controller
        if (!dragControllerRef.current) {
          dragControllerRef.current = new InclinedPlaneDragController(
            planeRef,
            () => (inputsRef.current.angle * Math.PI) / 180,
            { snapBack: false }
          );
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
        const angleRad = (inputsRef.current.angle * Math.PI) / 180;

        // Sync body parameters
        bodyRef.current.updateParams({
          mass: inputsRef.current.mass,
          size: inputsRef.current.size,
          color: inputsRef.current.blockColor,
        });
        bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
        bodyRef.current.trail.color = inputsRef.current.blockColor;

        // Update force calculator params
        forceCalculatorRef.current.updateParams({
          gravity: inputsRef.current.gravity,
          angle: inputsRef.current.angle,
          frictionStatic: inputsRef.current.frictionStatic,
          frictionKinetic: inputsRef.current.frictionKinetic,
          appliedForce: inputsRef.current.appliedForce,
          appliedAngle: inputsRef.current.appliedAngle,
        });

        // Calculate forces
        const forces = forceCalculatorRef.current.calculate(
          bodyRef.current,
          bodyRef.current.isMoving
        );

        // Physics step (if not dragging)
        if (!dragControllerRef.current.isDragging() && dt > 0) {
          bodyRef.current.stepAlongPlane(dt, forces.netParallel, angleRad);

          // Update trail
          if (bodyRef.current.trail.enabled) {
            bodyRef.current.updateTrailOnPlane();
          }
        }

        // Render scene
        renderScene(p, angleRad, forces);

        // Update sim info
        updateSimInfo(
          p,
          {
            posAlongPlane: bodyRef.current.planeState.posAlongPlane,
            vel: bodyRef.current.planeState.velAlongPlane,
            acc: bodyRef.current.planeState.accAlongPlane,
            mass: bodyRef.current.params.mass,
            kineticEnergy: bodyRef.current.getKineticEnergy(),
            potentialEnergy: bodyRef.current.getPotentialEnergy(
              inputsRef.current.gravity,
              angleRad
            ),
          },
          {
            gravity: inputsRef.current.gravity,
            angle: inputsRef.current.angle,
            forces,
          },
          SimInfoMapper
        );
      };

      const renderScene = (p, angleRad, forces) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        // Trail layer
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.fill(r, g, b, 40);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        // Draw plane on trail layer
        drawPlane(trailLayer, angleRad);

        // Main canvas
        p.clear();
        p.image(trailLayer, 0, 0);

        // Draw block
        const screenPos = bodyRef.current.drawOnPlane(
          p,
          { x: planeRef.current.startX, y: planeRef.current.startY },
          angleRad,
          { alignToPlane: true, hoverEffect: true }
        );

        // Draw forces
        if (inputsRef.current.showForces) {
          forceRendererRef.current.drawInclinedPlaneForces(
            p,
            screenPos.x,
            screenPos.y,
            forces,
            angleRad,
            {
              showComponents: inputsRef.current.showComponents,
            }
          );
        }
      };

      const drawPlane = (layer, angleRad) => {
        const plane = planeRef.current;
        const planeEndX =
          plane.startX + toPixels(plane.length) * Math.cos(angleRad);
        const planeEndY =
          plane.startY - toPixels(plane.length) * Math.sin(angleRad);

        layer.push();

        // Plane line
        layer.stroke(inputsRef.current.planeColor);
        layer.strokeWeight(5);
        layer.line(plane.startX, plane.startY, planeEndX, planeEndY);

        // Ground line
        layer.stroke(100, 100, 120);
        layer.strokeWeight(2);
        layer.line(0, plane.startY, layer.width, plane.startY);

        // Angle arc
        const arcRadius = 50;
        layer.noFill();
        layer.stroke(255, 200);
        layer.strokeWeight(2);
        layer.arc(
          plane.startX,
          plane.startY,
          arcRadius * 2,
          arcRadius * 2,
          -angleRad,
          0
        );

        // Angle label with background
        layer.push();
        layer.noStroke();
        layer.fill(0, 0, 0, 150);
        const labelText = `${inputsRef.current.angle.toFixed(1)}°`;
        layer.textSize(14);
        const tw = layer.textWidth(labelText);
        layer.rect(
          plane.startX + arcRadius + 15,
          plane.startY - 25,
          tw + 10,
          20,
          3
        );

        layer.fill(255, 220, 100);
        layer.textAlign(layer.CENTER, layer.CENTER);
        layer.text(
          labelText,
          plane.startX + arcRadius + 20 + tw / 2,
          plane.startY - 15
        );
        layer.pop();

        layer.pop();
      };

      // Mouse event handlers
      p.mousePressed = () => {
        if (!bodyRef.current) return;
        dragControllerRef.current.handlePress(p, bodyRef.current);
      };

      p.mouseDragged = () => {
        dragControllerRef.current.handleDrag(p);
      };

      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease();
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
    [inputsRef, updateSimInfo]
  );

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);

        // Reset body
        if (bodyRef.current) {
          const initialPos = inputsRef.current.size / 2 + 1;
          bodyRef.current.reset(initialPos);
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
    </SimulationLayout>
  );
}
