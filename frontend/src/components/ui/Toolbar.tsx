"use client";

import { motion } from "framer-motion";
import { Upload, RefreshCw, Home, Sparkles, Database, Layers } from "lucide-react";
import Link from "next/link";

interface MapToolbarProps {
  nodeCount: number;
  linkCount: number;
  onUpload: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function MapToolbar({ nodeCount, linkCount, onUpload, onRefresh, loading }: MapToolbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="toolbar flex items-center gap-3 px-4 py-0 relative z-30 flex-shrink-0"
      style={{ height: 56 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
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
        <div className="hidden sm:block">
          <div className="text-slate-200 font-semibold text-sm leading-tight" style={{ fontFamily: "Syne, Space Grotesk, sans-serif" }}>
            Semantic World
          </div>
          <div className="text-slate-600 text-xs leading-tight" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Explorer
          </div>
        </div>
      </Link>

      <div className="w-px h-5 bg-white/8 flex-shrink-0" />

      {/* Spacer — search floats below */}
      <div className="flex-1" />

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
        <div className="semantic-badge flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          {nodeCount} nodes
        </div>
        <div className="semantic-badge flex items-center gap-1.5" style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.08)" }}>
          <Layers className="w-3 h-3" />
          {linkCount} links
        </div>
      </div>

      {/* Qdrant live */}
      <div
        className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs flex-shrink-0"
        style={{
          background: "rgba(4,6,15,0.7)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#475569",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 qdrant-pulse" />
        Qdrant · Live
      </div>

      <div className="w-px h-5 bg-white/8 flex-shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href="/"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </Link>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-30"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-white text-xs font-semibold transition-all duration-200 flex-shrink-0"
          style={{
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.4)",
            boxShadow: "0 0 16px rgba(99,102,241,0.15)",
            fontFamily: "Space Grotesk, sans-serif",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.35)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(99,102,241,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(99,102,241,0.15)";
          }}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Data</span>
        </button>
      </div>
    </motion.div>
  );
}

export { MapToolbar as Toolbar };
