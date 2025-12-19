// app/(pages)/simulations/ProjectileMotion/page.jsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation.js";
// p5 is not imported here. It's passed into the sketch.

// --- Core Classes & Config ---
import ProjectileMotion from "../../../(core)/physics/ProjectileMotion.js"; 
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../../../(core)/data/configs/ProjectileMotion.js";

const MAX_LAUNCH_ANGLE = 89.9;

const normalizeAngle = (angle) => {
  // Return angle in degrees relative to horizontal, clamped to [-MAX_LAUNCH_ANGLE, MAX_LAUNCH_ANGLE]
  let a = ((angle % 360) + 360) % 360; // 0..359
  if (a > 180) a -= 360; // -179..180
  // Clamp
  if (a > MAX_LAUNCH_ANGLE) a = MAX_LAUNCH_ANGLE;
  if (a < -MAX_LAUNCH_ANGLE) a = -MAX_LAUNCH_ANGLE;
  return a;
};
import chapters from "../../../(core)/data/chapters.js";
import { SCALE } from "../../../(core)/constants/Config.js";

// --- Core Utils ---
import {
  computeDelta,
  resetTime,
  isPaused,
  setPause,
} from "../../../(core)/constants/Time.js";
import getBackgroundColor from "../../../(core)/utils/getBackgroundColor";
import { drawGlow } from "../../../(core)/utils/drawUtils.js"; // getActiveForces removed


// --- Reusable UI Components ---
import SimulationLayout from "../../../(core)/components/SimulationLayout.jsx";
import P5Wrapper from "../../../(core)/components/P5Wrapper.jsx";
import DynamicInputs from "../../../(core)/components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../../(core)/components/SimInfoPanel.jsx";

// --- Hooks ---
import useSimulationState from "../../../(core)/hooks/useSimulationState";
import useSimInfo from "../../../(core)/hooks/useSimInfo";


