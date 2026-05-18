"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import type { SearchResult } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelect: (id: string) => void;
  results: SearchResult[];
  loading: boolean;
  onClear: () => void;
}

export function SearchBar({ onSearch, onSelect, results, loading, onClear }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => onSearch(val), 400);
    } else if (!val.trim()) {
      onClear();
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    inputRef.current?.focus();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setFocused(false);
  };

  const showDropdown = focused && (results.length > 0 || loading);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: focused ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
        }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Semantic search..."
          className="bg-transparent flex-1 text-white text-sm placeholder-slate-600 outline-none min-w-0"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        />
        {query && (
          <button onClick={handleClear} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(10, 14, 30, 0.97)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            {results.length > 0 ? (
              <div className="py-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                    Semantic matches
                  </span>
                </div>
                {results.slice(0, 6).map((result) => (
                  <button
                    key={result.id}
                    onMouseDown={() => handleSelect(result.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: getCategoryColor(result.category) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{result.title}</p>
                      <p className="text-slate-500 text-xs truncate">{result.content.slice(0, 60)}...</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-mono"
                        style={{ color: getCategoryColor(result.category) }}
                      >
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : loading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
