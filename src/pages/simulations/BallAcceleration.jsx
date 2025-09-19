import { useState, useRef, useEffect, useCallback } from "react";
import Screen from "../../components/Screen.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import TopSim from "../../components/TopSim.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";

import Ball from "../../components/classes/Ball.js"; // <-- import classe esterna

export function BallAcceleration() {
  const [inputs, setInputs] = useState({
    maxspeed: 5,
    size: 48,
    acceleration: 0.1,
    color: "#7f7f7f"
  });

  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const Sketch = useCallback(p => {
    let ball;
    let w, h;

    p.setup = () => {
      w = p._userNode.clientWidth;
      h = p._userNode.clientHeight;
      p.createCanvas(w, h);

      // creo la palla in modalità "acceleration"
      ball = new Ball(p, inputsRef.current, w, h, "acceleration");
    };

    p.draw = () => {
      const screenEl = document.querySelector(".screen");
      let bgColor = window.getComputedStyle(screenEl).backgroundColor.match(/\d+/g);
      if (bgColor) {
        p.background(...bgColor.map(Number));
      } else {
        p.background(0);
      }

      ball.setConfig(inputsRef.current);
      // passo le coordinate del mouse come target
      ball.update({ x: p.mouseX, y: p.mouseY });
    };

    p.windowResized = () => {
      w = p._userNode.clientWidth;
      h = p._userNode.clientHeight;
      p.resizeCanvas(w, h);
      ball.resetPosition();
    };
  }, []);

  return (
    <>
      <TopSim/>
      <Stars color="#AEE3FF" opacity={0.3}/>
      <GradientBackground/>
      <Screen sketch={Sketch} />
      <div className="inputs-container">
        <NumberInput
          label="Ball Size:"
          name="size"
          val={inputs.size}
          min={10}
          max={200}
          onChange={e => handleInputChange("size", Number(e.target.value))}
        />
        <NumberInput
          label="Max Speed:"
          name="maxspeed"
          val={inputs.maxspeed}
          min={1}
          max={20}
          onChange={e => handleInputChange("maxspeed", Number(e.target.value))}
        />
        <NumberInput
          label="Acceleration:"
          name="acceleration"
          val={inputs.acceleration}
          min={0.001}
          max={1}
          step={0.001}
          onChange={e => handleInputChange("acceleration", Number(e.target.value))}
        />
        <ColorInput
          label="Ball Color:"
          name="color"
          value={inputs.color}
          onChange={e => handleInputChange("color", e.target.value)}
        />
      </div>

      <TheoryRenderer
        theory={
          chapters.find(ch => ch.link === useLocation().pathname)?.theory
        }
      />
    </>
  );
}
