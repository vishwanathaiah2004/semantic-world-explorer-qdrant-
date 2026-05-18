from abc import ABC, abstractmethod
import google.generativeai as genai
from config import settings
import numpy as np
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger(__name__)


class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        pass

    @abstractmethod
    async def embed_single(self, text: str) -> list[float]:
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        self._dimension = 768
        self.model = "models/text-embedding-004"

    @property
    def dimension(self) -> int:
        return self._dimension

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def embed_single(self, text: str) -> list[float]:
        if not settings.gemini_api_key:
            return self._mock_embedding(text)
        try:
            result = genai.embed_content(
                model=self.model,
                content=text,
                task_type="RETRIEVAL_DOCUMENT",
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Gemini embedding error: {e}")
            return self._mock_embedding(text)

    async def embed(self, texts: list[str]) -> list[list[float]]:
        embeddings = []
        for text in texts:
            emb = await self.embed_single(text)
            embeddings.append(emb)
        return embeddings

    def _mock_embedding(self, text: str) -> list[float]:
        """Deterministic mock embedding based on text hash for demo mode."""
        rng = np.random.RandomState(abs(hash(text)) % (2**31))
        vec = rng.randn(self._dimension).tolist()
        norm = np.linalg.norm(vec)
        return (np.array(vec) / norm).tolist()


def get_embedding_provider() -> EmbeddingProvider:
    return GeminiEmbeddingProvider()
