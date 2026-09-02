from __future__ import annotations

from collections.abc import Callable, Iterable
from html import unescape
from html.parser import HTMLParser


class _VisibleTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._hidden_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in {"script", "style", "noscript"}:
            self._hidden_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"script", "style", "noscript"} and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self._hidden_depth:
            text = " ".join(data.split())
            if text:
                self.parts.append(text)


def extract_readable_text(
    html: str,
    extractors: Iterable[Callable[[str], str | None]],
    minimum_chars: int = 80,
) -> str:
    """Try richer extractors first, then fall back to visible-text parsing."""
    for extractor in extractors:
        try:
            text = " ".join((extractor(html) or "").split())
        except Exception:
            continue
        if len(text) >= minimum_chars:
            return text

    parser = _VisibleTextParser()
    parser.feed(html)
    return unescape(" ".join(parser.parts)).strip()
