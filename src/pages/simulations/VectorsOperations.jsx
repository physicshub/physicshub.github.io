import { useState, useRef, useEffect, useCallback } from "react";
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


export function VectorsOperations() {
  const [inputs, setInputs] = useState({
    strokeColor: "#00e6e6",
    strokeWeight: 3,
    multiVector: 2,
    operation: "+",
  });

  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const Sketch = useCallback(p => {
    // State for draggable Vector A in + and - modes
    let originA;
    let headA;
    let dragging = null; // 'tail' | 'head' | null
    const handleRadius = 10; // used only for hit-testing, not visible

    function isNear(v, x, y, radius = handleRadius) {
      return p.dist(v.x, v.y, x, y) <= radius;
    }

    function drawArrow(fromVec, toVec, color, weight) {
      p.push();
      p.stroke(color);
      p.strokeWeight(weight);
      p.line(fromVec.x, fromVec.y, toVec.x, toVec.y);
      // Larger arrowhead
      const angle = Math.atan2(toVec.y - fromVec.y, toVec.x - fromVec.x);
      const headLen = Math.max(12, weight * 4);
      const headWidth = Math.max(8, weight * 3);
      const hx = toVec.x;
      const hy = toVec.y;
      p.fill(color);
      p.noStroke();
      p.beginShape();
      p.vertex(hx, hy);
      p.vertex(hx - headLen * Math.cos(angle - Math.PI / 8), hy - headLen * Math.sin(angle - Math.PI / 8));
      p.vertex(hx - headWidth * Math.cos(angle), hy - headWidth * Math.sin(angle));
      p.vertex(hx - headLen * Math.cos(angle + Math.PI / 8), hy - headLen * Math.sin(angle + Math.PI / 8));
      p.endShape(p.CLOSE);
      p.pop();
    }

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      // Initialize default Vector A
      originA = p.createVector(w * 0.3, h * 0.6);
      headA = p.createVector(w * 0.5, h * 0.4);
    };

    p.draw = () => {
        const screenEl = document.querySelector('.screen');
        const bgColor = window
            .getComputedStyle(screenEl)
            .backgroundColor.match(/\d+/g)
            .map(Number);
        p.background(bgColor[0], bgColor[1], bgColor[2]);

        const { strokeColor, strokeWeight, multiVector } = inputsRef.current;
        const mouse = p.createVector(p.mouseX, p.mouseY);
        let center = p.createVector(p.width / 2, p.height / 2);

        switch (inputsRef.current.operation) {
            case "+":
                // A: from originA to headA (draggable)
                // B: from headA to mouse (triangle rule)
                // R: from originA to mouse
                drawArrow(originA, headA, strokeColor, strokeWeight);
                drawArrow(headA, mouse, adjustColor(strokeColor), Math.max(1, strokeWeight * 0.9));
                drawArrow(originA, mouse, [255, 100, 100], strokeWeight + 1);

                // Labels
                p.fill(255);
                p.textAlign(p.CENTER);
                p.textSize(16);
                p.text("A", (originA.x + headA.x) / 2, (originA.y + headA.y) / 2 - 12);
                p.text("B", (headA.x + mouse.x) / 2, (headA.y + mouse.y) / 2 - 12);
                p.text("R", (originA.x + mouse.x) / 2, (originA.y + mouse.y) / 2 - 12);
                // Measures near midpoints (magnitude and angle)
                {
                  const aVec = p.createVector(headA.x - originA.x, headA.y - originA.y);
                  const bVec = p.createVector(mouse.x - headA.x, mouse.y - headA.y);
                  const rVec = p.createVector(mouse.x - originA.x, mouse.y - originA.y);
                  const midA = p.createVector((originA.x + headA.x) / 2, (originA.y + headA.y) / 2);
                  const midB = p.createVector((headA.x + mouse.x) / 2, (headA.y + mouse.y) / 2);
                  const midR = p.createVector((originA.x + mouse.x) / 2, (originA.y + mouse.y) / 2);
                  p.textSize(12);
                  p.text(`|A|=${aVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(aVec.y, aVec.x)).toFixed(0)}°`, midA.x, midA.y - 28);
                  p.text(`|B|=${bVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(bVec.y, bVec.x)).toFixed(0)}°`, midB.x, midB.y - 28);
                  p.text(`|R|=${rVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(rVec.y, rVec.x)).toFixed(0)}°`, midR.x, midR.y - 28);
                }
                break;
            case "-":
                // A: from originA to headA (draggable)
                // B: from originA to mouse
                // R = A - B, drawn from originA to originA + (A - B)
                {
                  const aVec = p.createVector(headA.x - originA.x, headA.y - originA.y);
                  const bVec = p.createVector(mouse.x - originA.x, mouse.y - originA.y);
                  const rVec = p.createVector(aVec.x - bVec.x, aVec.y - bVec.y);
                  const rEnd = p.createVector(originA.x + rVec.x, originA.y + rVec.y);
                  // Arrows
                  drawArrow(originA, headA, strokeColor, strokeWeight);
                  drawArrow(originA, mouse, adjustColor(strokeColor), Math.max(1, strokeWeight * 0.9));
                  drawArrow(originA, rEnd, [255, 100, 100], strokeWeight + 1);

                  // Labels
                  p.fill(255);
                  p.textAlign(p.CENTER);
                  p.textSize(16);
                  p.text("A", (originA.x + headA.x) / 2, (originA.y + headA.y) / 2 - 12);
                  p.text("B", (originA.x + mouse.x) / 2, (originA.y + mouse.y) / 2 - 12);
                  p.text("A-B", (originA.x + rEnd.x) / 2, (originA.y + rEnd.y) / 2 - 12);

                  // Measures near midpoints
                  const midA2 = p.createVector((originA.x + headA.x) / 2, (originA.y + headA.y) / 2);
                  const midB2 = p.createVector((originA.x + mouse.x) / 2, (originA.y + mouse.y) / 2);
                  const midR2 = p.createVector((originA.x + rEnd.x) / 2, (originA.y + rEnd.y) / 2);
                  p.textSize(12);
                  p.text(`|A|=${aVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(aVec.y, aVec.x)).toFixed(0)}°`, midA2.x, midA2.y - 28);
                  p.text(`|B|=${bVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(bVec.y, bVec.x)).toFixed(0)}°`, midB2.x, midB2.y - 28);
                  p.text(`|A-B|=${rVec.mag().toFixed(1)}, θ=${p.degrees(Math.atan2(rVec.y, rVec.x)).toFixed(0)}°`, midR2.x, midR2.y - 28);
                }
                break;
            case "x":
                // Work in centered coordinates
                mouse.sub(center);
                p.translate(p.width / 2, p.height / 2);

                // Define vectors
                const aVecMul = mouse.copy();
                const rVecMul = mouse.copy().mult(multiVector);

                // Draw original vector A and resultant kA from origin
                drawArrow(p.createVector(0, 0), aVecMul, strokeColor, strokeWeight);
                drawArrow(p.createVector(0, 0), rVecMul, [255, 100, 100], strokeWeight + 1);

                // Optional connector from end of A to end of kA
                p.stroke(adjustColor(strokeColor));
                p.strokeWeight(Math.max(1, strokeWeight * 0.8));
                p.line(aVecMul.x, aVecMul.y, rVecMul.x, rVecMul.y);

                // Labels
                p.fill(255);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.textSize(16);
                p.text("A", aVecMul.x / 2, aVecMul.y / 2 - 12);
                p.text(`${multiVector}A`, rVecMul.x / 2, rVecMul.y / 2 - 12);

                // Measures (magnitude and direction)
                p.textSize(12);
                const midA_mul_x = aVecMul.x / 2;
                const midA_mul_y = aVecMul.y / 2;
                const midR_mul_x = rVecMul.x / 2;
                const midR_mul_y = rVecMul.y / 2;
                const angA = p.degrees(Math.atan2(aVecMul.y, aVecMul.x)).toFixed(0);
                const angR = p.degrees(Math.atan2(rVecMul.y, rVecMul.x)).toFixed(0);
                p.text(`|A|=${aVecMul.mag().toFixed(1)}, θ=${angA}°`, midA_mul_x, midA_mul_y - 28);
                p.text(`|${multiVector}A|=${rVecMul.mag().toFixed(1)}, θ=${angR}°`, midR_mul_x, midR_mul_y - 28);
                break;
            default:
                break;
        }
        p.pop();
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
      // Keep Vector A within view after resize
      originA = p.createVector(w * 0.3, h * 0.6);
      headA = p.createVector(w * 0.5, h * 0.4);
    };
  }, []);

  const operations = [
    { value: "+", label: "Addition (+)" },
    { value: "-", label: "Subtraction (-)" },
    { value: "x", label: "Multiplication (x)" },
  ];

  return (
    <>
      <TopSim/>
      <Screen sketch={Sketch} />
      <Stars color="#AEE3FF" opacity={0.3}/>
      <GradientBackground/>
      <div className="inputs-container">
        <NumberInput
          label="Vectors lines weight:"
          name="strokeWeight"
          val={inputs.strokeWeight}
          onChange={e => handleInputChange("strokeWeight", Number(e.target.value))}
          min={1}
        />
        <SelectInput
          label="Vectors Operation:"
          name="operation"
          options={operations}
          value={inputs.operation}
          onChange={e => handleInputChange("operation", e.target.value)}
          placeholder="Select vectors operation…"
        />
        <NumberInput
          label="Multiplicate vector (multiplication only):"
          name="multiVector"
          val={inputs.multiVector}
          onChange={e => handleInputChange("multiVector", Number(e.target.value))}
          min={1}
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

      <TheoryRenderer theory={chapters.find(ch => ch.link === useLocation().pathname)?.theory} />
    </>
  );
}
