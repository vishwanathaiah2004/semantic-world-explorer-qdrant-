from pydantic import BaseModel, Field
from typing import Optional, Any
import uuid


class NodeMetadata(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: Optional[str] = None
    source: Optional[str] = None
    tags: list[str] = []
    extra: dict[str, Any] = {}


class GraphNode(BaseModel):
    id: str
    title: str
    content: str
    category: str
    tags: list[str] = []
    x: Optional[float] = None
    y: Optional[float] = None
    cluster_id: Optional[int] = None
    cluster_label: Optional[str] = None
    val: float = 1.0


class GraphLink(BaseModel):
    source: str
    target: str
    similarity: float
    label: Optional[str] = None


class GraphData(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]


class NodeDetail(BaseModel):
    id: str
    title: str
    content: str
    category: str
    tags: list[str]
    similar_nodes: list[dict]
    ai_insight: Optional[str] = None
    cluster_label: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResult(BaseModel):
    id: str
    title: str
    content: str
    category: str
    score: float
    tags: list[str] = []


class UploadResponse(BaseModel):
    success: bool
    message: str
    nodes_created: int
    collection_size: int


class SimilarNode(BaseModel):
    id: str
    title: str
    content: str
    category: str
    similarity: float
    connection_reason: Optional[str] = None


class ConnectionExplanation(BaseModel):
    node_a: str
    node_b: str
    explanation: str
    similarity: float
    shared_themes: list[str]
