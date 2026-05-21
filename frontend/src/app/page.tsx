"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Network, Brain, Search, Upload,
  Globe, Zap, MapPin, Layers, Navigation,
} from "lucide-react";

const FEATURES = [
  {
    icon: Network,
    title: "Semantic Graph World",
    description:
      "Force-directed graphs reveal hidden patterns and conceptual clusters that linear search can never show. Navigate knowledge like a map.",
    color: "#4285f4",
    badge: "Graph Engine",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Gemini AI explains why concepts connect, surfaces unexpected relationships, and generates contextual insights about every node.",
    color: "#34a853",
    badge: "Gemini AI",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Search by meaning, not keywords. Vector similarity finds conceptually adjacent ideas across any topic boundary.",
    color: "#4285f4",
    badge: "Vector Search",
  },
  {
    icon: Upload,
    title: "Universal Data Ingestion",
    description:
      "Upload TXT, JSON, or CSV. The system parses, embeds, and weaves your data into the knowledge graph automatically.",
    color: "#fbbc04",
    badge: "Auto-Embed",
  },
  {
    icon: Globe,
    title: "Cluster Discovery",
    description:
      "KMeans clustering auto-groups semantically related nodes. Color-coded domains let you navigate any knowledge space.",
    color: "#ea4335",
    badge: "KMeans",
  },
  {
    icon: Zap,
    title: "Real-Time Vector Store",
    description:
      "Qdrant powers sub-millisecond nearest-neighbor retrieval. Every query, every connection delivered at the speed of thought.",
    color: "#34a853",
    badge: "Qdrant",
  },
];

const DEMO_NODES = [
  { cx: 400, cy: 200, r: 20, color: "#4285f4", label: "AI / ML" },
  { cx: 210, cy: 145, r: 13, color: "#34a853", label: "Fintech" },
  { cx: 590, cy: 125, r: 15, color: "#00bcd4", label: "Climate" },
  { cx: 355, cy: 305, r: 12, color: "#fbbc04", label: "Robotics" },
  { cx: 125, cy: 275, r: 11, color: "#9c27b0", label: "Computing" },
  { cx: 655, cy: 265, r: 14, color: "#ea4335", label: "HealthTech" },
  { cx: 485, cy: 325, r: 11, color: "#009688", label: "SpaceTech" },
  { cx: 255, cy: 355, r: 10, color: "#8bc34a", label: "Agriculture" },
];

