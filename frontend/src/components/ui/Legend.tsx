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

export function MapLegend({ categories, onFilter, activeFilter }: LegendProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="absolute bottom-5 right-5 z-10"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(6,9,20,0.94)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.05)",
          minWidth: 168,
        }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 transition-all duration-200"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Domains
            </span>
          </div>
          {collapsed
            ? <ChevronDown className="w-3 h-3 text-slate-600" />
            : <ChevronUp   className="w-3 h-3 text-slate-600" />}
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
              <div className="border-t px-3.5 py-2.5 flex flex-col gap-1" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {onFilter && (
                  <button
                    onClick={() => onFilter(null)}
                    className="flex items-center gap-2.5 text-left py-1 rounded px-1 transition-all"
                    style={{ opacity: activeFilter === null ? 1 : 0.4 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
                    <span className="text-xs text-slate-400">All domains</span>
                  </button>
                )}
                {categories.map(cat => {
                  const color = CATEGORY_COLORS[cat] ?? "#64748b";
                  const isActive = !activeFilter || activeFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => onFilter?.(activeFilter === cat ? null : cat)}
                      className="flex items-center gap-2.5 text-left py-1 rounded px-1 transition-all group"
                      style={{ opacity: isActive ? 1 : 0.25 }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                        (e.currentTarget as HTMLElement).style.opacity = "1";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.opacity = isActive ? "1" : "0.25";
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-all group-hover:scale-125"
                        style={{ background: color, boxShadow: isActive ? `0 0 6px ${color}80` : "none" }}
                      />
                      <span className="text-xs text-slate-300">{cat}</span>
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

export { MapLegend as Legend };
