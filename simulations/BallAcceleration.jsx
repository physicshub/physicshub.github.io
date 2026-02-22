// app/pages/simulations/BallAcceleration.jsx
"use client";

import { useState, useCallback, useRef } from "react";
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
} from "../app/(core)/data/configs/BallAcceleration.js";
import { toMeters } from "../app/(core)/constants/Utils.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
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

export default function BallAcceleration() {
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

  // Sim info
  const { simData, updateSimInfo } = useSimInfo();

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
    },
    [setInputs]
  );

  const sketch = useCallback(
    (p) => {
      let trailLayer = null;

      const setupSimulation = () => {
        const w = p.width;
        const h = p.height;

        // Initialize body at center
        const initialX = toMeters(w / 2);
        const initialY = toMeters(h / 2);

        if (!bodyRef.current) {
          bodyRef.current = new PhysicsBody(p, {
            size: inputsRef.current.size,
            color: inputsRef.current.color,
            shape: "circle",
            position: p.createVector(initialX, initialY),
          });

          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.maxLength = 200;
          bodyRef.current.trail.color = inputsRef.current.color;
        } else {
          bodyRef.current.reset({
            position: p.createVector(initialX, initialY),
          });
        }

        // Initialize force renderer
        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            showLabels: true,
            showMagnitude: true,
            colors: {
              applied: "#ef4444", // Red for acceleration
              velocity: "#3b82f6", // Blue for velocity
            },
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

        const { size, acceleration, maxspeed, color, trailEnabled } =
          inputsRef.current;

        // Sync body parameters
        bodyRef.current.updateParams({
          size,
          color,
        });
        bodyRef.current.trail.enabled = trailEnabled;
        bodyRef.current.trail.color = color;

        // Calculate acceleration toward mouse
        const target = p.createVector(toMeters(p.mouseX), toMeters(p.mouseY));
        const offset = p.constructor.Vector.sub(
          target,
          bodyRef.current.state.position
        );

        let accelerationForce = p.createVector(0, 0);
        if (offset.magSq() > 1e-8) {
          const direction = offset.copy().normalize();
          accelerationForce = direction.mult(
            acceleration * bodyRef.current.params.mass
          ); // F = ma
        }

        // Apply acceleration force
        if (accelerationForce.magSq() > 0) {
          bodyRef.current.applyForce(accelerationForce);
        }

        // Physics step
        bodyRef.current.step(dt);

        // Clamp velocity to max speed
        if (bodyRef.current.state.velocity.mag() > maxspeed) {
          bodyRef.current.state.velocity.setMag(maxspeed);
        }

        // Keep in bounds
        bodyRef.current.constrainToBounds(
          size / 2,
          toMeters(p.width) - size / 2,
          size / 2,
          toMeters(p.height) - size / 2
        );

        // Render scene
        renderScene(p, { accelerationForce });

        // Update sim info
        updateSimInfo(
          p,
          {
            position: bodyRef.current.state.position,
            velocity: bodyRef.current.state.velocity,
            acceleration,
            maxspeed,
          },
          {
            canvasHeight: p.height,
          },
          SimInfoMapper
        );
      };

      const renderScene = (p, { accelerationForce }) => {
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

        // Draw vectors
        const renderer = forceRendererRef.current;

        // Acceleration vector (red)
        if (accelerationForce.mag() > 0.01) {
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            accelerationForce.x / bodyRef.current.params.mass, // Convert back to acceleration
            accelerationForce.y / bodyRef.current.params.mass,
            "#ef4444",
            "Acceleration"
          );
        }

        // Velocity vector (blue)
        if (bodyRef.current.state.velocity.mag() > 0.01) {
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            bodyRef.current.state.velocity.x * 10, // Scale for visibility
            bodyRef.current.state.velocity.y * 10,
            "#3b82f6",
            "Velocity",
            { scale: 1 } // Override default scale
          );
        }

        // Draw target indicator (mouse position)
        p.push();
        p.noFill();
        p.stroke(255, 255, 255, 100);
        p.strokeWeight(2);
        p.circle(p.mouseX, p.mouseY, 20);
        p.line(p.mouseX - 10, p.mouseY, p.mouseX + 10, p.mouseY);
        p.line(p.mouseX, p.mouseY - 10, p.mouseX, p.mouseY + 10);
        p.pop();
      };

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
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      }}
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
