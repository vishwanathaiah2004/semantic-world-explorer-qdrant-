"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

import { useGraph, useNodeDetail, useSearch } from "@/hooks/useGraph";
import { SemanticGraph } from "@/components/graph/SemanticGraph";
import { NodePanel } from "@/components/panels/NodePanel";
import { SearchBar } from "@/components/ui/SearchBar";
import { Toolbar } from "@/components/ui/Toolbar";
import { UploadPanel } from "@/components/ui/UploadPanel";
import { Legend } from "@/components/ui/Legend";
import { EmptyState } from "@/components/ui/EmptyState";
import { DiscoveryFeed } from "@/components/ui/DiscoveryFeed";
import { ParticleField } from "@/components/ui/ParticleField";
import type { GraphNode } from "@/types/graph";

export default function ExplorePage() {
  const { graphData, loading: graphLoading, error, reload } = useGraph();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { detail, loading: detailLoading } = useNodeDetail(selectedNodeId);
  const { results, loading: searchLoading, search, clear } = useSearch();
  const [showUpload, setShowUpload] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(graphData.nodes.map((n) => n.category))).sort(),
    [graphData.nodes]
  );

  // Apply category filter to graph data
  const filteredGraphData = useMemo(() => {
    if (!activeFilter) return graphData;
    const filteredNodes = graphData.nodes.filter((n) => n.category === activeFilter);
    const filteredIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = graphData.links.filter((l) => {
      const srcId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
      const tgtId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
      return filteredIds.has(srcId) && filteredIds.has(tgtId);
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, activeFilter]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    setHighlightIds(new Set());
  }, []);

  const handleSearchSelect = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      const nodeIds = new Set([id]);
      graphData.links.forEach((link) => {
        const srcId =
          typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
        const tgtId =
          typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
        if (srcId === id) nodeIds.add(tgtId);
        if (tgtId === id) nodeIds.add(srcId);
      });
      setHighlightIds(nodeIds);
    },
    [graphData.links]
  );

  const handleSearchAction = useCallback(
    (query: string) => {
      search(query);
      if (!query.trim()) setHighlightIds(new Set());
    },
    [search]
  );

  const handleClearSearch = useCallback(() => {
    clear();
    setHighlightIds(new Set());
  }, [clear]);

  const handleUploadSuccess = useCallback(() => {
    reload();
  }, [reload]);

  const handleNavigate = useCallback((id: string) => {
    setSelectedNodeId(id);
  }, []);

  const handleFilter = useCallback((cat: string | null) => {
    setActiveFilter(cat);
    setSelectedNodeId(null);
    setHighlightIds(new Set());
  }, []);

  const panelOpen = selectedNodeId !== null || detailLoading;
  const hasData = graphData.nodes.length > 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050810] overflow-hidden relative">
      {/* Particle background */}
      <ParticleField />

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/5 blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-600/4 blur-[100px]" />
      </div>

      {/* Toolbar */}
      <div className="relative z-20">
        <Toolbar
          nodeCount={graphData.nodes.length}
          linkCount={graphData.links.length}
          onUpload={() => setShowUpload(true)}
          onRefresh={reload}
          loading={graphLoading}
        />
      </div>

      {/* Search bar — centered overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-96">
        <SearchBar
          onSearch={handleSearchAction}
          onSelect={handleSearchSelect}
          results={results}
          loading={searchLoading}
          onClear={handleClearSearch}
        />
      </div>

      {/* Main graph area */}
      <div className="flex-1 relative overflow-hidden z-10">
        {graphLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5"
            >
              {/* Animated loader */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full border border-indigo-500/20 flex items-center justify-center"
                  style={{ boxShadow: "0 0 30px rgba(99,102,241,0.15)" }}
                >
                  <Sparkles className="w-6 h-6 text-indigo-400/60" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border border-indigo-500/40"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-indigo-500/20"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm font-mono">
                  Loading semantic universe...
                </p>
                <p className="text-slate-600 text-xs font-mono mt-1">
                  Fetching vectors from Qdrant
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        ) : error || !hasData ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : (
          <>
            {/* Graph canvas — shrinks when panel is open */}
            <div
              className="absolute inset-0 transition-all duration-400"
              style={{
                right: panelOpen ? 384 : 0,
                transition: "right 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <SemanticGraph
                data={filteredGraphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNodeId}
                highlightIds={highlightIds}
              />
            </div>

            {/* Legend — bottom right */}
            <Legend
              categories={categories}
              onFilter={handleFilter}
              activeFilter={activeFilter}
            />

            {/* Discovery feed — bottom left */}
            <DiscoveryFeed
              graphData={graphData}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                setHighlightIds(new Set());
              }}
            />

            {/* Active filter badge */}
            <AnimatePresence>
              {activeFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-20 mt-14"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
                    style={{
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a78bfa",
                    }}
                  >
                    <span>Filtering: {activeFilter}</span>
                    <button
                      onClick={() => handleFilter(null)}
                      className="text-indigo-400/60 hover:text-indigo-300 transition-colors ml-1"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Node detail panel */}
        <NodePanel
          detail={detail}
          loading={detailLoading}
          onClose={() => {
            setSelectedNodeId(null);
            setHighlightIds(new Set());
          }}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadPanel
            onSuccess={handleUploadSuccess}
            onClose={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
