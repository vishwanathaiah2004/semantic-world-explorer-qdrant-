"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { GraphData, NodeDetail, SearchResult } from "@/types/graph";

export function useGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total_nodes: number } | null>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, s] = await Promise.all([api.getGraph(), api.getStats()]);
      setGraphData(data);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load graph");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  return { graphData, loading, error, stats, reload: loadGraph };
}

export function useNodeDetail(nodeId: string | null) {
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    api
      .getNode(nodeId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [nodeId]);

  return { detail, loading };
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setQuery(q);
    try {
      const data = await api.search(q);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setQuery("");
  }, []);

  return { results, loading, query, search, clear };
}
