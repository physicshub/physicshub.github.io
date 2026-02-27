// app/pages/simulations/SimplePendulum.jsx
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
import { toPixels, toMeters } from "../app/(core)/constants/Utils.js";

// --- Physics Classes ---
import PhysicsBody from "../app/(core)/physics/PhysicsBody.js";
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

// Configuration
const INITIAL_INPUTS = {
  length: 3,
  mass: 1,
  gravity: 9.81,
  damping: 0.1,
  initialAngle: 45,
  showForces: true,
  showComponents: false,
  trailEnabled: true,
  bobColor: "#3b82f6",
  ropeColor: "#9ca3af",
};

const INPUT_FIELDS = [
  {
    name: "length",
    label: "Length (m)",
    type: "number",
    min: 1,
    max: 5,
    step: 0.1,
  },
  {
    name: "mass",
    label: "Mass (kg)",
    type: "number",
    min: 0.5,
    max: 5,
    step: 0.1,
  },
  {
    name: "gravity",
    label: "Gravity (m/s²)",
    type: "number",
    min: 1,
    max: 20,
    step: 0.1,
  },
  {
    name: "damping",
    label: "Damping",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "initialAngle",
    label: "Initial Angle (°)",
    type: "number",
    min: -90,
    max: 90,
    step: 1,
  },
  {
    name: "showForces",
    label: "Show Forces",
    type: "checkbox",
  },
  {
    name: "showComponents",
    label: "Show Components",
    type: "checkbox",
  },
  {
    name: "trailEnabled",
    label: "Show Trail",
    type: "checkbox",
  },
  {
    name: "bobColor",
    label: "Bob Color",
    type: "color",
  },
  {
    name: "ropeColor",
    label: "Rope Color",
    type: "color",
  },
];

const SimInfoMapper = (bodyState) => {
  const angle =
    (Math.atan2(bodyState.position.x, -bodyState.position.y) * 180) / Math.PI;

  return {
    Angle: `${angle.toFixed(1)}°`,
    "Angular Velocity": `${bodyState.angularVel.toFixed(2)} rad/s`,
    Height: `${(-bodyState.position.y).toFixed(2)} m`,
    Speed: `${bodyState.velocity.mag().toFixed(2)} m/s`,
    KE: `${bodyState.kineticEnergy.toFixed(2)} J`,
    PE: `${bodyState.potentialEnergy.toFixed(2)} J`,
    "Total E": `${(bodyState.kineticEnergy + bodyState.potentialEnergy).toFixed(2)} J`,
  };
};

/**
 * Pendulum Body - extends PhysicsBody with constraint to fixed anchor
 */
class PendulumBody extends PhysicsBody {
  constructor(p, params, anchorX, anchorY, length) {
    super(p, params);
    this.anchor = p.createVector(anchorX, anchorY);
    this.length = length;
    this.angularVel = 0;
  }

  /**
   * Update using pendulum physics with constraint
   */
  stepPendulum(dt, gravity, damping) {
    if (dt <= 0) return;

    // Get current angle from vertical
    const dx = this.state.position.x - this.anchor.x;
    const dy = this.state.position.y - this.anchor.y;
    const angle = Math.atan2(dx, dy);

    // Angular acceleration: α = -(g/L) * sin(θ) - damping * ω
    const angularAcc =
      -(gravity / this.length) * Math.sin(angle) - damping * this.angularVel;

    // Update angular velocity
    this.angularVel += angularAcc * dt;

    // Update angle
    const newAngle = angle + this.angularVel * dt;

    // Constrain position to circular path
    this.state.position.x = this.anchor.x + this.length * Math.sin(newAngle);
    this.state.position.y = this.anchor.y + this.length * Math.cos(newAngle);

    // Update linear velocity (tangent to circular path)
    const speed = this.angularVel * this.length;
    this.state.velocity.x = speed * Math.cos(newAngle);
    this.state.velocity.y = -speed * Math.sin(newAngle);

    // Update moving state
    this.isMoving = Math.abs(this.angularVel) > 0.001;

    // Update trail
    if (this.trail.enabled) {
      this.updateTrail();
    }
  }

