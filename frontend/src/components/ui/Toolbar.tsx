"use client";

import { motion } from "framer-motion";
import { RefreshCw, Upload, Home, Sparkles } from "lucide-react";
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center justify-between px-6 py-4 border-b border-white/5"
      style={{ background: "rgba(5, 8, 16, 0.8)", backdropFilter: "blur(16px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
            Semantic World
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-slate-600 text-xs font-mono">
              {nodeCount} nodes · {linkCount} links
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <Home className="w-4 h-4" />
        </Link>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.4)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)";
          }}
        >
          <Upload className="w-4 h-4" />
          Ingest Data
        </button>
      </div>
    </motion.div>
  );
}
