"""Aster Python v022
Authenticated historical derivative: object-removal prompt composition with a safe default and user override.
Proprietary wording removed.
"""
from __future__ import annotations

def removal_prompt(user_prompt: str = "") -> str:
    direction = (user_prompt or "").strip()
    base = "Remove the masked subject and reconstruct a coherent background while preserving unmasked content"
    return f"{base}. {direction}" if direction else base
