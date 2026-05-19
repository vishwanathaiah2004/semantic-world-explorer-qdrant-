"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_COLORS } from "@/types/graph";

interface LegendProps {
  categories: string[];
  onFilter?: (category: string | null) => void;
  activeFilter?: string | null;
}

export function Legend({ categories, onFilter, activeFilter }: LegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="absolute bottom-6 right-6 z-10"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(5, 8, 18, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          minWidth: 160,
        }}
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Domains
            </span>
          </div>
          {collapsed ? (
            <ChevronDown className="w-3 h-3 text-slate-600" />
          ) : (
            <ChevronUp className="w-3 h-3 text-slate-600" />
          )}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-1.5">
                {/* All filter */}
                {onFilter && (
                  <button
                    onClick={() => onFilter(null)}
                    className="flex items-center gap-2.5 text-left transition-all py-0.5"
                    style={{ opacity: activeFilter === null ? 1 : 0.45 }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.3)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                    <span className="text-xs text-slate-400 font-medium">All domains</span>
                  </button>
                )}

                {categories.map((cat) => {
                  const color = CATEGORY_COLORS[cat] ?? "#64748b";
                  const isActive = !activeFilter || activeFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => onFilter?.(activeFilter === cat ? null : cat)}
                      className="flex items-center gap-2.5 text-left transition-all py-0.5 group"
                      style={{ opacity: isActive ? 1 : 0.35 }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-all group-hover:scale-125"
                        style={{
                          background: color,
                          boxShadow: isActive ? `0 0 5px ${color}80` : "none",
                        }}
                      />
                      <span className="text-xs text-slate-300 font-medium">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
