"""Aster Python v021
Authenticated historical derivative: deterministic relight prompt composition from mood, intensity, and optional user direction.
Proprietary prompt wording removed.
"""
from __future__ import annotations

def relight_prompt(mood: str, intensity: float, user_prompt: str = "") -> str:
    mood = (mood or "neutral").strip().lower()
    level = max(0.0, min(float(intensity or 0.0), 1.0))
    parts = [f"Relight the scene with a {mood} lighting mood", f"intensity {level:.2f}", "preserve subject identity and geometry"]
    if (user_prompt or "").strip(): parts.append(user_prompt.strip())
    return ". ".join(parts)
