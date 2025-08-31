import { useState, useRef, useEffect, useCallback } from "react";

import Screen from "../../components/Screen.jsx";
import TopSim from "../../components/TopSim.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import { useLocation } from "react-router-dom";

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
        setInputs(prev => ({...prev, [name]: value}));
    };


    const bgColor = useRef([0, 0, 0]);
    

    const Sketch = useCallback(p => {

        p.setup = () => {
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.createCanvas(w, h);
            const style = getComputedStyle(document.querySelector('.screen'));
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
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.resizeCanvas(w, h);
        };
    }, []);

    return (
        <>
            <TopSim/>
            <Screen sketch={Sketch} />
            <div className="inputs-container">
                //
                // Inputs Components
                //
            </div>

            <TheoryRenderer
                theory={
                chapters.find(ch => ch.link === useLocation().pathname)?.theory
                }
            />
        </>
    );
}
