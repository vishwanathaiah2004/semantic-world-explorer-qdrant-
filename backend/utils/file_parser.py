import csv
import json
import io
from typing import Any


def parse_uploaded_file(filename: str, content: bytes) -> list[dict[str, Any]]:
    """Parse uploaded file (txt, json, csv) into a list of node dicts."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "txt":
        return _parse_txt(content)
    elif ext == "json":
        return _parse_json(content)
    elif ext == "csv":
        return _parse_csv(content)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


def _parse_txt(content: bytes) -> list[dict[str, Any]]:
    text = content.decode("utf-8", errors="replace")
    # Split on double newlines or paragraph breaks
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    nodes = []
    for i, para in enumerate(paragraphs):
        lines = para.split("\n")
        title = lines[0][:80] if lines else f"Entry {i+1}"
        nodes.append({
            "title": title,
            "content": para,
            "category": "Uploaded",
            "tags": ["text", "upload"],
        })
    return nodes


def _parse_json(content: bytes) -> list[dict[str, Any]]:
    data = json.loads(content.decode("utf-8"))
    if isinstance(data, list):
        return [_normalize_json_item(item, i) for i, item in enumerate(data)]
    elif isinstance(data, dict):
        # Try to find the array inside
        for key in ("items", "data", "nodes", "entries", "records"):
            if key in data and isinstance(data[key], list):
                return [_normalize_json_item(item, i) for i, item in enumerate(data[key])]
        # Single item
        return [_normalize_json_item(data, 0)]
    return []


def _normalize_json_item(item: Any, index: int) -> dict[str, Any]:
    if not isinstance(item, dict):
        text = str(item)
        return {"title": text[:60], "content": text, "category": "Uploaded", "tags": []}

    title = (
        item.get("title")
        or item.get("name")
        or item.get("headline")
        or item.get("subject")
        or f"Entry {index + 1}"
    )
    content = (
        item.get("content")
        or item.get("description")
        or item.get("text")
        or item.get("body")
        or item.get("abstract")
        or str(item)
    )
    category = item.get("category") or item.get("type") or item.get("domain") or "Uploaded"
    tags = item.get("tags") or item.get("keywords") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",")]

    return {
        "title": str(title)[:120],
        "content": str(content),
        "category": str(category),
        "tags": [str(t) for t in tags],
    }


def _parse_csv(content: bytes) -> list[dict[str, Any]]:
    text = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    nodes = []
    for i, row in enumerate(reader):
        nodes.append(_normalize_json_item(dict(row), i))
    return nodes
