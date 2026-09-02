"""Aster Python v010
Authenticated historical derivative: provider-neutral masked-removal handler cascade.
Designed for the image backend locked to port 5151; browser-visible responses carry explicit CORS headers.
"""
from __future__ import annotations
import inspect
from typing import Any, Callable
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
router=APIRouter()
IMAGE_BACKEND_PORT=5151

def _cors_media_headers(request:Request|None=None)->dict[str,str]:
    origin=request.headers.get('origin') if request else None;allow='null' if origin=='null' else (origin or '*')
    h={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Private-Network':'true','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*'}
    if origin and origin!='null':h['Vary']='Origin'
    return h

async def _call(handler:Callable[...,Any],**kwargs:Any)->Any:
    result=handler(**kwargs)
    return await result if inspect.isawaitable(result) else result

@router.post('/tool/remove')
async def remove(request:Request,image:UploadFile=File(...),mask:UploadFile=File(...),prompt:str=Form('')):
    image_bytes=await image.read();mask_bytes=await mask.read()
    if not image_bytes or not mask_bytes:raise HTTPException(422,'image and mask are required')
    handlers=[getattr(request.app.state,name,None) for name in ('masked_remove_primary','masked_remove_secondary','inpaint_handler')]
    last:Exception|None=None
    for handler in handlers:
        if not callable(handler):continue
        try:
            result=await _call(handler,image_bytes=image_bytes,mask_bytes=mask_bytes,prompt=prompt,request=request)
            payload=result if isinstance(result,dict) else {'ok':True,'result':result}
            return JSONResponse(payload,headers=_cors_media_headers(request))
        except Exception as exc:last=exc
    raise HTTPException(502,'No masked-removal handler completed successfully') from last
