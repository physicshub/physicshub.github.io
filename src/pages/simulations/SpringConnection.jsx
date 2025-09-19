import { useState, useRef, useEffect, useCallback } from "react";

import Screen from "../../components/Screen.jsx";
import TopSim from "../../components/TopSim.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { gravityTypes } from "../../data/gravity.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";

import Bob from "../../components/classes/Bob.js";
import Spring from "../../components/classes/Spring.js";

import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";

export function SpringConnection() {
  const [inputs, setInputs] = useState({
    bobMass: 24,
    bobDamping: 0.98,
    gravity: 1,
    springRestLength: 100,
    springK: 0.2,
    minLength: 30,
    maxLength: 400,
    bobColor: "#7f7f7f",
    anchorColor: "#7f7f7f",
    springColor: "#000000",
    bobSize: 48
  });

    // Input handling
    const inputsRef = useRef(inputs);
    useEffect(() => {
        inputsRef.current = inputs;
    }, [inputs]);

    const handleInputChange = (name, value) => {
        setInputs(prev => ({...prev, [name]: value}));
    };

  const bgColor = useRef([0, 0, 0]);

  const Sketch = useCallback(p => {
    let spring, bob;

    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode
      p.createCanvas(w, h)

      const style = getComputedStyle(document.querySelector('.screen'));
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

      const { gravity, springK, springRestLength, bobMass, bobDamping, bobSize, bobColor, springColor, anchorColor, minLength, maxLength } = inputsRef.current;

      let Gravity = p.createVector(0, gravity);
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
      const { clientWidth: w, clientHeight: h } = p._userNode
      p.resizeCanvas(w, h);

      // Ricrea gli oggetti con i parametri correnti
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
      <TopSim/>
      <Stars color="#AEE3FF" opacity={0.3}/>
      <GradientBackground />
      <Screen sketch={Sketch} />
      <div className="inputs-container">
        <NumberInput
          label="Bob Mass"
          val={inputs.bobMass}
          min={1}
          max={100}
          step={1}
          onChange={e => handleInputChange("bobMass", Number(e.target.value))}
        />
        <NumberInput
          label="Bob Size"
          val={inputs.bobSize}
          min={5}
          max={200}
          step={1}
          onChange={e => handleInputChange("bobSize", Number(e.target.value))}
        />
        <NumberInput
          label="Damping Bob"
          val={inputs.bobDamping}
          min={0}
          max={1}
          step={0.01}
          onChange={e => handleInputChange("bobDamping", Number(e.target.value))}
        />
        <SelectInput
          label="Gravity"
          options={gravityTypes}
          value={inputs.gravity}
          onChange={e => handleInputChange("gravity", Number(e.target.value))}
        />
        <NumberInput
          label="Spring costant (k)"
          val={inputs.springK}
          min={0.01}
          max={1}
          step={0.01}
          onChange={e => handleInputChange("springK", Number(e.target.value))}
        />
        <NumberInput
          label="Spring Rest Length"
          val={inputs.springRestLength}
          min={10}
          max={500}
          step={1}
          onChange={e => handleInputChange("springRestLength", Number(e.target.value))}
        />
        <NumberInput
          label="Min Length"
          val={inputs.minLength}
          min={0}
          max={200}
          step={1}
          onChange={e => handleInputChange("minLength", Number(e.target.value))}
        />
        <NumberInput
          label="Max Length"
          val={inputs.maxLength}
          min={50}
          max={500}
          step={1}
          onChange={e => handleInputChange("maxLength", Number(e.target.value))}
        />
        <ColorInput
          label="Bob Color"
          val={inputs.bobColor}
          onChange={e => handleInputChange("bobColor", e.target.value)}
        />
        <ColorInput
          label="Anchor Color"
          val={inputs.anchorColor}
          onChange={e => handleInputChange("anchorColor", e.target.value)}
        />
        <ColorInput
          label="Spring Color"
          val={inputs.springColor}
          onChange={e => handleInputChange("springColor", e.target.value)}
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
