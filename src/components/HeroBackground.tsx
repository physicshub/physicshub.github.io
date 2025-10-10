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
  particleDensity: 20000,
  minRadius: 10,
  speedRange: [0.0008, 0.003],
  wobbleRange: [3, 15],
  sizeRange: [0.2, 1],
  depthRange: [0.5, 3.5],
  trailOpacity: 0.9,
  mouseInfluence: 0.1,
  accentColorVar: "--ph-accent",
  shrinkMax: 0,
};

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const originalCount = useRef(0);
  const scrollProgress = useRef(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue(SIM_CONFIG.accentColorVar)
        .trim() || "#00e6e6";

    // HiDPI & resize
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // init particles
    const count = Math.floor(
      (canvas.offsetWidth * canvas.offsetHeight) /
        SIM_CONFIG.particleDensity
    );
    originalCount.current = count;
    const maxR = Math.min(canvas.offsetWidth, canvas.offsetHeight) / 2;
    particlesRef.current = Array.from({ length: count }, () => ({
      r: SIM_CONFIG.minRadius + Math.random() * maxR,
      a: Math.random() * Math.PI * 2,
      s:
        SIM_CONFIG.speedRange[0] +
        Math.random() *
          (SIM_CONFIG.speedRange[1] - SIM_CONFIG.speedRange[0]),
      wobble:
        SIM_CONFIG.wobbleRange[0] +
        Math.random() *
          (SIM_CONFIG.wobbleRange[1] - SIM_CONFIG.wobbleRange[0]),
      size:
        SIM_CONFIG.sizeRange[0] +
        Math.random() *
          (SIM_CONFIG.sizeRange[1] - SIM_CONFIG.sizeRange[0]),
      depth:
        SIM_CONFIG.depthRange[0] +
        Math.random() *
          (SIM_CONFIG.depthRange[1] - SIM_CONFIG.depthRange[0]),
    }));

    // mouse
    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.tx = e.clientX - rect.left;
      mouse.current.ty = e.clientY - rect.top;
    };
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });

    // scroll progress [0…1]
    const onScroll = () => {
      const top = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = Math.min(top / docH, 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // animate loop
    const animate = (time: number) => {
      // === pulizia completa del canvas per evitare resti ===
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // calcolo "mf" in funzione dello scroll: 0→1→0 lungo lo scroll continuo
      const p = scrollProgress.current;
      const cycle = p * 2;
      const mf = cycle <= 1 ? cycle : 2 - cycle;

      // dimensioni e centro
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;
      const shrink = 1 - SIM_CONFIG.shrinkMax * mf;

      // apply shrink
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(shrink, shrink);
      ctx.translate(-cx, -cy);

      // sfondo + trail - theme aware
      const theme = document.body.dataset.theme;
      if (theme === 'light') {
        ctx.fillStyle = `rgba(255, 255, 255, ${SIM_CONFIG.trailOpacity})`;
      } else {
        ctx.fillStyle = `rgba(11, 15, 25, ${SIM_CONFIG.trailOpacity})`;
      }
      ctx.fillRect(0, 0, w, h);

      // easing mouse
      mouse.current.x +=
        (mouse.current.tx - mouse.current.x) * 0.05;
      mouse.current.y +=
        (mouse.current.ty - mouse.current.y) * 0.05;

      // quante particelle disegnare
      const drawCount = Math.floor(
        originalCount.current * (1 - mf)
      );

      for (let i = 0; i < drawCount; i++) {
        const p = particlesRef.current[i];
        // dinamiche modificate
        const wob = Math.sin(time * 0.001 + i) * p.wobble * (1 + mf * 2);
        const rad = p.r * (1 + mf * 0.5) + wob;
        const sz = p.size * (1 + mf);
        p.a += p.s * p.depth * (1 + mf);

        // posizione
        const dx = (mouse.current.x - cx) * SIM_CONFIG.mouseInfluence * p.depth;
        const dy = (mouse.current.y - cy) * SIM_CONFIG.mouseInfluence * p.depth;
        const x = cx + Math.cos(p.a) * rad + dx;
        const y = cy + Math.sin(p.a) * rad + dy;

        // linea
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.15 * (1 - mf);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, sz * 5);
        glow.addColorStop(0, accent);
        glow.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.8 * (1 - mf);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, sz * 5, 0, Math.PI * 2);
        ctx.fill();

        // punto centrale
        ctx.globalAlpha = 1 * (1 - mf);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="ph-hero__canvas is-active" />;
}
