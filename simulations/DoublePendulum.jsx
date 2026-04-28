// simulations/DoublePendulum.jsx
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
  toPixels,
  toMeters,
  physicsYToScreenY,
} from "../app/(core)/constants/Utils.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/DoublePendulum.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

/**
 * Double Pendulum state
 * Uses RK4 integration for accuracy
 */
class DoublePendulumSystem {
  constructor(angle1, angle2, angVel1, angVel2) {
    this.angle1 = angle1;
    this.angle2 = angle2;
    this.angVel1 = angVel1;
    this.angVel2 = angVel2;
  }

  static derivatives(state, m1, m2, L1, L2, g, damping) {
    const { angle1, angle2, angVel1, angVel2 } = state;
    const d = angle1 - angle2;

    const denom1 = 2 * m1 + m2 - m2 * Math.cos(2 * d);
    const denom2 = (L2 / L1) * denom1;

    const acc1 =
      (-g * (2 * m1 + m2) * Math.sin(angle1) -
        m2 * g * Math.sin(angle1 - 2 * angle2) -
        2 *
          Math.sin(d) *
          m2 *
          (angVel2 ** 2 * L2 + angVel1 ** 2 * L1 * Math.cos(d)) -
        damping * angVel1) /
      (L1 * denom1);

    const acc2 =
      (2 *
        Math.sin(d) *
        (angVel1 ** 2 * L1 * (m1 + m2) +
          g * (m1 + m2) * Math.cos(angle1) +
          angVel2 ** 2 * L2 * m2 * Math.cos(d)) -
        damping * angVel2) /
      (L2 * denom2);

    return {
      angle1: angVel1,
      angle2: angVel2,
      angVel1: acc1,
      angVel2: acc2,
    };
  }

  static rk4Step(state, m1, m2, L1, L2, g, damping, dt) {
    const deriv = (s) =>
      DoublePendulumSystem.derivatives(s, m1, m2, L1, L2, g, damping);

    const add = (s, d, h) => ({
      angle1: s.angle1 + d.angle1 * h,
      angle2: s.angle2 + d.angle2 * h,
      angVel1: s.angVel1 + d.angVel1 * h,
      angVel2: s.angVel2 + d.angVel2 * h,
    });

    const k1 = deriv(state);
    const k2 = deriv(add(state, k1, dt / 2));
    const k3 = deriv(add(state, k2, dt / 2));
    const k4 = deriv(add(state, k3, dt));

    return new DoublePendulumSystem(
      state.angle1 +
        (dt / 6) * (k1.angle1 + 2 * k2.angle1 + 2 * k3.angle1 + k4.angle1),
      state.angle2 +
        (dt / 6) * (k1.angle2 + 2 * k2.angle2 + 2 * k3.angle2 + k4.angle2),
      state.angVel1 +
        (dt / 6) * (k1.angVel1 + 2 * k2.angVel1 + 2 * k3.angVel1 + k4.angVel1),
      state.angVel2 +
        (dt / 6) * (k1.angVel2 + 2 * k2.angVel2 + 2 * k3.angVel2 + k4.angVel2)
    );
  }

  getPositions(anchorX, anchorY, L1, L2) {
    const x1 = anchorX + L1 * Math.sin(this.angle1);
    const y1 = anchorY - L1 * Math.cos(this.angle1);
    const x2 = x1 + L2 * Math.sin(this.angle2);
    const y2 = y1 - L2 * Math.cos(this.angle2);
    return { x1, y1, x2, y2 };
  }

  getKineticEnergy(m1, m2, L1, L2) {
    const { angle1, angle2, angVel1, angVel2 } = this;
    const v1sq = (L1 * angVel1) ** 2;
    const v2sq =
      (L1 * angVel1) ** 2 +
      (L2 * angVel2) ** 2 +
      2 * L1 * L2 * angVel1 * angVel2 * Math.cos(angle1 - angle2);
    return 0.5 * m1 * v1sq + 0.5 * m2 * v2sq;
  }

  getPotentialEnergy(m1, m2, L1, L2, g, anchorY) {
    const y1 = anchorY - L1 * Math.cos(this.angle1);
    const y2 = y1 - L2 * Math.cos(this.angle2);
    return -m1 * g * y1 - m2 * g * y2;
  }
}

