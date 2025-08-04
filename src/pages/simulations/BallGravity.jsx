import React, {
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
import p5 from "p5";

import Back from "../../components/Back.jsx";
import NumberInput from "../../components/inputs/NumberInput.jsx";
import ColorInput from "../../components/inputs/ColorInput.jsx";
import SelectInput from "../../components/inputs/SelectInput.jsx";

export function BallGravity() {
  const [config, setConfig] = useState({
    mass: 5,
    size: 48,
    gravity: 1,
    color: "#7f7f7f",
    wind: 0.1
  });
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const canvasParent = useRef(null);
  const p5Instance   = useRef(null);

  const bgColor = useRef([0, 0, 0]);

  useEffect(() => {
    const sketch = p => {
      let w, h, ball;

      class Ball {
        constructor(cfg) {
          const { size, mass } = cfg;
          this.cfg         = { ...cfg };
          this.mass        = mass;
          this.pos         = p.createVector(w / 2, size / 2);
          this.vel         = p.createVector(0, 0);
          this.acc         = p.createVector(0, 0);
        }
        applyForce(f) {
          const force = f.copy().div(this.mass);
          this.acc.add(force);
        }
        update() {
          const { size, color } = this.cfg;
          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0);

          p.stroke(0);
          p.strokeWeight(2);
          p.fill(p.color(color));
          p.ellipse(this.pos.x, this.pos.y, size);

          if (this.pos.x < 0 || this.pos.x > w) {
            this.vel.x *= -1;
            this.pos.x = p.constrain(this.pos.x, 0, w);
          }
          if (this.pos.y > h) {
            this.vel.y *= -1;
            this.pos.y = h;
          }
        }
        reset(newW, newH) {
          w = newW; h = newH;
          const { size } = this.cfg;
          this.pos = p.createVector(w / 2, size / 2);
          this.vel.mult(0);
          this.acc.mult(0);
        }
        setConfig(cfg) {
          this.cfg = { ...cfg };
          this.mass = cfg.mass;
        }
      }

      p.setup = () => {
        w = canvasParent.current.clientWidth;
        h = canvasParent.current.clientHeight;
        p.createCanvas(w, h).parent(canvasParent.current);

        const style = getComputedStyle(canvasParent.current);
        const rgb = (style.backgroundColor.match(/\d+/g) || []).map(Number);
        bgColor.current = rgb.length === 3 ? rgb : [0, 0, 0];

        ball = new Ball(configRef.current);
      };

      p.draw = () => {
        const { gravity, wind } = configRef.current;
        ball.setConfig(configRef.current);

        p.background(...bgColor.current);

        ball.applyForce(p.createVector(0, gravity));

        if (p.mouseIsPressed) {
          ball.applyForce(p.createVector(wind, 0));
        }

        ball.update();
      };

      p.windowResized = () => {
        const newW = canvasParent.current.clientWidth;
        const newH = canvasParent.current.clientHeight;
        p.resizeCanvas(newW, newH);
        ball.reset(newW, newH);
      };
    };

    p5Instance.current = new p5(sketch, canvasParent.current);

    return () => {
      p5Instance.current.remove();
    };
  }, []);

  const handleChange = useCallback(
    name => e => {
      const val = name === "color" ? e.target.value : +e.target.value;
      setConfig(cfg => ({ ...cfg, [name]: val }));
    },
    []
  );

  const gravityTypes = ((earthG = 1) => [
    { value: 0.000 * earthG, label: "Zero Gravity"                    },
    { value: 0.028 * earthG, label: "Ceres (0.27 m/s²)"               },
    { value: 0.063 * earthG, label: "Pluto (0.62 m/s²)"               },
    { value: 0.165 * earthG, label: "Moon (1.62 m/s²)"                },
    { value: 0.378 * earthG, label: "Mercury (3.70 m/s²)"             },
    { value: 0.379 * earthG, label: "Mars (3.71 m/s²)"                },
    { value: 0.886 * earthG, label: "Uranus (8.69 m/s²)"              },
    { value: 0.904 * earthG, label: "Venus (8.87 m/s²)"               },
    { value: 1.000 * earthG, label: "Earth (9.81 m/s²)"               },
    { value: 1.065 * earthG, label: "Saturn (10.44 m/s²)"             },
    { value: 1.140 * earthG, label: "Neptune (11.15 m/s²)"            },
    { value: 2.528 * earthG, label: "Jupiter (24.79 m/s²)"            }
  ])();



  return (
    <>
      <Back content="Back to home" link="/" />

      <div ref={canvasParent} className="screen" style={{ flex: 1 }} />

      <main>
        <NumberInput
          label="Ball Size:"
          val={config.size}
          min={10}
          max={200}
          onChange={handleChange("size")}
        />
        <NumberInput
          label="Mass:"
          val={config.mass}
          min={1}
          max={20}
          onChange={handleChange("mass")}
        />
        <NumberInput
          label="Wind:"
          val={config.wind}
          min={0}
          max={10}
          step={0.1}
          onChange={handleChange("wind")}
        />
        <SelectInput
          label="Gravity Types:"
          options={gravityTypes}
          value={config.gravity}
          onChange={handleChange("gravity")}
        />
        <ColorInput
          label="Ball Color:"
          value={config.color}
          onChange={handleChange("color")}
        />
      </main>
    </>
  );
}