export default function ProjectileMotionPage() {
  const location = usePathname();
  const storageKey = location.replaceAll(/[/#]/g, "");
  
  //  line defines inputsRef. Its inside the component function.
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(
    INITIAL_INPUTS,
    storageKey
  );
  
  const [resetVersion, setResetVersion] = useState(0);

  // created the refs by myself here.
  const projectileRef = useRef(null);
  const timeRef = useRef(0);
  const rangeRef = useRef(0);
  const maxHeightRef = useRef(0);
  const infoRefs = useMemo(
    () => ({ timeRef, rangeRef, maxHeightRef }),
    []
  );
  const { simData, updateSimInfo } = useSimInfo({
    updateIntervalMs: 50,
    customRefs: infoRefs,
  });

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

  // The sketch function inside the component to access hooks
  const sketch = useCallback(
    (p) => { //  p5 instance from P5Wrapper
      let trailLayer = null;
      let groundY = 0;
      let originX = 0;
      let originY = 0;

      const createProjectile = () => {
        const { clientHeight: h } = p._userNode;
        groundY = (h - 50) / SCALE; 
        originX = 0; 
        originY = groundY;
        
        projectileRef.current = new ProjectileMotion(
          p,
          originX,
          originY,
          inputsRef.current.mass
        );
      };
      
      const launchProjectile = () => {
        const projectile = projectileRef.current;
        if (!projectile) return;

        const velocity =
          typeof inputsRef.current.initialVelocity === "number"
            ? inputsRef.current.initialVelocity
            : INITIAL_INPUTS.initialVelocity;
        const launchAngle =
          typeof inputsRef.current.angle === "number"
            ? inputsRef.current.angle
            : INITIAL_INPUTS.angle;
        
        timeRef.current = 0;
        rangeRef.current = 0;
        maxHeightRef.current = 0;

        projectile.launch(velocity, launchAngle);
        setPause(false); 
      };

      p.setup = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.createCanvas(w, h);
        trailLayer = p.createGraphics(w, h);
        trailLayer.clear();
        
        createProjectile();
        projectileRef.current.stop(); // Start stopped
        setPause(true); // Start paused
        
        p.background(getBackgroundColor());
      };

      p.draw = () => {
        const projectile = projectileRef.current;
        if (!projectile || !trailLayer) return;
        
        const dt = computeDelta(p);
        
        // Only update physics if not paused (and not dragging)
        if (dt && !projectile.isDragging) { 
          projectile.mass = inputsRef.current.mass;
          projectile.radius = inputsRef.current.size / 2;
          projectile.color = inputsRef.current.ballColor;

          if (projectile.isOnGround()) {
            projectile.stop();
            setPause(true); 
          }
          
          // 1) Physics
          if (!projectile.isOnGround()) {
            const gravityForce = p.createVector(0, projectile.mass * inputsRef.current.gravity);
            projectile.applyForce(gravityForce);
          }
          projectile.update(dt);
          
          // 2) Update Refs
          timeRef.current += dt;
        }

        // 3) Trail (Always draw)
        const bg = getBackgroundColor();
        const [r, g, b] = Array.isArray(bg) ? bg : [0, 0, 0];
        if (!inputsRef.current.trailEnabled) {
          trailLayer.background(r, g, b);
        } else {
          trailLayer.noStroke();
          trailLayer.fill(r, g, b, 60);
          trailLayer.rect(0, 0, trailLayer.width, trailLayer.height);
        }
        
        projectile.show(trailLayer);

        // 4) Compositing
        p.clear();
        p.image(trailLayer, 0, 0);
        
        // 5) Draw ground
        p.fill(80, 150, 80);
        p.noStroke();
        p.rect(0, p.height - 50, p.width, 50);
        
        // 6) Glow
        const bobPos = projectile.state.pos; 
        const bobX = bobPos.x * SCALE;
        const bobY = bobPos.y * SCALE;
        const bobRadius = projectile.radius * SCALE;

        const isHover = p.dist(bobX, bobY, p.mouseX, p.mouseY) <= bobRadius;
        drawGlow(p, isHover, projectile.color, () => {
            p.noStroke();
            p.fill(projectile.color);
            p.circle(bobX, bobY, bobRadius * 2);
          }, 20, p);

        // 7) Update SimInfo
        const { clientHeight } = p._userNode || {};
          updateSimInfo(
          p,
          {
            pos: projectile.state.pos,
            vel: projectile.state.vel,
            mass: projectile.mass,
          },
          {
            gravity: inputsRef.current.gravity,
            canvasHeight: clientHeight ?? p.height,
            isDragging: Boolean(projectile.isDragging),
              angle: inputsRef.current.angle,
              initialVelocity: inputsRef.current.initialVelocity,
             originX: originX,
             originY: originY,
             groundY: groundY,
          },
          SimInfoMapper
        );
      };

      p.mousePressed = () => {
        const projectile = projectileRef.current;
        if (projectile?.clicked(p.mouseX, p.mouseY)) {
          setPause(true);
        }
      };

      p.mouseDragged = () => {
        const projectile = projectileRef.current;
        if (!projectile || !projectile.isDragging) return;

        projectile.drag(p.mouseX, p.mouseY);

        const launchVec = projectile.getLaunchVector(originX, originY);
        const velocity = launchVec.mag();
        const rawAngle = p.degrees(-launchVec.heading());
        const angle = normalizeAngle(rawAngle);

        // Debug: log drag metrics to browser console
        try {
          console.debug("Projectile drag:", {
            launchVecX: launchVec.x,
            launchVecY: launchVec.y,
            velocity,
            rawAngle,
            angle,
          });
        } catch (e) {}

        inputsRef.current.initialVelocity = velocity;
        inputsRef.current.angle = angle;

        const roundedVelocity = Number(velocity.toFixed(2));
        const roundedAngle = Number(angle.toFixed(2));

        setInputs((prev) => {
          if (
            Math.abs((prev.initialVelocity ?? 0) - roundedVelocity) < 0.01 &&
            Math.abs((prev.angle ?? 0) - roundedAngle) < 0.01
          ) {
            return prev;
          }
          return {
            ...prev,
            initialVelocity: roundedVelocity,
            angle: roundedAngle,
          };
        });
      };

      p.mouseReleased = () => {
        const projectile = projectileRef.current;
        if (!projectile || !projectile.isDragging) return;

        projectile.stopDragging();
        launchProjectile(); 
      };

      p.windowResized = () => {
        const { clientWidth: w, clientHeight: h } = p._userNode;
        p.resizeCanvas(w, h);
        trailLayer = p.createGraphics(w, h); 
        trailLayer.clear();
        
        createProjectile();
        projectileRef.current.stop(); 
        setPause(true); 
        timeRef.current = 0;
        rangeRef.current = 0;
        maxHeightRef.current = 0;
      };
    },
    // This dependency array is now correct
    [inputsRef, updateSimInfo, setInputs] 
  );

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);
        resetInputs(true);
        timeRef.current = 0;
        rangeRef.current = 0;
        maxHeightRef.current = 0;
        setResetVersion((v) => v + 1); 
      }}
      inputs={inputs}
      simulation={location}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        timeRef.current = 0;
        rangeRef.current = 0;
        maxHeightRef.current = 0;
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
        simInfos={<SimInfoPanel data={simData} cooldown={50} />}
      />
    </SimulationLayout>
  );
}