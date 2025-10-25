import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

// UI shell
import Stars from "../../components/Stars.jsx";
import GradientBackground from "../../components/GradientBackground.jsx";
import TopSim from "../../components/TopSim.jsx";
import Screen from "../../components/Screen.jsx";
import Controls from "../../components/Controls.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs.jsx";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";

// Config & content
import chapters from "../../data/chapters.js";
import { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper } from "../../data/configs/BallAcceleration.js";

// Utils for visuals
import getBackgroundColor from "../../utils/getBackgroundColor.js";
import { drawGlow, drawForceVector } from "../../utils/drawUtils.js";
import { computeDelta, isPaused, setPause } from "../../constants/Time.js";

export function BallAcceleration() {
  // EN: Simulation inputs
  // IT: Parametri della simulazione
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const inputsRef = useRef(inputs);
  useEffect(() => { inputsRef.current = inputs; }, [inputs]);

  // EN: Info panel data (computed each frame)
  // IT: Dati del pannello info (calcolati ad ogni frame)
  const [simData, setSimData] = useState({});

  // EN: Force remount of the canvas on reset/load
  // IT: Forza il remount della canvas su reset/caricamento
  const [resetVersion, setResetVersion] = useState(0);

  const location = useLocation();
  const theory = useMemo(
    () => chapters.find((ch) => ch.link === location.pathname)?.theory,
    [location.pathname]
  );

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const Sketch = useCallback((p) => {
    // EN: Local physics state (pixels)
    // IT: Stato fisico locale (pixel)
    let pos, vel, acc;
    let w, h;

    // EN: Utility to clamp vector magnitude (px/frame)
    // IT: Utility per limitare il modulo del vettore (px/frame)
    const clampVelocity = (vx, vy, max) => {
      const sp = Math.hypot(vx, vy);
      if (sp > max && sp > 0) {
        const k = max / sp;
        return { x: vx * k, y: vy * k };
      }
      return { x: vx, y: vy };
    };

    p.setup = () => {
      w = p._userNode.clientWidth;
      h = p._userNode.clientHeight;
      p.createCanvas(w, h);

      // EN: Initialize at top-middle with zero velocity/acceleration
      // IT: Inizializza a metà in alto con velocità/accelerazione nulle
      pos = p.createVector(w / 2, inputsRef.current.size / 2 + 10);
      vel = p.createVector(0, 0);
      acc = p.createVector(0, 0);

      p.background(getBackgroundColor());
    };

    p.draw = () => {
      const { size, maxspeed, acceleration, ballColor } = inputsRef.current;
      // EN: Time scaling support via global time utilities (SpeedControl)
      // IT: Supporto alla scalatura del tempo tramite utilità globali (SpeedControl)
      const s = computeDelta(p) * 60; // scale factor relative to 60 FPS

      // EN: Background with subtle persistence could be added via a trail layer; here we clear per frame
      // IT: Uno sfondo persistente (scia) si può aggiungere con un layer; qui puliamo ogni frame
      const bg = getBackgroundColor();
      p.background(bg[0], bg[1], bg[2]);

      // EN: Compute acceleration towards mouse (target)
      // IT: Calcola accelerazione verso il mouse (target)
      const tx = p.mouseX;
      const ty = p.mouseY;
      const dx = tx - pos.x;
      const dy = ty - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1e-3) {
        acc.x = (dx / dist) * acceleration; // px/frame²
        acc.y = (dy / dist) * acceleration; // px/frame²
      } else {
        acc.x = 0; acc.y = 0;
      }

      // EN: Integrate motion (semi-implicit Euler) with time scale
      // IT: Integrazione del moto (Eulero semi-implicito) con fattore tempo
      vel.x += acc.x * s;
      vel.y += acc.y * s;
      const clamped = clampVelocity(vel.x, vel.y, maxspeed);
      vel.x = clamped.x; vel.y = clamped.y;
      pos.x += vel.x * s;
      pos.y += vel.y * s;

      // EN: Simple boundary collisions (perfectly elastic)
      // IT: Collisioni con i bordi (elastiche)
      if (pos.x - size / 2 < 0) { pos.x = size / 2; vel.x *= -1; }
      if (pos.x + size / 2 > w) { pos.x = w - size / 2; vel.x *= -1; }
      if (pos.y - size / 2 < 0) { pos.y = size / 2; vel.y *= -1; }
      if (pos.y + size / 2 > h) { pos.y = h - size / 2; vel.y *= -1; }

      // EN: Hover detection for glow
      // IT: Rilevamento hover per bagliore
      const isHover = p.dist(pos.x, pos.y, p.mouseX, p.mouseY) <= size / 2;

      // EN: Draw ball with glow
      // IT: Disegna la palla con bagliore
      drawGlow(
        p,
        isHover,
        ballColor,
        () => {
          p.noStroke();
          p.fill(ballColor);
          p.circle(pos.x, pos.y, size);
        },
        20
      );

      // EN: Visualize acceleration vector (red arrow)
      // IT: Visualizza il vettore accelerazione (freccia rossa)
      drawForceVector(p, pos.x, pos.y, { x: acc.x, y: acc.y }, "red");

      // EN: Update info panel
      // IT: Aggiorna pannello info
      setSimData(
        SimInfoMapper(
          { pos: { x: pos.x, y: pos.y }, vel: { x: vel.x, y: vel.y }, acc: { x: acc.x, y: acc.y }, target: { x: tx, y: ty } },
          {}
        )
      );
    };

    p.windowResized = () => {
      w = p._userNode.clientWidth;
      h = p._userNode.clientHeight;
      p.resizeCanvas(w, h);
      // EN: Re-center the ball to keep it visible on resize
      // IT: Ricentra la palla per mantenerla visibile al resize
      pos.set(w / 2, Math.min(h - inputsRef.current.size / 2, Math.max(inputsRef.current.size / 2, pos.y)));
    };
  }, []);

  return (
    <>
      {/* EN: Scene chrome (stars + gradient + header) */}
      {/* IT: Cornice della scena (stelle + gradiente + intestazione) */}
      <TopSim />
      <Stars color="var(--accent-color)" opacity={0.3} />
      <GradientBackground />

      {/* EN: Canvas */}
      {/* IT: Canvas */}
      <Screen sketch={Sketch} key={resetVersion} />

      {/* EN: Main controls (save/load, speed, play/pause, reset, share/embed) */}
      {/* IT: Controlli principali (salva/carica, velocità, play/pausa, reset, condividi/incorpora) */}
      <Controls
        onReset={() => {
          const wasPaused = isPaused();
          // resetTime() is already invoked inside ResetButton; avoid double call here
          if (wasPaused) setPause(true);
          setInputs(INITIAL_INPUTS);
          setResetVersion((v) => v + 1);
        }}
        inputs={inputs}
        simulation={location.pathname}
        onLoad={(loaded) => {
          setInputs(loaded);
          setResetVersion((v) => v + 1);
        }}
      />

      {/* EN: Simulation-specific inputs */}
      {/* IT: Parametri specifici della simulazione */}
      <DynamicInputs config={INPUT_FIELDS} values={inputs} onChange={handleInputChange} />

      {/* EN: Real-time info panel */}
      {/* IT: Pannello info in tempo reale */}
      <SimInfoPanel data={simData} />

      {/* EN: Theory content */}
      {/* IT: Contenuti teorici */}
      <TheoryRenderer theory={theory} />
    </>
  );
}
