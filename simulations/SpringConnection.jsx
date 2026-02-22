// app/pages/simulations/SpringConnection.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { resetTime, computeDelta } from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/SpringConnection.js";
import chapters from "../app/(core)/data/chapters.js";
import {
  toMeters,
  setCanvasHeight,
  screenYToPhysicsY,
} from "../app/(core)/constants/Utils.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import Spring from "../app/(core)/physics/Spring";
import ForceCalculator from "../app/(core)/physics/ForceCalculator.js";
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

export default function SpringConnection() {
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

        // Physics coordinates (Y-up, origin at bottom-left)
        const canvasWidthMeters = toMeters(canvasWidth);
        const canvasHeightMeters = toMeters(canvasHeight);

        // Anchor position: centered horizontally, near top of canvas
        // In physics coords: high Y value = near top
        const anchorPhysics = p.createVector(
          canvasWidthMeters / 2,
          canvasHeightMeters - 0.2 // 1 meter from top
        );

        // Initial body position: below anchor by rest length + extra
        const initialPhysics = p.createVector(
          anchorPhysics.x,
          anchorPhysics.y - springRestLength - 1.0 // Below anchor
        );

        // Initialize body
        bodyRef.current = new PhysicsBody(p, {
          mass: bobMass,
          size: bobSize,
          color: bobColor,
          shape: "circle",
        });
        bodyRef.current.state.position.set(initialPhysics);

        // Initialize spring
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
          scale: 5,
          showLabels: true,
          colors: { spring: springColor, weight: "#ef4444" },
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
          gravity,
          springK,
          springRestLength,
          bobMass,
          bobDamping,
          minLength,
          maxLength,
        } = inputsRef.current;

        // Update canvas height for coordinate conversions
        setCanvasHeight(p.height);

        // 1. Sync parameters
        springRef.current.k = springK;
        springRef.current.restLength = springRestLength;
        bodyRef.current.updateParams({
          mass: bobMass,
          size: inputsRef.current.bobSize,
          color: inputsRef.current.bobColor,
        });

        // 2. Calculate forces (if not dragging)
        if (!dragControllerRef.current.isDragging()) {
          // Gravity force (Y-up: negative Y is downward)
          const gravityForce = ForceCalculator.gravity(bobMass, gravity);
          bodyRef.current.applyForce(
            p.createVector(gravityForce.x, gravityForce.y)
          );

          // Spring force
          springRef.current.connect(bodyRef.current);

          // Damping force: F = -c * v
          const v = bodyRef.current.state.velocity;
          if (v.mag() > 0.001) {
            const dampingForce = v.copy().mult(-bobDamping);
            bodyRef.current.applyForce(dampingForce);
          }

          // Physics integration
          bodyRef.current.step(dt);

          // Length constraints
          springRef.current.constrainLength(
            bodyRef.current,
            minLength,
            maxLength
          );
        }

        // 3. Rendering
        renderScene(p);

        // 4. Update info panel
        const canvasHeightMeters = toMeters(p.height);
        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
            mass: bobMass,
            k: springK,
            restLength: springRestLength,
            potentialEnergyElastic: springRef.current.getElasticPotentialEnergy(
              bodyRef.current
            ),
            springForceMag: springRef.current.getSpringForce(bodyRef.current),
            currentLengthM: springRef.current.getLength(bodyRef.current),
            anchorHeight: springRef.current.anchor.y,
          },
          {
            gravity,
            canvasHeight: p.height,
            canvasHeightMeters,
          },
          SimInfoMapper
        );
      };

      const renderScene = (p) => {
        p.background(getBackgroundColor());

        // Draw spring and anchor
        springRef.current.showLine(bodyRef.current, true);
        springRef.current.show();

        // Draw body
        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        // Draw force vectors
        const renderer = forceRendererRef.current;

        // Gravity vector (points down in Y-up = negative Y)
        const gravityForce = ForceCalculator.gravity(
          bodyRef.current.params.mass,
          inputsRef.current.gravity
        );
        renderer.drawVector(
          p,
          screenPos.x,
          screenPos.y,
          gravityForce.x,
          gravityForce.y,
          "#ef4444",
          "Weight"
        );

        // Spring force vector
        const Vector = p.constructor.Vector;
        const springForceDir = Vector.sub(
          springRef.current.anchor,
          bodyRef.current.state.position
        );
        const springForceMag = springRef.current.getSpringForce(
          bodyRef.current
        );
        springForceDir.normalize().mult(springForceMag);

        renderer.drawVector(
          p,
          screenPos.x,
          screenPos.y,
          springForceDir.x,
          springForceDir.y,
          inputsRef.current.springColor,
          "Spring"
        );
      };

      p.mousePressed = () => {
        // Convert mouse position to physics coordinates for drag detection
        const mousePhysics = p.createVector(
          toMeters(p.mouseX),
          screenYToPhysicsY(p.mouseY)
        );
        dragControllerRef.current.handlePress(p, bodyRef.current, mousePhysics);
      };

      p.mouseDragged = () => {
        if (dragControllerRef.current.isDragging()) {
          const mousePhysics = p.createVector(
            toMeters(p.mouseX),
            screenYToPhysicsY(p.mouseY)
          );
          bodyRef.current.state.position.set(mousePhysics);
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
      <P5Wrapper
        sketch={sketch}
        key={resetVersion}
        simInfos={<SimInfoPanel data={simData} />}
      />
    </SimulationLayout>
  );
}
