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
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";
import { drawForceVector } from "../app/(core)/utils/drawUtils.js";

// --- Inclined Plane Body class ---
class InclinedBody {
  constructor(p, params, initialPosAlongPlane) {
    this.p = p;
    this.params = params; // { mass, size, color }
    this.state = {
      posAlongPlane: initialPosAlongPlane, // meters along the incline
      vel: 0, // velocity along the incline (m/s)
      acc: 0, // acceleration along the incline (m/s²)
    };
    this.isMoving = false;
  }

  step(dt, forces) {
    if (!forces || dt <= 0) return;

    const { netParallel } = forces;

    // Update acceleration along the plane
    this.state.acc = netParallel / this.params.mass;

    // Update velocity
    this.state.vel += this.state.acc * dt;

    // Update position
    this.state.posAlongPlane += this.state.vel * dt;

    // Check if moving
    this.isMoving = Math.abs(this.state.vel) > 0.001;
  }

  getScreenPosition(planeStart, angleRad) {
    const distPx = toPixels(this.state.posAlongPlane);
    return {
      x: planeStart.x + distPx * Math.cos(angleRad),
      y: planeStart.y - distPx * Math.sin(angleRad),
    };
  }

  isHover(p, screenPos) {
    const size = toPixels(this.params.size);
    return p.dist(screenPos.x, screenPos.y, p.mouseX, p.mouseY) <= size / 2;
  }

  constrainToPlane(planeLength) {
    const size = this.params.size;
    const minPos = size / 2;
    const maxPos = planeLength - size / 2;

    if (this.state.posAlongPlane < minPos) {
      this.state.posAlongPlane = minPos;
      this.state.vel = 0;
    } else if (this.state.posAlongPlane > maxPos) {
      this.state.posAlongPlane = maxPos;
      this.state.vel = 0;
    }
  }
}