  /**
   * Set angle directly (for dragging)
   */
  setAngle(angleRad) {
    this.state.position.x = this.anchor.x + this.length * Math.sin(angleRad);
    this.state.position.y = this.anchor.y + this.length * Math.cos(angleRad);
    this.angularVel = 0;
    this.state.velocity.set(0, 0);
  }

  /**
   * Get current angle from vertical
   */
  getAngle() {
    const dx = this.state.position.x - this.anchor.x;
    const dy = this.state.position.y - this.anchor.y;
    return Math.atan2(dx, dy);
  }

  /**
   * Calculate forces on pendulum
   */
  calculateForces(gravity) {
    const angle = this.getAngle();

    // Weight (downward)
    const weight = this.params.mass * gravity;

    // Weight components
    const weightTangent = -weight * Math.sin(angle); // Tangent to arc
    const weightRadial = weight * Math.cos(angle); // Toward anchor

    // Tension (must balance radial component + centripetal)
    const speed = this.angularVel * this.length;
    const centripetal = (this.params.mass * speed * speed) / this.length;
    const tension = weightRadial + centripetal;

    return {
      weight: { magnitude: weight },
      tension: { magnitude: tension },
      weightTangent,
      weightRadial,
      angle,
    };
  }

  /**
   * Get potential energy (relative to lowest point)
   */
  getPotentialEnergy(gravity) {
    const lowestY = this.anchor.y + this.length;
    return this.params.mass * gravity * (lowestY - this.state.position.y);
  }
}

