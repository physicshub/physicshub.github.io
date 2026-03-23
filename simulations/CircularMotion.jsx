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
} from "../app/(core)/data/configs/CircularMotion.js";

import { toMeters } from "../app/(core)/constants/Utils.js";

// --- Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";

// --- UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

export default function CircularMotion() {
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
  const centerRef = useRef(null);

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

        const center = p.createVector(toMeters(w / 2), toMeters(h / 2));
        centerRef.current = center;

        const { radius, speed } = inputsRef.current;

        const startPos = p.createVector(center.x + radius, center.y);

        if (!bodyRef.current) {
          bodyRef.current = new PhysicsBody(p, {
            size: inputsRef.current.size,
            color: inputsRef.current.color,
            shape: "circle",
            position: startPos,
          });
        } else {
          bodyRef.current.reset({ position: startPos });
        }

        // Set initial tangential velocity
        bodyRef.current.state.velocity = p.createVector(0, speed);

        // Trail
        bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
        bodyRef.current.trail.maxLength = 200;
        bodyRef.current.trail.color = inputsRef.current.color;

        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            showLabels: true,
            showMagnitude: true,
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

        const { radius, speed, mass, size, color, trailEnabled } =
          inputsRef.current;

        // Sync body params
        bodyRef.current.updateParams({ size, color });
        bodyRef.current.trail.enabled = trailEnabled;
        bodyRef.current.trail.color = color;

        const pos = bodyRef.current.state.position;
        const center = centerRef.current;

        // --- CENTRIPETAL FORCE ---
        const toCenter = p.constructor.Vector.sub(center, pos);

        let centripetalForce = p.createVector(0, 0);

        if (toCenter.magSq() > 1e-8) {
          const direction = toCenter.copy().normalize();

          const accelMag = (speed * speed) / radius; // a = v² / r

          centripetalForce = direction.mult(accelMag * mass); // F = ma
        }

        // Apply force
        if (centripetalForce.magSq() > 0) {
          bodyRef.current.applyForce(centripetalForce);
        }

        // Enforce constant speed
        if (bodyRef.current.state.velocity.mag() > 0) {
          bodyRef.current.state.velocity.setMag(speed);
        }

        // Step physics
        bodyRef.current.step(dt);

        // Render
        renderScene(p, { centripetalForce });

        // Update info
        updateSimInfo(
          p,
          {
            position: bodyRef.current.state.position,
            velocity: bodyRef.current.state.velocity,
            radius,
            speed,
          },
          {},
          SimInfoMapper
        );
      };

      const renderScene = (p, { centripetalForce }) => {
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

        p.clear();
        p.image(trailLayer, 0, 0);

        // Draw circular path
        p.push();
        p.noFill();
        p.stroke(120);
        p.circle(p.width / 2, p.height / 2, inputsRef.current.radius * 2);
        p.pop();

        // Draw body
        const screenPos = bodyRef.current.draw(p);

        const renderer = forceRendererRef.current;

        // Centripetal (red)
        if (centripetalForce.mag() > 0.01) {
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            centripetalForce.x / bodyRef.current.params.mass,
            -(centripetalForce.y / bodyRef.current.params.mass),
            "#ef4444",
            "Centripetal"
          );
        }

        // Velocity (blue)
        if (bodyRef.current.state.velocity.mag() > 0.01) {
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            bodyRef.current.state.velocity.x * 10,
            -(bodyRef.current.state.velocity.y * 10),
            "#3b82f6",
            "Velocity"
          );
        }
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
