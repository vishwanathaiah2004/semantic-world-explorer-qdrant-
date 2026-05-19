import type { GraphData, NodeDetail, SearchResult } from "@/types/graph";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  async getGraph(limit = 200): Promise<GraphData> {
    return apiFetch<GraphData>(`/api/graph?limit=${limit}`);
  },

  async getNode(id: string): Promise<NodeDetail> {
    return apiFetch<NodeDetail>(`/api/node/${id}`);
  },

  async getSimilar(id: string, limit = 8): Promise<{ similar: SearchResult[]; source_id: string }> {
    return apiFetch(`/api/similar/${id}?limit=${limit}`);
  },

  async search(query: string, limit = 10): Promise<{ results: SearchResult[]; query: string }> {
    return apiFetch(`/api/search`, {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
  },

  async uploadFile(file: File): Promise<{ success: boolean; message: string; nodes_created: number; collection_size: number }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Upload failed`);
    }
    return res.json();
  },

  async getStats(): Promise<{ total_nodes: number; collection: string }> {
    return apiFetch(`/api/stats`);
  },

  async explainConnection(nodeA: string, nodeB: string): Promise<{ explanation: string; shared_themes: string[] }> {
    return apiFetch(`/api/explain-connection`, {
      method: "POST",
      body: JSON.stringify({ node_a: nodeA, node_b: nodeB }),
    });
  },

  async getDiscovery(limit = 8): Promise<{
    discoveries: Array<{
      node_a: { id: string; title: string; category: string };
      node_b: { id: string; title: string; category: string };
      similarity: number;
      is_cross_domain: boolean;
    }>;
    total: number;
  }> {
    return apiFetch(`/api/discovery?limit=${limit}`);
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
