// app/pages/simulations/test.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters } from "../app/(core)/constants/Utils.js";
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
} from "../app/(core)/data/configs/test.js";
import chapters from "../app/(core)/data/chapters.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import ForceCalculator from "../app/(core)/physics/ForceCalculator.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function Test() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  const { simData, updateSimInfo } = useSimInfo();
  const bodiesRef = useRef([]);
  const trailLayerRef = useRef(null);

  const handleInputChange = useCallback(
    (name, value) => setInputs((prev) => ({ ...prev, [name]: value })),
    [setInputs]
  );

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const createBodies = useCallback((p, numBodies, params) => {
    const { mass, size, restitution } = params;
    const { clientWidth: w, clientHeight: h } = p._userNode;

    return Array.from({ length: numBodies }, () => {
      const randomColor = p.color(
        p.random(100, 255),
        p.random(100, 255),
        p.random(100, 255)
      );

      const randomX = toMeters(p.random(50, w - 50));
      const randomY = toMeters(p.random(50, h / 2));

      const body = new PhysicsBody(p, {
        mass: mass * p.random(0.5, 2),
        size: size * p.random(0.5, 1.5),
        color: randomColor.toString("#rrggbb"),
        shape: "circle",
        restitution,
        position: p.createVector(randomX, randomY),
      });

      // Enable trails
      body.trail.enabled = params.trailEnabled;
      body.trail.maxLength = 100;
      body.trail.color = randomColor.toString("#rrggbb");

      return body;
    });
  }, []);

  const sketch = useCallback(
    (p) => {
      let lastNumBodies = inputsRef.current.numBodies;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayerRef.current = p.createGraphics(w, h);
        trailLayerRef.current.pixelDensity(1);
        trailLayerRef.current.clear();

        bodiesRef.current = createBodies(
          p,
          inputsRef.current.numBodies,
          inputsRef.current
        );

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayerRef.current.background(r, g, b);
        p.background(r, g, b);
      };

      p.draw = () => {
        const { gravity, numBodies, trailEnabled, restitution, frictionMu } =
          inputsRef.current;
        const dt = computeDelta(p);
        if (dt <= 0) return;

        // Recreate bodies if count changed
        if (numBodies !== lastNumBodies) {
          bodiesRef.current = createBodies(p, numBodies, inputsRef.current);
          lastNumBodies = numBodies;

          // Clear trail
          const bg = getBackgroundColor();
          const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
          trailLayerRef.current.background(r, g, b);
        }

        // Render trail layer
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        if (!trailEnabled) {
          trailLayerRef.current.background(r, g, b);
        } else {
          trailLayerRef.current.fill(r, g, b, 60);
          trailLayerRef.current.noStroke();
          trailLayerRef.current.rect(
            0,
            0,
            trailLayerRef.current.width,
            trailLayerRef.current.height
          );
        }

        // Main canvas
        p.clear();
        p.image(trailLayerRef.current, 0, 0);

        // Update and draw all bodies
        bodiesRef.current.forEach((body, i) => {
          // Sync parameters
          body.updateParams({
            restitution,
          });
          body.trail.enabled = trailEnabled;

          // Apply gravity
          const gravityForce = ForceCalculator.gravity(
            body.params.mass,
            gravity
          );
          body.applyForce(p.createVector(gravityForce.x, gravityForce.y));

          // Ground friction (simplified)
          const bottomM = toMeters(p.height);
          const onGround =
            body.state.position.y + body.params.size / 2 >= bottomM - 0.01;
          if (onGround && body.state.velocity.mag() > 0.01 && frictionMu > 0) {
            const friction = ForceCalculator.friction(
              body.params.mass * gravity,
              frictionMu,
              frictionMu * 0.8,
              body.state.velocity.x,
              0
            );
            body.applyForce(p.createVector(friction, 0));
          }

          // Physics step
          body.step(dt);

          // Constrain to bounds
          const radius = body.params.size / 2;
          body.constrainToBounds(
            radius,
            toMeters(p.width) - radius,
            radius,
            toMeters(p.height) - radius
          );

          // Draw
          body.checkHover(p, body.toScreenPosition());
          body.draw(p, { hoverEffect: true });

          // Update sim info for first body
          if (i === 0) {
            updateSimInfo(
              p,
              {
                pos: body.state.position,
                vel: body.state.velocity,
                mass: body.params.mass,
                kineticEnergy: body.getKineticEnergy(),
                potentialEnergy: body.getPotentialEnergy(
                  gravity,
                  toMeters(p.height)
                ),
              },
              { p },
              SimInfoMapper
            );
          }
        });

        // Simple collision detection between bodies
        for (let i = 0; i < bodiesRef.current.length; i++) {
          for (let j = i + 1; j < bodiesRef.current.length; j++) {
            const body1 = bodiesRef.current[i];
            const body2 = bodiesRef.current[j];

            const dist = p.constructor.Vector.dist(
              body1.state.position,
              body2.state.position
            );
            const minDist = (body1.params.size + body2.params.size) / 2;

            if (dist < minDist) {
              // Collision detected - simple elastic response
              const normal = p.constructor.Vector.sub(
                body2.state.position,
                body1.state.position
              ).normalize();

              // Separate bodies
              const overlap = minDist - dist;
              body1.state.position.sub(
                p.constructor.Vector.mult(normal, overlap / 2)
              );
              body2.state.position.add(
                p.constructor.Vector.mult(normal, overlap / 2)
              );

              // Calculate relative velocity
              const relVel = p.constructor.Vector.sub(
                body2.state.velocity,
                body1.state.velocity
              );
              const velAlongNormal = relVel.dot(normal);

              // Don't resolve if velocities are separating
              if (velAlongNormal < 0) continue;

              // Calculate restitution (average of both bodies)
              const restitution =
                (body1.params.restitution + body2.params.restitution) / 2;

              // Calculate impulse
              const impulse =
                (-(1 + restitution) * velAlongNormal) /
                (1 / body1.params.mass + 1 / body2.params.mass);

              // Apply impulse
              body1.applyImpulse(p.constructor.Vector.mult(normal, -impulse));
              body2.applyImpulse(p.constructor.Vector.mult(normal, impulse));
            }
          }
        }
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        trailLayerRef.current = p.createGraphics(w, h);
        trailLayerRef.current.pixelDensity(1);

        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayerRef.current.background(r, g, b);
      };
    },
    [inputsRef, createBodies, updateSimInfo]
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
