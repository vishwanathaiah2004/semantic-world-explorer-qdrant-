from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import (
    SearchRequest, UploadResponse, GraphData, NodeDetail, SearchResult
)
from embeddings.provider import get_embedding_provider
from qdrant_store.service import get_qdrant_service
from services.graph_service import build_graph
from services.insight_service import generate_node_insight, explain_connection
from utils.file_parser import parse_uploaded_file
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_deps():
    emb = get_embedding_provider()
    qdrant = get_qdrant_service()
    return emb, qdrant


@router.post("/upload", response_model=UploadResponse)
async def upload_data(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed_extensions = {"txt", "json", "csv"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type .{ext}. Allowed: {', '.join(allowed_extensions)}"
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        raw_nodes = parse_uploaded_file(file.filename, content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not raw_nodes:
        raise HTTPException(status_code=400, detail="No data found in file")

    emb_provider, qdrant = get_deps()
    qdrant.ensure_collection()

    texts = [f"{n['title']}. {n['content']}" for n in raw_nodes]
    embeddings = await emb_provider.embed(texts)

    points = []
    for node, vector in zip(raw_nodes, embeddings):
        points.append({
            "id": str(uuid.uuid4()),
            "vector": vector,
            "payload": {
                "title": node["title"],
                "content": node["content"],
                "category": node.get("category", "Uploaded"),
                "tags": node.get("tags", []),
                "source": file.filename,
            },
        })

    qdrant.upsert_points(points)
    total = qdrant.count()

    return UploadResponse(
        success=True,
        message=f"Successfully ingested {len(points)} nodes",
        nodes_created=len(points),
        collection_size=total,
    )


@router.get("/graph", response_model=GraphData)
async def get_graph(limit: int = 200):
    _, qdrant = get_deps()
    try:
        qdrant.ensure_collection()
    except Exception:
        return GraphData(nodes=[], links=[])

    points = qdrant.get_all_points(limit=limit)
    if not points:
        return GraphData(nodes=[], links=[])

    graph = build_graph(points)
    return graph


@router.get("/node/{node_id}", response_model=NodeDetail)
async def get_node(node_id: str):
    emb_provider, qdrant = get_deps()
    qdrant.ensure_collection()

    point = qdrant.get_point(node_id)
    if not point:
        raise HTTPException(status_code=404, detail="Node not found")

    vector = point["vector"]
    similar = qdrant.search(
        vector=vector,
        limit=6,
        score_threshold=0.4,
        exclude_ids=[node_id],
    )

    similar_nodes = []
    similar_titles = []
    for sp in similar[:5]:
        payload = sp.payload or {}
        similar_titles.append(payload.get("title", ""))
        similar_nodes.append({
            "id": str(sp.id),
            "title": payload.get("title", ""),
            "category": payload.get("category", ""),
            "similarity": round(float(sp.score), 4),
        })

    payload = point["payload"] or {}
    insight = await generate_node_insight(
        title=payload.get("title", ""),
        content=payload.get("content", ""),
        similar_titles=similar_titles,
    )

    return NodeDetail(
        id=node_id,
        title=payload.get("title", ""),
        content=payload.get("content", ""),
        category=payload.get("category", ""),
        tags=payload.get("tags", []),
        similar_nodes=similar_nodes,
        ai_insight=insight,
        cluster_label=None,
    )


@router.get("/similar/{node_id}")
async def get_similar(node_id: str, limit: int = 8):
    emb_provider, qdrant = get_deps()
    qdrant.ensure_collection()

    point = qdrant.get_point(node_id)
    if not point:
        raise HTTPException(status_code=404, detail="Node not found")

    similar = qdrant.search(
        vector=point["vector"],
        limit=limit + 1,
        score_threshold=0.35,
        exclude_ids=[node_id],
    )

    results = []
    for sp in similar[:limit]:
        payload = sp.payload or {}
        results.append({
            "id": str(sp.id),
            "title": payload.get("title", ""),
            "content": payload.get("content", "")[:200],
            "category": payload.get("category", ""),
            "similarity": round(float(sp.score), 4),
            "tags": payload.get("tags", []),
        })

    return {"similar": results, "source_id": node_id}


@router.post("/search")
async def search_nodes(request: SearchRequest):
    emb_provider, qdrant = get_deps()
    qdrant.ensure_collection()

    query_vector = await emb_provider.embed_single(request.query)
    results = qdrant.search(
        vector=query_vector,
        limit=request.limit,
        score_threshold=0.25,
    )

    hits = []
    for sp in results:
        payload = sp.payload or {}
        hits.append(SearchResult(
            id=str(sp.id),
            title=payload.get("title", ""),
            content=payload.get("content", "")[:300],
            category=payload.get("category", ""),
            score=round(float(sp.score), 4),
            tags=payload.get("tags", []),
        ))

    return {"results": hits, "query": request.query}


@router.get("/stats")
async def get_stats():
    _, qdrant = get_deps()
    try:
        qdrant.ensure_collection()
        count = qdrant.count()
    except Exception:
        count = 0
    return {"total_nodes": count, "collection": qdrant.collection_name}


@router.post("/explain-connection")
async def explain_nodes_connection(body: dict):
    node_a_id = body.get("node_a")
    node_b_id = body.get("node_b")
    if not node_a_id or not node_b_id:
        raise HTTPException(status_code=400, detail="node_a and node_b required")

    _, qdrant = get_deps()
    qdrant.ensure_collection()

    pa = qdrant.get_point(node_a_id)
    pb = qdrant.get_point(node_b_id)

    if not pa or not pb:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

    result = await explain_connection(
        title_a=pa["payload"].get("title", ""),
        content_a=pa["payload"].get("content", ""),
        title_b=pb["payload"].get("title", ""),
        content_b=pb["payload"].get("content", ""),
    )
    return result


@router.get("/reset")
async def reset_collection():
    """Delete and re-seed the collection with fresh embeddings."""
    _, qdrant = get_deps()
    try:
        qdrant.delete_collection()
    except Exception:
        pass
    # Re-seed will happen on next startup, but we can trigger it manually
    from utils.demo_data import DEMO_NODES
    import uuid as _uuid
    qdrant.ensure_collection()
    emb_provider, _ = get_deps()
    texts = [f"{n['title']}. {n['content']}" for n in DEMO_NODES]
    embeddings = await emb_provider.embed(texts)
    points = []
    for node, vector in zip(DEMO_NODES, embeddings):
        points.append({
            "id": str(_uuid.uuid4()),
            "vector": vector,
            "payload": {
                "title": node["title"],
                "content": node["content"],
                "category": node["category"],
                "tags": node["tags"],
                "source": "demo",
            },
        })
    qdrant.upsert_points(points)
    return {"success": True, "message": f"Re-seeded {len(points)} nodes with fresh embeddings"}
async def get_discovery(limit: int = 8):
    """
    Surface the most surprising cross-domain connections in the graph.
    Returns high-similarity pairs from different categories.
    """
    _, qdrant = get_deps()
    try:
        qdrant.ensure_collection()
    except Exception:
        return {"discoveries": []}

    points = qdrant.get_all_points(limit=200)
    if len(points) < 2:
        return {"discoveries": []}

    import numpy as np
    from sklearn.preprocessing import normalize

    ids = [p["id"] for p in points]
    vectors = np.array([p["vector"] for p in points], dtype=np.float32)
    payloads = [p["payload"] for p in points]

    vectors_norm = normalize(vectors)
    sim_matrix = vectors_norm @ vectors_norm.T

    discoveries = []
    seen = set()

    # Find high-similarity cross-domain pairs
    pairs = []
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            cat_i = payloads[i].get("category", "")
            cat_j = payloads[j].get("category", "")
            if cat_i != cat_j:
                sim = float(sim_matrix[i, j])
                if sim >= 0.3:
                    pairs.append((sim, i, j))

    pairs.sort(reverse=True)

    for sim, i, j in pairs[:limit]:
        key = (min(ids[i], ids[j]), max(ids[i], ids[j]))
        if key in seen:
            continue
        seen.add(key)
        discoveries.append({
            "node_a": {
                "id": ids[i],
                "title": payloads[i].get("title", ""),
                "category": payloads[i].get("category", ""),
            },
            "node_b": {
                "id": ids[j],
                "title": payloads[j].get("title", ""),
                "category": payloads[j].get("category", ""),
            },
            "similarity": round(sim, 4),
            "is_cross_domain": True,
        })

    return {"discoveries": discoveries, "total": len(discoveries)}
