import google.generativeai as genai
from config import settings
import logging

logger = logging.getLogger(__name__)


def _is_ai_enabled() -> bool:
    return bool(settings.gemini_api_key)


async def generate_node_insight(title: str, content: str, similar_titles: list[str]) -> str:
    if not _is_ai_enabled():
        return _mock_insight(title, similar_titles)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are a knowledge graph analyst. Given this concept and its semantically related concepts, provide a brief, insightful 2-3 sentence analysis of what makes this concept unique and how it connects to the broader knowledge landscape.

Concept: {title}
Description: {content[:300]}
Related concepts: {', '.join(similar_titles[:5])}

Provide a concise, insightful analysis (2-3 sentences max). Focus on emerging patterns, unexpected connections, and strategic implications."""

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini insight error: {e}")
        return _mock_insight(title, similar_titles)


async def explain_connection(title_a: str, content_a: str, title_b: str, content_b: str) -> dict:
    if not _is_ai_enabled():
        return _mock_connection(title_a, title_b)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""Explain the semantic connection between these two concepts in 2 sentences. Identify shared themes.

Concept A: {title_a} - {content_a[:200]}
Concept B: {title_b} - {content_b[:200]}

Respond with JSON: {{"explanation": "...", "shared_themes": ["theme1", "theme2", "theme3"]}}"""

        response = model.generate_content(prompt)
        import json, re
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


def _mock_insight(title: str, similar_titles: list[str]) -> str:
    related = ", ".join(similar_titles[:3]) if similar_titles else "adjacent domains"
    return (
        f"{title} sits at a unique convergence point in the knowledge graph, "
        f"sharing deep semantic threads with {related}. "
        f"Its conceptual fingerprint reveals cross-domain applicability that makes it a high-leverage node for innovation and discovery."
    )


def _mock_connection(title_a: str, title_b: str) -> dict:
    return {
        "explanation": f"{title_a} and {title_b} share fundamental conceptual DNA, converging through shared principles of optimization, emergent complexity, and systemic impact.",
        "shared_themes": ["optimization", "emergence", "systems-thinking"],
    }
