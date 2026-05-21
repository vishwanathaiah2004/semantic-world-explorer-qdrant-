"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number; opacityDir: number;
  twinkleSpeed: number;
  color: string;
  type: "star" | "dust" | "nebula";
}

// Cinematic galaxy palette
const STAR_COLORS = [
  "rgba(99,102,241,",   // indigo
  "rgba(139,92,246,",   // purple
  "rgba(34,211,238,",   // cyan
  "rgba(167,139,250,",  // violet
  "rgba(248,250,252,",  // white
  "rgba(52,211,153,",   // emerald
];

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const starsRef  = useRef<Star[]>([]);
  const timeRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Create layered star field
    const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    starsRef.current = Array.from({ length: count }, (_, i): Star => {
      const type: Star["type"] =
        i < count * 0.6 ? "star" :
        i < count * 0.85 ? "dust" : "nebula";
      return {
        type,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (type === "nebula" ? 0.04 : type === "dust" ? 0.1 : 0.06),
        vy: (Math.random() - 0.5) * (type === "nebula" ? 0.04 : type === "dust" ? 0.1 : 0.06),
        radius: type === "nebula" ? Math.random() * 60 + 30
               : type === "dust"  ? Math.random() * 0.8 + 0.2
               :                    Math.random() * 1.2 + 0.3,
        opacity: type === "nebula" ? Math.random() * 0.04 + 0.01
               : Math.random() * 0.6 + 0.1,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        twinkleSpeed: Math.random() * 0.004 + 0.001,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };
    });

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, W(), H());

      const stars = starsRef.current;

      // ── Nebula clouds (large soft blobs) ──
      for (const s of stars) {
        if (s.type !== "nebula") continue;
        s.x += s.vx; s.y += s.vy;
        s.opacity += s.opacityDir * 0.0003;
        if (s.opacity > 0.05 || s.opacity < 0.005) s.opacityDir *= -1;
        if (s.x < -s.radius) s.x = W() + s.radius;
        if (s.x > W() + s.radius) s.x = -s.radius;
        if (s.y < -s.radius) s.y = H() + s.radius;
        if (s.y > H() + s.radius) s.y = -s.radius;

        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
        grd.addColorStop(0, `${s.color}${s.opacity.toFixed(3)})`);
        grd.addColorStop(1, `${s.color}0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // ── Dust particles ──
      for (const s of stars) {
        if (s.type !== "dust") continue;
        s.x += s.vx; s.y += s.vy;
        s.opacity += s.opacityDir * s.twinkleSpeed;
        if (s.opacity > 0.4 || s.opacity < 0.02) s.opacityDir *= -1;
        if (s.x < 0) s.x = W(); if (s.x > W()) s.x = 0;
        if (s.y < 0) s.y = H(); if (s.y > H()) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.opacity.toFixed(2)})`;
        ctx.fill();
      }

      // ── Stars with connection lines ──
      const activeStars = stars.filter(s => s.type === "star");
      for (let i = 0; i < activeStars.length; i++) {
        const s = activeStars[i];
        s.x += s.vx; s.y += s.vy;
        s.opacity += s.opacityDir * s.twinkleSpeed;
        if (s.opacity > 0.75 || s.opacity < 0.05) s.opacityDir *= -1;
        if (s.x < 0) s.x = W(); if (s.x > W()) s.x = 0;
        if (s.y < 0) s.y = H(); if (s.y > H()) s.y = 0;

        // Connection lines between nearby stars
        for (let j = i + 1; j < activeStars.length; j++) {
          const b = activeStars[j];
          const dx = s.x - b.x, dy = s.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.05;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }

        // Glow halo
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 5);
        grd.addColorStop(0, `${s.color}${(s.opacity * 0.5).toFixed(2)})`);
        grd.addColorStop(1, `${s.color}0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${Math.min(s.opacity, 0.9).toFixed(2)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.85 }}
    />
  );
}
