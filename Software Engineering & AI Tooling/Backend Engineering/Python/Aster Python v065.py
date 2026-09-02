from __future__ import annotations

import re

_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
    "without", "into", "from", "as", "this", "that", "these", "those", "is",
    "are", "was", "were", "be", "been", "being", "it", "its", "keep", "make",
    "very", "really", "just", "new", "area", "image", "scene", "match", "matching",
}


def _normalize(text: str) -> str:
    return " ".join(str(text or "").replace("\r", " ").replace("\n", " ").split()).strip()


def _keywords(text: str, max_words: int = 28) -> str:
    words = re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)?", _normalize(text).lower())
    out: list[str] = []
    seen: set[str] = set()
    for word in words:
        if len(word) < 4 or word in _STOPWORDS or word in seen:
            continue
        seen.add(word)
        out.append(word)
        if len(out) >= max(1, int(max_words)):
            break
    return " ".join(out)


def compact_prompt(user_text: str, technical_tail: str = "", limit: int = 460) -> str:
    """Bound a composed prompt while keeping user intent ahead of technical guidance."""
    cap = max(32, int(limit))
    user = _normalize(user_text)
    tail = _normalize(technical_tail)
    if not user and not tail:
        return ""

    combined = f"{user}. {tail}".strip(". ")
    if len(combined) <= cap:
        return combined

    if tail:
        tail = tail[: min(64, len(tail))]
        combined = f"{user}. {tail}".strip(". ")
        if len(combined) <= cap:
            return combined

    if len(user) > cap:
        lead_max = max(32, min(240, cap - 40))
        lead = user[:lead_max].rstrip(" ,.;:-")
        keywords = _keywords(user)
        return f"{lead} | {keywords}".strip()[:cap].rstrip(" ,.;:-")

    remaining = max(0, cap - len(user) - 1)
    return f"{user} {tail[:remaining]}".strip()[:cap].rstrip(" ,.;:-")
