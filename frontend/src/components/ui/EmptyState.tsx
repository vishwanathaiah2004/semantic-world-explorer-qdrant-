"use client";

import { motion } from "framer-motion";
import { Upload, RefreshCw, Wifi } from "lucide-react";

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Map background hint */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-sm px-8"
      >
        {/* Google Maps-style info card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(26, 32, 50, 0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Animated pin */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(66,133,244,0.1)",
                  border: "1px solid rgba(66,133,244,0.25)",
                }}
              >
                <Wifi className="w-7 h-7 text-[#4285f4] opacity-60" />
              </div>
            </motion.div>
            {/* Shadow */}
            <motion.div
              animate={{ scaleX: [1, 0.7, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
              style={{ background: "rgba(0,0,0,0.4)", filter: "blur(4px)" }}
            />
          </div>

          <h3
            className="text-[#e8eaed] text-lg font-medium mb-2"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Connecting to the universe
          </h3>
          <p
            className="text-[#9aa0a6] text-sm leading-relaxed mb-6"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Make sure Qdrant and the backend are running, then refresh.
            Or upload your own data to begin exploring.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={onUpload}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-200"
              style={{
                background: "#4285f4",
                boxShadow: "0 1px 4px rgba(66,133,244,0.4)",
                fontFamily: "Roboto, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#5a95f5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#4285f4";
              }}
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[#9aa0a6] text-sm transition-all hover:text-[#e8eaed]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "Roboto, sans-serif",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
