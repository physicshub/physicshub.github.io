// IMPORTANT!
// This is a template file to use if you want create another brand new simulation.
// THIS FILE IS INACTIVE RIGHT NOW, USE BouncingBall Simulation as a model to follow, It's right now the best and more optimized simulation
// If you make some changes about code centralized that every simulation should use, add it here.
// If you have questions, please ask on the Github repository opening an issue.

import { useState, useRef, useEffect, useCallback } from "react";

import Screen from "../../(core)/components/Screen.jsx";
import TopSim from "../../(core)/components/TopSim.jsx";
import TheoryRenderer from "../../(core)/components/theory/TheoryRenderer";
import chapters from "../../(core)/data/chapters.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../(core)/components/GradientBackground.jsx";
import Stars from "../../(core)/components/Stars.jsx";

// Classes imports, example:
// import Spring from "../../components/classes/Bob.js";

// Components Inputs imports, example:
// import NumberInput from "../../components/inputs/NumberInput.jsx";

export function SIMULATIONNAME() {
  const [inputs, setInputs] = useState({
    //
    // Inputs
    //
  });

  // Input handling
  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const bgColor = useRef([0, 0, 0]);

  const Sketch = useCallback((p) => {
    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      const style = getComputedStyle(document.querySelector(".screen"));
      const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
      bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];
    };

    p.draw = () => {
      p.background(...bgColor.current);
      //
      // Draw Code
      //
    };

    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
    };
  }, []);

  return (
    <>
      <TopSim />
      <Stars color="var(--accent-color)" opacity={0.3} />
      <GradientBackground />
      <Screen sketch={Sketch} />
      <div className="inputs-container">// // Inputs Components //</div>

      <TheoryRenderer
        theory={
          chapters.find((ch) => ch.link === useLocation().pathname)?.theory
        }
      />
    </>
  );
}
