// app/pages/simulations/test.jsx
"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
  setTimeScale,
} from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
  LEARNING_OBJECTIVES,
  PHYSICS_EQUATIONS,
  GUIDED_EXPERIMENTS,
} from "../app/(core)/data/configs/test.js";

// --- Reusable UI Components ---
import SimulationLayout from "../app/(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../app/(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../app/(core)/components/inputs/DynamicInputs.jsx";
import NumberInput from "../app/(core)/components/inputs/NumberInput.jsx";
import CheckboxInput from "../app/(core)/components/inputs/CheckboxInput.jsx";
import SimInfoPanel from "../app/(core)/components/SimInfoPanel.jsx";
import LearningObjectives from "../app/(core)/components/LearningObjectives.tsx";
import PhysicsEquations from "../app/(core)/components/PhysicsEquations.tsx";
import PhysicsWarnings from "../app/(core)/components/PhysicsWarnings.tsx";
import GuidedExperiments from "../app/(core)/components/GuidedExperiments.tsx";
import CollapsibleSection from "../app/(core)/components/CollapsibleSection.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faFlask } from "@fortawesome/free-solid-svg-icons";

// --- Hooks & Utils ---
import useSimulationState from "../app/(core)/hooks/useSimulationState.ts";
import useSimInfo from "../app/(core)/hooks/useSimInfo.ts";
import { drawBallWithTrail } from "../app/(core)/utils/drawUtils.js";
import getBackgroundColor from "../app/(core)/utils/getBackgroundColor.ts";

// --- Centralized Body class ---
import Body from "../app/(core)/physics/Body.ts";