export default function Pendulum() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");

  const { inputs, setInputs, inputsRef } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  const [resetVersion, setResetVersion] = useState(0);

  // References
  const bodyRef = useRef(null);
  const anchorRef = useRef({ x: 0, y: 0 });
  const forceRendererRef = useRef(null);
  const dragControllerRef = useRef(null);

  // Sim info
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

        // Setup anchor point
        anchorRef.current = {
          x: toMeters(w / 2),
          y: toMeters(h * 0.2),
        };

        // Calculate initial position
        const angleRad = (inputsRef.current.initialAngle * Math.PI) / 180;
        const length = inputsRef.current.length;
        const initialX = anchorRef.current.x + length * Math.sin(angleRad);
        const initialY = anchorRef.current.y + length * Math.cos(angleRad);

        // Initialize body
        if (!bodyRef.current) {
          bodyRef.current = new PendulumBody(
            p,
            {
              mass: inputsRef.current.mass,
              size: 0.3,
              color: inputsRef.current.bobColor,
              shape: "circle",
            },
            anchorRef.current.x,
            anchorRef.current.y,
            length
          );

          bodyRef.current.state.position.set(initialX, initialY);
          bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
          bodyRef.current.trail.maxLength = 200;
        } else {
          bodyRef.current.anchor.set(anchorRef.current.x, anchorRef.current.y);
          bodyRef.current.length = length;
          bodyRef.current.state.position.set(initialX, initialY);
          bodyRef.current.angularVel = 0;
          bodyRef.current.clearTrail();
        }

        // Initialize force renderer
        if (!forceRendererRef.current) {
          forceRendererRef.current = new ForceRenderer({
            scale: 10,
            showLabels: true,
            showMagnitude: true,
            colors: {
              weight: "#ef4444",
              tension: "#06b6d4",
              component: "#fca5a5",
            },
          });
        }

        // Initialize drag controller
        if (!dragControllerRef.current) {
          dragControllerRef.current = new DragController({
            snapBack: false,
          });
        }
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
        if (!bodyRef.current) return;

        const dt = computeDelta(p);

        // Sync body parameters
        bodyRef.current.updateParams({
          mass: inputsRef.current.mass,
          color: inputsRef.current.bobColor,
        });
        bodyRef.current.length = inputsRef.current.length;
        bodyRef.current.trail.enabled = inputsRef.current.trailEnabled;
        bodyRef.current.trail.color = inputsRef.current.bobColor;

        // Physics step (if not dragging)
        if (!dragControllerRef.current.isDragging() && dt > 0) {
          bodyRef.current.stepPendulum(
            dt,
            inputsRef.current.gravity,
            inputsRef.current.damping
          );
        }

        // Calculate forces
        const forces = bodyRef.current.calculateForces(
          inputsRef.current.gravity
        );

        // Render scene
        renderScene(p, forces);

        // Update sim info
        updateSimInfo(
          p,
          {
            position: bodyRef.current.state.position,
            velocity: bodyRef.current.state.velocity,
            angularVel: bodyRef.current.angularVel,
            kineticEnergy: bodyRef.current.getKineticEnergy(),
            potentialEnergy: bodyRef.current.getPotentialEnergy(
              inputsRef.current.gravity
            ),
          },
          {
            gravity: inputsRef.current.gravity,
            forces,
          },
          SimInfoMapper
        );
      };

      const renderScene = (p, forces) => {
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [20, 20, 30];

        // Trail layer
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.fill(r, g, b, 40);
          trailLayer.noStroke();
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }

        // Main canvas
        p.clear();
        p.image(trailLayer, 0, 0);

        // Draw anchor
        const anchorScreen = {
          x: toPixels(bodyRef.current.anchor.x),
          y: toPixels(bodyRef.current.anchor.y),
        };
        p.fill(150);
        p.noStroke();
        p.circle(anchorScreen.x, anchorScreen.y, 12);

        // Draw rope
        const bobScreen = {
          x: toPixels(bodyRef.current.state.position.x),
          y: toPixels(bodyRef.current.state.position.y),
        };
        p.stroke(inputsRef.current.ropeColor);
        p.strokeWeight(2);
        p.line(anchorScreen.x, anchorScreen.y, bobScreen.x, bobScreen.y);

        // Draw bob
        const screenPos = bodyRef.current.draw(p);

        // Draw forces
        if (inputsRef.current.showForces) {
          drawForces(p, screenPos, forces);
        }
      };

      const drawForces = (p, screenPos, forces) => {
        const renderer = forceRendererRef.current;

        // Weight (downward)
        renderer.drawWeight(
          p,
          screenPos.x,
          screenPos.y,
          bodyRef.current.params.mass,
          inputsRef.current.gravity
        );

        // Tension (toward anchor)
        const angle = forces.angle;
        const tensionAngle = angle + Math.PI; // Opposite direction
        renderer.drawVector(
          p,
          screenPos.x,
          screenPos.y,
          forces.tension.magnitude * Math.sin(tensionAngle),
          forces.tension.magnitude * Math.cos(tensionAngle),
          renderer.colors.tension,
          "Tension"
        );

        // Show components if enabled
        if (inputsRef.current.showComponents) {
          p.push();
          p.drawingContext.setLineDash([5, 5]);

          // Weight tangent component
          const tangentAngle = angle - Math.PI / 2;
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            Math.abs(forces.weightTangent) * Math.cos(tangentAngle),
            Math.abs(forces.weightTangent) * Math.sin(tangentAngle),
            renderer.colors.component,
            "mg⊥",
            { dashed: true, showMagnitude: false }
          );

          // Weight radial component
          renderer.drawVector(
            p,
            screenPos.x,
            screenPos.y,
            forces.weightRadial * Math.sin(angle),
            forces.weightRadial * Math.cos(angle),
            renderer.colors.component,
            "mg∥",
            { dashed: true, showMagnitude: false }
          );

          p.drawingContext.setLineDash([]);
          p.pop();
        }
      };

      // Mouse event handlers
      p.mousePressed = () => {
        if (!bodyRef.current) return;
        dragControllerRef.current.handlePress(p, bodyRef.current);
      };

      p.mouseDragged = () => {
        if (!dragControllerRef.current.isDragging()) return;

        // Calculate angle from mouse position
        const anchorScreen = {
          x: toPixels(bodyRef.current.anchor.x),
          y: toPixels(bodyRef.current.anchor.y),
        };

        const dx = p.mouseX - anchorScreen.x;
        const dy = p.mouseY - anchorScreen.y;
        const angle = Math.atan2(dx, dy);

        bodyRef.current.setAngle(angle);
      };

      p.mouseReleased = () => {
        dragControllerRef.current.handleRelease();
      };

      // Window resize
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