const LINKS = [
  [0, 1], [0, 2], [0, 3], [2, 5], [3, 6], [1, 4], [4, 7], [0, 5], [2, 6],
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen bg-[#1d2c4d] overflow-x-hidden overflow-y-auto">
      {/* Map-style background */}
      <div className="fixed inset-0 map-bg pointer-events-none" />

      {/* Subtle grid lines like map tiles */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Google Maps-style top navigation bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-2"
        style={{
          background: "rgba(26, 32, 50, 0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo — Google Maps style */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 mr-2"
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <MapPin className="w-8 h-8 text-[#4285f4]" strokeWidth={2} />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 40%, rgba(66,133,244,0.3), transparent 70%)",
              }}
            />
          </div>
          <div>
            <div
              className="text-[#e8eaed] font-medium text-sm leading-tight"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              Semantic World
            </div>
            <div className="text-[#9aa0a6] text-xs leading-tight">Explorer</div>
          </div>
        </motion.div>

        {/* Fake search bar — Google Maps style */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 max-w-lg"
        >
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-full"
            style={{
              background: "#303952",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            <Search className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
            <span className="text-[#9aa0a6] text-sm flex-1">
              Search the semantic universe...
            </span>
            <div
              className="w-px h-4 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <Navigation className="w-4 h-4 text-[#4285f4] flex-shrink-0" />
          </div>
        </motion.div>

        {/* Nav actions */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-2 ml-2"
        >
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full gmap-pill">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[#4285f4] qdrant-pulse"
            />
            Qdrant · Live
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-200"
            style={{
              background: "#4285f4",
              boxShadow: "0 1px 4px rgba(66,133,244,0.4)",
            }}
          >
            Open Map
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </nav>

      {/* Hero — full viewport map preview */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-14"
      >
        {/* Map preview canvas */}
        <div className="absolute inset-0 top-14 overflow-hidden">
          <svg className="w-full h-full opacity-40" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="softglow">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Background "water" areas */}
            <ellipse cx="200" cy="600" rx="300" ry="200" fill="#17263c" opacity="0.6" />
            <ellipse cx="1000" cy="100" rx="250" ry="180" fill="#17263c" opacity="0.5" />

            {/* "Road" lines */}
            {[
              "M 0 350 Q 300 300 600 350 Q 900 400 1200 350",
              "M 600 0 Q 580 200 600 350 Q 620 500 600 700",
              "M 0 150 Q 400 180 700 200 Q 900 210 1200 180",
              "M 100 700 Q 400 600 700 550 Q 900 520 1200 540",
            ].map((d, i) => (
              <path key={i} d={d} stroke="rgba(56,65,78,0.8)" strokeWidth="2" fill="none" />
            ))}

            {/* Semantic links */}
            {LINKS.map(([a, b], i) => {
              const na = DEMO_NODES[a];
              const nb = DEMO_NODES[b];
              const sx = (na.cx / 800) * 1200;
              const sy = (na.cy / 400) * 700;
              const tx = (nb.cx / 800) * 1200;
              const ty = (nb.cy / 400) * 700;
              return (
                <motion.line
                  key={i}
                  x1={sx} y1={sy} x2={tx} y2={ty}
                  stroke="rgba(66,133,244,0.3)"
                  strokeWidth="1.5"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity }}
                />
              );
            })}

            {/* Nodes as map pins */}
            {DEMO_NODES.map((node, i) => {
              const x = (node.cx / 800) * 1200;
              const y = (node.cy / 400) * 700;
              return (
                <motion.g key={i}>
                  {/* Glow */}
                  <circle cx={x} cy={y} r={node.r * 4} fill={node.color} opacity={0.06} filter="url(#softglow)" />
                  {/* Ripple */}
                  <motion.circle
                    cx={x} cy={y} r={node.r + 4}
                    fill="none" stroke={node.color} strokeWidth="1"
                    animate={{ r: [node.r + 4, node.r + 16], opacity: [0.5, 0] }}
                    transition={{ duration: 2.5 + i * 0.3, repeat: Infinity }}
                  />
                  {/* Main dot */}
                  <motion.circle
                    cx={x} cy={y} r={node.r}
                    fill={node.color}
                    opacity={0.9}
                    animate={{ r: [node.r, node.r * 1.1, node.r] }}
                    transition={{ duration: 3 + i * 0.2, repeat: Infinity }}
                  />
                  {/* White center */}
                  <circle cx={x} cy={y} r={node.r * 0.35} fill="white" opacity={0.9} />
                  {/* Label chip */}
                  <rect
                    x={x - 28} y={y + node.r + 6}
                    width={56} height={16}
                    rx={8}
                    fill="rgba(26,32,50,0.9)"
                    stroke={node.color}
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={x} y={y + node.r + 17}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="9"
                    fontFamily="Roboto, sans-serif"
                    fontWeight="500"
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Hero content — Google Maps info card style */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 text-center max-w-3xl mx-auto px-6"
        >
          {/* Hackathon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(66,133,244,0.12)",
              border: "1px solid rgba(66,133,244,0.3)",
              color: "#8ab4f8",
              fontSize: 12,
              fontFamily: "Roboto Mono, monospace",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#4285f4] qdrant-pulse" />
            Qdrant Think Outside the Bot · Hackathon 2025
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "Roboto, sans-serif", letterSpacing: "-0.5px" }}
          >
            Google Maps
            <br />
            <span style={{ color: "#4285f4" }}>for Ideas.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-[#9aa0a6] max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Upload any dataset. Watch it transform into a living semantic universe.
            Explore clusters, discover hidden connections, and navigate knowledge
            the way it was always meant to be explored.
          </motion.p>

          {/* CTA buttons — Google Maps style */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/explore"
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-medium text-base transition-all duration-200"
              style={{
                background: "#4285f4",
                boxShadow: "0 2px 8px rgba(66,133,244,0.5), 0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <Navigation className="w-4 h-4" />
              Explore the Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[#9aa0a6] hover:text-white font-medium text-base transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Layers className="w-4 h-4" />
              How it works
            </a>
          </motion.div>

          {/* Stats row — Google Maps style chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-3 mt-8 flex-wrap"
          >
            {[
              { label: "30 demo nodes", color: "#4285f4" },
              { label: "Qdrant vector DB", color: "#34a853" },
              { label: "Gemini embeddings", color: "#fbbc04" },
              { label: "768 dimensions", color: "#ea4335" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(26,32,50,0.9)",
                  border: `1px solid ${chip.color}30`,
                  color: chip.color,
                  fontFamily: "Roboto Mono, monospace",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: chip.color }}
                />
                {chip.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Google Maps-style bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(29,44,77,0.8))",
          }}
        />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features section — Google Maps card grid */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* Section label */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs"
              style={{
                background: "rgba(66,133,244,0.1)",
                border: "1px solid rgba(66,133,244,0.2)",
                color: "#8ab4f8",
                fontFamily: "Roboto Mono, monospace",
              }}
            >
              <Layers className="w-3 h-3" />
              Platform Features
            </div>
            <h2
              className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              Beyond the chatbot.
            </h2>
            <p className="text-[#9aa0a6] text-lg max-w-2xl mx-auto">
              Traditional search returns documents. Semantic World Explorer reveals
              the invisible architecture of knowledge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group rounded-xl p-5 transition-all duration-200 cursor-default"
                style={{
                  background: "rgba(26, 32, 50, 0.9)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}40`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${feature.color}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      background: `${feature.color}18`,
                      border: `1px solid ${feature.color}30`,
                    }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3
                        className="text-white font-medium text-sm"
                        style={{ fontFamily: "Roboto, sans-serif" }}
                      >
                        {feature.title}
                      </h3>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: `${feature.color}15`,
                          color: feature.color,
                          fontFamily: "Roboto Mono, monospace",
                          fontSize: 10,
                        }}
                      >
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-[#9aa0a6] text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section — Google Maps "directions" card style */}
      <section className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{
              background: "rgba(26, 32, 50, 0.97)",
              border: "1px solid rgba(66,133,244,0.2)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(66,133,244,0.1)",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #4285f4, #34a853, #fbbc04, #ea4335)" }}
            />

            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(66,133,244,0.12)",
                border: "1px solid rgba(66,133,244,0.3)",
              }}
            >
              <MapPin className="w-7 h-7 text-[#4285f4]" />
            </div>

            <h2
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              Enter the semantic universe
            </h2>
            <p className="text-[#9aa0a6] text-base mb-8 leading-relaxed">
              30 demo nodes loaded and ready. Zoom, explore, discover.
              Or upload your own data and watch it come alive.
            </p>

            <Link
              href="/explore"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-white font-medium text-base transition-all duration-200"
              style={{
                background: "#4285f4",
                boxShadow: "0 2px 8px rgba(66,133,244,0.5)",
              }}
            >
              <Navigation className="w-4 h-4" />
              Open the Explorer
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Tech stack row */}
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/5">
              {["Qdrant", "Gemini AI", "Next.js", "FastAPI"].map((tech) => (
                <span
                  key={tech}
                  className="text-xs text-[#5f6368]"
                  style={{ fontFamily: "Roboto Mono, monospace" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer — Google Maps style */}
      <footer
        className="relative border-t py-5 px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4285f4]" />
            <span className="text-[#5f6368] text-xs" style={{ fontFamily: "Roboto, sans-serif" }}>
              Semantic World Explorer
            </span>
            <span className="text-[#3c4043] text-xs">·</span>
            <span className="text-[#5f6368] text-xs">Qdrant Hackathon 2025</span>
          </div>
          <span
            className="text-[#5f6368] text-xs"
            style={{ fontFamily: "Roboto Mono, monospace" }}
          >
            Powered by Qdrant + Gemini
          </span>
        </div>
      </footer>
    </div>
  );
}
