"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { useGraph, useNodeDetail, useSearch } from "@/hooks/useGraph";
import { SemanticGraph } from "@/components/graph/SemanticGraph";
import { NodePanel } from "@/components/panels/NodePanel";
import { SearchBar } from "@/components/ui/SearchBar";
import { Toolbar } from "@/components/ui/Toolbar";
import { UploadPanel } from "@/components/ui/UploadPanel";
import { Legend } from "@/components/ui/Legend";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GraphNode } from "@/types/graph";

export default function ExplorePage() {
  const { graphData, loading: graphLoading, error, reload } = useGraph();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { detail, loading: detailLoading } = useNodeDetail(selectedNodeId);
  const { results, loading: searchLoading, search, clear } = useSearch();
  const [showUpload, setShowUpload] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(graphData.nodes.map((n) => n.category))).sort(),
    [graphData.nodes]
  );

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    setHighlightIds(new Set());
  }, []);

  const handleSearchSelect = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      // Highlight the selected node and its neighbors
      const nodeIds = new Set([id]);
      graphData.links.forEach((link) => {
        const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
        const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
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
      if (!query.trim()) {
        setHighlightIds(new Set());
      }
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

  const panelOpen = selectedNodeId !== null || detailLoading;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050810] overflow-hidden">
      {/* Top bar */}
      <Toolbar
        nodeCount={graphData.nodes.length}
        linkCount={graphData.links.length}
        onUpload={() => setShowUpload(true)}
        onRefresh={reload}
        loading={graphLoading}
      />

      {/* Search bar overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-80">
        <SearchBar
          onSearch={handleSearchAction}
          onSelect={handleSearchSelect}
          results={results}
          loading={searchLoading}
          onClear={handleClearSearch}
        />
      </div>

      {/* Main graph area */}
      <div className="flex-1 relative overflow-hidden">
        {graphLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <p className="text-slate-500 text-sm font-mono">Loading semantic universe...</p>
            </div>
          </div>
        ) : error ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : graphData.nodes.length === 0 ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ right: panelOpen ? 384 : 0, transition: "right 0.4s cubic-bezier(0.4,0,0.2,1)" }}
            >
              <SemanticGraph
                data={graphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNodeId}
                highlightIds={highlightIds}
              />
            </div>

            <Legend categories={categories} />
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
