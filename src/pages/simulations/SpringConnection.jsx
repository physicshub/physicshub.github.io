import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import Screen from "../../components/Screen.jsx";
import TopSim from "../../components/TopSim.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";

import Bob from "../../components/classes/Bob.js";
import Spring from "../../components/classes/Spring.js";

import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";

import chapters from "../../data/chapters.js";
import {
  gravityTypes,
  metersToPixels,
  pixelsToMeters,
  springK_SI_to_px,
  springK_px_to_SI,
  kgToSimMass,
  accelSI_to_pxSec
} from "../../data/constants.js";

export function SpringConnection() {
  // State is in SI units and converted to px for the simulation
  const [inputs, setInputs] = useState({
    bobMass: kgToSimMass(10), // kg
    bobDamping: 1,
    gravity: gravityTypes.find(g => g.label.includes("Earth")).value, // m/s²
    springK: springK_SI_to_px(100), // N/m → N/px
    springRestLength: metersToPixels(0.5), // m → px
    minLength: metersToPixels(0.1), // m → px
    maxLength: metersToPixels(3.5), // m → px
    bobColor: "#7f7f7f",
    anchorColor: "#7f7f7f",
    springColor: "#000000",
    bobSize: 40 // px
  });

  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  // Handler for number-based inputs
  const handleNumberChange = (name, converter) => (e) => {
    const val = +e.target.value;
    setInputs(prev => ({
      ...prev,
      [name]: converter ? converter(val) : val
    }));
  };

  // FIX: Added a new handler specifically for string values (like colors)
  const handleValueChange = (name) => (e) => {
    setInputs(prev => ({
      ...prev,
      [name]: e.target.value
    }));
  };


  const bgColor = useRef([0, 0, 0]);

  const Sketch = useCallback(p => {
    let spring, bob;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);

      const style = getComputedStyle(document.querySelector(".screen"));
      const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
      bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];

      spring = new Spring(p, w / 2, 10, inputsRef.current.springRestLength);
      spring.k = inputsRef.current.springK;

      bob = new Bob(p, w / 2, 100);
      bob.mass = inputsRef.current.bobMass;
      bob.damping = inputsRef.current.bobDamping;
      bob.size = inputsRef.current.bobSize;
    };

    p.draw = () => {
      p.background(...bgColor.current);

      const {
        gravity,
        springK,
        springRestLength,
        bobMass,
        bobDamping,
        bobSize,
        bobColor,
        springColor,
        anchorColor,
        minLength,
        maxLength
      } = inputsRef.current;

      const gravityPx = accelSI_to_pxSec(gravity);
      let Gravity = p.createVector(0, gravityPx);
      bob.applyForce(Gravity);

      spring.k = springK;
      spring.restLength = springRestLength;
      bob.mass = bobMass;
      bob.damping = bobDamping;
      bob.size = bobSize;
      bob.color = bobColor;
      spring.color = springColor;
      spring.anchorColor = anchorColor;

      bob.update();
      bob.handleDrag(p.mouseX, p.mouseY);

      spring.connect(bob);
      spring.constrainLength(bob, minLength, maxLength);

      spring.showLine(bob);
      bob.show();
      spring.show();
    };

    p.mousePressed = () => {
      bob.handleClick(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
      bob.stopDragging();
    };

    p.windowResized = () => {
      const { springRestLength, springK, bobMass, bobDamping, bobSize } = inputsRef.current;
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);

      spring = new Spring(p, w / 2, 10, springRestLength);
      spring.k = springK;

      bob = new Bob(p, w / 2, 100);
      bob.mass = bobMass;
      bob.damping = bobDamping;
      bob.size = bobSize;
    };
  }, []);

  return (
    <>
      <TopSim />
      <Stars color="var(--accent-color)" opacity={0.3} />
      <GradientBackground />
      <Screen sketch={Sketch} />

      <div className="inputs-container">
        <NumberInput
          label="Bob Mass (kg)"
          val={inputs.bobMass}
          min={0.1}
          max={10}
          step={0.1}
          onChange={handleNumberChange("bobMass")}
        />
        <NumberInput
          label="Bob Size (px)"
          val={inputs.bobSize}
          min={0.05}
          max={40}
          step={0.01}
          onChange={handleNumberChange("bobSize")}
        />
        <NumberInput
          label="Damping Bob"
          val={inputs.bobDamping}
          min={0}
          max={1}
          step={0.01}
          onChange={handleNumberChange("bobDamping")}
        />
        <SelectInput
          label="Gravity (m/s²)"
          options={gravityTypes}
          value={inputs.gravity}
          onChange={handleNumberChange("gravity")}
        />
        <NumberInput
          label="Spring constant k (N/m)"
          val={springK_px_to_SI(inputs.springK)}
          min={0.01}
          max={500}
          step={0.1}
          onChange={handleNumberChange("springK", springK_SI_to_px)}
        />
        <NumberInput
          label="Spring Rest Length (m)"
          val={pixelsToMeters(inputs.springRestLength)}
          min={0.1}
          max={5}
          step={0.01}
          onChange={handleNumberChange("springRestLength", metersToPixels)}
        />
        <NumberInput
          label="Min Length (m)"
          val={pixelsToMeters(inputs.minLength)}
          min={0}
          max={2}
          step={0.01}
          onChange={handleNumberChange("minLength", metersToPixels)}
        />
        <NumberInput
          label="Max Length (m)"
          val={pixelsToMeters(inputs.maxLength)}
          min={0.5}
          max={5}
          step={0.01}
          onChange={handleNumberChange("maxLength", metersToPixels)}
        />
        {/* FIX: Using the new handleValueChange for colors */}
        <ColorInput
          label="Bob Color"
          val={inputs.bobColor}
          onChange={handleValueChange("bobColor")}
        />
        <ColorInput
          label="Anchor Color"
          val={inputs.anchorColor}
          onChange={handleValueChange("anchorColor")}
        />
        <ColorInput
          label="Spring Color"
          val={inputs.springColor}
          onChange={handleValueChange("springColor")}
        />
      </div>

      <TheoryRenderer
        theory={chapters.find(ch => ch.link === useLocation().pathname)?.theory}
      />
    </>
  );
}