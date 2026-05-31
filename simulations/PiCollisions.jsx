// app/pages/simulations/PiCollision.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

import { setCanvasHeight } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  isPaused,
  resetTime,
  setPause,
} from "../app/(core)/constants/Time.js";

import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/PiCollisions.js";

import chapters from "../app/(core)/data/chapters.js";

import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

const normalizePiCollisionInputs = (values) => {
  const normalized = {
    ...INITIAL_INPUTS,
    ...values,
  };

  if (values?.smallBlockMass === undefined && values?.smallMass !== undefined) {
    normalized.smallBlockMass = values.smallMass;
  }

  if (values?.largeBlockMass === undefined && values?.largeMass !== undefined) {
    normalized.largeBlockMass = values.largeMass;
  }

  if (
    values?.smallBlockVelocityInitial === undefined &&
    values?.smallVelocityInitial !== undefined
  ) {
    normalized.smallBlockVelocityInitial = values.smallVelocityInitial;
  }

  if (
    values?.smallBlockVelocityInitial === undefined &&
    values?.smallBlockInitialVelocity !== undefined
  ) {
    normalized.smallBlockVelocityInitial = values.smallBlockInitialVelocity;
  }

  if (
    values?.largeBlockVelocityInitial === undefined &&
    values?.largeVelocityInitial !== undefined
  ) {
    normalized.largeBlockVelocityInitial = values.largeVelocityInitial;
  }

  if (
    values?.largeBlockVelocityInitial === undefined &&
    values?.largeBlockInitialVelocity !== undefined
  ) {
    normalized.largeBlockVelocityInitial = values.largeBlockInitialVelocity;
  }

  if (
    values?.largeBlockColor === undefined &&
    values?.largeMBlockColor !== undefined
  ) {
    normalized.largeBlockColor = values.largeMBlockColor;
  }

  return normalized;
};

const RESET_ON_CHANGE_INPUTS = new Set([
  "smallBlockSize",
  "largeBlockSize",
  "smallBlockVelocityInitial",
  "largeBlockVelocityInitial",
  "wallGap",
]);

