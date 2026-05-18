"use client";

import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/types/graph";

interface LegendProps {
  categories: string[];
  onFilter?: (category: string | null) => void;
  activeFilter?: string | null;
}

export function Legend({ categories, onFilter, activeFilter }: LegendProps) {
  if (categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="absolute bottom-6 left-6 z-10"
    >
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(5, 8, 16, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Domains</p>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat] ?? "#64748b";
            const isActive = activeFilter === null || activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => onFilter?.(activeFilter === cat ? null : cat)}
                className="flex items-center gap-2.5 text-left transition-opacity"
                style={{ opacity: isActive ? 1 : 0.4 }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs text-slate-300 font-medium">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
