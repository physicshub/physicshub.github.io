"use client";
import React, { useEffect, useRef } from "react";

export default function Stars({
  // Density of stars per pixel area
  starDensity = 0.0003,
  // Star color (hex)
  color = "#ffffff",
  // Whether to render the starfield
  show = true,
  // Overall opacity of the canvas
  opacity = 1,
  // CSS z-index of the canvas
  zIndex = -2,
  // Additional CSS classes
  className = "",
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    // Device pixel ratio (clamped between 1 and 2)
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    // Canvas width and height in CSS pixels
    let width = window.innerWidth;
    let height = window.innerHeight;
    // Array to hold star objects
    let stars = [];

    // Generate a random number between min (inclusive) and max (exclusive)
    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Convert hex color to an RGB object
    function hexToRgb(hex) {
      let sanitized = hex.replace("#", "");
      if (sanitized.length === 3) {
        sanitized = sanitized
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const intVal = parseInt(sanitized, 16);
      return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255,
      };
    }

    const baseRGB = hexToRgb(color);

    // Build an rgba CSS string from baseRGB and alpha
    function rgba(alpha) {
      return `rgba(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}, ${alpha})`;
    }

    // Initialize or regenerate the stars array based on canvas size
    function initStars() {
      const area = width * height;
      // Determine star count, clamped between 20 and 500
      const count = Math.max(20, Math.min(500, Math.floor(area * starDensity)));
      stars = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.4, 1.1), // radius
        baseAlpha: rand(0.25, 0.8), // base opacity
        twinkleSpeed: rand(0.5, 2.2), // twinkle frequency
        phase: rand(0, Math.PI * 2), // phase offset for sine wave
      }));
    }

    // Adjust canvas size and DPI scaling on window resize
    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initStars();
    }

    // Draw all stars for the current animation timestamp
    function draw(timeSeconds) {
      if (!show) return;
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        // Compute twinkle factor with sine wave
        const alpha =
          star.baseAlpha *
          (0.6 + 0.4 * Math.sin(star.phase + timeSeconds * star.twinkleSpeed));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(Math.max(0, Math.min(1, alpha)));
        ctx.fill();
      });
    }

    // Main animation loop
    function animate(timestamp) {
      const seconds = timestamp / 1000;
      draw(seconds);
      rafRef.current = requestAnimationFrame(animate);
    }

    // Initial setup
    resizeCanvas();
    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resizeCanvas);

    // Cleanup on unmount or deps change
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [starDensity, color, show]);

  // Render a full-screen, non-interactive canvas
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
