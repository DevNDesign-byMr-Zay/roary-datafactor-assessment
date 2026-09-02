"""Aster Python v001
Authenticated historical derivative: FastAPI image-tool service foundation.

Preserved implementation themes:
- file:// / Origin:null CORS handling and Private Network Access headers
- HTTP(S) media proxying
- binary mask normalization
- local image-tool service bound to port 5151

Original product identity, credentials, private paths, and proprietary prompt text removed.
"""

from __future__ import annotations

import io
from typing import Optional

import requests
from PIL import Image, ImageOps
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="Aster Image Tool Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def _aster_force_cors_headers(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")

    if origin == "null":
        response.headers["Access-Control-Allow-Origin"] = "null"
    elif origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers.setdefault("Vary", "Origin")
    else:
        response.headers.setdefault("Access-Control-Allow-Origin", "*")

    response.headers["Access-Control-Allow-Private-Network"] = "true"
    response.headers.setdefault(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    )
    response.headers.setdefault("Access-Control-Allow-Headers", "*")
    return response


def _safe_http_url(url: str) -> bool:
    try:
        parsed = requests.utils.urlparse(url)
        return parsed.scheme in ("http", "https")
    except Exception:
        return False


def _guess_content_type_from_url(url: str) -> Optional[str]:
    value = (url or "").lower()
    if value.endswith(".png"):
        return "image/png"
    if value.endswith(".jpg") or value.endswith(".jpeg"):
        return "image/jpeg"
    if value.endswith(".webp"):
        return "image/webp"
    return None


def binary_mask_from_image_bytes(data: bytes, *, auto_invert: bool = True) -> bytes:
    """Return a binary PNG where white is the editable region."""
    image = Image.open(io.BytesIO(data))
    image.load()

    if image.mode in ("RGBA", "LA"):
        mask = image.split()[-1]
    else:
        mask = image.convert("L")

    mask = mask.point(lambda value: 255 if value > 10 else 0).convert("L")

    if auto_invert:
        raw = mask.tobytes()
        if raw:
            white_ratio = sum(1 for value in raw if value > 127) / len(raw)
            if white_ratio > 0.65:
                mask = ImageOps.invert(mask)

    output = io.BytesIO()
    mask.save(output, format="PNG", optimize=True)
    return output.getvalue()


@app.get("/health")
@app.get("/healthz")
def health():
    return {"ok": True, "service": "aster-image-tools", "port": 5151}


@app.get("/media")
def media_proxy(url: str = Query(..., description="HTTP(S) media URL")):
    if not _safe_http_url(url):
        raise HTTPException(
            status_code=400,
            detail="Only http(s) URLs are allowed for the media proxy.",
        )

    try:
        upstream = requests.get(
            url,
            stream=True,
            timeout=60,
            allow_redirects=True,
            headers={"User-Agent": "Aster-MediaProxy/1.0"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Upstream fetch failed: {exc}",
        ) from exc

    content_type = (
        upstream.headers.get("content-type")
        or _guess_content_type_from_url(url)
        or "application/octet-stream"
    )

    def stream():
        try:
            for chunk in upstream.iter_content(chunk_size=1024 * 128):
                if chunk:
                    yield chunk
        finally:
            try:
                upstream.close()
            except Exception:
                pass

    return StreamingResponse(
        stream(),
        status_code=upstream.status_code,
        media_type=content_type,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5151, reload=False)
