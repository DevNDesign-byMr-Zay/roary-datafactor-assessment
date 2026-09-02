"""Aster Python v007
Authenticated historical derivative: provider-neutral masked object-removal route adapter.
Browser-visible JSON responses carry explicit media-safe CORS headers.
"""
from __future__ import annotations
import inspect
from typing import Any, Callable
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
router=APIRouter()

def _cors_media_headers(request: Request|None=None)->dict[str,str]:
    origin=request.headers.get("origin") if request else None; allow="null" if origin=="null" else (origin or "*")
    h={"Access-Control-Allow-Origin":allow,"Access-Control-Allow-Private-Network":"true","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"*"}
    if origin and origin!="null": h["Vary"]="Origin"
    return h

@router.post('/tool/remove')
@router.post('/tool/erase')
async def remove(request:Request,image:UploadFile=File(...),mask:UploadFile=File(...),prompt:str=Form(''),quality:str=Form(''),mask_expansion:int=Form(0)):
    processor:Callable[...,Any]|None=getattr(request.app.state,'masked_remove_handler',None)
    if not callable(processor): raise HTTPException(503,'Masked remove handler is not configured')
    result=processor(image_bytes=await image.read(),mask_bytes=await mask.read(),prompt=prompt,quality=quality,mask_expansion=max(0,int(mask_expansion)),request=request)
    if inspect.isawaitable(result): result=await result
    return JSONResponse(result if isinstance(result,dict) else {'ok':True,'result':result},headers=_cors_media_headers(request))
