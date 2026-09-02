"""Aster Python v056
Authenticated historical derivative: explicit CORS/private-network preflight policy for local browser-to-service requests.
"""
from __future__ import annotations

_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS"

def cors_private_network_policy(
    method: str,
    origin: str | None,
    requested_headers: str | None = None,
    *,
    max_age_seconds: int = 86400,
) -> tuple[int | None, dict[str, str]]:
    """Return (preflight_status, headers). A preflight status of 204 means the request can short-circuit."""
    headers: dict[str, str] = {}
    if origin == "null":
        headers["Access-Control-Allow-Origin"] = "null"
        headers["Vary"] = "Origin"
    elif origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Vary"] = "Origin"
    else:
        headers["Access-Control-Allow-Origin"] = "*"

    headers["Access-Control-Allow-Private-Network"] = "true"
    headers["Access-Control-Allow-Methods"] = _ALLOWED_METHODS
    headers["Access-Control-Allow-Headers"] = requested_headers or "*"
    headers["Access-Control-Max-Age"] = str(max(0, int(max_age_seconds)))
    return (204 if (method or "").upper() == "OPTIONS" else None), headers
