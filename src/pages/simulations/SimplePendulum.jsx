import { useState, useRef, useEffect, useCallback } from "react";

import Screen from "../../components/Screen.jsx";
import TopSim from "../../components/TopSim.js";
import TheoryRenderer from "../../components/theory/TheoryRenderer.js";
import chapters from "../../data/chapters.js";
import { gravityTypes } from "../../data/constants.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";

import Pendulum from "../../components/classes/Pendulum.js";

import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";


export function SimplePendulum() {
    const [inputs, setInputs] = useState({
        damping: 0.995,
        size: 24.0,
        color: "#7f7f7f",
        gravity: 1,
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
        let pendulum;

        p.setup = () => {
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.createCanvas(w, h);
            const style = getComputedStyle(document.querySelector('.screen'));
            const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
            bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];

            pendulum = new Pendulum(p, w / 2, 0, 175);
        };

        p.draw = () => {
            p.background(...bgColor.current);
            
            pendulum.damping = inputsRef.current.damping;
            pendulum.size = inputsRef.current.size;
            pendulum.gravity = inputsRef.current.gravity;
            pendulum.color = inputsRef.current.color;

            pendulum.update();
            pendulum.show();
            pendulum.drag();
        };

        p.mousePressed = () => {
            pendulum.clicked(p.mouseX, p.mouseY);
        };

        p.mouseReleased = () => {
            pendulum.stopDragging();
        };

        p.windowResized = () => {
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.resizeCanvas(w, h);

            pendulum = new Pendulum(p, w / 2, 0, 175);
        };
    }, []);

    return (
        <>
        <TopSim/>
        <Screen sketch={Sketch} />
        <Stars color="#AEE3FF" opacity={0.3}/>
        <GradientBackground/>
        <div className="inputs-container">
            <NumberInput
            label="Bob Size"
            val={inputs.size}
            min={5}
            max={200}
            step={1}
            onChange={e => handleInputChange("size", Number(e.target.value))}
            />
            <NumberInput
            label="Damping"
            val={inputs.damping}
            min={0}
            max={1}
            step={0.01}
            onChange={e => handleInputChange("damping", Number(e.target.value))}
            />
            <SelectInput
            label="Gravity"
            options={gravityTypes}
            value={inputs.gravity}
            onChange={e => handleInputChange("gravity", Number(e.target.value))}
            />
            <ColorInput
            label="Color"
            val={inputs.color}
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
