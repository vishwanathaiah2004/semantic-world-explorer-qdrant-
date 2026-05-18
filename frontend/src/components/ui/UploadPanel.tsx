"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { api } from "@/services/api";

interface UploadPanelProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function UploadPanel({ onSuccess, onClose }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; nodes_created?: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setResult(null);
    try {
      const res = await api.uploadFile(file);
      setResult({ success: true, message: res.message, nodes_created: res.nodes_created });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg rounded-3xl p-8 relative"
        style={{
          background: "rgba(10, 14, 30, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Ingest Data
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Upload TXT, JSON, or CSV. Your data will be embedded and woven into the semantic graph.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".txt,.json,.csv"
          className="hidden"
          onChange={handleChange}
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="relative rounded-2xl flex flex-col items-center justify-center gap-4 py-16 cursor-pointer transition-all duration-200"
          style={{
            border: `2px dashed ${dragging ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)"}`,
            background: dragging ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
          }}
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-500" />
          )}
          <div className="text-center">
            <p className="text-white font-medium">
              {uploading ? "Uploading & embedding..." : "Drop your file here"}
            </p>
            <p className="text-slate-500 text-sm mt-1">TXT · JSON · CSV — up to 10MB</p>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${
                result.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${result.success ? "text-emerald-300" : "text-red-300"}`}>
                  {result.message}
                </p>
                {result.nodes_created && (
                  <p className="text-emerald-500 text-xs mt-1 font-mono">
                    {result.nodes_created} nodes added to the graph
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "TXT", desc: "Plain text, one entry per paragraph" },
            { label: "JSON", desc: "Array of objects with title/content" },
            { label: "CSV", desc: "Columns: title, content, category" },
          ].map((fmt) => (
            <div
              key={fmt.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <FileText className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <p className="text-white text-xs font-mono font-bold">.{fmt.label.toLowerCase()}</p>
              <p className="text-slate-600 text-xs mt-0.5">{fmt.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
