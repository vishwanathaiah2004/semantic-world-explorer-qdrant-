"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Tag, Link2, ChevronRight, Loader2 } from "lucide-react";
import type { NodeDetail } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

interface NodePanelProps {
  detail: NodeDetail | null;
  loading: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function NodePanel({ detail, loading, onClose, onNavigate }: NodePanelProps) {
  return (
    <AnimatePresence>
      {(detail || loading) && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-96 z-20 flex flex-col"
          style={{
            background: "rgba(8, 12, 24, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Node Detail</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-500 font-mono">Loading node data...</span>
              </div>
            </div>
          ) : detail ? (
            <div className="flex-1 overflow-y-auto">
              {/* Category badge + title */}
              <div className="px-6 py-6 border-b border-white/5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: `${getCategoryColor(detail.category)}20`,
                    color: getCategoryColor(detail.category),
                    border: `1px solid ${getCategoryColor(detail.category)}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: getCategoryColor(detail.category) }}
                  />
                  {detail.category}
                </div>
                <h2 className="text-white font-bold text-xl leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {detail.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {detail.content}
                </p>
              </div>

              {/* Tags */}
              {detail.tags.length > 0 && (
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-xs font-mono border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight */}
              {detail.ai_insight && (
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-indigo-400 uppercase tracking-widest font-mono">AI Insight</span>
                  </div>
                  <div
                    className="rounded-xl p-4 text-sm text-slate-300 leading-relaxed"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    {detail.ai_insight}
                  </div>
                </div>
              )}

              {/* Similar nodes */}
              {detail.similar_nodes.length > 0 && (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                      Related Nodes
                    </span>
                  </div>
                  <div className="space-y-2">
                    {detail.similar_nodes.map((sim) => (
                      <motion.button
                        key={sim.id}
                        whileHover={{ x: 4 }}
                        onClick={() => onNavigate(sim.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 text-left group"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: getCategoryColor(sim.category) }}
                          />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{sim.title}</p>
                            <p className="text-slate-500 text-xs">{sim.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-lg"
                            style={{
                              background: `${getCategoryColor(sim.category)}15`,
                              color: getCategoryColor(sim.category),
                            }}
                          >
                            {Math.round(sim.similarity * 100)}%
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer spacer */}
              <div className="h-6" />
            </div>
          ) : null}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

