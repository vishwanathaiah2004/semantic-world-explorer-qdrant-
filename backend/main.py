from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from api.routes import router
from qdrant_store.service import get_qdrant_service
from embeddings.provider import get_embedding_provider
from utils.demo_data import DEMO_NODES
import uuid

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def seed_demo_data():
    """Seed the database with demo nodes if empty."""
    try:
        qdrant = get_qdrant_service()
        qdrant.ensure_collection()
        count = qdrant.count()

        if count > 0:
            logger.info(f"Collection already has {count} nodes, skipping seed")
            return

        logger.info("Seeding demo data...")
        emb_provider = get_embedding_provider()
        texts = [f"{n['title']}. {n['content']}" for n in DEMO_NODES]
        embeddings = await emb_provider.embed(texts)

        points = []
        for node, vector in zip(DEMO_NODES, embeddings):
            points.append({
                "id": str(uuid.uuid4()),
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
        logger.info(f"Seeded {len(points)} demo nodes")
    except Exception as e:
        logger.warning(f"Could not seed demo data (Qdrant may not be running): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Semantic World Explorer API")
    await seed_demo_data()
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="Semantic World Explorer API",
    description="AI-powered semantic exploration platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
