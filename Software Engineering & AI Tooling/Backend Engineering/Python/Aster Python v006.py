"""Aster Python v006
Authenticated historical derivative: JSON-body relight routes that avoid multipart part-count pressure.
Provider-specific model identifiers are intentionally host-supplied and absent from this artifact.
"""
from __future__ import annotations
import inspect
from typing import Any, Callable
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

router=APIRouter()

class RelightJsonRequest(BaseModel):
    image_url: str = Field(min_length=1)
    mood: str = "Neutral"
    level: float = 0.0
    prompt: str = ""
    model_id: str | None = None

def _cors_media_headers(request: Request | None = None) -> dict[str,str]:
    origin=request.headers.get("origin") if request is not None else None
    allow="null" if origin=="null" else (origin or "*")
    h={"Access-Control-Allow-Origin":allow,"Access-Control-Allow-Private-Network":"true","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"*"}
    if origin and origin!="null": h["Vary"]="Origin"
    return h

@router.post("/tool/relight_json")
async def relight_json(payload: RelightJsonRequest, request: Request):
    handler: Callable[...,Any] | None=getattr(request.app.state,"relight_json_handler",None)
    if not callable(handler): raise HTTPException(503,"Relight JSON handler is not configured")
    result=handler(payload=payload.model_dump(),request=request)
    if inspect.isawaitable(result): result=await result
    return JSONResponse(result if isinstance(result,dict) else {"ok":True,"result":result},headers=_cors_media_headers(request))
