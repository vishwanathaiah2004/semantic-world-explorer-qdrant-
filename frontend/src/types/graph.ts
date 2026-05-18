export interface GraphNode {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  x?: number;
  y?: number;
  cluster_id?: number;
  cluster_label?: string;
  val?: number;
  // runtime
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  color?: string;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  similarity: number;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface NodeDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  similar_nodes: SimilarNode[];
  ai_insight?: string;
  cluster_label?: string;
}

export interface SimilarNode {
  id: string;
  title: string;
  category: string;
  similarity: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  score: number;
  tags: string[];
}

export const CATEGORY_COLORS: Record<string, string> = {
  AI: "#6366f1",
  Fintech: "#10b981",
  Climate: "#22d3ee",
  Agriculture: "#84cc16",
  Robotics: "#f59e0b",
  Computing: "#8b5cf6",
  HealthTech: "#ec4899",
  SpaceTech: "#14b8a6",
  Uploaded: "#94a3b8",
  Other: "#64748b",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
}
