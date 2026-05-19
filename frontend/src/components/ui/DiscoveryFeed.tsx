"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap } from "lucide-react";
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
}

function getTopDiscoveries(graphData: GraphData, count = 6): Discovery[] {
  const nodeMap = new Map<string, GraphNode>(
    graphData.nodes.map((n) => [n.id, n])
  );

  const crossDomain: Discovery[] = [];
  const sameDomain: Discovery[] = [];

  for (const link of graphData.links) {
    const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
    const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
    const nodeA = nodeMap.get(srcId);
    const nodeB = nodeMap.get(tgtId);
    if (!nodeA || !nodeB) continue;

    const isCross = nodeA.category !== nodeB.category;
    const entry: Discovery = {
      id: `${srcId}-${tgtId}`,
      nodeA,
      nodeB,
      similarity: link.similarity,
      isCrossDomain: isCross,
    };

    if (isCross) crossDomain.push(entry);
    else sameDomain.push(entry);
  }

  // Sort cross-domain by similarity (most surprising high-similarity cross-domain first)
  crossDomain.sort((a, b) => b.similarity - a.similarity);
  sameDomain.sort((a, b) => b.similarity - a.similarity);

  return [...crossDomain.slice(0, count), ...sameDomain.slice(0, 2)].slice(0, count);
}

export function DiscoveryFeed({ graphData, onSelectNode }: DiscoveryFeedProps) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      setDiscoveries(getTopDiscoveries(graphData));
    }
  }, [graphData]);

  const handleClick = useCallback(
    (d: Discovery) => {
      setHighlighted(d.id);
      onSelectNode(d.nodeA.id);
      setTimeout(() => setHighlighted(null), 2000);
    },
    [onSelectNode]
  );

  if (discoveries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="absolute bottom-6 left-6 z-10 w-72"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(5, 8, 18, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center qdrant-pulse"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Hidden Connections
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: "rgba(99,102,241,0.1)", color: "rgba(99,102,241,0.7)" }}
            >
              {discoveries.filter((d) => d.isCrossDomain).length} cross-domain
            </span>
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
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
              <div className="border-t border-white/5 py-1.5">
                {discoveries.map((d, i) => {
                  const colorA = getCategoryColor(d.nodeA.category);
                  const colorB = getCategoryColor(d.nodeB.category);
                  const isHighlighted = highlighted === d.id;

                  return (
                    <motion.button
                      key={d.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => handleClick(d)}
                      className="discovery-card w-full flex items-start gap-3 px-4 py-2.5 text-left"
                      style={{
                        background: isHighlighted
                          ? "rgba(99,102,241,0.08)"
                          : "transparent",
                        borderLeft: d.isCrossDomain
                          ? "2px solid rgba(99,102,241,0.3)"
                          : "2px solid transparent",
                      }}
                    >
                      {/* Connection visual */}
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: colorA, boxShadow: `0 0 4px ${colorA}80` }}
                        />
                        <div
                          className="w-px flex-1 min-h-3"
                          style={{
                            background: `linear-gradient(to bottom, ${colorA}60, ${colorB}60)`,
                          }}
                        />
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: colorB, boxShadow: `0 0 4px ${colorB}80` }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-white text-xs font-medium truncate leading-tight">
                            {d.nodeA.title}
                          </p>
                          {d.isCrossDomain && (
                            <Zap className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
                          <p className="text-slate-400 text-xs truncate">{d.nodeB.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {d.isCrossDomain && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded font-mono"
                              style={{
                                background: "rgba(99,102,241,0.1)",
                                color: "rgba(167,139,250,0.8)",
                                fontSize: "9px",
                              }}
                            >
                              cross-domain
                            </span>
                          )}
                          <span className="text-xs font-mono text-slate-600">
                            {Math.round(d.similarity * 100)}% match
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div
                className="px-4 py-2.5 border-t border-white/5 flex items-center gap-2"
                style={{ background: "rgba(99,102,241,0.03)" }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#6366f1", boxShadow: "0 0 4px #6366f1" }}
                />
                <p className="text-xs text-slate-600 font-mono">
                  Powered by Qdrant vector similarity
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
