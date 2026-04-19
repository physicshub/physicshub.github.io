"use client";

import { useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation.js";

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
} from "../app/(core)/data/configs/ThreeBody.js";

import { toMeters } from "../app/(core)/constants/Utils.js";
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

const SUBSTEPS = 40;

const F8_POS = [
  [-0.97000436, 0.24308753],
  [0.0, 0.0],
  [0.97000436, -0.24308753],
];
const F8_VEL = [
  [0.46620368, 0.43236573],
  [-0.93240737, -0.86473146],
  [0.46620368, 0.43236573],
];
const F8_HALF_WIDTH = 0.97;

export default function ThreeBody() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);
  const bodiesRef = useRef([]);
  const { simData, updateSimInfo } = useSimInfo();

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));

      if (name === "configuration") {
        setResetVersion((v) => v + 1);
      }
    },
    [setInputs]
  );

  const sketch = useCallback(
    (p) => {
      const applyGravity = (a, b, G) => {
        const dx = b.state.position.x - a.state.position.x;
        const dy = b.state.position.y - a.state.position.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1e-4) return;
        const dist = Math.sqrt(distSq);
        const forceMag = (G * a.params.mass * b.params.mass) / distSq;
        const fx = (forceMag * dx) / dist;
        const fy = (forceMag * dy) / dist;
        a.applyForce(p.createVector(fx, fy));
        b.applyForce(p.createVector(-fx, -fy));
      };

      const makeBody = (x, y, vx, vy, color, mass, size, trailEnabled) => {
        const body = new PhysicsBody(p, {
          size,
          color,
          shape: "circle",
          position: p.createVector(x, y),
        });
        body.params.mass = mass;
        body.state.velocity = p.createVector(vx, vy);
        body.trail.enabled = trailEnabled;
        body.trail.maxLength = 800;
        return body;
      };

      const setupSimulation = () => {
        const { size, trailEnabled, chaos, mass, G, configuration } =
          inputsRef.current;

        const cx = toMeters(p.width / 2);
        const cy = toMeters(p.height / 2);
        const colors = ["#ef4444", "#3b82f6", "#22c55e"];

        let positions, velocities;

        if (configuration === "figure8") {
          const targetR = toMeters(Math.min(p.width, p.height) * 0.35);
          const spatialScale = targetR / F8_HALF_WIDTH;
          const vScale = Math.sqrt((G * mass) / spatialScale);

          positions = F8_POS.map(([x, y]) => [
            cx + x * spatialScale,
            cy + y * spatialScale,
          ]);
          velocities = F8_VEL.map(([vx, vy]) => [vx * vScale, vy * vScale]);
        } else if (configuration === "lagrange") {
          const R = toMeters(Math.min(p.width, p.height) * 0.3);
          const omega = Math.sqrt((G * mass) / (Math.sqrt(3) * R * R * R));

          positions = [0, 1, 2].map((i) => {
            const θ = (2 * Math.PI * i) / 3 + Math.PI / 2; // start with one body at top
            return [cx + R * Math.cos(θ), cy + R * Math.sin(θ)];
          });

          velocities = positions.map(([x, y]) => [
            -omega * (y - cy),
            omega * (x - cx),
          ]);
        } else {
          const R = toMeters(Math.min(p.width, p.height) * 0.3);
          const vKick = Math.sqrt((G * mass) / R) * 0.08; // tiny symmetry-breaking kick

          positions = [0, 1, 2].map((i) => {
            const θ = (2 * Math.PI * i) / 3 + Math.PI / 2;
            return [cx + R * Math.cos(θ), cy + R * Math.sin(θ)];
          });

          velocities = positions.map(() => [
            (Math.random() - 0.5) * vKick,
            (Math.random() - 0.5) * vKick,
          ]);
        }

        const pJitter = chaos * toMeters(Math.min(p.width, p.height) * 0.04);
        const vJitter = chaos * Math.sqrt(G * mass) * 0.2;

        let rawBodies = positions.map(([x, y], i) => {
          let [vx, vy] = velocities[i];
          return {
            x: x + (Math.random() - 0.5) * pJitter,
            y: y + (Math.random() - 0.5) * pJitter,
            vx: vx + (Math.random() - 0.5) * vJitter,
            vy: vy + (Math.random() - 0.5) * vJitter,
            color: colors[i],
          };
        });

        const comVx =
          rawBodies.reduce((s, b) => s + b.vx, 0) / rawBodies.length;
        const comVy =
          rawBodies.reduce((s, b) => s + b.vy, 0) / rawBodies.length;
        rawBodies = rawBodies.map((b) => ({
          ...b,
          vx: b.vx - comVx,
          vy: b.vy - comVy,
        }));

        bodiesRef.current = rawBodies.map(({ x, y, vx, vy, color }) =>
          makeBody(x, y, vx, vy, color, mass, size, trailEnabled)
        );
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        setupSimulation();
      };

      p.draw = () => {
        const dt = Math.min(computeDelta(p), 1 / 30);
        if (dt <= 0) return;

        const { G } = inputsRef.current;
        const bodies = bodiesRef.current;
        const subDt = dt / SUBSTEPS;

        for (let s = 0; s < SUBSTEPS; s++) {
          for (let i = 0; i < bodies.length; i++)
            for (let j = i + 1; j < bodies.length; j++)
              applyGravity(bodies[i], bodies[j], G);
          for (const b of bodies) b.step(subDt);
        }

        p.background(getBackgroundColor());
        for (const b of bodies) b.draw(p);

        updateSimInfo(p, {}, {}, SimInfoMapper);
      };

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
