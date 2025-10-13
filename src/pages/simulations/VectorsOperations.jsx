import { useState, useCallback, useRef } from "react";
import Screen from "../../components/Screen.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import TopSim from "../../components/TopSim.jsx";
import { adjustColor } from "../../utils/adjustColor.js";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";
import * as planck from "planck";
import { SCALE } from "../../constants/Config.js";
import Controls from "../../components/Controls.jsx";
import useSimulationState from "../../hooks/useSimulationState.js";
import { isPaused, getTimeScale, resetTime, setPause } from "../../constants/Time.js";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";


export function VectorsOperations() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");

  const INITIAL_INPUTS = {
    strokeColor: "#00e6e6",
    strokeWeight: 3,
    multiVector: 2,
    operation: "+",
    visualizeMode: "triangle", // triangle | parallelogram (for + / -)
    physicsEnabled: false,
    massKg: 5,
    pxPerNewton: 100,
  };

  const { inputs, setInputs, inputsRef } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);
  const [simData, setSimData] = useState({});
  const lastInfoUpdateMsRef = useRef(0);
  const INFO_UPDATE_MS = 150;

  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const Sketch = useCallback(p => {
    const worldRef = { current: null };
    const bodyRef = { current: null };
    const boundsRef = { current: null };
    const lastMassRef = { current: null };
    let last = 0;
    let acc = 0;
    const FIXED_DT = 1 / 60;
    const MAX_STEPS = 5;

    function createBounds(w, h) {
      const world = worldRef.current;
      if (!world) return;
      const metersW = w / SCALE;
      const metersH = h / SCALE;
      const ground = world.createBody();
      ground.createFixture(planck.Edge(planck.Vec2(0, 0), planck.Vec2(metersW, 0)));
      ground.createFixture(planck.Edge(planck.Vec2(0, metersH), planck.Vec2(metersW, metersH)));
      ground.createFixture(planck.Edge(planck.Vec2(0, 0), planck.Vec2(0, metersH)));
      ground.createFixture(planck.Edge(planck.Vec2(metersW, 0), planck.Vec2(metersW, metersH)));
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
        type: 'dynamic',
        position: pos,
        bullet: true
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
      last = performance.now() / 1000;
      acc = 0;
    }

    function destroyWorld() {
      worldRef.current = null;
      bodyRef.current = null;
      boundsRef.current = null;
    }

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      if (inputsRef.current.physicsEnabled) {
        createWorldAndBody(w, h);
      }
    };

    p.draw = () => {
        // React to toggle changes at runtime
        if (inputsRef.current.physicsEnabled && !worldRef.current) {
          const { clientWidth: w, clientHeight: h } = p._userNode;
          createWorldAndBody(w, h);
        } else if (!inputsRef.current.physicsEnabled && worldRef.current) {
          destroyWorld();
        }

        const screenEl = document.querySelector('.screen');
        const bgColor = window
            .getComputedStyle(screenEl)
            .backgroundColor.match(/\d+/g)
            .map(Number);
        p.background(bgColor[0], bgColor[1], bgColor[2]);
        
        // Get proper contrast text color for labels
        const currentTheme = document.body.dataset.theme;
        const rgbTextColor = currentTheme === 'light' ? [0, 0, 0] : [255, 255, 255];
        
        // Get theme-aware accent color for result vectors
        const accentColor = window
            .getComputedStyle(document.body)
            .getPropertyValue('--accent-color');
        const rgbAccentColor = accentColor.match(/\d+/g)?.map(Number) || [255, 100, 100];

        const { strokeColor, strokeWeight, multiVector } = inputsRef.current;
        const mouse = p.createVector(p.mouseX, p.mouseY);
        let center = p.createVector(p.width / 2, p.height / 2);

        p.push();
        const op = inputsRef.current.operation;
        const viz = inputsRef.current.visualizeMode;
        switch (op) {
            case "+": {
                // A from origin to center, B from center to mouse
                const Avec_add = center.copy();
                const Bvec_add = p.constructor.Vector.sub(mouse, center);
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                if (viz === "triangle") {
                  // Triangle method
                  p.line(0, 0, Avec_add.x, Avec_add.y);
                  p.line(Avec_add.x, Avec_add.y, mouse.x, mouse.y);
                  p.stroke(adjustColor(strokeColor));
                  p.strokeWeight(strokeWeight + 1);
                  p.line(0, 0, mouse.x, mouse.y); // resultant
                } else {
                  // Parallelogram method: draw A and B from origin
                  const Btip_from_origin = p.constructor.Vector.add(Avec_add, Bvec_add);
                  p.line(0, 0, Avec_add.x, Avec_add.y); // A from origin
                  p.line(0, 0, Bvec_add.x, Bvec_add.y); // B from origin
                  // complete parallelogram
                  p.drawingContext.setLineDash([6, 6]);
                  p.line(Avec_add.x, Avec_add.y, Btip_from_origin.x, Btip_from_origin.y);
                  p.line(Bvec_add.x, Bvec_add.y, Btip_from_origin.x, Btip_from_origin.y);
                  p.drawingContext.setLineDash([]);
                  // resultant diagonal
                  p.stroke(adjustColor(strokeColor));
                  p.strokeWeight(strokeWeight + 1);
                  p.line(0, 0, Btip_from_origin.x, Btip_from_origin.y);
                }
                break;
            }
            case "-": {
                // R = A - B; triangle method shows center->mouse vector as R
                const Avec_sub = center.copy();
                const Bvec_sub = p.constructor.Vector.sub(mouse, center);
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                if (viz === "triangle") {
                  p.line(0, 0, Avec_sub.x, Avec_sub.y); // A from origin
                  p.line(0, 0, mouse.x, mouse.y);      // B from origin
                  // resultant shown as center->mouse = B - A
                  p.stroke(adjustColor(strokeColor));
                  p.strokeWeight(strokeWeight + 1);
                  p.line(center.x, center.y, mouse.x, mouse.y);
                } else {
                  // Parallelogram variant: A + (-B)
                  const Bneg = p.constructor.Vector.mult(Bvec_sub, -1);
                  const tip = p.constructor.Vector.add(Avec_sub, Bneg);
                  p.line(0, 0, Avec_sub.x, Avec_sub.y);
                  p.line(0, 0, Bneg.x, Bneg.y);
                  p.drawingContext.setLineDash([6, 6]);
                  p.line(Avec_sub.x, Avec_sub.y, tip.x, tip.y);
                  p.line(Bneg.x, Bneg.y, tip.x, tip.y);
                  p.drawingContext.setLineDash([]);
                  p.stroke(adjustColor(strokeColor));
                  p.strokeWeight(strokeWeight + 1);
                  p.line(0, 0, tip.x, tip.y);
                }
                break;
            }
            case "x": {
                mouse.sub(center);
                p.translate(p.width / 2, p.height / 2);

                // Define vectors
                const aVecMul = mouse.copy();
                const rVecMul = mouse.copy().mult(multiVector);

                // Draw original vector A and resultant kA from origin
                drawArrow(p.createVector(0, 0), aVecMul, strokeColor, strokeWeight);
                drawArrow(p.createVector(0, 0), rVecMul, rgbAccentColor, strokeWeight + 1);

                // Optional connector from end of A to end of kA
                p.stroke(adjustColor(strokeColor));
                p.line(mouse.x, mouse.y, multiplied.x, multiplied.y);
                // If scalar negative, hint flip with a faint opposite
                if (multiVector < 0) {
                  p.stroke(200, 200, 200);
                  p.strokeWeight(1);
                  const flipped = mouse.copy().mult(-1);
                  p.line(0, 0, flipped.x, flipped.y);
                }
                break;
            }
            case "normalize": {
                // Draw input vector from center to mouse and its unit vector
                const v = p.constructor.Vector.sub(mouse, center);
                const len = v.mag() || 1;
                const unit = v.copy().div(len);
                p.translate(p.width / 2, p.height / 2);
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                p.line(0, 0, v.x, v.y);
                p.stroke(adjustColor(strokeColor));
                p.line(0, 0, unit.x * 100, unit.y * 100); // show unit direction scaled for visibility
                break;
            }
            case "dot": {
                // A = center (origin->center), B = mouse-center (tip-to-tail triangle)
                const A = center.copy();
                const B = p.constructor.Vector.sub(mouse, center);
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                p.line(0, 0, center.x, center.y);
                p.line(center.x, center.y, mouse.x, mouse.y);
                // resultant for context
                p.stroke(adjustColor(strokeColor));
                p.line(0, 0, mouse.x, mouse.y);
                break;
            }
            case "cross": {
                // Visuals same as dot for context; value shown in panel
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

        // Axis projections and angle arc for vector from center to mouse
        const v_proj = p.constructor.Vector.sub(mouse, center);
        p.push();
        p.stroke(255, 255, 255, 120);
        p.drawingContext.setLineDash([4, 4]);
        // Horizontal projection
        p.line(center.x, center.y, mouse.x, center.y);
        // Vertical projection
        p.line(mouse.x, center.y, mouse.x, mouse.y);
        p.drawingContext.setLineDash([]);
        // Angle arc at center (relative to +x)
        const arcR = 40;
        p.noFill();
        p.stroke(255, 255, 255, 150);
        const ang = Math.atan2(v_proj.y, v_proj.x);
        p.arc(center.x, center.y, arcR * 2, arcR * 2, 0, ang);
        p.pop();

        // Compute learning metrics and show in panel (throttled)
        const nowMs = performance.now();
        if (nowMs - lastInfoUpdateMsRef.current >= INFO_UPDATE_MS) {
          // Define vectors for operations
          const A = center.copy(); // origin -> center
          const B_from_center = p.constructor.Vector.sub(mouse, center); // center -> mouse (triangle method)
          const B_from_origin = mouse.copy(); // origin -> mouse

          let info = {};

          // Basics for the input (B_from_center)
          const mag = B_from_center.mag();
          const angleRad = Math.atan2(B_from_center.y, B_from_center.x);
          const angleDeg = (angleRad * 180) / Math.PI;
          info["Vector |B| (px)"] = mag.toFixed(2);
          info["Vector angle θ (deg)"] = angleDeg.toFixed(1);
          info["B components (px)"] = `(${B_from_center.x.toFixed(2)}, ${B_from_center.y.toFixed(2)})`;

          if (op === "+") {
            // Triangle addition resultant is origin->mouse
            const R = viz === "triangle" ? B_from_origin : p.constructor.Vector.add(A, B_from_center);
            info["Addition resultant R (px)"] = `(${R.x.toFixed(2)}, ${R.y.toFixed(2)})`;
            info["|R| (px)"] = R.mag().toFixed(2);
            info["Formula"] = viz === "triangle"
              ? "Triangle: R = B (origin→mouse)"
              : "Parallelogram: R = A + B";
          } else if (op === "-") {
            // Subtraction resultant shown is center->mouse which equals (B - A)
            const R = viz === "triangle" ? p.constructor.Vector.sub(mouse, center)
                                          : p.constructor.Vector.add(A, p.constructor.Vector.mult(B_from_center, -1));
            info["Subtraction resultant R = B - A (px)"] = `(${R.x.toFixed(2)}, ${R.y.toFixed(2)})`;
            info["|R| (px)"] = R.mag().toFixed(2);
            info["Formula"] = viz === "triangle"
              ? "Triangle: R = B - A (center→mouse)"
              : "Parallelogram: R = A + (-B)";
          } else if (op === "x") {
            const v = p.constructor.Vector.sub(mouse, center);
            const scalar = multiVector;
            const R = v.copy().mult(scalar);
            const angleR = Math.atan2(R.y, R.x) * 180 / Math.PI;
            info["Scalar s"] = scalar.toFixed(2);
            info["Scaled vector s·v (px)"] = `(${R.x.toFixed(2)}, ${R.y.toFixed(2)})`;
            info["|s·v| (px)"] = R.mag().toFixed(2);
            info["Angle of s·v (deg)"] = angleR.toFixed(1);
            info["Formula"] = "s·v = (s·vx, s·vy); if s < 0, orientation flips";
          } else if (op === "normalize") {
            const v = p.constructor.Vector.sub(mouse, center);
            const len = v.mag();
            const unit = len ? v.copy().div(len) : p.createVector(0, 0);
            info["|v|"] = len.toFixed(2);
            info["unit v̂"] = `(${unit.x.toFixed(3)}, ${unit.y.toFixed(3)})`;
            info["Formula"] = "v̂ = v / |v|";
          } else if (op === "dot") {
            const A = center.copy();
            const B = p.constructor.Vector.sub(mouse, center);
            const dot = A.x * B.x + A.y * B.y;
            const magA = A.mag();
            const magB = B.mag();
            const cosTheta = magA && magB ? dot / (magA * magB) : 0;
            const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180 / Math.PI;
            info["A·B (px²)"] = dot.toFixed(2);
            info["θ between A and B (deg)"] = theta.toFixed(1);
            info["Formula"] = "A·B = |A||B| cosθ = AxBx + AyBy";
          } else if (op === "cross") {
            const A = center.copy();
            const B = p.constructor.Vector.sub(mouse, center);
            const z = A.x * B.y - A.y * B.x;
            const sign = z > 0 ? "+ (counterclockwise)" : z < 0 ? "- (clockwise)" : "0";
            info["A×B (z-component, px²)"] = `${z.toFixed(2)} ${sign}`;
            info["Formula"] = "A×B (2D) = AxBy − AyBx (z-axis out of plane)";
          }

          setSimData(info);
          lastInfoUpdateMsRef.current = nowMs;
        }

        if (inputsRef.current.physicsEnabled && worldRef.current && bodyRef.current) {
          // Update body mass if changed
          const radiusM = 0.2;
          const desiredMass = inputsRef.current.massKg;
          if (lastMassRef.current == null || Math.abs(desiredMass - lastMassRef.current) > 1e-6) {
            const area = Math.PI * radiusM * radiusM;
            const newDensity = desiredMass / area;
            const fixture = bodyRef.current.getFixtureList();
            fixture.setDensity(newDensity);
            bodyRef.current.resetMassData();
            lastMassRef.current = desiredMass;
          }

          const now = performance.now() / 1000;
          const frameDt = Math.min(now - last, 0.25);
          last = now;
          // Apply global time scale and pause from Controls
          const scale = getTimeScale();
          if (!isPaused()) {
            acc += frameDt * Math.max(0, scale);
          }

          const op = inputsRef.current.operation;
          const pxPerNewton = Math.max(1, inputsRef.current.pxPerNewton);
          const A = { x: center.x, y: center.y };
          const B = { x: mouse.x - center.x, y: mouse.y - center.y };
          let FA = { x: A.x / pxPerNewton, y: A.y / pxPerNewton };
          let FB = { x: B.x / pxPerNewton, y: B.y / pxPerNewton };
          if (op === "-") {
            FB = { x: -FB.x, y: -FB.y };
          } else if (op === "x") {
            FB = { x: FB.x * multiVector, y: FB.y * multiVector };
            FA = { x: 0, y: 0 };
          }

          let steps = 0;
          while (acc >= FIXED_DT && steps < MAX_STEPS) {
            const body = bodyRef.current;
            body.applyForce(planck.Vec2(FA.x, FA.y), body.getWorldCenter());
            body.applyForce(planck.Vec2(FB.x, FB.y), body.getWorldCenter());
            worldRef.current.step(FIXED_DT);
            steps++;
            acc -= FIXED_DT;
          }

          const pos = bodyRef.current.getPosition();
          const rPx = 0.2 * SCALE * 2;
          p.noStroke();
          p.fill(adjustColor(strokeColor));
          p.circle(pos.x * SCALE, pos.y * SCALE, rPx);
        }
    };

    p.mousePressed = () => {
      const op = inputsRef.current.operation;
      if (op === "+" || op === "-") {
        // Drag from arrow tail or head
        if (isNear(originA, p.mouseX, p.mouseY)) {
          dragging = 'tail';
          return;
        }
        if (isNear(headA, p.mouseX, p.mouseY)) {
          dragging = 'head';
          return;
        }
      }
    };

    p.mouseDragged = () => {
      if (!dragging) return;
      const clampedX = Math.max(0, Math.min(p.width, p.mouseX));
      const clampedY = Math.max(0, Math.min(p.height, p.mouseY));
      if (dragging === 'tail') {
        originA.set(clampedX, clampedY);
      } else if (dragging === 'head') {
        headA.set(clampedX, clampedY);
      }
    };

    p.mouseReleased = () => {
      dragging = null;
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      if (inputsRef.current.physicsEnabled) {
        // Recreate world to match new bounds
        destroyWorld();
        createWorldAndBody(w, h);
      }
    };
  }, [inputsRef, lastInfoUpdateMsRef]);

  const operations = [
    { value: "+", label: "Addition (+)" },
    { value: "-", label: "Subtraction (-)" },
    { value: "x", label: "Scalar Multiplication (x)" },
    { value: "normalize", label: "Normalize (v̂)" },
    { value: "dot", label: "Dot Product (A·B)" },
    { value: "cross", label: "Cross Product 2D (A×B z)" },
  ];

  return (
    <>
      <TopSim/>
      <Screen sketch={Sketch} key={resetVersion} />
      <SimInfoPanel data={simData} />
      <Stars color="#AEE3FF" opacity={0.3}/>
      <GradientBackground/>
      <Controls
        onReset={() => {
          const wasPaused = isPaused();
          resetTime();
          if (wasPaused) setPause(true);
          setInputs(INITIAL_INPUTS);
          setResetVersion(v => v + 1);
        }}
        inputs={inputs}
        simulation={location.pathname}
        onLoad={(loaded) => {
          setInputs(loaded);
          setResetVersion(v => v + 1);
        }}
      />
      <div className="inputs-container">
        <NumberInput
          label="Vectors lines weight:"
          name="strokeWeight"
          val={inputs.strokeWeight}
          onChange={e => handleInputChange("strokeWeight", Number(e.target.value))}
          min={1}
        />
        <SelectInput
          label="Physics (Planck):"
          name="physicsEnabled"
          options={[{ value: "false", label: "Off" }, { value: "true", label: "On" }]}
          value={String(inputs.physicsEnabled)}
          onChange={e => handleInputChange("physicsEnabled", e.target.value === "true")}
        />
        <SelectInput
          label="Vectors Operation:"
          name="operation"
          options={operations}
          value={inputs.operation}
          onChange={e => handleInputChange("operation", e.target.value)}
          placeholder="Select vectors operation…"
        />
        {(inputs.operation === "+" || inputs.operation === "-") && (
          <SelectInput
            label="Visualization:"
            name="visualizeMode"
            options={[
              { value: "triangle", label: "Triangle" },
              { value: "parallelogram", label: "Parallelogram" },
            ]}
            value={inputs.visualizeMode}
            onChange={e => handleInputChange("visualizeMode", e.target.value)}
          />
        )}
        <NumberInput
          label="Mass (kg)"
          name="massKg"
          val={inputs.massKg}
          onChange={e => handleInputChange("massKg", Number(e.target.value))}
          min={0.1}
          step={0.1}
          disabled={!inputs.physicsEnabled}
        />
        <NumberInput
          label="Pixels per Newton"
          name="pxPerNewton"
          val={inputs.pxPerNewton}
          onChange={e => handleInputChange("pxPerNewton", Number(e.target.value))}
          min={1}
          step={1}
          disabled={!inputs.physicsEnabled}
        />
        <NumberInput
          label="Multiplicate vector (multiplication only):"
          name="multiVector"
          val={inputs.multiVector}
          onChange={e => handleInputChange("multiVector", Number(e.target.value))}
          min={-10}
          max={10}
          disabled={inputs.operation !== "x"}
        />
        <ColorInput
          label="Vectors color:"
          name="strokeColor"
          value={inputs.strokeColor}
          onChange={e => handleInputChange("strokeColor", e.target.value)}
        />
      </div>

      {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
      <TheoryRenderer theory={chapters.find(ch => ch.link === useLocation().pathname)?.theory} />
    </>
  );
}
