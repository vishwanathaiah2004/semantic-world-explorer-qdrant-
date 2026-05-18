import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function formatSimilarity(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
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
  return colors[category] ?? colors.Other;
}
