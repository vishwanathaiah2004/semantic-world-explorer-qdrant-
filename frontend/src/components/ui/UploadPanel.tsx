"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, CheckCircle, AlertCircle, FileText,
  Loader2, Sparkles, Database,
} from "lucide-react";
import { api } from "@/services/api";

interface UploadPanelProps {
  onSuccess: () => void;
  onClose: () => void;
}

type UploadState = "idle" | "uploading" | "embedding" | "success" | "error";

export function UploadPanel({ onSuccess, onClose }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [result, setResult] = useState<{
    message: string;
    nodes_created?: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadState("uploading");
    setResult(null);

    // Simulate embedding phase for UX
    setTimeout(() => {
      if (uploadState === "uploading") setUploadState("embedding");
    }, 800);

    try {
      setUploadState("embedding");
      const res = await api.uploadFile(file);
      setUploadState("success");
      setResult({ message: res.message, nodes_created: res.nodes_created });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2200);
    } catch (e) {
      setUploadState("error");
      setResult({ message: e instanceof Error ? e.message : "Upload failed" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isProcessing = uploadState === "uploading" || uploadState === "embedding";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-lg rounded-3xl relative overflow-hidden"
        style={{
          background: "rgba(8, 11, 24, 0.99)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
        }}
      >
        {/* Top accent */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, transparent)" }}
        />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2
                  className="text-white font-bold text-xl"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Ingest Data
                </h2>
              </div>
              <p className="text-slate-500 text-sm">
                Upload your data — it will be embedded and woven into the semantic graph.
              </p>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".txt,.json,.csv"
            className="hidden"
            onChange={handleChange}
          />

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isProcessing) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileRef.current?.click()}
            className="relative rounded-2xl flex flex-col items-center justify-center gap-4 py-14 transition-all duration-300"
            style={{
              border: `2px dashed ${
                dragging
                  ? "rgba(99,102,241,0.7)"
                  : uploadState === "success"
                  ? "rgba(16,185,129,0.5)"
                  : uploadState === "error"
                  ? "rgba(239,68,68,0.4)"
                  : "rgba(255,255,255,0.08)"
              }`,
              background: dragging
                ? "rgba(99,102,241,0.06)"
                : uploadState === "success"
                ? "rgba(16,185,129,0.04)"
                : "rgba(255,255,255,0.015)",
              cursor: isProcessing ? "default" : "pointer",
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-full border border-indigo-500/20 flex items-center justify-center"
                      style={{ boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}
                    >
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border border-indigo-500/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">
                      {uploadState === "uploading" ? "Uploading..." : "Generating embeddings..."}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 font-mono">
                      {uploadState === "uploading"
                        ? "Parsing your data"
                        : "Gemini text-embedding-004 · 768 dimensions"}
                    </p>
                  </div>
                </motion.div>
              ) : uploadState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-300 text-sm font-semibold">
                      {result?.nodes_created} nodes added to the graph
                    </p>
                    <p className="text-slate-500 text-xs mt-1 font-mono">
                      Refreshing semantic universe...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      background: dragging
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${dragging ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <Upload
                      className="w-6 h-6 transition-colors"
                      style={{ color: dragging ? "#818cf8" : "rgba(100,116,139,0.6)" }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">
                      {dragging ? "Release to upload" : "Drop your file here"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      TXT · JSON · CSV — up to 10MB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {uploadState === "error" && result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl p-3 flex items-start gap-3"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{result.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Format guide */}
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { label: "TXT", desc: "Paragraphs become nodes" },
              { label: "JSON", desc: "Array with title/content" },
              { label: "CSV", desc: "title, content, category" },
            ].map((fmt) => (
              <div
                key={fmt.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <FileText className="w-3.5 h-3.5 text-slate-600 mx-auto mb-1.5" />
                <p className="text-white text-xs font-mono font-bold">.{fmt.label.toLowerCase()}</p>
                <p className="text-slate-600 text-xs mt-0.5">{fmt.desc}</p>
              </div>
            ))}
          </div>

          {/* Qdrant note */}
          <div
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <Sparkles className="w-3 h-3 text-indigo-500 flex-shrink-0" />
            <p className="text-xs text-slate-600 font-mono">
              Vectors stored in Qdrant · Cosine similarity · 768 dimensions
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
