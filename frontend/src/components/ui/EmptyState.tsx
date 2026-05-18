"use client";

import { motion } from "framer-motion";
import { Globe, Upload } from "lucide-react";

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md px-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <Globe className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-white text-xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          Your semantic universe awaits
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The backend may be starting up. Ensure Qdrant and the API are running, then refresh. Or upload your own data to begin exploring.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onUpload}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
        </div>
      </motion.div>
    </div>
  );
}
