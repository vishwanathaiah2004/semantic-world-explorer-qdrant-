"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Tag, Network, Loader2, Zap, Brain,
  GitBranch, Navigation,
} from "lucide-react";
import type { NodeDetail } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";
import { api } from "@/services/api";

interface NodePanelProps {
  detail: NodeDetail | null;
  loading: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function SimilarityBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="h-0.5 rounded-full overflow-hidden flex-1" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
        />
      </div>
      <span className="text-xs w-7 text-right flex-shrink-0 text-slate-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function InsightText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setDone(true); clearInterval(iv); }
    }, 11);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-0.5 h-3.5 ml-0.5 align-middle"
          style={{ background: "rgba(99,102,241,0.8)", animation: "blink 1s step-end infinite" }}
        />
      )}
    </span>
  );
}

function ConnectionExplainer({ sourceId, targetId, onClose }: { sourceId: string; targetId: string; onClose: () => void }) {
  const [data, setData] = useState<{ explanation: string; shared_themes: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setData(null);
    api.explainConnection(sourceId, targetId)
      .then(setData)
      .catch(() => setData({ explanation: "These concepts share deep semantic overlap across multiple dimensions of innovation.", shared_themes: ["innovation", "systems-thinking", "emergence"] }))
      .finally(() => setLoading(false));
  }, [sourceId, targetId]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mx-3 mb-3 rounded-xl overflow-hidden" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)" }}>
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-indigo-400" />
            <span className="text-xs text-indigo-400 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
              Semantic Bridge
            </span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="px-3 py-2.5">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin flex-shrink-0" />
              <span className="text-xs text-slate-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>Analyzing semantic bridge...</span>
            </div>
          ) : data ? (
            <>
              <p className="text-slate-400 text-xs leading-relaxed mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                <InsightText text={data.explanation} />
              </p>
              {data.shared_themes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.shared_themes.map(theme => (
                    <span key={theme} className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export function NodePanel({ detail, loading, onClose, onNavigate }: NodePanelProps) {
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  useEffect(() => { setActiveConnection(null); }, [detail?.id]);

  const color = detail ? getCategoryColor(detail.category) : "#6366f1";

  return (
    <AnimatePresence>
      {(detail || loading) && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="absolute right-0 top-0 bottom-0 z-20 flex flex-col"
          style={{
            width: 400,
            background: "linear-gradient(180deg, rgba(6,9,20,0.99) 0%, rgba(4,6,15,0.99) 100%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "-20px 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.04)",
          }}
        >
          {/* Colored top accent */}
          {detail && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
              className="h-0.5 w-full origin-left flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}80, transparent)` }}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
              <span className="text-xs text-slate-500 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                Intelligence Panel
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {[0,1].map(i => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-indigo-500/30"
                      animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                </div>
                <p className="text-xs text-slate-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>Querying vector space...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && detail && (
            <div className="flex-1 overflow-y-auto">

              {/* ── Identity ── */}
              <div className="px-5 pt-4 pb-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      {detail.category}
                    </span>
                    {detail.cluster_label && (
                      <span className="text-xs text-slate-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {detail.cluster_label}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-white font-bold text-xl leading-tight mb-3" style={{ fontFamily: "Syne, Space Grotesk, sans-serif" }}>
                    {detail.title}
                  </h2>

                  {/* Tags */}
                  {detail.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {detail.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {detail.content}
                  </p>
                </motion.div>
              </div>

              <div className="mx-5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

              {/* ── Semantic Neighbors ── */}
              {detail.similar_nodes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pt-3 pb-2">
                  <div className="flex items-center gap-2 px-5 mb-2">
                    <Network className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                      Semantic Neighbors
                    </span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.4)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                      Qdrant ANN
                    </span>
                  </div>

                  <div className="space-y-1">
                    {detail.similar_nodes.map((sim, i) => {
                      const simColor = getCategoryColor(sim.category);
                      const isActive = activeConnection === sim.id;
                      return (
                        <motion.div key={sim.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.04 }}>
                          <div
                            className="mx-3 rounded-xl overflow-hidden transition-all duration-150"
                            style={{
                              background: isActive ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.025)",
                              border: isActive ? "1px solid rgba(99,102,241,0.28)" : "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <div className="flex items-center gap-2 px-3 py-2.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: simColor, boxShadow: `0 0 6px ${simColor}80` }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{sim.title}</p>
                                <p className="text-xs font-mono truncate" style={{ color: `${simColor}99` }}>{sim.category}</p>
                              </div>
                              <div className="w-20 flex-shrink-0">
                                <SimilarityBar value={sim.similarity} />
                              </div>
                              {/* Why? */}
                              <button
                                onClick={() => setActiveConnection(isActive ? null : sim.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 transition-all"
                                style={{
                                  background: isActive ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.1)",
                                  color: isActive ? "#c4b5fd" : "#818cf8",
                                  border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(99,102,241,0.2)",
                                }}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                Why?
                              </button>
                              {/* Warp navigate */}
                              <button
                                onClick={() => onNavigate(sim.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"}
                                title="Warp to node"
                              >
                                <Navigation className="w-3 h-3 text-indigo-400" />
                              </button>
                            </div>
                            <AnimatePresence>
                              {isActive && (
                                <ConnectionExplainer sourceId={detail.id} targetId={sim.id} onClose={() => setActiveConnection(null)} />
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mx-5 border-t mt-2" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

              {/* ── AI Insight ── */}
              {detail.ai_insight && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="px-5 pt-3 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-indigo-400 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                      AI Insight
                    </span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", color: "rgba(99,102,241,0.6)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                      Gemini
                    </span>
                  </div>
                  <div className="rounded-xl p-3 text-xs text-slate-300 leading-relaxed" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
                    <InsightText text={detail.ai_insight} />
                  </div>
                </motion.div>
              )}

              <div className="h-4" />
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
