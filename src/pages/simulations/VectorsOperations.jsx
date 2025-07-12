import { useState, useRef, useEffect, useCallback } from "react";
import Screen from "../../components/Screen.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import Back from "../../components/Back.jsx";
import { adjustColor } from "../../utils/adjustColor.js";

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
    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
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
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                p.line(0, 0, center.x, center.y);
                p.line(center.x, center.y, mouse.x, mouse.y);
                p.push();
                p.stroke(adjustColor(strokeColor));
                p.line(0, 0, mouse.x, mouse.y);
                break;
            case "-":
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                p.line(0, 0, center.x, center.y);
                p.line(0, 0, mouse.x, mouse.y);
                p.push();
                p.stroke(adjustColor(strokeColor));
                p.line(center.x, center.y, mouse.x, mouse.y);
                break;
            case "x":
                mouse.sub(center);
                p.translate(p.width / 2, p.height / 2);
                p.strokeWeight(strokeWeight);
                p.stroke(strokeColor);
                p.line(0, 0, mouse.x, mouse.y);
                let multiplied = mouse.copy().mult(multiVector);
                p.strokeWeight(strokeWeight * 0.8);
                p.stroke(adjustColor(strokeColor));
                p.line(mouse.x, mouse.y, multiplied.x, multiplied.y);
                break;
            default:
                break;
        }
        p.pop();
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
    };
  }, []);

  const operations = [
    { value: "+", label: "Addition (+)" },
    { value: "-", label: "Subtraction (-)" },
    { value: "x", label: "Multiplication (x)" },
  ];

  return (
    <>
      <Back content="Back to home" link="/" />
      <Screen sketch={Sketch} />
      <main>
        <NumberInput
          label="Vectors lines weight:"
          name="strokeWeight"
          val={inputs.strokeWeight}
          onChange={e => handleInputChange("strokeWeight", Number(e.target.value))}
          min={1}
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
        <SelectInput
          label="Vectors Operation:"
          name="operation"
          options={operations}
          value={inputs.operation}
          onChange={e => handleInputChange("operation", e.target.value)}
          placeholder="Select vectors operation…"
        />
        <ColorInput
          label="Vectors color:"
          name="strokeColor"
          value={inputs.strokeColor}
          onChange={e => handleInputChange("strokeColor", e.target.value)}
        />
      </main>
    </>
  );
}
