"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap, Navigation } from "lucide-react";
import type { GraphData, GraphNode } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

interface Discovery {
  id: string;
  nodeA: GraphNode;
  nodeB: GraphNode;
  similarity: number;
  isCrossDomain: boolean;
}

interface DiscoveryFeedProps {
  graphData: GraphData;
  onSelectNode: (id: string) => void;
  onWarpTo?: (id: string) => void;
}

function getTopDiscoveries(graphData: GraphData, count = 6): Discovery[] {
  const nodeMap = new Map<string, GraphNode>(graphData.nodes.map(n => [n.id, n]));
  const cross: Discovery[] = [], same: Discovery[] = [];

  for (const link of graphData.links) {
    const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
    const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
    const nodeA = nodeMap.get(srcId), nodeB = nodeMap.get(tgtId);
    if (!nodeA || !nodeB) continue;
    const entry: Discovery = {
      id: `${srcId}-${tgtId}`, nodeA, nodeB,
      similarity: link.similarity,
      isCrossDomain: nodeA.category !== nodeB.category,
    };
    if (entry.isCrossDomain) { cross.push(entry); } else { same.push(entry); }
  }
  cross.sort((a, b) => b.similarity - a.similarity);
  same.sort((a, b) => b.similarity - a.similarity);
  return [...cross.slice(0, count), ...same.slice(0, 2)].slice(0, count);
}

export function DiscoveryFeed({ graphData, onSelectNode, onWarpTo }: DiscoveryFeedProps) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [warpingId, setWarpingId] = useState<string | null>(null);

  useEffect(() => {
    if (graphData.nodes.length > 0) setDiscoveries(getTopDiscoveries(graphData));
  }, [graphData]);

  const handleClick = useCallback((d: Discovery) => {
    setActiveId(d.id);
    onSelectNode(d.nodeA.id);
    setTimeout(() => setActiveId(null), 2500);
  }, [onSelectNode]);

  const handleWarp = useCallback((e: React.MouseEvent, d: Discovery) => {
    e.stopPropagation();
    setWarpingId(d.id);
    onSelectNode(d.nodeA.id);
    onWarpTo?.(d.nodeA.id);
    setTimeout(() => setWarpingId(null), 1200);
  }, [onSelectNode, onWarpTo]);

  if (discoveries.length === 0) return null;

  const crossCount = discoveries.filter(d => d.isCrossDomain).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="absolute bottom-5 left-5 z-10 w-72"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(6,9,20,0.94)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.06)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center qdrant-pulse"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">Hidden Connections</div>
              <div className="text-xs text-slate-500" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>
                {crossCount} cross-domain · semantic warp
              </div>
            </div>
          </div>
          {collapsed
            ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            : <ChevronUp   className="w-3.5 h-3.5 text-slate-600" />}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {discoveries.map((d, i) => {
                  const colorA = getCategoryColor(d.nodeA.category);
                  const colorB = getCategoryColor(d.nodeB.category);
                  const isActive  = activeId  === d.id;
                  const isWarping = warpingId === d.id;

                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <button
                        onClick={() => handleClick(d)}
                        className="discovery-card w-full flex items-start gap-3 px-4 py-2.5 text-left"
                        style={{
                          background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                          borderLeft: d.isCrossDomain
                            ? `2px solid ${isActive ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.25)"}`
                            : "2px solid transparent",
                        }}
                      >
                        {/* Connection visual */}
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5">
                          <div className="w-3 h-3 rounded-full" style={{ background: colorA, boxShadow: `0 0 6px ${colorA}80` }} />
                          <div className="w-px flex-1 min-h-3" style={{ background: `linear-gradient(to bottom, ${colorA}60, ${colorB}60)` }} />
                          <div className="w-3 h-3 rounded-full" style={{ background: colorB, boxShadow: `0 0 6px ${colorB}80` }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-slate-200 text-xs font-medium truncate leading-tight">
                              {d.nodeA.title}
                            </p>
                            {d.isCrossDomain && <Zap className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
                            <p className="text-slate-500 text-xs truncate">{d.nodeB.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {d.isCrossDomain && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
                                cross-domain
                              </span>
                            )}
                            <span className="text-xs text-slate-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                              {Math.round(d.similarity * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Warp button */}
                        <button
                          onClick={e => handleWarp(e, d)}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            background: isWarping ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.25)",
                          }}
                          title="Semantic Warp"
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.25)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isWarping ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)"}
                        >
                          <motion.div
                            animate={isWarping ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          >
                            <Navigation className="w-3 h-3 text-indigo-400" />
                          </motion.div>
                        </button>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2 border-t flex items-center gap-2"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(99,102,241,0.03)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 qdrant-pulse" />
                <p className="text-xs text-slate-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Qdrant vector similarity · warp to explore
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
