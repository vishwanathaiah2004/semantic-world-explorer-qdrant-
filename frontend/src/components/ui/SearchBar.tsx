"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Sparkles, TrendingUp, MapPin } from "lucide-react";
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
    <div className="relative w-full">
      {/* Cinematic search bar */}
      <div
        className="search-bar flex items-center gap-2.5 px-4 py-2.5"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#4285f4] animate-spin flex-shrink-0" />
        ) : (
          <Search
            className="w-4 h-4 flex-shrink-0 transition-colors"
            style={{ color: focused ? "#8ab4f8" : "#9aa0a6" }}
          />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder="Search by meaning, not keywords..."
          className="bg-transparent flex-1 text-slate-200 text-sm placeholder-slate-600 outline-none min-w-0"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-[#9aa0a6] hover:text-[#e8eaed] transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown — Google Maps results style */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(6,9,20,0.98)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
            }}
          >
            {results.length > 0 ? (
              <div className="py-1">
                {/* Header */}
                <div
                  className="flex items-center gap-2 px-4 py-2 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <Sparkles className="w-3 h-3 text-[#4285f4]" />
                  <span
                    className="text-xs text-[#9aa0a6] uppercase tracking-wider"
                    style={{ fontFamily: "Roboto Mono, monospace", fontSize: 10 }}
                  >
                    Semantic matches
                  </span>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(66,133,244,0.12)",
                      color: "#8ab4f8",
                      fontFamily: "Roboto Mono, monospace",
                      fontSize: 10,
                    }}
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
                      transition={{ delay: i * 0.03 }}
                      onMouseDown={() => handleSelect(result.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(66,133,244,0.07)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {/* Map pin icon */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                      >
                        <MapPin className="w-3.5 h-3.5" style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[#e8eaed] text-sm font-medium truncate">
                          {result.title}
                        </p>
                        <p className="text-[#9aa0a6] text-xs truncate mt-0.5">
                          {result.content.slice(0, 60)}...
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: `${color}15`,
                            color: color,
                            fontFamily: "Roboto Mono, monospace",
                            fontSize: 10,
                          }}
                        >
                          {result.category}
                        </span>
                        <span
                          className="text-xs text-[#5f6368]"
                          style={{ fontFamily: "Roboto Mono, monospace" }}
                        >
                          {Math.round(result.score * 100)}%
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : loading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#4285f4] animate-spin" />
                <p
                  className="text-xs text-[#9aa0a6]"
                  style={{ fontFamily: "Roboto Mono, monospace" }}
                >
                  Searching vector space...
                </p>
              </div>
            ) : (
              /* Suggestions */
              <div className="py-1">
                <div
                  className="flex items-center gap-2 px-4 py-2 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <TrendingUp className="w-3 h-3 text-[#9aa0a6]" />
                  <span
                    className="text-xs text-[#9aa0a6] uppercase tracking-wider"
                    style={{ fontFamily: "Roboto Mono, monospace", fontSize: 10 }}
                  >
                    Try exploring
                  </span>
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSuggestion(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <Search className="w-3.5 h-3.5 text-[#5f6368] flex-shrink-0" />
                    <span className="text-sm text-[#9aa0a6]">{s}</span>
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