export default function CollisionSimulation() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );

  const [resetVersion, setResetVersion] = useState(0);

  const { simData, updateSimInfo, resetSimInfo } = useSimInfo();

  const smallBlockRef = useRef(null);
  const largeBlockRef = useRef(null);
  const totalCollisionsRef = useRef(0);
  const eventsLimitedRef = useRef(false);

  useEffect(() => {
    const normalizedInputs = normalizePiCollisionInputs(inputsRef.current);

    if (
      JSON.stringify(normalizedInputs) !== JSON.stringify(inputsRef.current)
    ) {
      setInputs(normalizedInputs);
      setResetVersion((v) => v + 1);
    }
  }, [inputsRef, setInputs]);

  const handleInputChange = useCallback(
    (name, value) => {
      const nextInputs = {
        ...inputsRef.current,
        [name]: value,
      };

      inputsRef.current = nextInputs;
      setInputs(nextInputs);

      if (RESET_ON_CHANGE_INPUTS.has(name)) {
        const wasPaused = isPaused();

        totalCollisionsRef.current = 0;
        eventsLimitedRef.current = false;
        resetSimInfo();
        resetTime();

        if (wasPaused) setPause(true);

        setResetVersion((v) => v + 1);
      }
    },
    [inputsRef, resetSimInfo, setInputs]
  );

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  const sketch = useCallback(
    (p) => {
      const PIXELS_PER_METER = 100;
      const EPSILON = 1e-12;
      const CONTACT_EPSILON = 1e-10;
      const MAX_EVENTS_PER_FRAME = 10000;
      let trailLayer = null;

      const metersToPixels = (meters) => meters * PIXELS_PER_METER;
      const pixelsToMeters = (pixels) => pixels / PIXELS_PER_METER;

      const getNumber = (value, fallback = 0) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
      };

      const getPositiveNumber = (value, fallback) => {
        return Math.max(EPSILON, getNumber(value, fallback));
      };

      const getBackground = () => {
        const bg = getBackgroundColor();
        return Array.isArray(bg) ? bg : [20, 20, 30];
      };

      const makeInfoBody = (block) => ({
        params: {
          id: block.id,
          mass: block.mass,
          size: block.size,
          color: block.color,
        },
        state: {
          position: {
            x: block.x,
            y: block.y,
          },
          velocity: {
            x: block.v,
            y: 0,
          },
        },
      });

      const updateInfoPanel = () => {
        updateSimInfo(
          p,
          {
            smallBlock: smallBlockRef.current
              ? makeInfoBody(smallBlockRef.current)
              : null,
            largeBlock: largeBlockRef.current
              ? makeInfoBody(largeBlockRef.current)
              : null,
            totalCollisions: totalCollisionsRef.current,
            eventsLimited: eventsLimitedRef.current,
          },
          {},
          SimInfoMapper
        );
      };

      const getBlockBottomY = () => p.height;

      const getBlockCenterYPixels = (sizeMeters) => {
        return getBlockBottomY() - metersToPixels(sizeMeters) / 2;
      };

      const syncLiveInputs = () => {
        if (!smallBlockRef.current || !largeBlockRef.current) return;

        smallBlockRef.current.mass = getPositiveNumber(
          inputsRef.current.smallBlockMass,
          1
        );

        largeBlockRef.current.mass = getPositiveNumber(
          inputsRef.current.largeBlockMass,
          100
        );

        smallBlockRef.current.color = inputsRef.current.smallBlockColor;
        largeBlockRef.current.color = inputsRef.current.largeBlockColor;
      };

      const resetTrailLayer = () => {
        if (!trailLayer) return;

        const [r, g, b] = getBackground();
        trailLayer.background(r, g, b);
      };

      const keepBlocksOnBottom = () => {
        if (!smallBlockRef.current || !largeBlockRef.current) return;

        smallBlockRef.current.y = pixelsToMeters(
          getBlockCenterYPixels(smallBlockRef.current.size)
        );

        largeBlockRef.current.y = pixelsToMeters(
          getBlockCenterYPixels(largeBlockRef.current.size)
        );
      };

      const setupSimulation = () => {
        const smallSize = getPositiveNumber(
          inputsRef.current.smallBlockSize,
          0.5
        );
        const largeSize = getPositiveNumber(
          inputsRef.current.largeBlockSize,
          1
        );

        const smallHalf = smallSize / 2;
        const wallGap = Math.max(
          0,
          getNumber(inputsRef.current.wallGap, INITIAL_INPUTS.wallGap)
        );
        const smallStartX = smallHalf + wallGap;
        const largeStartX = Math.max(
          smallStartX + smallHalf + largeSize / 2 + 0.5,
          pixelsToMeters(p.width * 0.72)
        );

        totalCollisionsRef.current = 0;
        eventsLimitedRef.current = false;

        smallBlockRef.current = {
          id: "Small Block",
          x: smallStartX,
          y: pixelsToMeters(getBlockCenterYPixels(smallSize)),
          v: getNumber(inputsRef.current.smallBlockVelocityInitial, 0),
          mass: getPositiveNumber(inputsRef.current.smallBlockMass, 1),
          size: smallSize,
          color: inputsRef.current.smallBlockColor,
        };

        largeBlockRef.current = {
          id: "Large Block",
          x: largeStartX,
          y: pixelsToMeters(getBlockCenterYPixels(largeSize)),
          v: -Math.abs(
            getNumber(inputsRef.current.largeBlockVelocityInitial, -1)
          ),
          mass: getPositiveNumber(inputsRef.current.largeBlockMass, 100),
          size: largeSize,
          color: inputsRef.current.largeBlockColor,
        };

        updateInfoPanel();
        resetTrailLayer();
      };

      const advanceBlocks = (dt) => {
        smallBlockRef.current.x += smallBlockRef.current.v * dt;
        largeBlockRef.current.x += largeBlockRef.current.v * dt;

        keepBlocksOnBottom();
      };

      const getTimeToLeftWallCollision = () => {
        const small = smallBlockRef.current;

        if (small.v >= 0) return Infinity;

        const leftEdge = small.x - small.size / 2;

        if (leftEdge <= 0) return 0;

        return (0 - leftEdge) / small.v;
      };

      const getTimeToBlockCollision = () => {
        const small = smallBlockRef.current;
        const large = largeBlockRef.current;

        const smallRightEdge = small.x + small.size / 2;
        const largeLeftEdge = large.x - large.size / 2;

        const gap = largeLeftEdge - smallRightEdge;
        const closingSpeed = small.v - large.v;

        if (closingSpeed <= EPSILON) return Infinity;
        if (gap <= CONTACT_EPSILON) return 0;

        return gap / closingSpeed;
      };

      const resolveLeftWallCollision = () => {
        const small = smallBlockRef.current;

        small.x = small.size / 2;

        if (small.v < 0) {
          small.v *= -1;
          totalCollisionsRef.current += 1;
        }
      };

      const resolveBlockCollision = () => {
        const small = smallBlockRef.current;
        const large = largeBlockRef.current;

        const m1 = small.mass;
        const m2 = large.mass;

        const v1 = small.v;
        const v2 = large.v;

        const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);

        small.v = newV1;
        large.v = newV2;

        large.x = small.x + small.size / 2 + large.size / 2;

        totalCollisionsRef.current += 1;
      };

      const simulateFrame = (dt) => {
        let remainingTime = dt;
        let eventsThisFrame = 0;
        eventsLimitedRef.current = false;

        while (
          remainingTime > EPSILON &&
          eventsThisFrame < MAX_EVENTS_PER_FRAME
        ) {
          const timeToWall = getTimeToLeftWallCollision();
          const timeToBlocks = getTimeToBlockCollision();

          const nextCollisionTime = Math.min(timeToWall, timeToBlocks);

          if (
            !Number.isFinite(nextCollisionTime) ||
            nextCollisionTime > remainingTime
          ) {
            advanceBlocks(remainingTime);
            remainingTime = 0;
            break;
          }

          const safeTime = Math.max(0, nextCollisionTime);

          advanceBlocks(safeTime);
          remainingTime -= safeTime;

          if (timeToWall <= timeToBlocks) {
            resolveLeftWallCollision();
          } else {
            resolveBlockCollision();
          }

          eventsThisFrame += 1;
        }

        if (eventsThisFrame >= MAX_EVENTS_PER_FRAME) {
          eventsLimitedRef.current = true;
        }

        keepBlocksOnBottom();
      };

      const drawBlock = (block) => {
        const sizePx = metersToPixels(block.size);
        const centerX = metersToPixels(block.x);
        const centerY = getBlockCenterYPixels(block.size);

        p.fill(block.color);
        p.noStroke();

        p.rectMode(p.CENTER);
        p.rect(centerX, centerY, sizePx, sizePx);

        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(p.width < 600 ? 12 : 16);
        p.textFont("Poppins");

        p.text(block.id, centerX, centerY - sizePx / 2 - 14);
      };

      const drawTrace = (block) => {
        if (!trailLayer) return;

        const sizePx = metersToPixels(block.size);
        const centerX = metersToPixels(block.x);
        const centerY = getBlockCenterYPixels(block.size);

        trailLayer.noStroke();
        trailLayer.fill(`${block.color}88`);
        trailLayer.rectMode(p.CENTER);
        trailLayer.rect(centerX, centerY, sizePx, sizePx);
      };

      const drawVelocityVector = (block) => {
        if (!inputsRef.current.showVectors) return;

        const centerX = metersToPixels(block.x);
        const centerY = getBlockCenterYPixels(block.size);
        const arrowLength = Math.max(-120, Math.min(120, block.v * 45));

        if (Math.abs(arrowLength) < 1) return;

        p.stroke(230);
        p.strokeWeight(2);
        p.line(centerX, centerY, centerX + arrowLength, centerY);

        const direction = Math.sign(arrowLength);
        const arrowX = centerX + arrowLength;

        p.line(arrowX, centerY, arrowX - direction * 10, centerY - 6);
        p.line(arrowX, centerY, arrowX - direction * 10, centerY + 6);
      };

      const renderScene = (recordTrace) => {
        const [r, g, b] = getBackground();

        if (trailLayer) {
          if (inputsRef.current.trailEnabled) {
            trailLayer.fill(r, g, b, 60);
            trailLayer.noStroke();
            trailLayer.rectMode(p.CORNER);
            trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);

            if (recordTrace) {
              if (smallBlockRef.current) drawTrace(smallBlockRef.current);
              if (largeBlockRef.current) drawTrace(largeBlockRef.current);
            }

            p.clear();
            p.image(trailLayer, 0, 0);
          } else {
            trailLayer.background(r, g, b);
            p.background(r, g, b);
          }
        } else {
          p.background(r, g, b);
        }

        const floorY = p.height - 1;

        p.stroke(150);
        p.strokeWeight(4);

        p.line(0, floorY, p.width, floorY);

        p.strokeWeight(5);
        p.line(0, p.height - 220, 0, p.height);

        if (smallBlockRef.current) {
          drawBlock(smallBlockRef.current);
          drawVelocityVector(smallBlockRef.current);
        }

        if (largeBlockRef.current) {
          drawBlock(largeBlockRef.current);
          drawVelocityVector(largeBlockRef.current);
        }
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;

        p.createCanvas(w, h);
        setCanvasHeight(h);

        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupSimulation();
      };

      p.draw = () => {
        if (!smallBlockRef.current || !largeBlockRef.current) return;

        const dt = computeDelta(p);
        const shouldStep = dt !== 0;

        if (shouldStep) {
          syncLiveInputs();
          simulateFrame(dt);
          updateInfoPanel();
        }

        renderScene(shouldStep);
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;

        p.resizeCanvas(w, h);
        setCanvasHeight(h);

        if (trailLayer) trailLayer.remove();
        trailLayer = p.createGraphics(w, h);
        trailLayer.pixelDensity(1);
        trailLayer.clear();

        setupSimulation();
      };
    },
    [inputsRef, updateSimInfo]
  );

  useEffect(() => {
    return () => {
      smallBlockRef.current = null;
      largeBlockRef.current = null;
      totalCollisionsRef.current = 0;
      eventsLimitedRef.current = false;
    };
  }, []);

  const handleReset = useCallback(() => {
    const wasPaused = isPaused();

    totalCollisionsRef.current = 0;
    eventsLimitedRef.current = false;
    resetSimInfo();

    resetTime();

    if (wasPaused) setPause(true);

    setResetVersion((v) => v + 1);
  }, [resetSimInfo]);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={handleReset}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(normalizePiCollisionInputs(loadedInputs));
        totalCollisionsRef.current = 0;
        eventsLimitedRef.current = false;
        resetSimInfo();
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
