"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { resetTime, computeDelta } from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/HorizontalSpring.js";
import chapters from "../app/(core)/data/chapters.js";
import {
  toMeters,
  toPixels,
  setCanvasHeight,
  screenYToPhysicsY,
} from "../app/(core)/constants/Utils.js";

// --- Centralized Physics Components ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
import Spring from "../app/(core)/physics/Spring";
import ForceRenderer from "../app/(core)/physics/ForceRenderer.js";
import DragController from "../app/(core)/physics/DragController.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState";
import useSimInfo from "../app/(core)/hooks/useSimInfo";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor";

// Ground height in physics meters from bottom of canvas
const GROUND_Y = 0.5;

export default function HorizontalSpring() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodyRef = useRef(null);
  const springRef = useRef(null);
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);

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
      const setupSimulation = () => {
        const canvasHeight = p.height;

        setCanvasHeight(canvasHeight);

        const {
          springRestLength,
          springK,
          bobMass,
          bobSize,
          bobColor,
          springColor,
          anchorColor,
        } = inputsRef.current;

        // Anchor sits on the ground, near the left wall
        const anchorPhysics = p.createVector(0.2, GROUND_Y);

        // Body starts at rest length away from anchor, on the same ground Y
        const initialPhysics = p.createVector(
          anchorPhysics.x + springRestLength,
          GROUND_Y
        );

        bodyRef.current = new PhysicsBody(p, {
          mass: bobMass,
          size: bobSize,
          color: bobColor,
          shape: "circle",
        });
        bodyRef.current.state.position.set(initialPhysics);
        bodyRef.current.state.velocity.set(0, 0);

        springRef.current = new Spring(
          p,
          anchorPhysics,
          springRestLength,
          springK,
          {
            color: springColor,
            anchorColor: anchorColor,
          }
        );

        forceRendererRef.current = new ForceRenderer({
          showLabels: true,
          colors: { spring: springColor },
        });

        dragControllerRef.current = new DragController({ snapBack: false });
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        setupSimulation();
      };

      p.draw = () => {
        if (!bodyRef.current || !springRef.current) return;

        const dt = computeDelta(p);
        if (dt <= 0) return;

        const { springK, springRestLength, bobMass, minCompressionLength } =
          inputsRef.current;

        const effectiveMinLength = Math.min(
          minCompressionLength,
          springRestLength
        );

        setCanvasHeight(p.height);

        springRef.current.k = springK;
        springRef.current.restLength = springRestLength;
        bodyRef.current.updateParams({
          mass: bobMass,
          size: inputsRef.current.bobSize,
          color: inputsRef.current.bobColor,
        });

        if (!dragControllerRef.current.isDragging()) {
          const anchorX = springRef.current.anchor.x;
          const bodyX = bodyRef.current.state.position.x;
          const currentLength = bodyX - anchorX;

          // Only restrict LEFT side (compression limit)
          if (currentLength < effectiveMinLength) {
            bodyRef.current.state.position.x = anchorX + effectiveMinLength;
            bodyRef.current.state.velocity.x = Math.max(
              0,
              bodyRef.current.state.velocity.x
            );
          }

          const displacement = currentLength - springRestLength;

          // Spring only pushes (compression)
          if (displacement < 0) {
            const springForceX = -springK * displacement;
            bodyRef.current.applyForce(p.createVector(springForceX, 0));
          }

          const vx = bodyRef.current.state.velocity.x;
          if (Math.abs(vx) > 0.0001) {
            const friction = -Math.sign(vx) * inputsRef.current.bobDamping;
            bodyRef.current.applyForce(p.createVector(friction, 0));
          }

          // Damping ONLY while compressed (simulates spring's internal damping)
          // Once body is free, no damping — it slides freely
          // if (displacement < 0) {
          //   const vx = bodyRef.current.state.velocity.x;
          //   if (Math.abs(vx) > 0.001) {
          //     bodyRef.current.applyForce(p.createVector(-bobDamping * vx, 0));
          //   }
          // }

          bodyRef.current.step(dt);

          // Hard horizontal constraint — lock Y to ground
          bodyRef.current.state.position.y = GROUND_Y;
          bodyRef.current.state.velocity.y = 0;

          // Body can't travel left past minLength from anchor
          const minX = anchorX + effectiveMinLength;
          if (bodyRef.current.state.position.x < minX) {
            bodyRef.current.state.position.x = minX;
            bodyRef.current.state.velocity.x = Math.max(
              0,
              bodyRef.current.state.velocity.x
            );
          }
        }

        // 3. Render
        renderScene(p);

        // 4. Update info panel
        const canvasHeightMeters = toMeters(p.height);
        const anchorX = springRef.current.anchor.x;
        const currentLengthM = bodyRef.current.state.position.x - anchorX;
        const displacement = currentLengthM - springRestLength;

        // Spring force is only real when compressed
        const springForceMag = displacement < 0 ? -springK * displacement : 0;
        const potentialEnergyElastic =
          displacement < 0 ? 0.5 * springK * displacement * displacement : 0;

        updateSimInfo(
          p,
          {
            pos: bodyRef.current.state.position,
            vel: bodyRef.current.state.velocity,
            mass: bobMass,
            k: springK,
            restLength: springRestLength,
            potentialEnergyElastic,
            springForceMag,
            currentLengthM,
            anchorX,
          },
          { canvasHeight: p.height, canvasHeightMeters },
          SimInfoMapper
        );
      };

      const renderScene = (p) => {
        p.background(getBackgroundColor());

        drawGround(p);
        drawWall(p);

        // Spring visual: only draw line up to body when compressed,
        // retract to rest length visually when body is beyond rest length.
        const anchorX = springRef.current.anchor.x;
        const bodyX = bodyRef.current.state.position.x;
        const currentLength = bodyX - anchorX;
        const { springRestLength } = inputsRef.current;

        if (currentLength <= springRestLength) {
          // Compressed or at rest — draw spring connected to body
          springRef.current.showLine(bodyRef.current, true);
        } else {
          // Body has moved past rest length — spring retracts to rest length
          const springTipX = anchorX + springRestLength;
          const springTipY = GROUND_Y;
          const fakeBody = {
            state: {
              position: p.createVector(springTipX, springTipY),
            },
          };
          springRef.current.showLine(fakeBody, true);
        }
        springRef.current.show();

        bodyRef.current.checkHover(p, bodyRef.current.toScreenPosition());
        const screenPos = bodyRef.current.draw(p, { hoverEffect: true });

        const displacement = currentLength - springRestLength;
        if (displacement < 0) {
          const renderer = forceRendererRef.current;
          const springForceMagnitude =
            -inputsRef.current.springK * displacement;
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            springForceMagnitude,
            0,
            inputsRef.current.springColor,
            "Spring"
          );
        }
      };

      const drawGround = (p) => {
        const groundScreenY = p.height - toPixels(GROUND_Y);

        // Ground surface line
        p.stroke(180, 180, 190, 230);
        p.strokeWeight(2);
        p.line(0, groundScreenY, p.width, groundScreenY);

        // Hatching below ground
        p.stroke(140, 140, 150, 90);
        p.strokeWeight(1);
        const spacing = 18;
        for (let x = 0; x < p.width + spacing; x += spacing) {
          p.line(x, groundScreenY, x - 14, groundScreenY + 14);
        }
        p.noStroke();
      };

      const drawWall = (p) => {
        const anchorScreenX = toPixels(springRef.current.anchor.x);
        const wallHeight = p.height;

        p.noStroke();
        p.fill(100, 100, 110, 180);
        p.rect(0, 0, anchorScreenX, wallHeight);

        p.stroke(140, 140, 150, 120);
        p.strokeWeight(1);
        const spacing = 18;
        for (let y = -wallHeight; y < wallHeight * 2; y += spacing) {
          p.line(0, y, anchorScreenX, y + anchorScreenX);
        }

        p.stroke(200, 200, 210, 220);
        p.strokeWeight(2);
        p.line(anchorScreenX, 0, anchorScreenX, wallHeight);
        p.noStroke();
      };

      // ── Mouse interaction

      p.mousePressed = () => {
        const mousePhysics = p.createVector(
          toMeters(p.mouseX),
          screenYToPhysicsY(p.mouseY)
        );
        dragControllerRef.current.handlePress(p, bodyRef.current, mousePhysics);
      };

      p.mouseDragged = () => {
        if (dragControllerRef.current.isDragging()) {
          // Horizontal drag only — clamp X to valid range
          const { minCompressionLength } = inputsRef.current;
          const anchorX = springRef.current.anchor.x;
          const rawX = toMeters(p.mouseX);
          const clampedX = Math.max(anchorX + minCompressionLength, rawX);
          bodyRef.current.state.position.set(clampedX, GROUND_Y);
          bodyRef.current.state.velocity.set(0, 0); // clear velocity while dragging
        }
      };

      p.mouseReleased = () => dragControllerRef.current.handleRelease();

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
        resetTime();
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loaded) => {
        setInputs(loaded);
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
      <div className="flex-1 relative">
        <P5Wrapper sketch={sketch} key={resetVersion} />
        <div className="absolute top-4 right-4 w-[300px]">
          <SimInfoPanel data={simData} />
        </div>
      </div>
    </SimulationLayout>
  );
}
