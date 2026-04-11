// simulations/ThreeBodyProblem.jsx
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
  PRESETS,
} from "../app/(core)/data/configs/ThreeBodyProblem.js";
import chapters from "../app/(core)/data/chapters.js";
import { toMeters, toPixels, physicsToScreen } from "../app/(core)/constants/Utils.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function ThreeBodyProblem() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodiesRef = useRef([]);
  const trailLayersRef = useRef([]);

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

  /**
   * Calculate gravitational force between two bodies
   * F = G * m1 * m2 / r^2
   * Returns force vector acting on body1 due to body2
   */
  const calculateGravity = (body1, body2, G) => {
    const Vector = body1.p.constructor.Vector;
    
    // Direction from body1 to body2
    const direction = Vector.sub(body2.state.position, body1.state.position);
    const distance = direction.mag();
    
    // Prevent division by zero and extreme forces at very close distances
    const minDistance = 0.1;
    const safeDistance = Math.max(distance, minDistance);
    
    // Gravitational force magnitude
    const forceMagnitude = (G * body1.params.mass * body2.params.mass) / (safeDistance * safeDistance);
    
    // Normalize direction and multiply by force magnitude
    direction.normalize();
    direction.mult(forceMagnitude);
    
    return direction;
  };

  const sketch = useCallback(
    (p) => {
      let initialized = false;

      const getInitialPositions = () => {
        const preset = PRESETS[inputsRef.current.preset] || PRESETS.figure8;
        const centerX = toMeters(p.width / 2);
        const centerY = toMeters(p.height / 2);
        
        return [
          {
            x: centerX + (preset.positions[0]?.x || -1),
            y: centerY + (preset.positions[0]?.y || 0),
          },
          {
            x: centerX + (preset.positions[1]?.x || 1),
            y: centerY + (preset.positions[1]?.y || 0),
          },
          {
            x: centerX + (preset.positions[2]?.x || 0),
            y: centerY + (preset.positions[2]?.y || 0.866),
          },
        ];
      };

      const getInitialVelocities = () => {
        const preset = PRESETS[inputsRef.current.preset] || PRESETS.figure8;
        return [
          preset.velocities[0] || { x: 0, y: 0.5 },
          preset.velocities[1] || { x: 0, y: -0.5 },
          preset.velocities[2] || { x: 0, y: 0 },
        ];
      };

      const setupSimulation = () => {
        const w = p.width;
        const h = p.height;

        // Get initial conditions based on preset
        const initialPositions = getInitialPositions();
        const initialVelocities = getInitialVelocities();
        const { mass1, mass2, mass3, size, color1, color2, color3, trailEnabled, trailLength } = inputsRef.current;

        // Create trail layers for each body
        trailLayersRef.current = [
          p.createGraphics(w, h),
          p.createGraphics(w, h),
          p.createGraphics(w, h),
        ];
        trailLayersRef.current.forEach(layer => {
          layer.pixelDensity(1);
          layer.clear();
        });

        // Initialize three bodies
        const bodyParams = [
          { mass: mass1, color: color1 },
          { mass: mass2, color: color2 },
          { mass: mass3, color: color3 },
        ];

        bodiesRef.current = bodyParams.map((params, i) => {
          const body = new PhysicsBody(p, {
            mass: params.mass,
            size: size,
            color: params.color,
            shape: "circle",
            restitution: 1,
            position: p.createVector(initialPositions[i].x, initialPositions[i].y),
            velocity: p.createVector(initialVelocities[i].x, initialVelocities[i].y),
          });

          // Enable trail
          body.trail.enabled = trailEnabled;
          body.trail.maxLength = trailLength;
          body.trail.color = params.color;

          return body;
        });

        initialized = true;
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        setupSimulation();
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        if (!initialized || bodiesRef.current.length !== 3) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

        const { 
          mass1, mass2, mass3, size, G, 
          color1, color2, color3,
          trailEnabled, trailLength 
        } = inputsRef.current;

        // Update body parameters
        const bodyParams = [
          { mass: mass1, color: color1 },
          { mass: mass2, color: color2 },
          { mass: mass3, color: color3 },
        ];

        bodiesRef.current.forEach((body, i) => {
          body.updateParams({
            mass: bodyParams[i].mass,
            size: size,
            color: bodyParams[i].color,
          });
          body.trail.enabled = trailEnabled;
          body.trail.maxLength = trailLength;
          body.trail.color = bodyParams[i].color;
        });

        // Calculate gravitational forces for each body
        const bodies = bodiesRef.current;
        
        // Force on body 0 from body 1 and 2
        const forceOnBody0 = p.constructor.Vector.add(
          calculateGravity(bodies[0], bodies[1], G),
          calculateGravity(bodies[0], bodies[2], G)
        );
        bodies[0].applyForce(forceOnBody0);

        // Force on body 1 from body 0 and 2
        const forceOnBody1 = p.constructor.Vector.add(
          calculateGravity(bodies[1], bodies[0], G),
          calculateGravity(bodies[1], bodies[2], G)
        );
        bodies[1].applyForce(forceOnBody1);

        // Force on body 2 from body 0 and 1
        const forceOnBody2 = p.constructor.Vector.add(
          calculateGravity(bodies[2], bodies[0], G),
          calculateGravity(bodies[2], bodies[1], G)
        );
        bodies[2].applyForce(forceOnBody2);

        // Update all bodies
        bodiesRef.current.forEach((body) => {
          body.step(dt);
        });

        // Constrain to canvas bounds
        const bounds = {
          minX: size / 2,
          maxX: toMeters(p.width) - size / 2,
          minY: size / 2,
          maxY: toMeters(p.height) - size / 2,
        };

        // Render scene
        renderScene(p);

        // Update sim info
        updateSimInfo(
          p,
          {
            body1: bodies[0],
            body2: bodies[1],
            body3: bodies[2],
          },
          { G },
          SimInfoMapper
        );
      };

      const renderScene = (p) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        // Clear trail layers
        trailLayersRef.current.forEach((layer, i) => {
          if (!inputsRef.current.trailEnabled) {
            layer.background(r, g, b);
          } else {
            layer.fill(r, g, b, 40);
            layer.noStroke();
            layer.rect(0, 0, layer.width, layer.height);
          }
        });

        // Draw trails to trail layers
        bodiesRef.current.forEach((body, i) => {
          if (body.trail.enabled && body.trail.points.length > 1) {
            trailLayersRef.current[i].push();
            trailLayersRef.current[i].noFill();
            
            for (let j = 1; j < body.trail.points.length; j++) {
              const alpha = (j / body.trail.points.length) * 200;
              const prev = body.trail.points[j - 1];
              const curr = body.trail.points[j];
              
              const prevScreen = physicsToScreen(prev, p);
              const currScreen = physicsToScreen(curr, p);
              
              trailLayersRef.current[i].stroke(body.trail.color);
              trailLayersRef.current[i].strokeWeight(2);
              trailLayersRef.current[i].stroke(200, alpha);
              trailLayersRef.current[i].line(
                prevScreen.x, prevScreen.y, 
                currScreen.x, currScreen.y
              );
            }
            trailLayersRef.current[i].pop();
          }
        });

        // Main canvas
        p.clear();
        
        // Draw trail layers
        trailLayersRef.current.forEach((layer) => {
          p.image(layer, 0, 0);
        });

        // Draw center reference point
        const centerScreen = physicsToScreen(
          p.createVector(toMeters(p.width / 2), toMeters(p.height / 2)),
          p
        );
        p.push();
        p.noFill();
        p.stroke(100, 100, 120, 100);
        p.strokeWeight(1);
        p.circle(centerScreen.x, centerScreen.y, 20);
        p.line(centerScreen.x - 15, centerScreen.y, centerScreen.x + 15, centerScreen.y);
        p.line(centerScreen.x, centerScreen.y - 15, centerScreen.x, centerScreen.y + 15);
        p.pop();

        // Draw bodies
        bodiesRef.current.forEach((body, i) => {
          body.checkHover(p, body.toScreenPosition());
          body.draw(p, { hoverEffect: true });
          
          // Draw mass label
          const screenPos = body.toScreenPosition();
          p.push();
          p.fill(255);
          p.noStroke();
          p.textSize(12);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text(`m${i + 1}`, screenPos.x, screenPos.y - toPixels(body.params.size) / 2 - 5);
          p.pop();
        });
      };

      // Window resize
      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        // Recreate trail layers
        trailLayersRef.current = [
          p.createGraphics(w, h),
          p.createGraphics(w, h),
          p.createGraphics(w, h),
        ];
        trailLayersRef.current.forEach(layer => {
          layer.pixelDensity(1);
          layer.clear();
        });

        // Reset simulation with new center
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

        setTimeout(() => {
          if (wasPaused) setPause(true);
          setResetVersion((v) => v + 1);
        }, 0);
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
