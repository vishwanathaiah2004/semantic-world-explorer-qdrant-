"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Connecting to Qdrant...",
  "Loading vector embeddings...",
  "Building semantic graph...",
  "Calculating cosine similarity...",
  "Materializing knowledge universe...",
];

export function MapLoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const [step, setStep] = useState(0);

  // Cycle through loading steps
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 600);
    return () => clearInterval(id);
  }, []);

  // Animated particle burst
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    interface Dot { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string; }
    const COLORS = ["#6366f1","#a78bfa","#22d3ee","#34d399","#818cf8"];
    const dots: Dot[] = Array.from({ length: 80 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.6 + 0.1;
      return {
        x: cx + (Math.random() - 0.5) * 300,
        y: cy + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient glow at center
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      grd.addColorStop(0, "rgba(99,102,241,0.06)");
      grd.addColorStop(1, "rgba(99,102,241,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 200, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Orbiting ring
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + t * 0.4;
        const r = 90 + Math.sin(t * 2 + i * 0.3) * 8;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        const alpha = 0.15 + Math.sin(t * 3 + i * 0.2) * 0.1;
        ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${alpha})`; ctx.fill();
      }

      // Floating dots
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        d.alpha = 0.3 + Math.sin(t * 2 + d.x * 0.01) * 0.2;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;

        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        g.addColorStop(0, d.color + Math.round(d.alpha * 255).toString(16).padStart(2,"0"));
        g.addColorStop(1, d.color + "00");
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color; ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: "#04060f" }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Central orb */}
        <div className="relative">
          {[0,1,2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-indigo-500/30"
              animate={{ scale: [1, 1.8 + i * 0.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(139,92,246,0.4), rgba(99,102,241,0.15))",
              border: "1px solid rgba(99,102,241,0.4)",
              boxShadow: "0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8"
            >
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="rgba(99,102,241,0.6)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="16" cy="4"  r="2.5" fill="#6366f1" />
                <circle cx="28" cy="16" r="2"   fill="#a78bfa" />
                <circle cx="16" cy="28" r="1.5" fill="#22d3ee" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-300 text-sm font-medium mb-1"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {STEPS[step]}
          </motion.p>
          <p className="text-slate-600 text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Qdrant · Gemini · 768 dimensions
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, #22d3ee)" }}
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
