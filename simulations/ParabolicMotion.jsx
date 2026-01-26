// app/(pages)/simulations/ParabolicMotion/page.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
  FORCES,
  SimInfoMapper,
  computeProjectileAnalytics,
} from "../app/(core)/data/configs/ParabolicMotion.js";
import chapters from "../app/(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";
import {
  drawBallWithTrail,
  drawForceVector,
} from "../app/(core)/utils/drawUtils.js";

// --- Centralized Body class ---
import Body from "../app/(core)/physics/Body.ts";

const TRAJECTORY_STEPS = 96;

export default function ParabolicMotion() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  const bodyRef = useRef(null);
  const trailLayerRef = useRef(null);
  const needsRelaunchRef = useRef(true);
  const predictedPathRef = useRef([]);
  const launchMetadataRef = useRef({
    startPos: null,
    startMs: 0,
    stats: computeProjectileAnalytics({
      v0: INITIAL_INPUTS.v0,
      angleDeg: INITIAL_INPUTS.angle,
      h0: INITIAL_INPUTS.h0,
      gravity: INITIAL_INPUTS.gravity,
    }),
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

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback(
    (p) => {
      const dragState = { active: false };

      const resetTrailLayer = () => {
        if (!trailLayerRef.current) return;
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
        trailLayerRef.current.background(r, g, b);
      };

      const clampHeight = (canvasHeightMeters, radius, desiredHeight) => {
        const maxHeight = Math.max(0, canvasHeightMeters - radius * 2);
        return Math.min(Math.max(desiredHeight, 0), maxHeight);
      };

      const recomputeLaunch = (hardResetTrail = false) => {
        if (!bodyRef.current) return;

        const { mass, size, gravity, v0, angle, h0 } = inputsRef.current;

        bodyRef.current.params.mass = Math.max(mass, 0.1);
        bodyRef.current.params.gravity = gravity;
        bodyRef.current.params.color = inputsRef.current.ballColor;
        bodyRef.current.params.restitution = 0;
        bodyRef.current.params.frictionMu = 0;

        if (size !== bodyRef.current.params.size) {
          bodyRef.current.params.size = size;
        }

        const canvasHeightMeters = toMeters(p.height);
        const canvasWidthMeters = toMeters(p.width);
        const radius = bodyRef.current.params.size / 2;
        const safeHeight = clampHeight(canvasHeightMeters, radius, h0);

        const analytics = computeProjectileAnalytics({
          v0,
          angleDeg: angle,
          h0: safeHeight,
          gravity,
        });

        const startX = Math.max(toMeters(80), canvasWidthMeters * 0.12);
        const groundY = canvasHeightMeters;
        const startY = Math.min(
          groundY - radius,
          Math.max(radius, groundY - safeHeight - radius)
        );

        const vx0 = analytics.vx0;
        const vy0World = -analytics.vy0; // convert to downward-positive axis

        bodyRef.current.state.pos.set(startX, startY);
        bodyRef.current.state.vel.set(vx0, vy0World);
        bodyRef.current.state.acc.set(0, 0);

        launchMetadataRef.current = {
          startPos: { x: startX, y: startY },
          startMs: p.millis(),
          stats: analytics,
          radius,
        };

        predictedPathRef.current = buildTrajectoryPoints(
          analytics,
          { x: startX, y: startY },
          gravity,
          radius
        );

        needsRelaunchRef.current = false;
        if (hardResetTrail) resetTrailLayer();
      };

      const buildTrajectoryPoints = (analytics, startPos, gravity, radius) => {
        if (!analytics || !startPos) return [];
        if (!isFinite(analytics.flightTime) || analytics.flightTime <= 0) {
          return [];
        }

        const points = [];
        const dt = analytics.flightTime / TRAJECTORY_STEPS;
        const canvasHeightMeters = toMeters(p.height);
        const ground = canvasHeightMeters - radius;
        for (let i = 0; i <= TRAJECTORY_STEPS; i += 1) {
          const t = dt * i;
          const x = startPos.x + analytics.vx0 * t;
          const y = startPos.y + -analytics.vy0 * t + 0.5 * gravity * t * t;

          if (y > ground) break;
          points.push({
            x: toPixels(x),
            y: toPixels(y),
          });
        }
        return points;
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        trailLayerRef.current = p.createGraphics(w, h);
        trailLayerRef.current.pixelDensity(1);
        trailLayerRef.current.clear();

        bodyRef.current = new Body(
          p,
          {
            mass: inputsRef.current.mass,
            size: inputsRef.current.size,
            gravity: inputsRef.current.gravity,
            restitution: 0,
            frictionMu: 0,
            color: inputsRef.current.ballColor,
          },
          p.createVector(
            toMeters(w * 0.12),
            toMeters(h) - inputsRef.current.size / 2
          )
        );

        recomputeLaunch(true);
      };

      p.draw = () => {
        if (!bodyRef.current) return;
        const dt = computeDelta(p);
        if (dt <= 0) return;

        if (needsRelaunchRef.current) {
          recomputeLaunch();
        }

        const { trailEnabled, showGuides, showVectors } = inputsRef.current;
        syncBodyParams(p);

        if (!dragState.active) {
          const external = computeExternalAcceleration(p);
          bodyRef.current.step(
            p,
            dt,
            external?.mag?.() > 0 ? external : undefined
          );
        }

        renderScene(p, {
          trailEnabled,
          showGuides,
          showVectors,
        });
      };

      const syncBodyParams = (p) => {
        const { mass, size, gravity, ballColor } = inputsRef.current;
        const radius = bodyRef.current.params.size / 2;

        bodyRef.current.params.mass = Math.max(mass, 0.1);
        bodyRef.current.params.gravity = gravity;
        bodyRef.current.params.color = ballColor;

        if (size !== bodyRef.current.params.size) {
          bodyRef.current.params.size = size;
          const bottomM = toMeters(p.height);
          bodyRef.current.state.pos.x = Math.min(
            Math.max(bodyRef.current.state.pos.x, radius),
            toMeters(p.width) - radius
          );
          bodyRef.current.state.pos.y = Math.min(
            Math.max(bodyRef.current.state.pos.y, radius),
            bottomM - radius
          );
        }
      };

      const computeExternalAcceleration = (p) => {
        const { dragCoeff, wind, mass } = inputsRef.current;
        const external = p.createVector(0, 0);
        const vel = bodyRef.current.state.vel.copy();

        if (dragCoeff > 0 && vel.magSq() > 0) {
          external.add(vel.copy().mult(-Math.max(dragCoeff, 0)));
        }

        if (wind !== 0) {
          external.add(p.createVector(wind / Math.max(mass, 0.1), 0));
        }

        return external;
      };

      const renderScene = (p, opts) => {
        const trailLayer = trailLayerRef.current;
        if (!trailLayer) return;

        const { pos, vel } = bodyRef.current.state;
        const radius = bodyRef.current.params.size / 2;
        const pixelX = toPixels(pos.x);
        const pixelY = toPixels(pos.y);
        const isHover =
          p.dist(pixelX, pixelY, p.mouseX, p.mouseY) <= toPixels(radius);

        drawBallWithTrail(p, trailLayer, {
          bg: getBackgroundColor(),
          trailEnabled: opts.trailEnabled,
          trailAlpha: 50,
          pixelX,
          pixelY,
          size: toPixels(bodyRef.current.params.size),
          isHover,
          ballColor: bodyRef.current.params.color,
        });

        p.clear();
        p.image(trailLayer, 0, 0);

        if (opts.showGuides && predictedPathRef.current.length > 1) {
          drawGuides(p);
        }

        if (opts.showVectors) {
          const activeForces = FORCES.map((def) => {
            const vec = def.computeFn(
              {
                pos,
                vel,
                radius,
                mass: bodyRef.current.params.mass,
              },
              inputsRef.current,
              { canvasHeightMeters: toMeters(p.height) }
            );
            return vec ? { vec, color: def.color } : null;
          }).filter(Boolean);

          activeForces.forEach((force) =>
            drawForceVector(p, pixelX, pixelY, force.vec, force.color)
          );
        }

        const elapsed =
          (p.millis() - (launchMetadataRef.current?.startMs ?? 0)) / 1000;
        updateSimInfo(
          p,
          { pos, vel },
          {
            canvasHeightMeters: toMeters(p.height),
            radius,
            elapsedTime: Math.max(0, elapsed),
          },
          SimInfoMapper
        );
      };

      const drawGuides = (p) => {
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
          const ctx = p.drawingContext;
          if (ctx?.setLineDash) {
            ctx.save();
            ctx.setLineDash([6, 6]);
            p.stroke("#f472b6");
            p.strokeWeight(1);
            p.line(landingPoint.x, landingPoint.y, landingPoint.x, p.height);
            ctx.restore();
          } else {
            p.stroke("#f472b6");
            p.strokeWeight(1);
            p.line(landingPoint.x, landingPoint.y, landingPoint.x, p.height);
          }
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
        const { pos } = bodyRef.current.state;
        const radiusPx = toPixels(bodyRef.current.params.size / 2);
        const d = p.dist(toPixels(pos.x), toPixels(pos.y), p.mouseX, p.mouseY);
        if (d <= radiusPx) {
          dragState.active = true;
        }
      };

      p.mouseDragged = () => {
        if (!dragState.active || !bodyRef.current) return;
        bodyRef.current.state.pos.x = toMeters(p.mouseX);
        bodyRef.current.state.pos.y = toMeters(p.mouseY);
        bodyRef.current.state.vel.set(0, 0);
        needsRelaunchRef.current = false;
        predictedPathRef.current = [];
        launchMetadataRef.current.stats = null;
      };

      p.mouseReleased = () => {
        dragState.active = false;
        if (bodyRef.current) {
          launchMetadataRef.current.startPos = {
            x: bodyRef.current.state.pos.x,
            y: bodyRef.current.state.pos.y,
          };
          launchMetadataRef.current.startMs = p.millis();
        }
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
