// app/pages/simulations/VectorsOperations.jsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { SCALE } from "../app/(core)/constants/Config.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
} from "../app/(core)/data/configs/VectorsOperations.js";
import chapters from "../app/(core)/data/chapters.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";
import { adjustColor } from "../app/(core)/utils/adjustColor.ts";

// --- Planck Physics ---
import * as planck from "planck";

export default function VectorsOperations() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // Centralized sim info system
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
      // -- PHYSICS STATE & UTILITY FUNCTIONS --
      const worldRef = { current: null };
      const bodyRef = { current: null };
      const boundsRef = { current: null };
      const lastMassRef = { current: null };

      let accumulator = 0;
      const FIXED_DT = 1 / 60;
      const MAX_STEPS = 5;

      function createBounds(w, h) {
        const world = worldRef.current;
        if (!world) return;
        const metersW = w / SCALE;
        const metersH = h / SCALE;
        const ground = world.createBody();
        ground.createFixture(
          planck.Edge(planck.Vec2(0, 0), planck.Vec2(metersW, 0))
        );
        ground.createFixture(
          planck.Edge(planck.Vec2(0, metersH), planck.Vec2(metersW, metersH))
        );
        ground.createFixture(
          planck.Edge(planck.Vec2(0, 0), planck.Vec2(0, metersH))
        );
        ground.createFixture(
          planck.Edge(planck.Vec2(metersW, 0), planck.Vec2(metersW, metersH))
        );
        boundsRef.current = ground;
      }

      function createWorldAndBody(w, h) {
        const world = planck.World(planck.Vec2(0, 0));
        worldRef.current = world;
        createBounds(w, h);

        const metersW = w / SCALE;
        const metersH = h / SCALE;
        const pos = planck.Vec2(metersW / 2, metersH / 2);
        const body = world.createBody({
          type: "dynamic",
          position: pos,
          bullet: true,
        });

        const radiusM = 0.2;
        const massKg = inputsRef.current.massKg;
        const area = Math.PI * radiusM * radiusM;
        const density = massKg / area;

        body.createFixture(planck.Circle(radiusM), {
          density,
          restitution: 0.2,
          friction: 0.2,
        });

        bodyRef.current = body;
        lastMassRef.current = massKg;
        accumulator = 0;
      }

      function destroyWorld() {
        worldRef.current = null;
        bodyRef.current = null;
        boundsRef.current = null;
      }

      function updatePhysics(dt) {
        if (
          !inputsRef.current.physicsEnabled ||
          !worldRef.current ||
          !bodyRef.current
        )
          return;

        // Update body mass if changed
        const radiusM = 0.2;
        const desiredMass = inputsRef.current.massKg;
        if (
          lastMassRef.current == null ||
          Math.abs(desiredMass - lastMassRef.current) > 1e-6
        ) {
          const area = Math.PI * radiusM * radiusM;
          const newDensity = desiredMass / area;
          const fixture = bodyRef.current.getFixtureList();
          fixture.setDensity(newDensity);
          bodyRef.current.resetMassData();
          lastMassRef.current = desiredMass;
        }

        // Apply global time scale and pause
        const scale = 0; //getTimeScale();
        if (!isPaused()) {
          accumulator += dt * Math.max(0, scale);
        }

        // Apply forces based on vector operation
        const center = p.createVector(p.width / 2, p.height / 2);
        const mouse = p.createVector(p.mouseX, p.mouseY);
        const op = inputsRef.current.operation;
        const pxPerNewton = Math.max(1, inputsRef.current.pxPerNewton);

        const A = { x: center.x, y: center.y };
        const B = { x: mouse.x - center.x, y: mouse.y - center.y };

        let FA = { x: A.x / pxPerNewton, y: A.y / pxPerNewton };
        let FB = { x: B.x / pxPerNewton, y: B.y / pxPerNewton };

        if (op === "-") {
          FB = { x: -FB.x, y: -FB.y };
        } else if (op === "x") {
          FB = {
            x: FB.x * inputsRef.current.multiVector,
            y: FB.y * inputsRef.current.multiVector,
          };
          FA = { x: 0, y: 0 };
        }

        // Physics stepping
        let steps = 0;
        while (accumulator >= FIXED_DT && steps < MAX_STEPS) {
          const body = bodyRef.current;
          body.applyForce(planck.Vec2(FA.x, FA.y), body.getWorldCenter());
          body.applyForce(planck.Vec2(FB.x, FB.y), body.getWorldCenter());
          worldRef.current.step(FIXED_DT);
          steps++;
          accumulator -= FIXED_DT;
        }
      }

      function drawVectorVisualizations() {
        const {
          strokeColor,
          strokeWeight,
          multiVector,
          operation,
          visualizeMode,
        } = inputsRef.current;
        const mouse = p.createVector(p.mouseX, p.mouseY);
        const center = p.createVector(p.width / 2, p.height / 2);

        p.push();

        switch (operation) {
          case "+": {
            const Avec_add = center.copy();
            const Bvec_add = p.constructor.Vector.sub(mouse, center);

            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);

            if (visualizeMode === "triangle") {
              // Triangle method
              p.line(0, 0, Avec_add.x, Avec_add.y);
              p.line(Avec_add.x, Avec_add.y, mouse.x, mouse.y);
              p.stroke(adjustColor(strokeColor));
              p.strokeWeight(strokeWeight + 1);
              p.line(0, 0, mouse.x, mouse.y); // resultant
            } else {
              // Parallelogram method
              const Btip_from_origin = p.constructor.Vector.add(
                Avec_add,
                Bvec_add
              );
              p.line(0, 0, Avec_add.x, Avec_add.y);
              p.line(0, 0, Bvec_add.x, Bvec_add.y);
              p.drawingContext.setLineDash([6, 6]);
              p.line(
                Avec_add.x,
                Avec_add.y,
                Btip_from_origin.x,
                Btip_from_origin.y
              );
              p.line(
                Bvec_add.x,
                Bvec_add.y,
                Btip_from_origin.x,
                Btip_from_origin.y
              );
              p.drawingContext.setLineDash([]);
              p.stroke(adjustColor(strokeColor));
              p.strokeWeight(strokeWeight + 1);
              p.line(0, 0, Btip_from_origin.x, Btip_from_origin.y);
            }
            break;
          }

          case "-": {
            const Avec_sub = center.copy();
            const Bvec_sub = mouse.copy(); // B: origin -> mouse
            const negAvec_sub = p.constructor.Vector.mult(Avec_sub, -1); // -A
            const Rvec_sub = p.constructor.Vector.add(Bvec_sub, negAvec_sub); // R = B + (-A) = B - A

            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);

            if (visualizeMode === "triangle") {
              p.line(0, 0, Avec_sub.x, Avec_sub.y);
              p.line(0, 0, mouse.x, mouse.y);
              p.stroke(adjustColor(strokeColor));
              p.strokeWeight(strokeWeight + 1);
              p.line(center.x, center.y, mouse.x, mouse.y);
            } else {
              p.stroke(strokeColor);
              p.strokeWeight(Math.max(1, strokeWeight - 0.5));
              p.line(0, 0, Avec_sub.x, Avec_sub.y);

              p.stroke(strokeColor);
              p.strokeWeight(strokeWeight);
              p.line(0, 0, Bvec_sub.x, Bvec_sub.y);

              p.stroke(180, 180, 180, 180);
              p.strokeWeight(strokeWeight);
              p.drawingContext.setLineDash([6, 6]);
              p.line(0, 0, negAvec_sub.x, negAvec_sub.y);

              p.line(Bvec_sub.x, Bvec_sub.y, Rvec_sub.x, Rvec_sub.y);
              p.line(negAvec_sub.x, negAvec_sub.y, Rvec_sub.x, Rvec_sub.y);
              p.drawingContext.setLineDash([]);

              p.noStroke();
              p.fill(220);
              p.textSize(14);
              p.textAlign(p.CENTER, p.CENTER);
              p.text("-A", negAvec_sub.x * 0.55, negAvec_sub.y * 0.55);

              p.stroke(adjustColor(strokeColor));
              p.strokeWeight(strokeWeight + 1);
              p.line(0, 0, Rvec_sub.x, Rvec_sub.y);

              p.stroke(adjustColor(strokeColor));
              p.strokeWeight(Math.max(1, strokeWeight - 0.2));
              p.line(Avec_sub.x, Avec_sub.y, Bvec_sub.x, Bvec_sub.y);

              p.noStroke();
              p.fill(255, 220, 120);
              p.circle(Avec_sub.x, Avec_sub.y, 7);
            }
            break;
          }

          case "x": {
            mouse.sub(center);
            p.translate(p.width / 2, p.height / 2);
            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);
            p.line(0, 0, mouse.x, mouse.y);

            let multiplied = mouse.copy().mult(multiVector);
            p.strokeWeight(strokeWeight * 0.8);
            p.stroke(adjustColor(strokeColor));
            p.line(mouse.x, mouse.y, multiplied.x, multiplied.y);

            if (multiVector < 0) {
              p.stroke(200, 200, 200);
              p.strokeWeight(1);
              const flipped = mouse.copy().mult(-1);
              p.line(0, 0, flipped.x, flipped.y);
            }
            break;
          }

          case "normalize": {
            const v = p.constructor.Vector.sub(mouse, center);
            const len = v.mag() || 1;
            const unit = v.copy().div(len);

            p.translate(p.width / 2, p.height / 2);
            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);
            p.line(0, 0, v.x, v.y);
            p.stroke(adjustColor(strokeColor));
            p.line(0, 0, unit.x * 100, unit.y * 100);
            break;
          }

          case "dot": {
            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);
            p.line(0, 0, center.x, center.y);
            p.line(center.x, center.y, mouse.x, mouse.y);
            p.stroke(adjustColor(strokeColor));
            p.line(0, 0, mouse.x, mouse.y);
            break;
          }

          case "cross": {
            p.strokeWeight(strokeWeight);
            p.stroke(strokeColor);
            p.line(0, 0, center.x, center.y);
            p.line(center.x, center.y, mouse.x, mouse.y);
            p.stroke(adjustColor(strokeColor));
            p.line(0, 0, mouse.x, mouse.y);
            break;
          }

          default:
            break;
        }
        p.pop();
      }

      function drawAxisProjections() {
        const center = p.createVector(p.width / 2, p.height / 2);
        const mouse = p.createVector(p.mouseX, p.mouseY);
        const v_proj = p.constructor.Vector.sub(mouse, center);

        p.push();
        p.stroke(255, 255, 255, 120);
        p.drawingContext.setLineDash([4, 4]);
        p.line(center.x, center.y, mouse.x, center.y);
        p.line(mouse.x, center.y, mouse.x, mouse.y);
        p.drawingContext.setLineDash([]);

        const arcR = 40;
        p.noFill();
        p.stroke(255, 255, 255, 150);
        const ang = Math.atan2(v_proj.y, v_proj.x);
        p.arc(center.x, center.y, arcR * 2, arcR * 2, 0, ang);
        p.pop();
      }

      function drawPhysicsBody() {
        if (!inputsRef.current.physicsEnabled || !bodyRef.current) return;

        const pos = bodyRef.current.getPosition();
        const rPx = 0.2 * SCALE * 2;
        const { strokeColor } = inputsRef.current;

        p.noStroke();
        p.fill(adjustColor(strokeColor));
        p.circle(pos.x * SCALE, pos.y * SCALE, rPx);
      }

      function computeSimInfo() {
        const center = p.createVector(p.width / 2, p.height / 2);
        const mouse = p.createVector(p.mouseX, p.mouseY);
        const { operation, visualizeMode, multiVector } = inputsRef.current;

        const A = center.copy();
        const B_from_center = p.constructor.Vector.sub(mouse, center);
        const B_from_origin = mouse.copy();

        let info = {};
        const mag = B_from_center.mag();
        const angleRad = Math.atan2(B_from_center.y, B_from_center.x);
        const angleDeg = (angleRad * 180) / Math.PI;

        info["Vector |B|"] = `${mag.toFixed(2)} px`;
        info["Vector angle θ"] = `${angleDeg.toFixed(1)} deg`;
        info["B components"] = `(${B_from_center.x.toFixed(
          2
        )}, ${B_from_center.y.toFixed(2)}) px`;

        switch (operation) {
          case "+": {
            const R =
              visualizeMode === "triangle"
                ? B_from_origin
                : p.constructor.Vector.add(A, B_from_center);
            info["Addition resultant R"] = `(${R.x.toFixed(2)}, ${R.y.toFixed(
              2
            )}) px`;
            info["|R|"] = `${R.mag().toFixed(2)} px`;
            info["Formula"] =
              visualizeMode === "triangle"
                ? "Triangle: R = B (origin→mouse)"
                : "Parallelogram: R = A + B";
            break;
          }

          case "-": {
            const R = p.constructor.Vector.sub(mouse, center);
            const Rpar = p.constructor.Vector.sub(B_from_origin, A);
            const negA = p.constructor.Vector.mult(A, -1);
            const Bcheck = p.constructor.Vector.add(A, R);
            const checkErr = p.constructor.Vector.sub(
              Bcheck,
              B_from_origin
            ).mag();

            info["Subtraction resultant R = B - A"] = `(${R.x.toFixed(
              2
            )}, ${R.y.toFixed(2)}) px`;
            info["Parallelogram diagonal B + (-A)"] = `(${Rpar.x.toFixed(
              2
            )}, ${Rpar.y.toFixed(2)}) px`;
            info["|R|"] = `${R.mag().toFixed(2)} px`;
            info["Auxiliary -A"] = `(${negA.x.toFixed(2)}, ${negA.y.toFixed(
              2
            )}) px`;
            info["Parallelogram check B = A + R"] = `(${Bcheck.x.toFixed(
              2
            )}, ${Bcheck.y.toFixed(2)}) px`;
            info["Check error |(A + R) - B|"] = `${checkErr.toFixed(4)} px`;
            info["Formula"] =
              visualizeMode === "triangle"
                ? "Triangle: R = B - A (center→mouse)"
                : "Parallelogram: use B and -A as adjacent sides, diagonal is R = B + (-A)";
            break;
          }

          case "x": {
            const v = p.constructor.Vector.sub(mouse, center);
            const scalar = multiVector;
            const R = v.copy().mult(scalar);
            const angleR = (Math.atan2(R.y, R.x) * 180) / Math.PI;
            info["Scalar s"] = scalar.toFixed(2);
            info["Scaled vector s·v"] = `(${R.x.toFixed(2)}, ${R.y.toFixed(
              2
            )}) px`;
            info["|s·v|"] = `${R.mag().toFixed(2)} px`;
            info["Angle of s·v"] = `${angleR.toFixed(1)} deg`;
            info["Formula"] = "s·v = (s·vx, s·vy); if s < 0, orientation flips";
            break;
          }

          case "normalize": {
            const v = p.constructor.Vector.sub(mouse, center);
            const len = v.mag();
            const unit = len ? v.copy().div(len) : p.createVector(0, 0);
            info["|v|"] = len.toFixed(2);
            info["unit v̂"] = `(${unit.x.toFixed(3)}, ${unit.y.toFixed(3)})`;
            info["Formula"] = "v̂ = v / |v|";
            break;
          }

          case "dot": {
            const A = center.copy();
            const B = p.constructor.Vector.sub(mouse, center);
            const dot = A.x * B.x + A.y * B.y;
            const magA = A.mag();
            const magB = B.mag();
            const cosTheta = magA && magB ? dot / (magA * magB) : 0;
            const theta =
              (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;
            info["A·B"] = `${dot.toFixed(2)} px²`;
            info["θ between A and B (deg)"] = theta.toFixed(1);
            info["Formula"] = "A·B = |A||B| cosθ = AxBx + AyBy";
            break;
          }

          case "cross": {
            const A = center.copy();
            const B = p.constructor.Vector.sub(mouse, center);
            const z = A.x * B.y - A.y * B.x;
            const sign =
              z > 0 ? "+ (counterclockwise)" : z < 0 ? "- (clockwise)" : "0";
            info["A×B (z-component)"] = `${z.toFixed(2)} ${sign} px²`;
            info["Formula"] = "A×B (2D) = AxBy − AyBx (z-axis out of plane)";
            break;
          }
        }

        return info;
      }

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);

        if (inputsRef.current.physicsEnabled) {
          createWorldAndBody(w, h);
        }
      };

      p.draw = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;

        // Handle physics toggle at runtime
        if (inputsRef.current.physicsEnabled && !worldRef.current) {
          createWorldAndBody(w, h);
        } else if (!inputsRef.current.physicsEnabled && worldRef.current) {
          destroyWorld();
        }

        // Background
        p.background(getBackgroundColor());

        // Update physics
        updatePhysics(computeDelta(p));

        // Draw vector visualizations
        drawVectorVisualizations();

        // Draw axis projections
        drawAxisProjections();

        // Draw physics body
        drawPhysicsBody();

        // Update sim info using the centralized system
        updateSimInfo(p, {}, {}, () => computeSimInfo());
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);

        if (inputsRef.current.physicsEnabled) {
          destroyWorld();
          createWorldAndBody(w, h);
        }
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