export default function Test() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );

  const [resetVersion, setResetVersion] = useState(0);
  const [currentSeed, setCurrentSeed] = useState(0);
  const randomSeedRef = useRef(0);

  // Initialize time scale
  useEffect(() => {
    setTimeScale(inputs.timeScale || 1.0);
  }, [inputs.timeScale]);

  const initialEnergyRef = useRef(null);
  const { simData, updateSimInfo } = useSimInfo({
    customRefs: { initialEnergyRef },
  });

  // ✅ Derived energy (no setState-in-effect)
  const lastEnergy = useMemo(() => {
    if (!simData["Total Energy"]) return null;
    return parseFloat(simData["Total Energy"].replace(" J", ""));
  }, [simData]);

  const warnings = useMemo(() => {
    const newWarnings = [];

    if (inputs.numBodies > 50) {
      newWarnings.push({
        id: "many-bodies",
        message: `⚠ Large number of bodies (${inputs.numBodies}) may cause numerical instability`,
        severity: "warning",
      });
    }

    if (lastEnergy && simData["Total Energy"]) {
      const currentEnergy = parseFloat(
        simData["Total Energy"].replace(" J", "")
      );
      const energyDiff = Math.abs(currentEnergy - lastEnergy);
      const energyPercentChange = (energyDiff / lastEnergy) * 100;

      if (energyPercentChange > 5 && lastEnergy > 0.01) {
        newWarnings.push({
          id: "energy-drift",
          message: `⚠ Energy not conserved (${energyPercentChange.toFixed(
            1
          )}% change)`,
          severity: "warning",
        });
      }
    }

    return newWarnings;
  }, [inputs.numBodies, simData, lastEnergy]);

  const bodiesRef = useRef([]);
  const trailLayerRef = useRef(null);
  const lastMassRef = useRef(null);

  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));

      if (name === "timeScale") {
        setTimeScale(value);
      }

      if (name === "deterministic" && value) {
        randomSeedRef.current = inputs.randomSeed || 0;
      }
    },
    [setInputs, inputs.randomSeed]
  );

  const handleApplyExperiment = useCallback(
    (params) => {
      setInputs((prev) => ({ ...prev, ...params }));
      setResetVersion((v) => v + 1);
    },
    [setInputs]
  );

  const createBodies = useCallback((p, numBodies, params) => {
    const {
      mass,
      size,
      gravity,
      restitution,
      frictionMu,
      deterministic,
      randomSeed,
    } = params;
    const { clientWidth: w, clientHeight: h } = p._userNode;

    if (deterministic) {
      p.randomSeed(randomSeed || randomSeedRef.current);
    }

    return Array.from({ length: numBodies }, () => {
      const randomColor = p.color(
        p.random(0, 255),
        p.random(0, 255),
        p.random(0, 255)
      );
      const randomX = toMeters(p.random(50, w - 50));
      const randomY = toMeters(p.random(50, h / 2));

      return new Body(
        p,
        {
          mass: mass * p.random(0.5, 2),
          size: size * p.random(0.5, 1.5),
          gravity,
          restitution,
          frictionMu,
          color: randomColor,
        },
        p.createVector(randomX, randomY)
      );
    });
  }, []);

  const initTrailLayer = useCallback((p, w, h) => {
    const layer = p.createGraphics(w, h);
    layer.pixelDensity(1);
    layer.clear();
    return layer;
  }, []);

  const sketch = useCallback(
    (p) => {
      let lastNumBodies = inputsRef.current.numBodies;

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        trailLayerRef.current = initTrailLayer(p, w, h);
        bodiesRef.current = createBodies(
          p,
          inputsRef.current.numBodies,
          inputsRef.current
        );
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        const dt = computeDelta(p);
        if (dt <= 0) return;

        const { gravity, numBodies, trailEnabled, trailLength } =
          inputsRef.current;

        if (numBodies !== lastNumBodies) {
          bodiesRef.current = createBodies(p, numBodies, inputsRef.current);
          lastNumBodies = numBodies;
        }

        p.clear();
        p.image(trailLayerRef.current, 0, 0);

        const currentMass = inputsRef.current.mass;
        const massChanged =
          lastMassRef.current !== null &&
          Math.abs(lastMassRef.current - currentMass) > 0.001;

        bodiesRef.current.forEach((body) => {
          body.params.gravity = gravity;

          if (massChanged && lastMassRef.current > 0) {
            const massRatio = currentMass / lastMassRef.current;
            const oldMass = body.params.mass;
            const momentumX = body.state.vel.x * oldMass;
            const momentumY = body.state.vel.y * oldMass;

            body.params.mass = oldMass * massRatio;

            if (body.params.mass > 0) {
              body.state.vel.x = momentumX / body.params.mass;
              body.state.vel.y = momentumY / body.params.mass;
            }
          }

          if (
            inputsRef.current.energyDissipation &&
            inputsRef.current.dampingCoefficient < 1.0
          ) {
            body.state.vel.mult(inputsRef.current.dampingCoefficient);
          }

          body.step(p, dt);
        });

        lastMassRef.current = currentMass;

        bodiesRef.current.forEach((body) => {
          const { pos } = body.state;
          drawBallWithTrail(p, trailLayerRef.current, {
            bg: getBackgroundColor(),
            trailEnabled,
            trailAlpha: 60,
            trailLength: trailLength || 100,
            pixelX: toPixels(pos.x),
            pixelY: toPixels(pos.y),
            size: toPixels(body.params.size),
            isHover: body.isHover(p),
            ballColor: body.params.color,
          });
        });

        if (bodiesRef.current.length > 0) {
          updateSimInfo(p, {}, { p, bodies: bodiesRef.current }, SimInfoMapper);
        }
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
        trailLayerRef.current = initTrailLayer(p, w, h);
      };
    },
    [inputsRef, updateSimInfo, createBodies, initTrailLayer]
  );

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);

        randomSeedRef.current = inputs.deterministic
          ? inputs.randomSeed || Date.now()
          : Date.now();

        initialEnergyRef.current = null;
        lastMassRef.current = null;

        bodiesRef.current.forEach((body) => {
          body.collisionCount = 0;
          body.lastCollisionPos = null;
        });

        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      }}
      dynamicInputs={
        <>
          <DynamicInputs
            config={INPUT_FIELDS}
            values={inputs}
            onChange={handleInputChange}
            grouped
          />

          <div className="inputs-container">
            <NumberInput
              name="timeScale"
              label="Time Scale:"
              val={inputs.timeScale || 1.0}
              min={0.1}
              max={2.0}
              step={0.1}
              onChange={(e) =>
                handleInputChange("timeScale", Number(e.target.value))
              }
            />

            <CheckboxInput
              name="deterministic"
              label="Deterministic Mode"
              checked={inputs.deterministic || false}
              onChange={(e) =>
                handleInputChange("deterministic", e.target.checked)
              }
            />

            {inputs.deterministic && (
              <NumberInput
                name="randomSeed"
                label="Random Seed:"
                val={inputs.randomSeed || currentSeed}
                min={0}
                max={999999}
                step={1}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  handleInputChange("randomSeed", value);
                  setCurrentSeed(value);
                  randomSeedRef.current = value;
                }}
              />
            )}
          </div>

          <CollapsibleSection
            title="Learning Guide & Theory"
            icon={<FontAwesomeIcon icon={faBook} />}
          >
            <LearningObjectives {...LEARNING_OBJECTIVES} />
            <PhysicsEquations equations={PHYSICS_EQUATIONS} />
            {warnings.length > 0 && <PhysicsWarnings warnings={warnings} />}
          </CollapsibleSection>

          <CollapsibleSection
            title="Guided Experiments"
            icon={<FontAwesomeIcon icon={faFlask} />}
          >
            <GuidedExperiments
              experiments={GUIDED_EXPERIMENTS}
              onApplyExperiment={handleApplyExperiment}
            />
          </CollapsibleSection>
        </>
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
