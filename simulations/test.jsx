// app/pages/simulations/test.jsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- Core Physics & Constants ---
import { toMeters, toPixels } from "../app/(core)/constants/Utils.js";
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
  setTimeScale,
  getTimeScale,
} from "../app/(core)/constants/Time.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  PHYSICS_CONTROLS,
  VISUALIZATION_CONTROLS,
  SimInfoMapper,
  LEARNING_OBJECTIVES,
  PHYSICS_EQUATIONS,
  GUIDED_EXPERIMENTS,
} from "../app/(core)/data/configs/test.js";
import chapters from "../app/(core)/data/chapters.js";

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
  const [warnings, setWarnings] = useState([]);
  const [selectedBodyIndex, setSelectedBodyIndex] = useState(0);
  const randomSeedRef = useRef(0);

  // Initialize time scale
  useEffect(() => {
    setTimeScale(inputs.timeScale || 1.0);
  }, []);

  const initialEnergyRef = useRef(null);
  const { simData, updateSimInfo } = useSimInfo({ customRefs: { initialEnergyRef } });
  const bodiesRef = useRef([]);
  const trailLayerRef = useRef(null);
  const lastEnergyRef = useRef(null);
  const lastMassRef = useRef(null);

  // 🔧 Gestione input
  const handleInputChange = useCallback(
    (name, value) => {
      setInputs((prev) => ({ ...prev, [name]: value }));
      
      // Update time scale if changed
      if (name === "timeScale") {
        setTimeScale(value);
      }
      
      // Update random seed if deterministic mode is enabled
      if (name === "deterministic" && value) {
        randomSeedRef.current = inputs.randomSeed || 0;
      }
    },
    [setInputs, inputs.randomSeed]
  );

  // Apply experiment parameters
  const handleApplyExperiment = useCallback(
    (params) => {
      setInputs((prev) => ({ ...prev, ...params }));
      setResetVersion((v) => v + 1);
    },
    [setInputs]
  );

  // Check for physics warnings
  useEffect(() => {
    const newWarnings = [];
    
    // Check for numerical instability with many bodies
    if (inputs.numBodies > 50) {
      newWarnings.push({
        id: "many-bodies",
        message: `⚠ Large number of bodies (${inputs.numBodies}) may cause numerical instability`,
        severity: "warning",
      });
    }
    
    // Check for energy drift (if we have energy data)
    if (lastEnergyRef.current && simData["Total Energy"]) {
      const currentEnergy = parseFloat(simData["Total Energy"].replace(" J", ""));
      const energyDiff = Math.abs(currentEnergy - lastEnergyRef.current);
      const energyPercentChange = (energyDiff / lastEnergyRef.current) * 100;
      
      if (energyPercentChange > 5 && lastEnergyRef.current > 0.01) {
        newWarnings.push({
          id: "energy-drift",
          message: `⚠ Energy not conserved (${energyPercentChange.toFixed(1)}% change)`,
          severity: "warning",
        });
      }
      
      lastEnergyRef.current = currentEnergy;
    } else if (simData["Total Energy"]) {
      lastEnergyRef.current = parseFloat(simData["Total Energy"].replace(" J", ""));
    }
    
    setWarnings(newWarnings);
  }, [inputs.numBodies, simData]);

  // 📚 Teoria associata
  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location)?.theory,
    [location]
  );

  // 🔄 Funzione per creare corpi con seed deterministico
  const createBodies = useCallback((p, numBodies, params) => {
    const { mass, size, gravity, restitution, frictionMu, deterministic, randomSeed } = params;
    const { clientWidth: w, clientHeight: h } = p._userNode;

    // Set random seed if deterministic
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

  // 🎨 Inizializza layer trail
  const initTrailLayer = useCallback((p, w, h) => {
    const layer = p.createGraphics(w, h);
    layer.pixelDensity(1);
    layer.clear();
    return layer;
  }, []);

  // 🖌️ Sketch P5
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
        const frameStart = performance.now();
        const { gravity, numBodies, trailEnabled, trailLength } = inputsRef.current;
        const dt = computeDelta(p);
        if (dt <= 0) return;

        // 🔄 Ricrea corpi se numBodies cambia
        if (numBodies !== lastNumBodies) {
          bodiesRef.current = createBodies(p, numBodies, inputsRef.current);
          lastNumBodies = numBodies;
        }

        // Performance tracking: Update phase
        const updateStart = performance.now();
        
        p.clear();
        p.image(trailLayerRef.current, 0, 0);

        // Handle mass changes with momentum conservation
        const currentMass = inputsRef.current.mass;
        const massChanged = lastMassRef.current !== null && 
                           Math.abs(lastMassRef.current - currentMass) > 0.001;
        
        bodiesRef.current.forEach((body, i) => {
          body.params.gravity = gravity;
          
          // If mass input changed, update each body's mass proportionally while conserving momentum
          if (massChanged && lastMassRef.current > 0) {
            // Calculate the mass ratio (how much the base mass changed)
            const massRatio = currentMass / lastMassRef.current;
            
            // Store old mass and momentum
            const oldMass = body.params.mass;
            const momentumX = body.state.vel.x * oldMass;
            const momentumY = body.state.vel.y * oldMass;
            
            // Update mass proportionally (maintains the random variation)
            body.params.mass = oldMass * massRatio;
            
            // Conserve momentum: p = mv = constant
            // v_new = p / m_new = (v_old * m_old) / m_new
            if (body.params.mass > 0) {
              body.state.vel.x = momentumX / body.params.mass;
              body.state.vel.y = momentumY / body.params.mass;
            }
          }
          
          // Apply energy dissipation if enabled
          if (inputsRef.current.energyDissipation && inputsRef.current.dampingCoefficient < 1.0) {
            // Apply damping to velocity to gradually reduce energy
            body.state.vel.mult(inputsRef.current.dampingCoefficient);
          }
          body.step(p, dt);
        });
        
        // Update last mass reference
        lastMassRef.current = currentMass;
        
        const updateEnd = performance.now();
        const updateTime = updateEnd - updateStart;

        // Performance tracking: Render phase
        const renderStart = performance.now();
        
        bodiesRef.current.forEach((body, i) => {
          const { pos } = body.state;
          const pixelX = toPixels(pos.x);
          const pixelY = toPixels(pos.y);
          const bodySizePx = toPixels(body.params.size);

          drawBallWithTrail(p, trailLayerRef.current, {
            bg: getBackgroundColor(),
            trailEnabled,
            trailAlpha: 60,
            trailLength: trailLength || 100,
            pixelX,
            pixelY,
            size: bodySizePx,
            isHover: body.isHover(p),
            ballColor: body.params.color,
          });
        });
        
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        
        // Update sim info with performance metrics (only once per frame)
        if (bodiesRef.current.length > 0) {
          updateSimInfo(p, {}, { 
            p, 
            bodies: bodiesRef.current,
            performanceMetrics: {
              frameTime,
              updateTime,
              renderTime,
            }
          }, SimInfoMapper);
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
        // Update random seed if deterministic
        if (inputs.deterministic) {
          randomSeedRef.current = inputs.randomSeed || Date.now();
        } else {
          randomSeedRef.current = Date.now();
        }
        lastEnergyRef.current = null; // Reset energy tracking
        initialEnergyRef.current = null; // Reset initial energy for conservation tracking
        lastMassRef.current = null; // Reset mass tracking
        // Reset collision counts for all bodies
        bodiesRef.current.forEach(body => {
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
      theory={theory}
      hideDefaultControls={false}
      dynamicInputs={
        <>
          {/* Enhanced Controls Panel */}
          <div className="simulation-controls-panel enhanced-controls">
            <div className="controls-row physics-controls">
              <h3 className="controls-row-title">
                <span className="title-icon">⚙️</span>
                Physics Parameters
              </h3>
              <div className="controls-content">
                <DynamicInputs
                  config={PHYSICS_CONTROLS}
                  values={inputs}
                  onChange={handleInputChange}
                  grouped={false}
                />
              </div>
            </div>

            <div className="controls-row visualization-controls">
              <h3 className="controls-row-title">
                <span className="title-icon">🎨</span>
                Visualization & Simulation
              </h3>
              <div className="controls-content">
                <DynamicInputs
                  config={VISUALIZATION_CONTROLS}
                  values={inputs}
                  onChange={handleInputChange}
                  grouped={false}
                />
                <div className="inputs-container advanced-controls">
                  <div className="control-group">
                    <NumberInput
                      name="timeScale"
                      label="Time Scale:"
                      val={inputs.timeScale || 1.0}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        handleInputChange("timeScale", value);
                        setTimeScale(value);
                      }}
                    />
                  </div>
                  <div className="control-group">
                    <CheckboxInput
                      name="deterministic"
                      label="Deterministic Mode"
                      checked={inputs.deterministic || false}
                      onChange={(e) => handleInputChange("deterministic", e.target.checked)}
                    />
                    {inputs.deterministic && (
                      <NumberInput
                        name="randomSeed"
                        label="Random Seed:"
                        val={inputs.randomSeed || randomSeedRef.current}
                        min={0}
                        max={999999}
                        step={1}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          handleInputChange("randomSeed", value);
                          randomSeedRef.current = value;
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Guide & Theory Section */}
          <CollapsibleSection
            title="Learning Guide & Theory"
            defaultExpanded={false}
            icon={<FontAwesomeIcon icon={faBook} />}
            className="educational-section"
          >
            <div className="educational-content">
              <LearningObjectives
                title={LEARNING_OBJECTIVES.title}
                goals={LEARNING_OBJECTIVES.goals}
                variables={LEARNING_OBJECTIVES.variables}
              />
              
              <PhysicsEquations equations={PHYSICS_EQUATIONS} />
              
              {warnings.length > 0 && <PhysicsWarnings warnings={warnings} />}
            </div>
          </CollapsibleSection>

          {/* Guided Experiments Section - Separate */}
          <CollapsibleSection
            title="Guided Experiments"
            defaultExpanded={false}
            icon={<FontAwesomeIcon icon={faFlask} />}
            className="experiments-section"
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