export default function InclinedPlane() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Physics body
  const bodyRef = useRef(null);
  const planeRef = useRef({ startX: 0, startY: 0, length: 0 });
  const dragStateRef = useRef({ active: false });

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

      const setupPlane = () => {
        const w = p.width;
        const h = p.height;
        const planeLength = Math.min(w, h) * 0.6;

        planeRef.current = {
          startX: w * 0.25,
          startY: h * 0.75,
          length: toMeters(planeLength),
        };

        // Initialize body at start of plane
        const initialPos = inputsRef.current.size / 2 + 1; // 1 meter from start
        if (!bodyRef.current) {
          bodyRef.current = new InclinedBody(
            p,
            {
              mass: inputsRef.current.mass,
              size: inputsRef.current.size,
              color: inputsRef.current.blockColor,
            },
            initialPos
          );
        } else {
          bodyRef.current.state.posAlongPlane = initialPos;
          bodyRef.current.state.vel = 0;
          bodyRef.current.state.acc = 0;
        }
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupPlane();
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        if (!bodyRef.current) return;

        const dt = computeDelta(p);
        const angleRad = (inputsRef.current.angle * Math.PI) / 180;

        // Sync body parameters
        bodyRef.current.params.mass = inputsRef.current.mass;
        bodyRef.current.params.size = inputsRef.current.size;
        bodyRef.current.params.color = inputsRef.current.blockColor;

        // Calculate all forces
        const forces = calculateForces(angleRad);

        // Physics step (if not dragging)
        if (!dragStateRef.current.active && dt > 0) {
          bodyRef.current.step(dt, forces);
          bodyRef.current.constrainToPlane(planeRef.current.length);
        }

        // Render scene
        renderScene(p, angleRad, forces);

        // Update sim info
        bodyRef.current.getScreenPosition(
          { x: planeRef.current.startX, y: planeRef.current.startY },
          angleRad
        );

        updateSimInfo(
          p,
          {
            posAlongPlane: bodyRef.current.state.posAlongPlane,
            vel: bodyRef.current.state.vel,
            acc: bodyRef.current.state.acc,
            mass: bodyRef.current.params.mass,
          },
          {
            gravity: inputsRef.current.gravity,
            angle: inputsRef.current.angle,
            forces,
          },
          SimInfoMapper
        );
      };

      const calculateForces = (angleRad) => {
        const {
          mass,
          gravity,
          frictionStatic,
          frictionKinetic,
          appliedForce,
          appliedAngle,
        } = inputsRef.current;

        // Weight components
        const weightMag = mass * gravity;
        const weightParallel = weightMag * Math.sin(angleRad);
        const weightPerpendicular = weightMag * Math.cos(angleRad);

        // Applied force components (relative to plane)
        const appliedAngleRad = (appliedAngle * Math.PI) / 180;
        const totalAppliedAngle = angleRad - appliedAngleRad;
        const appliedParallel = appliedForce * Math.cos(totalAppliedAngle);
        const appliedPerpendicular = appliedForce * Math.sin(totalAppliedAngle);

        // Normal force
        const normalForce = Math.max(
          0,
          weightPerpendicular - appliedPerpendicular
        );

        // Friction force
        let frictionForce = 0;
        const netForceWithoutFriction = appliedParallel - weightParallel;

        if (!bodyRef.current.isMoving) {
          // Static friction
          const maxStaticFriction = frictionStatic * normalForce;
          if (Math.abs(netForceWithoutFriction) <= maxStaticFriction) {
            frictionForce = -netForceWithoutFriction;
          } else {
            frictionForce =
              -Math.sign(netForceWithoutFriction) *
              frictionKinetic *
              normalForce;
            bodyRef.current.isMoving = true;
          }
        } else {
          // Kinetic friction
          const vel = bodyRef.current.state.vel;
          if (Math.abs(vel) > 0.001) {
            frictionForce = -Math.sign(vel) * frictionKinetic * normalForce;
          } else {
            bodyRef.current.isMoving = false;
          }
        }

        const netParallel = -weightParallel + appliedParallel + frictionForce;

        return {
          weight: {
            mag: weightMag,
            parallel: weightParallel,
            perpendicular: weightPerpendicular,
          },
          normal: normalForce,
          friction: frictionForce,
          applied: {
            mag: appliedForce,
            parallel: appliedParallel,
            perpendicular: appliedPerpendicular,
          },
          netParallel,
        };
      };

      const renderScene = (p, angleRad, forces) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];

        // Trail layer
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.fill(r, g, b, 40);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        // Draw plane on trail
        drawPlane(trailLayer, angleRad);

        // Main canvas
        p.clear();
        p.image(trailLayer, 0, 0);

        // Draw block
        const screenPos = drawBlock(p, angleRad);

        // Draw forces
        if (inputsRef.current.showForces) {
          drawForces(p, screenPos, angleRad, forces);
        }
      };

      const drawPlane = (layer, angleRad) => {
        const plane = planeRef.current;
        const endX = plane.startX + toPixels(plane.length) * Math.cos(angleRad);
        const endY = plane.startY - toPixels(plane.length) * Math.sin(angleRad);

        layer.push();
        layer.stroke(inputsRef.current.planeColor);
        layer.strokeWeight(4);
        layer.line(plane.startX, plane.startY, endX, endY);

        // Ground line
        layer.stroke(100);
        layer.strokeWeight(2);
        layer.line(0, plane.startY, layer.width, plane.startY);

        // Angle arc
        const arcRadius = 50;
        layer.noFill();
        layer.stroke(255, 200);
        layer.strokeWeight(1);
        layer.arc(
          plane.startX,
          plane.startY,
          arcRadius * 2,
          arcRadius * 2,
          -angleRad,
          0
        );

        // Angle label
        layer.noStroke();
        layer.fill(255);
        layer.textAlign(layer.CENTER, layer.CENTER);
        layer.textSize(14);
        layer.text(
          `${inputsRef.current.angle}°`,
          plane.startX + arcRadius + 25,
          plane.startY - 15
        );
        layer.pop();
      };

      const drawBlock = (p, angleRad) => {
        const plane = planeRef.current;
        const screenPos = bodyRef.current.getScreenPosition(
          { x: plane.startX, y: plane.startY },
          angleRad
        );
        const size = toPixels(bodyRef.current.params.size);
        const isHover = bodyRef.current.isHover(p, screenPos);

        p.push();
        p.translate(screenPos.x, screenPos.y);
        p.rotate(-angleRad);

        if (isHover) {
          p.drawingContext.shadowBlur = 20;
          p.drawingContext.shadowColor = bodyRef.current.params.color;
        }

        p.fill(bodyRef.current.params.color);
        p.noStroke();
        p.rectMode(p.CENTER);
        p.rect(0, 0, size, size);

        p.drawingContext.shadowBlur = 0;
        p.pop();

        return screenPos;
      };

      const drawForces = (p, screenPos, angleRad, forces) => {
        const scale = 5; // pixels per Newton
        const { x, y } = screenPos;

        // Weight (downward, in world coordinates)
        const weightVec = p.createVector(0, forces.weight.mag * scale);
        drawForceVector(p, x, y, weightVec, "#ef4444");

        // Normal force (perpendicular to plane)
        const normalAngle = angleRad + Math.PI / 2;
        const normalVec = p.createVector(
          forces.normal * scale * Math.cos(normalAngle),
          -forces.normal * scale * Math.sin(normalAngle)
        );
        drawForceVector(p, x, y, normalVec, "#10b981");

        // Friction force (along plane)
        if (Math.abs(forces.friction) > 0.01) {
          const frictionVec = p.createVector(
            forces.friction * scale * Math.cos(angleRad),
            -forces.friction * scale * Math.sin(angleRad)
          );
          drawForceVector(p, x, y, frictionVec, "#f59e0b");
        }

        // Applied force
        if (inputsRef.current.appliedForce > 0) {
          const appliedAngleRad =
            (inputsRef.current.appliedAngle * Math.PI) / 180;
          const totalAngle = angleRad - appliedAngleRad;
          const appliedVec = p.createVector(
            inputsRef.current.appliedForce * scale * Math.cos(totalAngle),
            -inputsRef.current.appliedForce * scale * Math.sin(totalAngle)
          );
          drawForceVector(p, x, y, appliedVec, "#a855f7");
        }

        // Component vectors (dashed)
        if (inputsRef.current.showComponents) {
          p.drawingContext.setLineDash([5, 5]);

          // Weight parallel component
          const wpVec = p.createVector(
            -forces.weight.parallel * scale * Math.cos(angleRad),
            forces.weight.parallel * scale * Math.sin(angleRad)
          );
          drawForceVector(p, x, y, wpVec, "#fca5a5");

          // Weight perpendicular component
          const wPerpVec = p.createVector(
            forces.weight.perpendicular *
              scale *
              Math.cos(angleRad + Math.PI / 2),
            -forces.weight.perpendicular *
              scale *
              Math.sin(angleRad + Math.PI / 2)
          );
          drawForceVector(p, x, y, wPerpVec, "#fca5a5");

          p.drawingContext.setLineDash([]);
        }
      };

      p.mousePressed = () => {
        if (!bodyRef.current) return;
        const angleRad = (inputsRef.current.angle * Math.PI) / 180;
        const screenPos = bodyRef.current.getScreenPosition(
          { x: planeRef.current.startX, y: planeRef.current.startY },
          angleRad
        );
        const size = toPixels(bodyRef.current.params.size);

        if (p.dist(p.mouseX, p.mouseY, screenPos.x, screenPos.y) <= size / 2) {
          dragStateRef.current.active = true;
        }
      };

      p.mouseDragged = () => {
        if (!dragStateRef.current.active || !bodyRef.current) return;

        const plane = planeRef.current;
        const angleRad = (inputsRef.current.angle * Math.PI) / 180;

        // Project mouse position onto plane
        const dx = p.mouseX - plane.startX;
        const dy = p.mouseY - plane.startY;
        const projectedDist = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);

        bodyRef.current.state.posAlongPlane = toMeters(projectedDist);
        bodyRef.current.state.vel = 0;
        bodyRef.current.constrainToPlane(planeRef.current.length);
      };

      p.mouseReleased = () => {
        dragStateRef.current.active = false;
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupPlane();
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
