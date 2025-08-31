import React, { useEffect, useRef } from "react";

/**
 * ShootingStarsBackground
 * Comete che attraversano il viewport, disegnate su <canvas>, con stelle di sfondo che "twinkano".
 *
 * Props:
 * - count: numero massimo di comete simultanee (default 12)
 * - speed: moltiplicatore della velocità (default 1)
 * - direction: "down-right" | "down-left" (default "down-right")
 * - color: colore della cometa (default "#ffffff")
 * - showStars: mostra le stelline di sfondo (default true)
 * - starDensity: densità stelle (0..0.002 circa) (default 0.00015)
 * - opacity: opacità globale del canvas (0..1) (default 1)
 * - zIndex: z-index del canvas (default 0)
 * - className: classi aggiuntive per styling (opzionale)
 */
export default function Stars({
  count = 12,
  speed = 1,
  direction = "down-right",
  color = "#ffffff",
  showStars = true,
  starDensity = 0.00015,
  opacity = 1,
  zIndex = 0,
  className = "",
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = window.innerWidth;
    let h = window.innerHeight;

    const state = {
      lastTime: performance.now(),
      comets: [],
      stars: [],
      spawnTimer: 0,
      spawnIntervalMin: 140, // ms
      spawnIntervalMax: 900, // ms
      offscreenMargin: 120,
    };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      if (showStars) initStars();
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function hexToRgb(hex) {
      const m = hex.replace("#", "");
      const bigint = parseInt(m.length === 3 ? m.split("").map(c => c + c).join("") : m, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    const baseRGB = hexToRgb(color);

    function rgba(a) {
      return `rgba(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}, ${a})`;
    }

    function initStars() {
      const area = w * h;
      const target = Math.max(20, Math.min(500, Math.floor(area * starDensity)));
      state.stars = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.1),
        baseA: rand(0.25, 0.8),
        tw: rand(0.5, 2.2), // velocità di twinkle
        phase: rand(0, Math.PI * 2),
      }));
    }

    function spawnComet() {
      // Direzione
      const angleDeg =
        direction === "down-left" ? rand(145, 160) : rand(20, 35);
      const angle = (angleDeg * Math.PI) / 180;

      const baseSpeed = rand(420, 900) * speed; // px/s
      const vx = Math.cos(angle) * baseSpeed;
      const vy = Math.sin(angle) * baseSpeed;

      // Punto di spawn (appena fuori dallo schermo nella direzione opposta)
      let x, y;
      const m = state.offscreenMargin;
      if (direction === "down-left") {
        x = rand(-m, w + m);
        y = rand(-m, 0);
      } else {
        x = rand(-m, w + m);
        y = rand(-m, 0);
      }

      const size = rand(1.2, 2.4);
      const tail = rand(90, 220); // lunghezza scia in px
      const life = rand(1.2, 2.4); // secondi visibili (fallback)

      state.comets.push({
        x,
        y,
        vx,
        vy,
        size,
        tail,
        born: performance.now(),
        maxLife: life,
      });
    }

    function update(dt) {
      // Spawn
      state.spawnTimer -= dt * 1000;
      if (state.comets.length < count && state.spawnTimer <= 0) {
        spawnComet();
        state.spawnTimer = rand(state.spawnIntervalMin, state.spawnIntervalMax);
      }

      // Update comete
      const now = performance.now();
      state.comets = state.comets.filter((c) => {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        const alive = (now - c.born) / 1000 < c.maxLife;
        const onscreen =
          c.x > -state.offscreenMargin &&
          c.x < w + state.offscreenMargin &&
          c.y > -state.offscreenMargin &&
          c.y < h + state.offscreenMargin;
        return alive && onscreen;
      });
    }

    function drawBackgroundStars(t) {
      if (!showStars) return;
      for (let i = 0; i < state.stars.length; i++) {
        const s = state.stars[i];
        const a = s.baseA * (0.6 + 0.4 * Math.sin(s.phase + t * s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(Math.max(0, Math.min(1, a)));
        ctx.fill();
      }
    }

    function drawComets() {
      for (let i = 0; i < state.comets.length; i++) {
        const c = state.comets[i];

        // Direzione normalizzata (per scia)
        const spd = Math.hypot(c.vx, c.vy) || 1;
        const dx = (c.vx / spd) * c.tail;
        const dy = (c.vy / spd) * c.tail;

        const headX = c.x;
        const headY = c.y;
        const tailX = c.x - dx;
        const tailY = c.y - dy;

        // Scia con gradiente
        const grad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        grad.addColorStop(0, rgba(0.9));
        grad.addColorStop(0.4, rgba(0.5));
        grad.addColorStop(1, rgba(0));

        ctx.strokeStyle = grad;
        ctx.lineWidth = c.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bagliore sulla testa della cometa
        const glowR = c.size * 3.2;
        const glow = ctx.createRadialGradient(
          headX, headY, 0,
          headX, headY, glowR
        );
        glow.addColorStop(0, rgba(0.8));
        glow.addColorStop(1, rgba(0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(headX, headY, glowR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(t) {
      const now = t || performance.now();
      const dt = Math.min(0.033, Math.max(0.001, (now - state.lastTime) / 1000));
      state.lastTime = now;

      ctx.clearRect(0, 0, w, h);
      drawBackgroundStars(now / 1000);
      update(dt);
      drawComets();

      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    if (showStars) initStars();
    state.lastTime = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, speed, direction, color, showStars, starDensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex,
        opacity,
      }}
    />
  );
}
