from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    SearchRequest as QSearchRequest,
    ScoredPoint,
    UpdateStatus,
    PayloadSchemaType,
)
from config import settings
import logging
import uuid

logger = logging.getLogger(__name__)


class QdrantService:
    def __init__(self):
        kwargs: dict = {
            "host": settings.qdrant_host,
            "port": settings.qdrant_port,
        }
        if settings.qdrant_api_key:
            kwargs["api_key"] = settings.qdrant_api_key
        self.client = QdrantClient(**kwargs)
        self.collection_name = settings.collection_name
        self.dimension = settings.embedding_dimension

    def ensure_collection(self) -> None:
        existing = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in existing:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE,
                ),
            )
            logger.info(f"Created collection: {self.collection_name}")
        else:
            logger.info(f"Collection already exists: {self.collection_name}")

    def upsert_points(self, points: list[dict]) -> bool:
        structs = []
        for p in points:
            structs.append(
                PointStruct(
                    id=p["id"],
                    vector=p["vector"],
                    payload=p["payload"],
                )
            )
        result = self.client.upsert(
            collection_name=self.collection_name,
            points=structs,
        )
        return result.status == UpdateStatus.COMPLETED

    def search(
        self,
        vector: list[float],
        limit: int = 10,
        score_threshold: float = 0.3,
        exclude_ids: list[str] | None = None,
    ) -> list[ScoredPoint]:
        query_filter = None
        if exclude_ids:
            from qdrant_client.models import HasIdCondition, Filter as QFilter
            query_filter = QFilter(
                must_not=[HasIdCondition(has_id=exclude_ids)]
            )

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=query_filter,
            with_payload=True,
        )
        return results

    def get_point(self, point_id: str) -> dict | None:
        results = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[point_id],
            with_payload=True,
            with_vectors=True,
        )
        if results:
            p = results[0]
            return {"id": str(p.id), "payload": p.payload, "vector": p.vector}
        return None

    def get_all_points(self, limit: int = 500) -> list[dict]:
        results = []
        offset = None
        while True:
            batch, next_offset = self.client.scroll(
                collection_name=self.collection_name,
                limit=min(limit, 100),
                offset=offset,
                with_payload=True,
                with_vectors=True,
            )
            for p in batch:
                results.append({"id": str(p.id), "payload": p.payload, "vector": p.vector})
            if next_offset is None or len(results) >= limit:
                break
            offset = next_offset
        return results[:limit]

    def count(self) -> int:
        result = self.client.count(collection_name=self.collection_name)
        return result.count

    def delete_collection(self) -> None:
        self.client.delete_collection(self.collection_name)


_qdrant_service: QdrantService | None = None


def get_qdrant_service() -> QdrantService:
    global _qdrant_service
    if _qdrant_service is None:
        _qdrant_service = QdrantService()
    return _qdrant_service
