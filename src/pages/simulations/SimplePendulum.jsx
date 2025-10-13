import { useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

// --- Core Classes & Constants ---
import Pendulum from "../../components/classes/Pendulum.js";
import { INITIAL_INPUTS, INPUT_FIELDS } from "../../data/configs/SimplePendulum.js";
import chapters from "../../data/chapters.js";
import { resetTime, isPaused, setPause } from "../../constants/Time.js";

// --- Reusable UI Components ---
import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import useSimulationState from "../../hooks/useSimulationState.js";

export function SimplePendulum() {
  const location = useLocation();
  const storageKey = location.pathname.replaceAll(/[/#]/g, "");
  const { inputs, setInputs, inputsRef, resetInputs } = useSimulationState(INITIAL_INPUTS, storageKey);
  const [resetVersion, setResetVersion] = useState(0);

  // Ref to hold the pendulum instance
  const pendulumRef = useRef(null);

  const handleInputChange = useCallback((name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, [setInputs]);

  const theory = useMemo(
    () => chapters.find((ch) => ch.link === useLocation().pathname)?.theory,
    [location.pathname]
  );

  const sketch = useCallback((p) => {
    const getBackgroundColor = () => {
      const style = getComputedStyle(document.querySelector('.screen'));
      const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
      return rgb.length === 3 ? rgb : [0, 0, 0];
    };

    const createPendulum = () => {
      const { clientWidth: w } = p._userNode;
      pendulumRef.current = new Pendulum(p, w / 2, 0, 175);
    };
    
    p.setup = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.createCanvas(w, h);
      createPendulum();
    };

    p.draw = () => {
      p.background(getBackgroundColor());
      
      const pendulum = pendulumRef.current;
      if (!pendulum) return;

      // Update pendulum properties from inputs
      pendulum.damping = inputsRef.current.damping;
      pendulum.size = inputsRef.current.size;
      pendulum.gravity = inputsRef.current.gravity;
      pendulum.color = inputsRef.current.color;

      pendulum.update();
      pendulum.show();
      pendulum.drag();
    };

    p.mousePressed = () => {
      pendulumRef.current?.clicked(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
      pendulumRef.current?.stopDragging();
    };



    p.windowResized = () => {
      const { clientWidth: w, clientHeight: h } = p._userNode;
      p.resizeCanvas(w, h);
      createPendulum(); // Recreate the pendulum to recenter it
    };
  }, [inputsRef]);

  return (
    <SimulationLayout
      resetVersion={resetVersion}
      onReset={() => {
        const wasPaused = isPaused();
        resetTime();
        if (wasPaused) setPause(true);
        resetInputs(true);
        setResetVersion((v) => v + 1);
      }}
      inputs={inputs}
      simulation={location.pathname}
      onLoad={(loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      }}
      theory={theory}
    >
      <P5Wrapper sketch={sketch} key={resetVersion} />
      <DynamicInputs
        config={INPUT_FIELDS}
        values={inputs}
        onChange={handleInputChange}
      />
    </SimulationLayout>
  );
}