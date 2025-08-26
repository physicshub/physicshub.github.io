import { useState, useRef, useEffect, useCallback } from "react";

import Screen from "../../components/Screen.jsx";
import TopSim from "../../components/TopSim.js";
import TheoryRenderer from "../../components/theory/TheoryRenderer.js";
import chapters from "../../data/chapters.js";
import { useLocation } from "react-router-dom";

import Pendulum from "../../components/classes/Pendulum.js";

import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";


export function SimplePendulum() {
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
        <div className="inputs-container">
            
        </div>

        <TheoryRenderer
            theory={
            chapters.find(ch => ch.link === useLocation().pathname)?.theory
            }
        />
        </>
    );
}
