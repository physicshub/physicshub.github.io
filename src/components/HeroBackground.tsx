// HeroBackground.tsx
import React, { useEffect, useMemo, useRef } from "react";
import "../styles/landing.css";

type Particle = {
  r: number;
  a: number;
  s: number;
  wobble: number;
  size: number;
  depth: number;
};

const SIM_CONFIG = {
  particleDensity: 8000, // più basso = più particelle
  minRadius: 40,
  speedRange: [0.0008, 0.003], // velocità rotazione
  wobbleRange: [3, 15], // oscillazione
  sizeRange: [0.5, 2], // dimensione particelle
  depthRange: [0.5, 3], // profondità (parallax)
  trailOpacity: 0.5, // opacità scia
  mouseInfluence: 0.05, // quanto il mouse sposta le particelle
  accentColorVar: "--ph-accent", // variabile CSS per il colore
};

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue(SIM_CONFIG.accentColorVar)
        .trim() || "#00e6e6";

    const scale = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * scale;
      canvas.height = canvas.offsetHeight * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const count = Math.floor(
      (canvas.offsetWidth * canvas.offsetHeight) / SIM_CONFIG.particleDensity
    );
    const maxRadius = Math.min(canvas.offsetWidth, canvas.offsetHeight) / 2;

    particlesRef.current = Array.from({ length: count }, () => ({
      r: SIM_CONFIG.minRadius + Math.random() * maxRadius,
      a: Math.random() * Math.PI * 2,
      s:
        SIM_CONFIG.speedRange[0] +
        Math.random() * (SIM_CONFIG.speedRange[1] - SIM_CONFIG.speedRange[0]),
      wobble:
        SIM_CONFIG.wobbleRange[0] +
        Math.random() * (SIM_CONFIG.wobbleRange[1] - SIM_CONFIG.wobbleRange[0]),
      size:
        SIM_CONFIG.sizeRange[0] +
        Math.random() * (SIM_CONFIG.sizeRange[1] - SIM_CONFIG.sizeRange[0]),
      depth:
        SIM_CONFIG.depthRange[0] +
        Math.random() * (SIM_CONFIG.depthRange[1] - SIM_CONFIG.depthRange[0]),
    }));

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.targetX = e.clientX - rect.left;
      mouse.current.targetY = e.clientY - rect.top;
    };
    canvas.addEventListener("pointermove", onMove, { passive: true });

    const animate = (time: number) => {
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

      ctx.fillStyle = `rgba(11, 15, 25, ${SIM_CONFIG.trailOpacity})`;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const cX = canvas.offsetWidth / 2;
      const cY = canvas.offsetHeight / 2;

      for (const [i, p] of particlesRef.current.entries()) {
        p.a += p.s * p.depth;
        const wob = Math.sin(time * 0.001 + i) * p.wobble;
        const rr = p.r + wob;
        const dx = (mouse.current.x - cX) * SIM_CONFIG.mouseInfluence * p.depth;
        const dy = (mouse.current.y - cY) * SIM_CONFIG.mouseInfluence * p.depth;
        const x = cX + Math.cos(p.a) * rr + dx;
        const y = cY + Math.sin(p.a) * rr + dy;

        // Scia
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 5);
        glow.addColorStop(0, accent);
        glow.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Punto centrale
        ctx.globalAlpha = 1;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, [reducedMotion]);

  return (
      <canvas ref={canvasRef} className="ph-hero__canvas is-active" />
  );
}
