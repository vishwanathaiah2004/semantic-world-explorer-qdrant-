"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useGraph, useNodeDetail, useSearch } from "@/hooks/useGraph";
import { SemanticGraph } from "@/components/graph/SemanticGraph";
import { NodePanel } from "@/components/panels/NodePanel";
import { SearchBar } from "@/components/ui/SearchBar";
import { MapToolbar } from "@/components/ui/Toolbar";
import { UploadPanel } from "@/components/ui/UploadPanel";
import { MapLegend } from "@/components/ui/Legend";
import { EmptyState } from "@/components/ui/EmptyState";
import { DiscoveryFeed } from "@/components/ui/DiscoveryFeed";
import { MapLoadingScreen } from "@/components/ui/MapLoadingScreen";
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
  const [warpTargetId, setWarpTargetId] = useState<string | null>(null);
  const [showWarpFlash, setShowWarpFlash] = useState(false);
  const warpKeyRef = useRef(0);

  const categories = useMemo(
    () => Array.from(new Set(graphData.nodes.map(n => n.category))).sort(),
    [graphData.nodes]
  );

  const filteredGraphData = useMemo(() => {
    if (!activeFilter) return graphData;
    const filteredNodes = graphData.nodes.filter(n => n.category === activeFilter);
    const filteredIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => {
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

  const handleSearchSelect = useCallback((id: string) => {
    setSelectedNodeId(id);
    const nodeIds = new Set([id]);
    graphData.links.forEach(link => {
      const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
      if (srcId === id) nodeIds.add(tgtId);
      if (tgtId === id) nodeIds.add(srcId);
    });
    setHighlightIds(nodeIds);
    // Warp to search result
    setShowWarpFlash(true);
    warpKeyRef.current += 1;
    setWarpTargetId(`${id}__${warpKeyRef.current}`);
    setTimeout(() => setShowWarpFlash(false), 800);
  }, [graphData.links]);

  const handleSearchAction = useCallback((query: string) => {
    search(query);
    if (!query.trim()) setHighlightIds(new Set());
  }, [search]);

  const handleClearSearch = useCallback(() => {
    clear();
    setHighlightIds(new Set());
  }, [clear]);

  const triggerWarp = useCallback((id: string) => {
    setShowWarpFlash(true);
    warpKeyRef.current += 1;
    setWarpTargetId(`${id}__${warpKeyRef.current}`); // force re-trigger
    setTimeout(() => setShowWarpFlash(false), 800);
  }, []);

  const handleWarpTo = useCallback((id: string) => {
    triggerWarp(id);
  }, [triggerWarp]);

  const handleUploadSuccess = useCallback(() => reload(), [reload]);
  const handleNavigate = useCallback((id: string) => {
    setSelectedNodeId(id);
    triggerWarp(id);
  }, [triggerWarp]);

  const handleFilter = useCallback((cat: string | null) => {
    setActiveFilter(cat);
    setSelectedNodeId(null);
    setHighlightIds(new Set());
  }, []);

  const panelOpen = selectedNodeId !== null || detailLoading;
  const hasData = graphData.nodes.length > 0;
  const TOOLBAR_H = 56;

  // Extract just the node id from warpTargetId (strips the key suffix)
  const warpNodeId = warpTargetId ? warpTargetId.split("__")[0] : null;

  return (
    <div className="h-screen w-screen overflow-hidden relative galaxy-bg">

      {/* ── Cinematic particle galaxy background ── */}
      <ParticleField />

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/4 blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/3 blur-[80px]" />
      </div>

      {/* ── Warp flash overlay ── */}
      <AnimatePresence>
        {showWarpFlash && (
          <motion.div
            key="warp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{
              background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <MapToolbar
          nodeCount={graphData.nodes.length}
          linkCount={graphData.links.length}
          onUpload={() => setShowUpload(true)}
          onRefresh={reload}
          loading={graphLoading}
        />
      </div>

      {/* ── Floating search bar ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-40"
        style={{ top: TOOLBAR_H + 12, width: 500, maxWidth: "calc(100vw - 32px)" }}
      >
        <SearchBar
          onSearch={handleSearchAction}
          onSelect={handleSearchSelect}
          results={results}
          loading={searchLoading}
          onClear={handleClearSearch}
        />
      </div>

      {/* ── Main graph area ── */}
      <div className="absolute inset-0" style={{ top: TOOLBAR_H }}>
        {graphLoading ? (
          <MapLoadingScreen />
        ) : error || !hasData ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : (
          <>
            {/* Graph canvas */}
            <div
              className="absolute inset-0"
              style={{
                right: panelOpen ? 400 : 0,
                transition: "right 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <SemanticGraph
                data={filteredGraphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNodeId}
                highlightIds={highlightIds}
                warpTargetId={warpNodeId}
              />
            </div>

            {/* Active filter chip */}
            <AnimatePresence>
              {activeFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-1/2 -translate-x-1/2 z-20"
                  style={{ top: 80 }}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(6,9,20,0.95)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      color: "#818cf8",
                      boxShadow: "0 0 20px rgba(99,102,241,0.15)",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Filtering: {activeFilter}
                    <button
                      onClick={() => handleFilter(null)}
                      className="ml-1 text-slate-500 hover:text-white transition-colors text-base leading-none"
                    >×</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Discovery feed */}
            <DiscoveryFeed
              graphData={graphData}
              onSelectNode={id => { setSelectedNodeId(id); setHighlightIds(new Set()); }}
              onWarpTo={handleWarpTo}
            />

            {/* Legend */}
            <MapLegend
              categories={categories}
              onFilter={handleFilter}
              activeFilter={activeFilter}
            />
          </>
        )}

        {/* Node detail panel */}
        <NodePanel
          detail={detail}
          loading={detailLoading}
          onClose={() => { setSelectedNodeId(null); setHighlightIds(new Set()); }}
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
