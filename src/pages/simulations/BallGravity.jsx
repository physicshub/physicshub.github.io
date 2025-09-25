import React, { useState, useRef, useEffect, useCallback } from "react";
import p5 from "p5";

import TopSim from "../../components/TopSim.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";
import TheoryRenderer from "../../components/theory/TheoryRenderer";
import chapters from "../../data/chapters.js";
import {
  gravityTypes,
  accelSI_to_pxSec,
  accelPxSec_to_SI,
  pixelsToMeters
} from "../../data/constants.js";
import { useLocation } from "react-router-dom";
import GradientBackground from "../../components/GradientBackground.jsx";
import Stars from "../../components/Stars.jsx";

import Ball from "../../components/classes/Ball.js";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";


export function BallGravity() {
  const location = useLocation();

  const [config, setConfig] = useState({
    massKg: 5,                // kg
    sizePx: 40,               // px (estetico)
    gravityMps2: accelPxSec_to_SI(
      gravityTypes.find(g => g.label.includes("Earth")).value
    ),                         // m/s²
    color: "#7f7f7f",
    windMps2: 1,               // m/s²
    frictionMu: 0              // coefficiente di attrito μ
  });

  const [simData, setSimData] = useState({});
  const handleChange = useCallback(
    (name, converter) => (e) => {
      const val = name === "color" ? e.target.value : +e.target.value;
      setConfig(cfg => ({
        ...cfg,
        [name]: converter ? converter(val) : val
      }));
    },
    []
  );

  const [isBlowing, setIsBlowing] = useState(false);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const canvasParent = useRef(null);
  const p5Instance = useRef(null);
  const bgColor = useRef([0, 0, 0]);
  const maxHeightRef = useRef(0);

  const lastInfoUpdateMs = useRef(0);
  const INFO_UPDATE_INTERVAL_MS = 200;

  useEffect(() => {
    const sketch = (p) => {
      let w, h, ball;

      p.setup = () => {
        w = canvasParent.current.clientWidth;
        h = canvasParent.current.clientHeight;
        p.createCanvas(w, h).parent(canvasParent.current);

        const style = getComputedStyle(canvasParent.current);
        const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
        bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];

        ball = new Ball(p, {
          mass: configRef.current.massKg,
          size: configRef.current.sizePx,
          color: configRef.current.color
        }, w, h);
      };

      p.draw = () => {
        const { massKg, gravityMps2, windMps2, frictionMu } = configRef.current;

        ball.setConfig({
          mass: massKg,
          size: configRef.current.sizePx,
          color: configRef.current.color
        });

        p.background(...bgColor.current);

        // Gravità come accelerazione costante (indipendente dalla massa)
        const gravityPx = accelSI_to_pxSec(gravityMps2);
        ball.applyAcceleration(p.createVector(0, gravityPx));

        // Vento come forza (dipende dalla massa)
        if (p.mouseIsPressed) {
          const windAccelPx = accelSI_to_pxSec(windMps2/massKg);
          // Forza = m * a
          const windForce = p.createVector(windAccelPx, 0);
          ball.applyForce(windForce);
        }

        // Attrito: a_f = μ * g
        if (ball.contactEdge() && ball.vel.mag() > 0) {
          const frictionAccelSI = frictionMu * gravityMps2;
          const frictionAccelPx = accelSI_to_pxSec(frictionAccelSI);

          const fric = ball.vel.copy();
          fric.mult(-1);
          fric.setMag(frictionAccelPx);
          ball.applyAcceleration(fric);
        }

        ball.update();

        // Altezza massima raggiunta
        const currentHeightM = pixelsToMeters(h - ball.pos.y);
        if (currentHeightM > maxHeightRef.current) {
          maxHeightRef.current = currentHeightM;
        }

        // Tempo di caduta teorico
        let fallTime = 0;
        if (gravityMps2 > 0) {
          fallTime = Math.sqrt((2 * maxHeightRef.current) / gravityMps2);
        }

        // Aggiornamento pannello info con throttle
        const now = p.millis();
        if (now - lastInfoUpdateMs.current >= INFO_UPDATE_INTERVAL_MS) {
          const speedMs = pixelsToMeters(ball.vel.mag());
          const accelMs2 = accelPxSec_to_SI(ball.acc.mag());
          const posXM = pixelsToMeters(ball.pos.x);
          const posYM = pixelsToMeters(ball.pos.y);
          const keJ = 0.5 * massKg * Math.pow(speedMs, 2);

          setSimData({
            velocity: `${speedMs.toFixed(2)} m/s`,
            acceleration: `${accelMs2.toFixed(2)} m/s²`,
            position: `(${posXM.toFixed(2)}, ${posYM.toFixed(2)}) m`,
            kineticEnergy: `${keJ.toFixed(2)} J`,
            fallTime: `${fallTime.toFixed(2)} s`
          });

          lastInfoUpdateMs.current = now;
        }
      };

      p.mousePressed = () => setIsBlowing(true);
      p.mouseReleased = () => setIsBlowing(false);

      p.windowResized = () => {
        const newW = canvasParent.current.clientWidth;
        const newH = canvasParent.current.clientHeight;
        p.resizeCanvas(newW, newH);
        ball.reset(newW, newH);
      };
    };

    p5Instance.current = new p5(sketch, canvasParent.current);
    return () => { p5Instance.current.remove(); };
  }, []);

  const currentGravityPx = accelSI_to_pxSec(config.gravityMps2);

  return (
    <>
      <TopSim/>
      <Stars color="#AEE3FF" opacity={0.3}/>
      <GradientBackground/>

      <div ref={canvasParent} className="screen wind-container" style={{ flex: 1, position: "relative" }}>
        <SimInfoPanel data={simData} />
        <div className={`wind-overlay ${isBlowing ? 'blowing' : ''}`} aria-hidden="true">
          <svg className="wind-icon" viewBox="0 0 64 32" width="80" height="40">
            <path d="M2 10 Q18 5, 30 10 T62 10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <path d="M8 20 Q22 15, 34 20 T62 20" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="58" cy="10" r="2" fill="white" />
            <circle cx="56" cy="20" r="2" fill="white" />
          </svg>
        </div>
      </div>

      <div className="inputs-container">
        <NumberInput label="Ball size (px):" val={config.sizePx} min={1} max={100} step={1} onChange={handleChange("sizePx")} />
        <NumberInput label="Mass (kg):" val={config.massKg} min={0.1} max={20} step={0.1} onChange={handleChange("massKg")} />
        <NumberInput label="Wind (m/s²):" val={config.windMps2} min={0} max={5} step={0.1} onChange={handleChange("windMps2")} />
        <NumberInput label="Friction coefficient μ:" val={config.frictionMu} min={0} max={1} step={0.01} onChange={handleChange("frictionMu")} />
        <SelectInput label="Gravity types:" options={gravityTypes} value={currentGravityPx} onChange={handleChange("gravityMps2", accelPxSec_to_SI)} />
        <ColorInput label="Ball color:" value={config.color} onChange={handleChange("color")} />
      </div>

      <TheoryRenderer theory={chapters.find(ch => ch.link === location.pathname)?.theory} />
    </>
  );
}
