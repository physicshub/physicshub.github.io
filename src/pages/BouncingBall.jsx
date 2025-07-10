import { useState, useRef, useEffect, useCallback } from "react";
import Screen from "../components/Screen.jsx"
import NumberInput from "../components/inputs/NumberInput.jsx"
import CheckboxInput from "../components/inputs/CheckboxInput.jsx"
import Back from "../components/Back.jsx"

export function BouncingBall() {
    const [inputs, setInputs] = useState({
        velocityX: 2.5,
        velocityY: 2,
        size: 48,
        trailEnabled: true,
    });

    // Input handling
    const inputsRef = useRef(inputs);
    useEffect(() => {
        inputsRef.current = inputs;
    }, [inputs]);

    const handleInputChange = (name, value) => {
        setInputs(prev => ({
        ...prev,
        [name]: value
        }));
    };

    // p5 sketch
    const Sketch = useCallback(p => {
        let position, velocity

        p.setup = () => {
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.createCanvas(w, h)

            position = p.createVector(100, 100)
            velocity = p.createVector(2.5, 2)

        }

        p.draw = () => {
            const { velocityX, velocityY, size, trailEnabled } = inputsRef.current;
            if (Math.abs(velocity.x) !== Math.abs(velocityX)) {
                velocity.x = Math.sign(velocity.x) * Math.abs(velocityX);
            }
            if (Math.abs(velocity.y) !== Math.abs(velocityY)) {
                velocity.y = Math.sign(velocity.y) * Math.abs(velocityY);
            }

            if (position.x > p.width || position.x < 0) velocity.x *= -1;
            if (position.y > p.height || position.y < 0) velocity.y *= -1;
            position.add(velocity)

            const screenEl = document.querySelector('.screen');
            const bgColor = window
                .getComputedStyle(screenEl)
                .backgroundColor.match(/\d+/g)
                .map(Number);

            if (trailEnabled) {
                p.noStroke();
                p.fill(bgColor[0], bgColor[1], bgColor[2], 60);
                p.rect(0, 0, p.width, p.height);
                p.stroke(0);
                p.fill(127);
            } else {
                p.background(bgColor[0], bgColor[1], bgColor[2]);
            }
            p.circle(position.x, position.y, size);   
        }

        p.windowResized = () => {
            const { clientWidth: w, clientHeight: h } = p._userNode
            p.resizeCanvas(w, h)
        }
    }, []);

    return(
        <>
            <Back content="Back to home" link="/" />
            <Screen sketch={Sketch}/>
            <main>
                <NumberInput
                    label="Velocity X:"
                    name="velocityX"
                    placeholder="Insert velocity for X axis..."
                    val={inputs.velocityX}
                    onChange={e => handleInputChange("velocityX", Number(e.target.value))}
                />
                <NumberInput
                    label="Velocity Y:"
                    name="velocityY"
                    placeholder="Insert velocity for Y axis..."
                    val={inputs.velocityY}
                    onChange={e => handleInputChange("velocityY", Number(e.target.value))}
                />
                <NumberInput
                    label="Ball Size:"
                    name="size"
                    placeholder="Insert Ball Size..."
                    val={inputs.size}
                    onChange={e => handleInputChange("size", Number(e.target.value))}
                />
                <CheckboxInput
                    label="Enable trail"
                    name="trailEnabled"
                    checked={inputs.trailEnabled}
                    onChange={e =>
                        handleInputChange("trailEnabled", e.target.checked)
                    }
                />
            </main>
        </>
    );
}