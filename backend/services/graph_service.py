import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize
from models.schemas import GraphNode, GraphLink, GraphData
import logging
import math

logger = logging.getLogger(__name__)

CATEGORY_COLORS = {
    "AI": "#6366f1",
    "Fintech": "#10b981",
    "Climate": "#22d3ee",
    "Agriculture": "#84cc16",
    "Robotics": "#f59e0b",
    "Computing": "#8b5cf6",
    "HealthTech": "#ec4899",
    "SpaceTech": "#14b8a6",
    "Uploaded": "#94a3b8",
    "Other": "#64748b",
}

CLUSTER_LABELS = {
    0: "Innovation Hub",
    1: "Data Nexus",
    2: "Future Systems",
    3: "Knowledge Core",
    4: "Discovery Zone",
    5: "Research Frontier",
    6: "Tech Convergence",
    7: "Emerging Paradigms",
}


def build_graph(
    points: list[dict],
    similarity_threshold: float = 0.65,
    max_links_per_node: int = 5,
) -> GraphData:
    if not points:
        return GraphData(nodes=[], links=[])

    ids = [p["id"] for p in points]
    vectors = np.array([p["vector"] for p in points], dtype=np.float32)
    payloads = [p["payload"] for p in points]

    # Normalize for cosine similarity
    vectors_norm = normalize(vectors)

    # Cluster assignment
    n_clusters = min(8, max(2, len(points) // 4))
    if len(points) >= n_clusters:
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_ids = kmeans.fit_predict(vectors_norm).tolist()
    else:
        cluster_ids = [0] * len(points)

    # Build nodes
    nodes = []
    for i, (pid, payload, cid) in enumerate(zip(ids, payloads, cluster_ids)):
        category = payload.get("category", "Other")
        cluster_label = CLUSTER_LABELS.get(cid, f"Cluster {cid}")

        # Spread initial positions in a circle
        angle = (i / len(points)) * 2 * math.pi
        radius = 300 + (cid * 80)
        x = radius * math.cos(angle) + (cid * 50)
        y = radius * math.sin(angle) + (cid * 30)

        nodes.append(
            GraphNode(
                id=pid,
                title=payload.get("title", "Unknown"),
                content=payload.get("content", ""),
                category=category,
                tags=payload.get("tags", []),
                x=x,
                y=y,
                cluster_id=int(cid),
                cluster_label=cluster_label,
                val=1.5 + len(payload.get("tags", [])) * 0.3,
            )
        )

    # Build similarity matrix and extract top links
    sim_matrix = vectors_norm @ vectors_norm.T
    links = []
    link_counts: dict[str, int] = {pid: 0 for pid in ids}

    # Get upper triangle pairs sorted by similarity
    pairs = []
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            sim = float(sim_matrix[i, j])
            if sim >= similarity_threshold:
                pairs.append((sim, i, j))

    pairs.sort(reverse=True)

    seen_pairs: set[tuple[str, str]] = set()
    for sim, i, j in pairs:
        id_i, id_j = ids[i], ids[j]
        if link_counts[id_i] >= max_links_per_node or link_counts[id_j] >= max_links_per_node:
            continue
        pair_key = (min(id_i, id_j), max(id_i, id_j))
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)
        links.append(GraphLink(source=id_i, target=id_j, similarity=round(sim, 4)))
        link_counts[id_i] += 1
        link_counts[id_j] += 1

    return GraphData(nodes=nodes, links=links)


def get_category_color(category: str) -> str:
    return CATEGORY_COLORS.get(category, CATEGORY_COLORS["Other"])
