"""Aster Python v005
Authenticated historical derivative: UI compatibility endpoints for a local image-tool service.
Designed to be mounted beside Aster Python v004 on port 5151.
"""
from __future__ import annotations
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

router=APIRouter()

def _cors_media_headers(request: Request | None = None) -> dict[str,str]:
    origin=request.headers.get("origin") if request is not None else None
    allow="null" if origin=="null" else (origin or "*")
    h={"Access-Control-Allow-Origin":allow,"Access-Control-Allow-Private-Network":"true","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"*"}
    if origin and origin!="null": h["Vary"]="Origin"
    return h

@router.get("/ui/status")
async def ui_status(request: Request):
    return JSONResponse({"ok":True,"image_backend":"http://127.0.0.1:5151"},headers=_cors_media_headers(request))

@router.get("/ui/import.js")
async def ui_import(request: Request):
    body='window.__asterUiCompatLoaded=true;'
    return Response(body,media_type="text/javascript",headers={**_cors_media_headers(request),"Cache-Control":"no-store"})

@router.post("/tool/relight_preview")
async def relight_preview(request: Request):
    handler=getattr(request.app.state,"relight_preview_handler",None)
    if not callable(handler): return JSONResponse({"ok":False,"error":"Preview handler is not configured"},status_code=503,headers=_cors_media_headers(request))
    result=handler(request)
    if hasattr(result,"__await__"): result=await result
    return JSONResponse(result if isinstance(result,dict) else {"ok":True,"result":result},headers=_cors_media_headers(request))
