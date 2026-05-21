"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, CheckCircle, AlertCircle, FileText, Loader2, MapPin,
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
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl relative overflow-hidden"
        style={{
          background: "rgba(22, 28, 46, 0.99)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(66,133,244,0.1)",
        }}
      >
        {/* Google Maps color bar */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, #4285f4, #34a853, #fbbc04, #ea4335)",
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(66,133,244,0.12)",
                  border: "1px solid rgba(66,133,244,0.25)",
                }}
              >
                <MapPin className="w-4.5 h-4.5 text-[#4285f4]" />
              </div>
              <div>
                <h2
                  className="text-[#e8eaed] font-medium text-lg leading-tight"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Add to Map
                </h2>
                <p
                  className="text-[#9aa0a6] text-xs mt-0.5"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Upload data to embed into the semantic graph
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded flex items-center justify-center text-[#5f6368] hover:text-[#e8eaed] hover:bg-white/5 transition-all"
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

          {/* Drop zone — Google Maps card style */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isProcessing) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileRef.current?.click()}
            className="relative rounded-xl flex flex-col items-center justify-center gap-4 py-12 transition-all duration-200"
            style={{
              border: `2px dashed ${
                dragging
                  ? "rgba(66,133,244,0.6)"
                  : uploadState === "success"
                  ? "rgba(52,168,83,0.5)"
                  : uploadState === "error"
                  ? "rgba(234,67,53,0.4)"
                  : "rgba(255,255,255,0.08)"
              }`,
              background: dragging
                ? "rgba(66,133,244,0.05)"
                : uploadState === "success"
                ? "rgba(52,168,83,0.04)"
                : "rgba(255,255,255,0.02)",
              cursor: isProcessing ? "default" : "pointer",
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(66,133,244,0.1)",
                        border: "1px solid rgba(66,133,244,0.25)",
                      }}
                    >
                      <Loader2 className="w-5 h-5 text-[#4285f4] animate-spin" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[#4285f4]/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[#e8eaed] text-sm font-medium"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      {uploadState === "uploading" ? "Uploading..." : "Generating embeddings..."}
                    </p>
                    <p
                      className="text-[#9aa0a6] text-xs mt-1"
                      style={{ fontFamily: "Roboto Mono, monospace" }}
                    >
                      {uploadState === "uploading"
                        ? "Parsing your data"
                        : "Gemini text-embedding-004 · 768 dims"}
                    </p>
                  </div>
                </motion.div>
              ) : uploadState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(52,168,83,0.1)",
                      border: "1px solid rgba(52,168,83,0.3)",
                    }}
                  >
                    <CheckCircle className="w-6 h-6 text-[#34a853]" />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[#81c995] text-sm font-medium"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      {result?.nodes_created} nodes added to the map
                    </p>
                    <p
                      className="text-[#9aa0a6] text-xs mt-1"
                      style={{ fontFamily: "Roboto Mono, monospace" }}
                    >
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
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: dragging ? "rgba(66,133,244,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${dragging ? "rgba(66,133,244,0.35)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    <Upload
                      className="w-5 h-5 transition-colors"
                      style={{ color: dragging ? "#4285f4" : "#9aa0a6" }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[#e8eaed] text-sm font-medium"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      {dragging ? "Release to upload" : "Drop your file here"}
                    </p>
                    <p
                      className="text-[#9aa0a6] text-xs mt-1"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      TXT · JSON · CSV — up to 10MB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {uploadState === "error" && result && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-lg p-3 flex items-start gap-2.5"
                style={{
                  background: "rgba(234,67,53,0.08)",
                  border: "1px solid rgba(234,67,53,0.2)",
                }}
              >
                <AlertCircle className="w-4 h-4 text-[#ea4335] flex-shrink-0 mt-0.5" />
                <p
                  className="text-[#f28b82] text-sm"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  {result.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Format guide — Google Maps info chips */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: ".txt", desc: "Paragraphs → nodes" },
              { label: ".json", desc: "title + content" },
              { label: ".csv", desc: "title, content, cat" },
            ].map((fmt) => (
              <div
                key={fmt.label}
                className="rounded-lg p-2.5 text-center"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <FileText className="w-3.5 h-3.5 text-[#5f6368] mx-auto mb-1" />
                <p
                  className="text-[#e8eaed] text-xs font-medium"
                  style={{ fontFamily: "Roboto Mono, monospace" }}
                >
                  {fmt.label}
                </p>
                <p
                  className="text-[#5f6368] text-xs mt-0.5"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  {fmt.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Qdrant note */}
          <div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(66,133,244,0.04)",
              border: "1px solid rgba(66,133,244,0.1)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#4285f4] qdrant-pulse flex-shrink-0" />
            <p
              className="text-xs text-[#5f6368]"
              style={{ fontFamily: "Roboto Mono, monospace" }}
            >
              Vectors stored in Qdrant · Cosine similarity · 768 dimensions
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
