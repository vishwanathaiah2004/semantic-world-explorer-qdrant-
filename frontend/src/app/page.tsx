"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Globe, Network, Sparkles, Brain, Search, Upload } from "lucide-react";

const FEATURES = [
  {
    icon: Network,
    title: "Semantic Graph World",
    description: "Watch your ideas form living constellations. Force-directed graphs reveal hidden patterns and conceptual clusters that linear search can never show.",
    color: "#6366f1",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Gemini AI explains why concepts connect, surfaces unexpected relationships, and generates contextual insights about every node in your knowledge universe.",
    color: "#10b981",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Search by meaning, not keywords. Vector similarity finds conceptually adjacent ideas across any topic boundary, powered by state-of-the-art embeddings.",
    color: "#22d3ee",
  },
  {
    icon: Upload,
    title: "Universal Data Ingestion",
    description: "Upload TXT, JSON, or CSV. The system parses, embeds, and weaves your data into the knowledge graph automatically — no configuration needed.",
    color: "#f59e0b",
  },
  {
    icon: Globe,
    title: "Cluster Discovery",
    description: "KMeans clustering auto-groups semantically related nodes. Color-coded domains let you navigate the topology of any knowledge space.",
    color: "#ec4899",
  },
  {
    icon: Zap,
    title: "Real-Time Vector Store",
    description: "Qdrant powers sub-millisecond nearest-neighbor retrieval. Every query, every connection, every insight delivered at the speed of thought.",
    color: "#8b5cf6",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#050810] overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-purple-700/6 blur-[100px]" />
      </div>

      {/* Grid background */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center glow-indigo">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            Semantic World
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/explore"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 glow-indigo"
          >
            Launch Explorer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-8 pt-20">
        <motion.div style={{ y, opacity }} className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Qdrant Think Outside the Bot — Hackathon 2024
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="font-display font-bold text-6xl md:text-8xl text-white leading-[0.95] tracking-tight mb-8"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Google Maps
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-glow">
              for Ideas.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light"
          >
            Upload any dataset. Watch it transform into a living, breathing
            semantic universe. Explore clusters, discover hidden connections,
            and navigate knowledge the way it was always meant to be explored.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/explore"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all duration-300 glow-indigo"
            >
              Explore the Universe
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-slate-300 hover:text-white font-medium text-lg transition-all duration-200"
            >
              How it works
            </a>
          </motion.div>

          {/* Hero graph preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="relative mt-24 max-w-4xl mx-auto"
          >
            <div className="relative glass rounded-3xl border border-white/10 overflow-hidden" style={{ height: 400 }}>
              {/* Simulated graph preview with SVG */}
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <defs>
                  <radialGradient id="nodeGlow1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="nodeGlow2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="nodeGlow3" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </radialGradient>
                  <filter id="blur">
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                </defs>

                {/* Ambient glow */}
                <ellipse cx="400" cy="200" rx="300" ry="150" fill="rgba(99,102,241,0.06)" />

                {/* Links */}
                {[
                  [200, 150, 400, 200], [400, 200, 580, 130], [400, 200, 350, 300],
                  [580, 130, 650, 260], [350, 300, 480, 320], [200, 150, 120, 280],
                  [120, 280, 250, 350], [400, 200, 580, 130],
                ].map(([x1, y1, x2, y2], i) => (
                  <motion.line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(99,102,241,0.25)"
                    strokeWidth="1"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
                  />
                ))}

                {/* Nodes */}
                {[
                  { cx: 400, cy: 200, r: 18, color: "#6366f1", label: "AI" },
                  { cx: 200, cy: 150, r: 12, color: "#10b981", label: "Fintech" },
                  { cx: 580, cy: 130, r: 14, color: "#22d3ee", label: "Climate" },
                  { cx: 350, cy: 300, r: 11, color: "#f59e0b", label: "Robotics" },
                  { cx: 120, cy: 280, r: 10, color: "#8b5cf6", label: "Computing" },
                  { cx: 650, cy: 260, r: 13, color: "#ec4899", label: "Health" },
                  { cx: 480, cy: 320, r: 10, color: "#14b8a6", label: "Space" },
                  { cx: 250, cy: 350, r: 9, color: "#84cc16", label: "Agri" },
                ].map((node, i) => (
                  <motion.g key={i}>
                    <circle
                      cx={node.cx} cy={node.cy} r={node.r * 3}
                      fill={node.color}
                      opacity={0.08}
                      filter="url(#blur)"
                    />
                    <motion.circle
                      cx={node.cx} cy={node.cy} r={node.r}
                      fill={node.color}
                      opacity={0.9}
                      animate={{ r: [node.r, node.r * 1.15, node.r] }}
                      transition={{ duration: 2.5 + i * 0.3, repeat: Infinity }}
                    />
                    <circle cx={node.cx} cy={node.cy} r={node.r + 4} fill="none" stroke={node.color} strokeWidth="1" opacity={0.4} />
                    <text x={node.cx} y={node.cy + node.r + 14} textAnchor="middle" fill={node.color} fontSize="10" fontFamily="Space Grotesk" opacity={0.8}>
                      {node.label}
                    </text>
                  </motion.g>
                ))}
              </svg>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent pointer-events-none" />

              {/* Corner labels */}
              <div className="absolute top-4 left-4 text-xs text-slate-500 font-mono">SEMANTIC SPACE v1.0</div>
              <div className="absolute top-4 right-4 text-xs text-indigo-400 font-mono">30 NODES · 47 LINKS</div>
              <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono">COSINE SIMILARITY · QDRANT</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Beyond the chatbot.
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              Traditional search returns documents. Semantic World Explorer reveals the invisible architecture of knowledge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group glass rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-300"
                style={{ '--feature-color': feature.color } as React.CSSProperties}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-16 border border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-cyan-600/5 pointer-events-none" />
            <h2 className="font-display text-4xl font-bold text-white mb-6 relative" style={{ fontFamily: 'Syne, sans-serif' }}>
              Enter the semantic universe
            </h2>
            <p className="text-slate-400 text-lg mb-10 relative">
              30 demo nodes loaded and ready. Zoom, explore, discover. Or upload your own data and watch it come alive.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all duration-300 glow-indigo relative"
            >
              Open the Explorer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-slate-600 text-sm">
          <span>Semantic World Explorer — Qdrant Hackathon 2024</span>
          <span className="font-mono">Powered by Qdrant + Gemini</span>
        </div>
      </footer>
    </div>
  );
}
