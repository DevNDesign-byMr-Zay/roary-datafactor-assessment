from __future__ import annotations

from collections.abc import Callable

OutpaintStep = Callable[[str, dict[str, int]], str]


def chain_outpaint(
    image_ref: str,
    left: int,
    right: int,
    top: int,
    bottom: int,
    run_step: OutpaintStep,
    max_pad_per_step: int = 720,
    max_steps: int = 20,
) -> dict[str, object]:
    """Apply large four-sided expansion as bounded sequential outpaint steps."""
    current = image_ref
    remaining = [max(0, int(v)) for v in (left, right, top, bottom)]
    cap = max(1, int(max_pad_per_step))
    used = 0

    for _ in range(max(0, int(max_steps))):
        if not any(remaining):
            break
        pads = {
            "left": min(cap, remaining[0]),
            "right": min(cap, remaining[1]),
            "top": min(cap, remaining[2]),
            "bottom": min(cap, remaining[3]),
        }
        next_ref = run_step(current, pads)
        if not isinstance(next_ref, str) or not next_ref.strip():
            raise RuntimeError("outpaint step returned no image reference")
        current = next_ref.strip()
        remaining[0] -= pads["left"]
        remaining[1] -= pads["right"]
        remaining[2] -= pads["top"]
        remaining[3] -= pads["bottom"]
        used += 1

    return {
        "image_ref": current,
        "steps": used,
        "remaining": dict(zip(("left", "right", "top", "bottom"), remaining)),
        "complete": not any(remaining),
    }
