"use client";

import { motion } from "framer-motion";
import { Upload, Wifi, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm px-8 relative"
      >
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              animation: "qdrantPulse 3s ease-in-out infinite",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wifi className="w-8 h-8 text-indigo-400/60" />
          </div>
        </div>

        <h3
          className="text-white text-xl font-bold mb-2"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Connecting to the universe
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Make sure Qdrant and the backend are running, then refresh. Or upload your own data to begin exploring.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onUpload}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200"
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 0 20px rgba(99,102,241,0.1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)";
            }}
          >
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-slate-400 text-sm transition-all hover:text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </motion.div>
    </div>
  );
}