export default function DoublePendulum() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  const systemRef = useRef(null);
  const anchorRef = useRef({ x: 0, y: 0 });
  const scaledLengthsRef = useRef({ L1: 1, L2: 1 });
  const trailRef = useRef([]);

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

        // Anchor near the top-center
        const anchorYpx = h * 0.55;
        anchorRef.current = {
          x: toMeters(w / 2),
          y: toMeters(anchorYpx),
        };

        // Scale arms so L1+L2 fits within 80% of the remaining canvas height
        const L1 = inputsRef.current.length1;
        const L2 = inputsRef.current.length2;
        const totalPx = toPixels(L1 + L2);
        const maxPx = (h - anchorYpx) * 0.8;
        const scale = totalPx > maxPx ? maxPx / totalPx : 1;

        scaledLengthsRef.current = {
          L1: L1 * scale,
          L2: L2 * scale,
        };

        const angle1 = (inputsRef.current.initialAngle1 * Math.PI) / 180;
        const angle2 = (inputsRef.current.initialAngle2 * Math.PI) / 180;

        systemRef.current = new DoublePendulumSystem(angle1, angle2, 0, 0);
        trailRef.current = [];
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
        if (!systemRef.current) return;

        const dt = computeDelta(p);
        const inp = inputsRef.current;
        const { L1, L2 } = scaledLengthsRef.current;

        if (dt > 0) {
          const subSteps = 8;
          const subDt = dt / subSteps;
          for (let i = 0; i < subSteps; i++) {
            systemRef.current = DoublePendulumSystem.rk4Step(
              systemRef.current,
              inp.mass1,
              inp.mass2,
              L1,
              L2,
              inp.gravity,
              inp.damping,
              subDt
            );
          }
        }

        const { x1, y1, x2, y2 } = systemRef.current.getPositions(
          anchorRef.current.x,
          anchorRef.current.y,
          L1,
          L2
        );

        if (inp.trailEnabled) {
          trailRef.current.push({
            x: toPixels(x2),
            y: physicsYToScreenY(y2),
          });
          if (trailRef.current.length > 600) {
            trailRef.current.shift();
          }
        } else {
          trailRef.current = [];
        }

        renderScene(p, x1, y1, x2, y2);

        const ke = systemRef.current.getKineticEnergy(
          inp.mass1,
          inp.mass2,
          L1,
          L2
        );
        const pe = systemRef.current.getPotentialEnergy(
          inp.mass1,
          inp.mass2,
          L1,
          L2,
          inp.gravity,
          anchorRef.current.y
        );

        updateSimInfo(
          p,
          {
            angle1: systemRef.current.angle1,
            angle2: systemRef.current.angle2,
            angularVel1: systemRef.current.angVel1,
            angularVel2: systemRef.current.angVel2,
            kineticEnergy: ke,
            potentialEnergy: pe,
          },
          {},
          SimInfoMapper
        );
      };

      const renderScene = (p, x1, y1, x2, y2) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];
        const inp = inputsRef.current;

        if (!inp.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.fill(r, g, b, 30);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        const trail = trailRef.current;
        if (trail.length > 1) {
          for (let i = 1; i < trail.length; i++) {
            const alpha = Math.floor((i / trail.length) * 200);
            trailLayer.stroke(
              `${inp.bob2Color}${alpha.toString(16).padStart(2, "0")}`
            );
            trailLayer.strokeWeight(1.5);
            trailLayer.line(
              trail[i - 1].x,
              trail[i - 1].y,
              trail[i].x,
              trail[i].y
            );
          }
        }

        p.clear();
        p.image(trailLayer, 0, 0);

        const ax = toPixels(anchorRef.current.x);
        const ay = physicsYToScreenY(anchorRef.current.y);
        const sx1 = toPixels(x1);
        const sy1 = physicsYToScreenY(y1);
        const sx2 = toPixels(x2);
        const sy2 = physicsYToScreenY(y2);

        // Anchor
        p.fill(150);
        p.noStroke();
        p.circle(ax, ay, 12);

        // Rod 1
        p.stroke(inp.ropeColor);
        p.strokeWeight(2);
        p.line(ax, ay, sx1, sy1);

        // Bob 1
        const r1 = 10 + inp.mass1 * 4;
        p.fill(inp.bob1Color);
        p.noStroke();
        p.circle(sx1, sy1, r1 * 2);

        // Rod 2
        p.stroke(inp.ropeColor);
        p.strokeWeight(2);
        p.line(sx1, sy1, sx2, sy2);

        // Bob 2
        const r2 = 10 + inp.mass2 * 4;
        p.fill(inp.bob2Color);
        p.noStroke();
        p.circle(sx2, sy2, r2 * 2);
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
