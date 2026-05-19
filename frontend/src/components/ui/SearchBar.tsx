"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Sparkles, TrendingUp } from "lucide-react";
import type { SearchResult } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelect: (id: string) => void;
  results: SearchResult[];
  loading: boolean;
  onClear: () => void;
}

const SUGGESTIONS = [
  "AI drug discovery",
  "climate fintech",
  "autonomous systems",
  "quantum biology",
];

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
      debounceRef.current = setTimeout(() => onSearch(val), 380);
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

  const handleSuggestion = (s: string) => {
    setQuery(s);
    onSearch(s);
    inputRef.current?.focus();
  };

  const showDropdown = focused && (results.length > 0 || loading || query.length === 0);

  return (
    <div className="relative">
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 1px rgba(99,102,241,0.5), 0 0 30px rgba(99,102,241,0.15)"
            : "0 0 0 1px rgba(255,255,255,0.07)",
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
        style={{
          background: focused
            ? "rgba(10,12,28,0.97)"
            : "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
        ) : (
          <Search
            className="w-4 h-4 flex-shrink-0 transition-colors"
            style={{ color: focused ? "#818cf8" : "rgba(100,116,139,0.7)" }}
          />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder="Search by meaning, not keywords..."
          className="bg-transparent flex-1 text-white text-sm placeholder-slate-600 outline-none min-w-0"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(8, 11, 24, 0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
            }}
          >
            {results.length > 0 ? (
              <div className="py-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                    Semantic matches
                  </span>
                  <span
                    className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(99,102,241,0.1)", color: "rgba(99,102,241,0.7)" }}
                  >
                    {results.length} results
                  </span>
                </div>
                {results.slice(0, 6).map((result, i) => {
                  const color = getCategoryColor(result.category);
                  return (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onMouseDown={() => handleSelect(result.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 transition-colors text-left group"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color, boxShadow: `0 0 4px ${color}80` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{result.title}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5">
                          {result.content.slice(0, 65)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: `${color}12`, color: `${color}cc` }}
                        >
                          {result.category}
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          {Math.round(result.score * 100)}%
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : loading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-600 font-mono">Searching vector space...</p>
              </div>
            ) : (
              /* Suggestions when empty */
              <div className="py-3">
                <div className="flex items-center gap-2 px-4 py-2">
                  <TrendingUp className="w-3 h-3 text-slate-600" />
                  <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">
                    Try exploring
                  </span>
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSuggestion(s)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/4 transition-colors text-left"
                  >
                    <Search className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="text-sm text-slate-400">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
