"use client";

import { motion } from "framer-motion";
import { RefreshCw, Upload, Home, Sparkles, Database, Activity } from "lucide-react";
import Link from "next/link";

interface ToolbarProps {
  nodeCount: number;
  linkCount: number;
  onUpload: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function Toolbar({ nodeCount, linkCount, onUpload, onRefresh, loading }: ToolbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex items-center justify-between px-5 py-3 relative z-20"
      style={{
        background: "rgba(4, 6, 16, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo + stats */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 0 12px rgba(99,102,241,0.2)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span
            className="text-white font-bold text-sm hidden sm:block"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Semantic Explorer
          </span>
        </Link>

        {/* Live stats */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Database className="w-3 h-3 text-slate-500" />
            <span className="text-xs font-mono text-slate-400">
              {nodeCount.toLocaleString()} nodes
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Activity className="w-3 h-3 text-slate-500" />
            <span className="text-xs font-mono text-slate-400">
              {linkCount.toLocaleString()} connections
            </span>
          </div>
        </div>
      </div>

      {/* Center — Qdrant badge + discovery stat */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#6366f1",
              boxShadow: "0 0 6px #6366f1",
              animation: "qdrantPulse 2.5s ease-in-out infinite",
            }}
          />
          <span className="text-xs font-mono text-indigo-400/70">
            Qdrant · Vector Search Active
          </span>
        </div>
        {linkCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400/70">
              {linkCount} semantic connections discovered
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
          title="Refresh graph"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all duration-200"
          style={{
            background: "rgba(99,102,241,0.18)",
            border: "1px solid rgba(99,102,241,0.35)",
            boxShadow: "0 0 12px rgba(99,102,241,0.1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.3)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.18)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(99,102,241,0.1)";
          }}
        >
          <Upload className="w-3.5 h-3.5" />
          Ingest Data
        </button>
      </div>
    </motion.div>
  );
}
