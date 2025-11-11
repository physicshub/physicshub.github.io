"use client"
import React, { useEffect, useRef } from "react";

export default function Comets({
  count = 12,
  speed = 1,
  direction = "down-right",
  color = "#ffffff",
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
      spawnTimer: 0,
      spawnIntervalMin: 140,
      spawnIntervalMax: 900,
      offscreenMargin: 120,
    };

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function hexToRgb(hex) {
      let m = hex.replace("#", "");
      if (m.length === 3) {
        m = m.split("").map((c) => c + c).join("");
      }
      const i = parseInt(m, 16);
      return {
        r: (i >> 16) & 255,
        g: (i >> 8) & 255,
        b: i & 255,
      };
    }

    const baseRGB = hexToRgb(color);

    function rgba(a) {
      return `rgba(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}, ${a})`;
    }

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
    }

    function spawnComet() {
      const angleDeg =
        direction === "down-left" ? rand(145, 160) : rand(20, 35);
      const angle = (angleDeg * Math.PI) / 180;
      const baseSpeed = rand(420, 900) * speed;
      const vx = Math.cos(angle) * baseSpeed;
      const vy = Math.sin(angle) * baseSpeed;

      const m = state.offscreenMargin;
      const x = rand(-m, w + m);
      const y = rand(-m, 0);

      const size = rand(1.2, 2.4);
      const tail = rand(90, 220);
      const life = rand(3.2, 4.4);

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
      state.spawnTimer -= dt * 1000;
      if (state.comets.length < count && state.spawnTimer <= 0) {
        spawnComet();
        state.spawnTimer = rand(
          state.spawnIntervalMin,
          state.spawnIntervalMax
        );
      }

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

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      update(dt);
      state.comets.forEach((c) => {
        const spd = Math.hypot(c.vx, c.vy) || 1;
        const dx = (c.vx / spd) * c.tail;
        const dy = (c.vy / spd) * c.tail;

        const headX = c.x;
        const headY = c.y;
        const tailX = c.x - dx;
        const tailY = c.y - dy;

        const grad = ctx.createLinearGradient(
          headX,
          headY,
          tailX,
          tailY
        );
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

        const glowR = c.size * 3.2;
        const glow = ctx.createRadialGradient(
          headX,
          headY,
          0,
          headX,
          headY,
          glowR
        );
        glow.addColorStop(0, rgba(0.8));
        glow.addColorStop(1, rgba(0));

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(headX, headY, glowR, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop(ts) {
      const now = ts || performance.now();
      const dt = Math.min(
        0.033,
        Math.max(0.001, (now - state.lastTime) / 1000)
      );
      state.lastTime = now;

      draw(dt);
      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, speed, direction, color]);

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
