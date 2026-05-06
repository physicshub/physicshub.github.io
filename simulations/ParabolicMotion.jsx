// app/(pages)/simulations/ParabolicMotion/page.jsx
"use client";

import { useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";
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
  computeProjectileAnalytics,
} from "../app/(core)/data/configs/ParabolicMotion.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import ForceCalculator from "../app/(core)/physics/ForceCalculator.js";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";
import DragController from "../app/(core)/physics/DragController.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

const TRAJECTORY_STEPS = 96;

export default function ParabolicMotion() {
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
  const dragControllerRef = useRef(null);
  const trailLayerRef = useRef(null);
  const needsRelaunchRef = useRef(true);
  const predictedPathRef = useRef([]);
  const launchMetadataRef = useRef({
    startPos: null,
    startMs: 0,
    stats: null,
    radius: INITIAL_INPUTS.size / 2,
  });

  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { launchMetadataRef, predictedPathRef },
  });

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
      needsRelaunchRef.current = true;
    },
    [setInputs]
  );

  const sketch = useCallback(
    (p) => {
      const resetTrailLayer = () => {
        if (!trailLayerRef.current) return;
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        trailLayerRef.current.background(r, g, b);
      };

      const buildTrajectoryPoints = (analytics, startPos, gravity) => {
        if (!analytics || !startPos) return [];
        if (!isFinite(analytics.flightTime) || analytics.flightTime <= 0) {
          return [];
        }

        const points = [];
        const dt = analytics.flightTime / TRAJECTORY_STEPS;

        for (let i = 0; i <= TRAJECTORY_STEPS; i++) {
          const t = dt * i;
          const x = startPos.x + analytics.vx0 * t;
          const y = startPos.y + analytics.vy0 * t + 0.5 * -gravity * t * t;

          points.push({
            x: toPixels(x),
            y: p.height - toPixels(y),
          });
        }
        return points;
      };

      const recomputeLaunch = (hardResetTrail = false) => {
        if (!bodyRef.current) return;

        const { mass, size, gravity, v0, angle, h0 } = inputsRef.current;

        bodyRef.current.updateParams({
          mass: Math.max(mass, 0.1),
          size,
          color: inputsRef.current.ballColor,
          restitution: 0,
        });

        const canvasWidthMeters = toMeters(p.width);
        const radius = size / 2;
        const safeHeight = Math.max(radius, h0);

        const analytics = computeProjectileAnalytics({
          v0,
          angleDeg: angle,
          h0: safeHeight,
          gravity,
        });

        const startX = Math.max(toMeters(80), canvasWidthMeters * 0.12);
        const vx0 = analytics.vx0;
        const vy0World = analytics.vy0;

        bodyRef.current.state.position.set(startX, safeHeight);
        bodyRef.current.state.velocity.set(vx0, vy0World);
        bodyRef.current.state.acceleration.set(0, 0);

        launchMetadataRef.current = {
          startPos: { x: startX, y: safeHeight },
          startMs: p.millis(),
          stats: analytics,
          radius,
        };

        predictedPathRef.current = buildTrajectoryPoints(
          analytics,
          { x: startX, y: safeHeight },
          gravity,
          radius
        );

        needsRelaunchRef.current = false;
        if (hardResetTrail) resetTrailLayer();
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayerRef.current = p.createGraphics(w, h);
        trailLayerRef.current.pixelDensity(1);
        trailLayerRef.current.clear();

        bodyRef.current = new PhysicsBody(p, {
          mass: inputsRef.current.mass,
          size: inputsRef.current.size,
          color: inputsRef.current.ballColor,
          shape: "circle",
          restitution: 0,
          position: p.createVector(
            toMeters(w * 0.12),
            toMeters(h) - inputsRef.current.size / 2
          ),
        });

        bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
        bodyRef.current.trail.maxLength = 200;

        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 10,
            showLabels: true,
            showMagnitude: true,
          });
        }

        if (!dragControllerRef.current) {
          dragControllerRef.current = new DragController({
            snapBack: false,
          });
        }

        recomputeLaunch(true);
      };

      p.draw = () => {
        if (!bodyRef.current) return;

        const fixedDt = 1 / 120;
        let frameTime = computeDelta(p);
        if (frameTime <= 0) return;

        if (needsRelaunchRef.current) {
          recomputeLaunch();
        }

        const {
          gravity,
          dragCoeff,
          wind,
          trailEnabled,
          showGuides,
          showVectors,
        } = inputsRef.current;

        bodyRef.current.params.color = inputsRef.current.ballColor;
        bodyRef.current.trail.enabled = trailEnabled;
        bodyRef.current.trail.color = inputsRef.current.ballColor;

        while (frameTime > 0) {
          const frameStep = Math.min(frameTime, fixedDt);

          if (!dragControllerRef.current.isDragging()) {
            // Gravity
            const gravityForce = ForceCalculator.gravity(
              bodyRef.current.params.mass,
              gravity
            );
            bodyRef.current.applyForce(
              p.createVector(gravityForce.x, gravityForce.y)
            );

            // Air resistance
            if (dragCoeff > 0) {
              const vel = bodyRef.current.state.velocity;
              const drag = ForceCalculator.airResistance(
                vel.mag(),
                dragCoeff,
                false
              );
              if (Math.abs(drag) > 0.001 && vel.mag() > 0) {
                const dragForce = vel.copy().normalize().mult(drag);
                bodyRef.current.applyForce(dragForce);
              }
            }

            // Wind force
            if (wind !== 0) {
              bodyRef.current.applyForce(p.createVector(wind, 0));
            }

            // FIX: Save acceleration BEFORE step() resets it to 0.
            // The ground collision handler needs the real gravity value to
            // correctly conserve energy. Without this save, gravity reads as
            // 0 and the ball loses kinetic energy on every bounce.
            const accBeforeStep = bodyRef.current.state.acceleration.copy();

            bodyRef.current.step(frameStep);

            // Ground collision with proper energy conservation
            const radius = bodyRef.current.params.size / 2;
            const groundY = radius;

            if (bodyRef.current.state.position.y <= groundY) {
              bodyRef.current.state.position.y = groundY;

              // FIX: Use restitution to bounce instead of always killing
              // vertical velocity. restitution=1 → perfect elastic bounce,
              // restitution=0 → ball stops (original parabolic motion behavior).
              // Also apply ground friction only when restitution < 1, so a
              // perfectly elastic ball doesn't lose energy horizontally either.
              const restitution = inputsRef.current.restitution ?? 0;

              if (bodyRef.current.state.velocity.y < 0) {
                // Correct for energy added by gravity during penetration
                const penetration = groundY - bodyRef.current.state.position.y;
                const gravityAcc = Math.abs(accBeforeStep.y);
                const liftDistance = 2 * Math.abs(penetration);
                const work = gravityAcc > 0 ? 2 * gravityAcc * liftDistance : 0;
                const velSq = bodyRef.current.state.velocity.y ** 2;

                if (velSq > work) {
                  const vNew = Math.sqrt(velSq - work);
                  bodyRef.current.state.velocity.y = vNew * restitution;
                } else {
                  bodyRef.current.state.velocity.y = 0;
                }
              }

              // Only apply ground friction when restitution < 1 (not a perfect bounce)
              if (restitution < 1) {
                bodyRef.current.state.velocity.x *= 0.95;
              }
            }
          }

          frameTime -= frameStep;
        }

        // Render scene
        renderScene(p, { showGuides, showVectors });

        // Update sim info
        const elapsed =
          (p.millis() - (launchMetadataRef.current?.startMs ?? 0)) / 1000;
        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
          },
          {
            canvasHeightMeters: toMeters(p.height),
            radius: bodyRef.current.params.size / 2,
            elapsedTime: Math.max(0, elapsed),
          },
          SimInfoMapper
        );
      };

      const renderScene = (p, opts) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        if (!inputsRef.current.trailEnabled) {
          trailLayerRef.current.background(r, g, b);
        } else {
          trailLayerRef.current.fill(r, g, b, 50);
          trailLayerRef.current.noStroke();
          trailLayerRef.current.rect(
            0,
            0,
            trailLayerRef.current.width,
            trailLayerRef.current.height
          );
        }

        p.clear();
        p.image(trailLayerRef.current, 0, 0);

        if (opts.showGuides && predictedPathRef.current.length > 1) {
          drawTrajectory(p);
        }

        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        if (opts.showVectors) {
          const renderer = forceRendererRef.current;

          renderer.drawWeight(
            p,
            screenPos.x,
            screenPos.y,
            bodyRef.current.params.mass,
            inputsRef.current.gravity
          );

          if (inputsRef.current.dragCoeff > 0) {
            const vel = bodyRef.current.state.velocity;
            const drag = ForceCalculator.airResistance(
              vel.mag(),
              inputsRef.current.dragCoeff,
              false
            );
            if (Math.abs(drag) > 0.01 && vel.mag() > 0.01) {
              const dragVec = vel.copy().normalize().mult(drag);
              renderer.drawVector(
                p,
                screenPos.x,
                screenPos.y,
                dragVec.x,
                dragVec.y,
                renderer.colors.drag,
                "Drag"
              );
            }
          }

          if (inputsRef.current.wind !== 0) {
            renderer.drawVector(
              p,
              screenPos.x,
              screenPos.y,
              inputsRef.current.wind,
              0,
              "#6366f1",
              "Wind"
            );
          }
        }

        p.push();
        p.stroke(100, 100, 120);
        p.strokeWeight(2);
        p.line(0, p.height, p.width, p.height);
        p.pop();
      };

      const drawTrajectory = (p) => {
        p.push();
        p.noFill();
        p.stroke("#7dd3fc");
        p.strokeWeight(2);
        p.beginShape();
        predictedPathRef.current.forEach((point) => {
          p.vertex(point.x, point.y);
        });
        p.endShape();

        const landingPoint =
          predictedPathRef.current[predictedPathRef.current.length - 1];
        if (landingPoint) {
          p.push();
          p.drawingContext.setLineDash([6, 6]);
          p.stroke("#f472b6");
          p.strokeWeight(1);
          p.line(landingPoint.x, landingPoint.y, landingPoint.x, p.height);
          p.drawingContext.setLineDash([]);
          p.pop();

          p.stroke("#f472b6");
          p.strokeWeight(2);
          p.line(
            landingPoint.x - 8,
            landingPoint.y,
            landingPoint.x + 8,
            landingPoint.y
          );
        }
        p.pop();
      };

      p.mousePressed = () => {
        if (!bodyRef.current) return;
        dragControllerRef.current.handlePress(p, bodyRef.current);
      };

      p.mouseDragged = () => {
        if (dragControllerRef.current.isDragging()) {
          dragControllerRef.current.handleDrag(p);
          needsRelaunchRef.current = false;
          predictedPathRef.current = [];
        }
      };

      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease((body) => {
          launchMetadataRef.current.startPos = {
            x: body.state.position.x,
            y: body.state.position.y,
          };
          launchMetadataRef.current.startMs = p.millis();
        });
      };

      p.doubleClicked = () => {
        needsRelaunchRef.current = true;
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        trailLayerRef.current = p.createGraphics(w, h);
        trailLayerRef.current.pixelDensity(1);
        trailLayerRef.current.clear();

        needsRelaunchRef.current = true;
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
        needsRelaunchRef.current = true;
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        needsRelaunchRef.current = true;
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
