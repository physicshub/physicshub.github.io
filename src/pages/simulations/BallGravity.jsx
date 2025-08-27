import React, { useState, useRef, useEffect, useCallback } from "react";
import p5 from "p5";

import TopSim from "../../components/TopSim.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { gravityTypes } from "../../data/gravity.js";
import { useLocation } from "react-router-dom";

import Ball from "../../components/classes/Ball.js";

export function BallGravity() {
  const [config, setConfig] = useState({
    mass: 5,
    size: 48,
    gravity: 1,
    color: "#7f7f7f",
    wind: 0.1,
    friction: 0
  });

  // handling input
  const handleChange = useCallback(
    (name) => (e) => {
      const val = name === "color" ? e.target.value : +e.target.value;
      setConfig((cfg) => ({ ...cfg, [name]: val }));
    },
    []
  );
  const [isBlowing, setIsBlowing] = useState(false);

  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const canvasParent = useRef(null);
  const p5Instance = useRef(null);

  const bgColor = useRef([0, 0, 0]);

  useEffect(() => {
    const sketch = (p) => {
      let w, h, ball;

      p.setup = () => {
        w = canvasParent.current.clientWidth;
        h = canvasParent.current.clientHeight;
        p.createCanvas(w, h).parent(canvasParent.current);

        // leggo colore di sfondo dal CSS del contenitore
        const style = getComputedStyle(canvasParent.current);
        const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
        bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];

        ball = new Ball(p, configRef.current, w, h);
      };

      p.draw = () => {
        const { gravity, wind, friction } = configRef.current;
        ball.setConfig(configRef.current);

        p.background(...bgColor.current);

        // gravità
        ball.applyForce(p.createVector(0, gravity));

        // vento
        if (p.mouseIsPressed) {
          ball.applyForce(p.createVector(wind, 0));
        }

        // attrito quando la palla tocca terra
        if (ball.contactEdge()) {
          let fric = ball.vel.copy();
          fric.mult(-1);
          fric.setMag(friction);
          ball.applyForce(fric);
        }

        ball.update();
      };

      // eventi mouse
      p.mousePressed = () => setIsBlowing(true);
      p.mouseReleased = () => setIsBlowing(false);

      // resize finestra
      p.windowResized = () => {
        const newW = canvasParent.current.clientWidth;
        const newH = canvasParent.current.clientHeight;
        p.resizeCanvas(newW, newH);
        ball.reset(newW, newH);
      };
    };

    p5Instance.current = new p5(sketch, canvasParent.current);

    return () => {
      p5Instance.current.remove();
    };
  }, []);

  return (
    <>
      <TopSim/>

      {/* canvas simulazione */}
      <div
        ref={canvasParent}
        className="screen wind-container"
        style={{ flex: 1 }}
      >
        <div
          className={`wind-overlay ${isBlowing ? 'blowing' : ''}`}
          aria-hidden="true"
        >
          <svg
            className="wind-icon"
            viewBox="0 0 64 32"
            width="80"
            height="40"
          >
            <path
              d="M2 10 Q18 5, 30 10 T62 10"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M8 20 Q22 15, 34 20 T62 20"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="58" cy="10" r="2" fill="white" />
            <circle cx="56" cy="20" r="2" fill="white" />
          </svg>
        </div>
      </div>

      {/* pannello controlli */}
      <div className="inputs-container">
        <NumberInput
          label="Ball Size:"
          val={config.size}
          min={10}
          max={200}
          onChange={handleChange("size")}
        />
        <NumberInput
          label="Mass:"
          val={config.mass}
          min={1}
          max={20}
          onChange={handleChange("mass")}
        />
        <NumberInput
          label="Wind:"
          val={config.wind}
          min={0}
          max={10}
          step={0.1}
          onChange={handleChange("wind")}
        />
        <NumberInput
          label="Friction:"
          val={config.friction}
          min={0}
          max={2}
          onChange={handleChange("friction")}
        />
        <SelectInput
          label="Gravity Types:"
          options={gravityTypes}
          value={config.gravity}
          onChange={handleChange("gravity")}
        />
        <ColorInput
          label="Ball Color:"
          value={config.color}
          onChange={handleChange("color")}
        />
      </div>

      {/* teoria */}
      <TheoryRenderer
        theory={
          chapters.find(ch => ch.link === useLocation().pathname)?.theory
        }
      />
    </>
  );
}
