import google.generativeai as genai
from config import settings
import logging
import hashlib

logger = logging.getLogger(__name__)

# Configure Gemini once at module load if key is available
_gemini_configured = False


def _ensure_gemini():
    global _gemini_configured
    if not _gemini_configured and settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)
        _gemini_configured = True


def _is_ai_enabled() -> bool:
    return bool(settings.gemini_api_key)


async def generate_node_insight(title: str, content: str, similar_titles: list[str]) -> str:
    if not _is_ai_enabled():
        return _mock_insight(title, similar_titles)

    try:
        _ensure_gemini()
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = (
            f"You are a knowledge graph analyst. Given this concept and its semantically related concepts, "
            f"provide a brief, insightful 2-3 sentence analysis of what makes this concept unique and how it "
            f"connects to the broader knowledge landscape.\n\n"
            f"Concept: {title}\n"
            f"Description: {content[:300]}\n"
            f"Related concepts: {', '.join(similar_titles[:5])}\n\n"
            f"Provide a concise, insightful analysis (2-3 sentences max). "
            f"Focus on emerging patterns, unexpected connections, and strategic implications."
        )

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini insight error: {e}")
        return _mock_insight(title, similar_titles)


async def explain_connection(title_a: str, content_a: str, title_b: str, content_b: str) -> dict:
    if not _is_ai_enabled():
        return _mock_connection(title_a, title_b)

    try:
        _ensure_gemini()
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = (
            f"Explain the semantic connection between these two concepts in 2 sentences. Identify shared themes.\n\n"
            f"Concept A: {title_a} - {content_a[:200]}\n"
            f"Concept B: {title_b} - {content_b[:200]}\n\n"
            f'Respond with JSON: {{"explanation": "...", "shared_themes": ["theme1", "theme2", "theme3"]}}'
        )

        response = model.generate_content(prompt)
        import json
        import re
        text = response.text.strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return {
                "explanation": data.get("explanation", ""),
                "shared_themes": data.get("shared_themes", []),
            }
    except Exception as e:
        logger.error(f"Gemini connection error: {e}")

    return _mock_connection(title_a, title_b)


async def generate_connection_reason(title_a: str, title_b: str, similarity: float) -> str:
    """Generate a short one-line reason why two nodes are connected."""
    if not _is_ai_enabled():
        return _mock_connection_reason(title_a, title_b, similarity)

    try:
        _ensure_gemini()
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = (
            f"In one short sentence (max 12 words), explain the core semantic link between:\n"
            f"'{title_a}' and '{title_b}'\n"
            f"Be specific and insightful. No filler words."
        )

        response = model.generate_content(prompt)
        return response.text.strip().rstrip(".")
    except Exception as e:
        logger.error(f"Gemini reason error: {e}")
        return _mock_connection_reason(title_a, title_b, similarity)


def _mock_insight(title: str, similar_titles: list[str]) -> str:
    related = ", ".join(similar_titles[:3]) if similar_titles else "adjacent domains"
    return (
        f"{title} sits at a unique convergence point in the knowledge graph, "
        f"sharing deep semantic threads with {related}. "
        f"Its conceptual fingerprint reveals cross-domain applicability that makes it "
        f"a high-leverage node for innovation and discovery."
    )


def _mock_connection(title_a: str, title_b: str) -> dict:
    return {
        "explanation": (
            f"{title_a} and {title_b} share fundamental conceptual DNA, converging through "
            f"shared principles of optimization, emergent complexity, and systemic impact."
        ),
        "shared_themes": ["optimization", "emergence", "systems-thinking"],
    }


# Deterministic mock reasons based on title hash for consistent demo experience
_REASON_TEMPLATES = [
    "Both leverage data-driven optimization for real-world impact",
    "Shared foundation in intelligent systems and adaptive algorithms",
    "Converge through decentralized, autonomous decision-making",
    "United by the challenge of scaling complex biological systems",
    "Both transform physical infrastructure through digital intelligence",
    "Linked by energy efficiency and sustainable resource management",
    "Share deep roots in probabilistic modeling and uncertainty",
    "Both enable human augmentation through machine intelligence",
]


def _mock_connection_reason(title_a: str, title_b: str, similarity: float) -> str:
    key = hashlib.md5(f"{title_a}{title_b}".encode()).hexdigest()
    idx = int(key[:4], 16) % len(_REASON_TEMPLATES)
    return _REASON_TEMPLATES[idx]
