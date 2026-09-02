"""Aster Python v004
Authenticated historical derivative: generic FastAPI image-tool compatibility service.
Historical provider identities, credentials, private paths, and non-5151 local ports removed.
Every browser-visible response carries explicit media-safe CORS headers.
"""
from __future__ import annotations
import inspect
from typing import Any, Callable
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

SERVICE_PORT = 5151
app = FastAPI(title="Aster Image Tool Compatibility")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

def _cors_media_headers(request: Request | None = None) -> dict[str,str]:
    origin = request.headers.get("origin") if request is not None else None
    allow = "null" if origin == "null" else (origin or "*")
    headers={"Access-Control-Allow-Origin":allow,"Access-Control-Allow-Private-Network":"true","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"*"}
    if origin and origin != "null": headers["Vary"]="Origin"
    return headers

async def _invoke(request: Request, key: str) -> JSONResponse:
    handler: Callable[...,Any] | None=getattr(request.app.state,key,None)
    if not callable(handler): raise HTTPException(503,f"Handler '{key}' is not configured")
    body=await request.json() if request.headers.get("content-type","").lower().startswith("application/json") else None
    result=handler(request=request, body=body)
    if inspect.isawaitable(result): result=await result
    if isinstance(result,JSONResponse):
        for k,v in _cors_media_headers(request).items(): result.headers.setdefault(k,v)
        return result
    return JSONResponse(result if isinstance(result,dict) else {"ok":True,"result":result},headers=_cors_media_headers(request))

@app.get("/healthz")
async def healthz(request: Request): return JSONResponse({"ok":True,"port":SERVICE_PORT},headers=_cors_media_headers(request))

@app.post("/tool/image_edit")
@app.post("/tool/edit")
async def image_edit(request: Request): return await _invoke(request,"image_edit_handler")

@app.post("/tool/remove")
@app.post("/tool/erase")
@app.post("/tool/inpaint")
async def remove(request: Request): return await _invoke(request,"remove_handler")

@app.post("/tool/expand")
@app.post("/tool/expand_canvas")
@app.post("/tool/outpaint")
async def expand(request: Request): return await _invoke(request,"expand_handler")

@app.post("/tool/relight")
async def relight(request: Request): return await _invoke(request,"relight_handler")
