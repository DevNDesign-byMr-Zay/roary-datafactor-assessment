"""Aster Python v009
Authenticated historical derivative: configurable mask-expansion/quality wrapper for object-removal processing.
Runs under the port-5151 image service and returns media-safe CORS headers.
"""
from __future__ import annotations
import inspect
from typing import Any, Callable
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
router=APIRouter()

def _cors_media_headers(request:Request|None=None)->dict[str,str]:
    origin=request.headers.get('origin') if request else None;allow='null' if origin=='null' else (origin or '*')
    h={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Private-Network':'true','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*'}
    if origin and origin!='null':h['Vary']='Origin'
    return h

@router.post('/tool/remove_masked')
async def remove_masked(request:Request,image:UploadFile=File(...),mask:UploadFile=File(...),quality:str=Form('balanced'),mask_expansion:int=Form(12),prompt:str=Form('')):
    image_bytes=await image.read();mask_bytes=await mask.read()
    if not image_bytes or not mask_bytes:raise HTTPException(422,'image and mask are required')
    handler:Callable[...,Any]|None=getattr(request.app.state,'object_removal_handler',None)
    fallback:Callable[...,Any]|None=getattr(request.app.state,'inpaint_handler',None)
    kwargs={'image_bytes':image_bytes,'mask_bytes':mask_bytes,'quality':quality,'mask_expansion':max(0,min(128,int(mask_expansion))),'prompt':prompt,'request':request}
    try:
        if not callable(handler):raise RuntimeError('primary handler unavailable')
        result=handler(**kwargs)
        if inspect.isawaitable(result):result=await result
    except Exception:
        if not callable(fallback):raise HTTPException(503,'No masked removal handler is configured')
        result=fallback(**kwargs)
        if inspect.isawaitable(result):result=await result
    return JSONResponse(result if isinstance(result,dict) else {'ok':True,'result':result},headers=_cors_media_headers(request))
