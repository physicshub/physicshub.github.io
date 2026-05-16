// app/pages/simulations/CollisionSimulation.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, setCanvasHeight } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  isPaused,
  resetTime,
  setPause,
} from "../app/(core)/constants/Time.js";

import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/CollisionSimulation.js";

import chapters from "../app/(core)/data/chapters.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import DragController from "../app/(core)/physics/DragController.js";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function CollisionSimulation() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );

  // State
  const [resetVersion, setResetVersion] = useState(0);

  // Sim info
  const { simData, updateSimInfo } = useSimInfo();

  // Physics & Rendering References

  // Physics bodies
  const bodiesRef = useRef([]);

  // Vector renderer instance
  const forceRendererRef = useRef(null);

  // Mouse drag controller
  const dragControllerRef = useRef(null);

  // Stores initial velocities
  // for comparison in info panel
  const initialStateRef = useRef(null);

  // Input Handling
  const handleInputChange = useCallback(
    (name, value) => {
      // Prevent invalid restitution values
      if (name === "restitution") {
        const num = Number(value);

        if (num < 0 || num > 1) return;
      }
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
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
        // Compute Initial Positions

        const minX = toMeters(p.width * 0.2);
        const maxX = toMeters(p.width * 0.8);

        const initialX1 = minX + (maxX - minX) * 0.25;
        const initialX2 = minX + (maxX - minX) * 0.75;

        const initialY1 = toMeters(p.height / 2);
        const initialY2 = toMeters(p.height / 2);

        // Create or Reset Bodies

        if (!bodiesRef.current.length) {
          bodiesRef.current = [
            new PhysicsBody(p, {
              id: "m 1",
              mass: inputsRef.current.mass1,
              size: inputsRef.current.size1,
              color: inputsRef.current.ballColor1,
              shape: "circle",
              restitution: inputsRef.current.restitution,
              position: p.createVector(initialX1, initialY1),
            }),
            new PhysicsBody(p, {
              id: "m 2",
              mass: inputsRef.current.mass2,
              size: inputsRef.current.size2,
              color: inputsRef.current.ballColor2,
              shape: "circle",
              restitution: inputsRef.current.restitution,
              position: p.createVector(initialX2, initialY2),
            }),
          ];
        } else {
          bodiesRef.current[0].reset({
            position: p.createVector(initialX1, initialY1),
          });

          bodiesRef.current[1].reset({
            position: p.createVector(initialX2, initialY2),
          });
        }

        // Initialize Velocities
        bodiesRef.current[0].state.velocity.x = Math.abs(
          inputsRef.current.velocity1
        );

        bodiesRef.current[1].state.velocity.x = -Math.abs(
          inputsRef.current.velocity2
        );

        // Configure Trail Rendering
        bodiesRef.current[0].trail.enabled = inputsRef.current.trailEnabled;

        bodiesRef.current[0].trail.maxLength = 200;

        bodiesRef.current[0].trail.color = inputsRef.current.ballColor1;
        bodiesRef.current[1].trail.enabled = inputsRef.current.trailEnabled;

        bodiesRef.current[1].trail.maxLength = 200;

        bodiesRef.current[1].trail.color = inputsRef.current.ballColor2;

        // Update Physics Parameters
        const { mass1, mass2, ballColor1, ballColor2, restitution } =
          inputsRef.current;

        // Scale objects for smaller screens
        const screenScale = p.width < 600 ? 0.7 : 1;

        bodiesRef.current[0].updateParams({
          mass: mass1,
          size: inputsRef.current.size1 * screenScale,
          color: ballColor1,
          restitution,
        });

        bodiesRef.current[1].updateParams({
          mass: mass2,
          size: inputsRef.current.size2 * screenScale,
          color: ballColor2,
          restitution,
        });

        // Initialize Vector Renderer
        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 20,
            showMagnitude: false,
            labelSize: 14,
          });
        }

        // Initialize Drag Controller
        if (!dragControllerRef.current) {
          dragControllerRef.current = new DragController({
            snapBack: false,
            smoothing: 0.3,
          });
        }
        // Store Initial Simulation State
        initialStateRef.current = {
          u1: Math.abs(inputsRef.current.velocity1),
          u2: Math.abs(inputsRef.current.velocity2),
        };

        // Update Simulation Info Panel
        updateSimInfo(
          p,
          {
            body1: bodiesRef.current[0],
            body2: bodiesRef.current[1],
            initialState: initialStateRef.current,
          },
          {},
          SimInfoMapper
        );
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
        // Early Exit Checks
        if (!bodiesRef.current.length || !trailLayer) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

        // Sync Visual Properties
        const { ballColor1, ballColor2, trailEnabled } = inputsRef.current;
        bodiesRef.current[0].params.color = ballColor1;

        bodiesRef.current[1].params.color = ballColor2;

        bodiesRef.current[0].trail.enabled = trailEnabled;
        bodiesRef.current[0].trail.color = ballColor1;

        bodiesRef.current[1].trail.enabled = trailEnabled;
        bodiesRef.current[1].trail.color = ballColor2;

        // Physics Update
        if (!dragControllerRef.current.isDragging()) {
          // Update body positions
          bodiesRef.current.forEach((body) => {
            body.step(dt);
          });

          // Ball-to-Ball Collision
          const body1 = bodiesRef.current[0];
          const body2 = bodiesRef.current[1];
          const dx = body2.state.position.x - body1.state.position.x;
          const distance = Math.abs(dx);
          const minDistance = (body1.params.size + body2.params.size) / 2;

          // Prevent repeated collision
          // response while separating
          const relativeVelocity =
            body2.state.velocity.x - body1.state.velocity.x;

          if (distance <= minDistance && relativeVelocity < 0) {
            const u1 = body1.state.velocity.x;
            const u2 = body2.state.velocity.x;

            const m1 = body1.params.mass;
            const m2 = body2.params.mass;

            const e = body1.params.restitution;

            const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);

            const v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);

            body1.state.velocity.x = v1;
            body2.state.velocity.x = v2;

            // Resolve overlap
            const overlap = minDistance - distance;

            if (overlap > 0) {
              body1.state.position.x -= overlap / 2;
              body2.state.position.x += overlap / 2;
            }
          }

          // Wall Collision
          const leftWall = p.width * 0.2;
          const rightWall = p.width * 0.8;

          const minX = toMeters(leftWall);
          const maxX = toMeters(rightWall);

          bodiesRef.current.forEach((body) => {
            // Keep motion horizontal
            body.state.position.y = toMeters(p.height / 2);
            const radius = body.params.size / 2;

            // Left wall collision
            if (body.state.position.x - radius < minX) {
              body.state.position.x = minX + radius;
              body.state.velocity.x *= -body.params.restitution;
            }

            // Right wall collision
            if (body.state.position.x + radius > maxX) {
              body.state.position.x = maxX - radius;
              body.state.velocity.x *= -body.params.restitution;
            }
          });
        }

        // Update Simulation Info

        updateSimInfo(
          p,
          {
            body1: bodiesRef.current[0],
            body2: bodiesRef.current[1],
            initialState: initialStateRef.current,
          },
          {},
          SimInfoMapper
        );

        renderScene(p);
      };

      const renderScene = (p) => {
        // Current background color
        const bg = getBackgroundColor();

        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        // Create fading trail effect
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

        // Simulation boundaries
        const leftWall = p.width * 0.2;
        const rightWall = p.width * 0.8;

        p.stroke(150);
        p.strokeWeight(5);

        p.line(leftWall, 0, leftWall, p.height);
        p.line(rightWall, 0, rightWall, p.height);

        bodiesRef.current.forEach((body) => {
          body.checkHover(p, body.toScreenPosition());

          // Draw collision body
          body.draw(p, {
            hoverEffect: true,
          });

          const pos = body.toScreenPosition();

          // Velocity vector
          if (inputsRef.current.showVectors) {
            forceRendererRef.current.drawVector(
              p,
              pos.x,
              pos.y,
              body.state.velocity.x,
              0,
              "#aaaaaa"
            );
          }

          // Body label
          p.fill(255);
          p.noStroke();

          p.textAlign(p.CENTER);

          p.textSize(p.width < 600 ? 14 : 22);

          p.textFont("Poppins");

          p.text(body.params.id, pos.x, pos.y - 36);
        });
      };

      // Update dragged body position
      p.mouseDragged = () => {
        dragControllerRef.current.handleDrag(p);
      };

      // Release dragged body
      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease();
      };

      // Keep canvas and simulation responsive
      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
        setCanvasHeight(h);

        // Recreate trail layer
        if (trailLayer) trailLayer.remove();
        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayer.background(r, g, b);

        // Reinitialize simulation if
        // bodies were not created yet
        if (!bodiesRef.current.length) {
          setupSimulation();
          return;
        }

        // Keep bodies inside canvas bounds
        bodiesRef.current.forEach((body) => {
          const { size } = body.params;
          const radius = size / 2;

          const maxX = toMeters(w) - radius;
          const maxY = toMeters(h) - radius;

          if (body.state.position.x > maxX) body.state.position.x = maxX;

          if (body.state.position.y > maxY) body.state.position.y = maxY;

          if (body.state.position.x < radius) body.state.position.x = radius;

          if (body.state.position.y < radius) body.state.position.y = radius;
        });
      };
    },
    [inputsRef, updateSimInfo]
  );

  // Cleanup physics bodies on unmount
  useEffect(() => {
    return () => {
      bodiesRef.current = [];
    };
  }, []);

  // Reset simulation state and timing
  const handleReset = useCallback(() => {
    const wasPaused = isPaused();

    resetTime();

    // Preserve paused state after reset
    if (wasPaused) setPause(true);

    // Force p5 canvas remount
    setResetVersion((v) => v + 1);
  }, []);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={handleReset}
      inputs={inputs}
      simulation={location}
      // Restore saved simulation inputs
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
