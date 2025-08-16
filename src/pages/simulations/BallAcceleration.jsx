import { useState, useRef, useEffect, useCallback } from "react";
import Screen from "../../components/Screen.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import TopSim from "../../components/TopSim.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { useLocation } from "react-router-dom";

export function BallAcceleration() {
  const [inputs, setInputs] = useState({
    maxspeed: 5,
    size: 48,
    acceleration: 0.1,
    color: "#7f7f7f",
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

    class Ball {
      constructor() {
        this.resetPosition();
        this.velocity = p.createVector();
        this.acceleration = p.createVector();
      }

      resetPosition() {
        this.position = p.createVector(w / 2, h / 2);
      }

      update() {
        const { maxspeed, size, acceleration, color } = inputsRef.current;
        let mouse = p.createVector(p.mouseX, p.mouseY);
        let dir = mouse.sub(this.position);
        dir.setMag(acceleration);
        this.acceleration = dir;
        this.velocity.add(this.acceleration);
        this.velocity.limit(maxspeed);
        this.position.add(this.velocity);

        p.stroke(0);
        p.strokeWeight(2);
        p.fill(p.color(color));
        p.circle(this.position.x, this.position.y, size);
      }
    }

    p.setup = () => {
      w = p._userNode.clientWidth;
      h = p._userNode.clientHeight;
      p.createCanvas(w, h);
      ball = new Ball();
    };

    p.draw = () => {
      const screenEl = document.querySelector('.screen');
      let bgColor = window.getComputedStyle(screenEl).backgroundColor.match(/\d+/g);
      if (bgColor) {
        bgColor = bgColor.map(Number);
        p.background(bgColor[0], bgColor[1], bgColor[2]);
      } else {
        p.background(0);
      }
      ball.update();
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
      <Screen sketch={Sketch} />
      <div className="inputs-container">
        <NumberInput
          label="Ball Size:"
          name="size"
          placeholder="Insert Ball Size..."
          val={inputs.size}
          min={10}
          max={200}
          onChange={e => handleInputChange("size", Number(e.target.value))}
        />
        <NumberInput
          label="Max Speed:"
          name="maxspeed"
          placeholder="Insert Max Speed..."
          val={inputs.maxspeed}
          min={1}
          max={20}
          onChange={e => handleInputChange("maxspeed", Number(e.target.value))}
        />
        <NumberInput
          label="Acceleration:"
          name="acceleration"
          placeholder="Insert Acceleration..."
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

      <TheoryRenderer theory={chapters.find(ch => ch.link === useLocation().pathname)?.theory} />
    </>
  );
}